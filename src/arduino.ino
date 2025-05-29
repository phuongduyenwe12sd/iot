#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <time.h>
// Provide the token generation process info
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions
#include "addons/RTDBHelper.h"

// WiFi credentials
const char *ssid = "Phuong";
const char *password = "0386399516";

// Firebase credentials
#define API_KEY "AIzaSyAzuloKPhOSsoDTKw4Ks4Gx0mvw_h6Sj3s"
#define DATABASE_URL "https://project-3680597276515843100-default-rtdb.firebaseio.com/"

// Define Firebase Data object, Auth and Config
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Pin definitions
#define DUST_SENSOR_PIN 36 // VP pin on ESP32
#define DUST_LED_PIN 18    // GPIO18
#define MQ135_PIN 39       // VN pin on ESP32
#define SHT30_SDA_PIN 21   // I2C SDA pin
#define SHT30_SCL_PIN 22   // I2C SCL pin
#define SHT30_ADDRESS 0x44 // Default I2C address for SHT30

// Constants for MQ135
#define RLOAD 10.0       // Load resistor on the board, in kOhm
#define RZERO 76.63      // Calibration resistance at atmospheric CO2 level
#define PARA 116.6020682 // Parameters for calculating ppm of CO2 from sensor resistance
#define PARB 2.769034857 // Parameters for calculating ppm of CO2 from sensor resistance

// Data upload interval (in milliseconds)
const unsigned long DATA_UPLOAD_INTERVAL = 5000; // 5 seconds
unsigned long lastUploadTime = 0;

// Maximum WiFi connection attempts
const int MAX_WIFI_ATTEMPTS = 20;
// Maximum Firebase retry attempts
const int MAX_FIREBASE_RETRIES = 3;

// Dust Sensor Class
class GP2Y1010AU0F
{
private:
    uint8_t _LEDPin;
    uint8_t _measurePin;
    int _samplingTime = 280;
    int _deltaTime = 40;
    int _sleepTime = 9680;
    float _VCC = 5.0;
    int _lastRawReading = 0;
    float _lastVoltage = 0.0;

public:
    GP2Y1010AU0F(uint8_t ledPin, uint8_t measurePin)
    {
        _LEDPin = ledPin;
        _measurePin = measurePin;
    }

    bool begin()
    {
        pinMode(_LEDPin, OUTPUT);
        digitalWrite(_LEDPin, HIGH); // LED off initially
        return true;
    }

    float read()
    {
        digitalWrite(_LEDPin, LOW); // Turn on LED
        delayMicroseconds(_samplingTime);
        int rawReading = analogRead(_measurePin);
        delayMicroseconds(_deltaTime);
        digitalWrite(_LEDPin, HIGH); // Turn off LED
        delayMicroseconds(_sleepTime);

        // Store raw value for debug
        _lastRawReading = rawReading;

        // Calculate voltage from the SAME reading
        _lastVoltage = rawReading * (_VCC / 4096.0);

        // Calculate dust density using that voltage
        float dustDensity = (0.17 * _lastVoltage - 0.1) * 1000.0;

        if (dustDensity < 0)
        {
            dustDensity = 0;
        }

        return dustDensity;
    }

    float getVoltage()
    {
        return _lastVoltage;
    }

    int getRawReading()
    {
        return _lastRawReading;
    }

    void setVCC(float vcc)
    {
        _VCC = vcc;
    }
};

// MQ135 Gas Sensor Class - CORRECTED VERSION
class MQ135
{
private:
    uint8_t _pin;
    float _rzero = RZERO; // Allow calibration

public:
    MQ135(uint8_t pin)
    {
        _pin = pin;
    }

    // Temperature and humidity correction factor
    float getCorrectionFactor(float t, float h)
    {
        return 0.00035 * t * t - 0.02718 * t + 1.39538 - (h - 33.) * 0.0018;
    }

    // CORRECTED resistance calculation
    float getResistance()
    {
        int val = analogRead(_pin);
        if (val == 0)
            val = 1; // Prevent division by zero

        // Convert reading to voltage (0-5V)
        float voltage = val * (5.0 / 4096.0);

        // Proper voltage divider formula: Rs = Rl * (Vc-Vout)/Vout
        return RLOAD * (5.0 - voltage) / voltage;
    }

    float getCorrectedResistance(float t, float h)
    {
        return getResistance() / getCorrectionFactor(t, h);
    }

    // CORRECTED PPM calculation
    float getPPM()
    {
        return PARA * pow((getResistance() / _rzero), -PARB);
    }

    float getCorrectedPPM(float t, float h)
    {
        return PARA * pow((getCorrectedResistance(t, h) / _rzero), -PARB);
    }

    float getRZero()
    {
        return getResistance() * pow((397.13 / PARA), (1. / PARB));
    }

    float getCorrectedRZero(float t, float h)
    {
        return getCorrectedResistance(t, h) * pow((397.13 / PARA), (1. / PARB));
    }

    // Set calibration value
    void setRZero(float rzero)
    {
        _rzero = rzero;
    }
};

// SHT30 Temperature/Humidity Sensor Class
class SHT30_Sensor
{
private:
    uint8_t _address;
    TwoWire *_wire;
    float _temperature;
    float _humidity;
    bool _isConnected;

public:
    SHT30_Sensor(uint8_t address = 0x44, TwoWire *wire = &Wire)
    {
        _address = address;
        _wire = wire;
        _temperature = 25.0; // Default values until first reading
        _humidity = 50.0;
        _isConnected = false;
    }

    bool begin(uint8_t sda_pin, uint8_t scl_pin)
    {
        _wire->begin(sda_pin, scl_pin);
        delay(50); // Give the sensor time to initialize
        _isConnected = isConnected();

        // Take initial reading if connected
        if (_isConnected)
        {
            readData();
        }

        return _isConnected;
    }

    bool isConnected()
    {
        _wire->beginTransmission(_address);
        return (_wire->endTransmission() == 0);
    }

    bool readData()
    {
        uint8_t data[6];
        uint16_t rawTemp, rawHum;

        // Send measurement command
        _wire->beginTransmission(_address);
        _wire->write(0x2C); // Measurement command
        _wire->write(0x06); // High repeatability
        if (_wire->endTransmission() != 0)
        {
            return false;
        }

        delay(100); // Wait for measurement

        // Request data
        if (_wire->requestFrom(_address, (uint8_t)6) != 6)
        {
            return false;
        }

        // Read data
        for (int i = 0; i < 6; i++)
        {
            data[i] = _wire->read();
        }

        // Calculate values (skip CRC check for simplicity)
        rawTemp = (data[0] << 8) | data[1];
        rawHum = (data[3] << 8) | data[4];

        // Convert to physical values
        _temperature = -45.0 + 175.0 * ((float)rawTemp / 65535.0);
        _humidity = 100.0 * ((float)rawHum / 65535.0);

        return true;
    }

    float getTemperature()
    {
        return _temperature;
    }

    float getHumidity()
    {
        return _humidity;
    }
};

// Create sensor instances
GP2Y1010AU0F dustSensor(DUST_LED_PIN, DUST_SENSOR_PIN);
MQ135 gasSensor(MQ135_PIN);
SHT30_Sensor sht30;

// Function to connect to WiFi
void connectToWiFi()
{
    Serial.println("Connecting to WiFi...");

    WiFi.begin(ssid, password);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < MAX_WIFI_ATTEMPTS)
    {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println();
        Serial.print("Connected to WiFi. IP address: ");
        Serial.println(WiFi.localIP());
    }
    else
    {
        Serial.println();
        Serial.println("Failed to connect to WiFi. Will retry later.");
    }
}

// Initialize Firebase
void initFirebase()
{
    Serial.println("Initializing Firebase...");

    // Configure Firebase API Key
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;

    Serial.println("Attempting Firebase sign-in...");

    // Sign in anonymously - THIS IS THE MISSING STEP
    if (Firebase.signUp(&config, &auth, "", ""))
    {
        Serial.println("Firebase sign up successful");
        config.token_status_callback = tokenStatusCallback;
    }
    else
    {
        Serial.println("Firebase sign up failed");
        Serial.println(config.signer.signupError.message.c_str());
    }

    // Begin connection
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    // Set database timeout
    Firebase.RTDB.setReadTimeout(&fbdo, 1000 * 60); // 1 minute
    Firebase.RTDB.setwriteSizeLimit(&fbdo, "tiny"); // Small writes only

    Serial.println("Firebase initialized successfully!");
}

bool sendDataToFirebase(float temperature, float humidity, float pm25, float co2, float co)
{
    // Check if Firebase is ready
    if (!Firebase.ready())
    {
        Serial.println("Firebase not ready. Cannot send data.");
        return false;
    }
    // Check WiFi connection
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("WiFi not connected. Attempting to reconnect...");
        connectToWiFi();
        if (WiFi.status() != WL_CONNECTED)
        {
            Serial.println("Failed to reconnect to WiFi. Data not sent.");
            return false;
        }
    }

    bool success = false;
    int retries = 0;

    while (!success && retries < MAX_FIREBASE_RETRIES)
    {
        // Debug info
        Serial.println("----------------------------------------");
        Serial.print("Attempt ");
        Serial.print(retries + 1);
        Serial.print(" of ");
        Serial.print(MAX_FIREBASE_RETRIES);
        Serial.println(" - Sending data to Firebase...");

        // Create a path
        String timestamp = String(millis());
        String dataPath = "/air_quality/" + timestamp;

        // Create a JSON object for the sensor data
        FirebaseJson json;
        json.set("temperature", temperature);
        json.set("humidity", humidity);
        json.set("pm25", pm25);
        json.set("co2", co2);
        json.set("co_corrected", co);
        json.set("timestamp", timestamp);

        Serial.println("Sending data to Firebase:");
        json.toString(Serial, true);

        // Send data to Firebase RTDB
        if (Firebase.RTDB.setJSON(&fbdo, dataPath.c_str(), &json))
        {
            Serial.println("Data sent successfully!");

            // Also update the "latest" data for easier retrieval
            if (Firebase.RTDB.setJSON(&fbdo, "/air_quality/latest", &json))
            {
                Serial.println("Latest data updated successfully!");
            }
            else
            {
                Serial.print("Error updating latest data: ");
                Serial.println(fbdo.errorReason());
            }

            success = true;
        }
        else
        {
            Serial.print("Firebase error: ");
            Serial.println(fbdo.errorReason());
            retries++;
            delay(1000); // Wait before retry
        }

        Serial.println("----------------------------------------");
    }

    return success;
}

void setup()
{

    Serial.begin(115200);
    delay(1000);

    Serial.println("\nInitializing Air Quality Monitor...");

    // Set ADC resolution and attenuation
    analogReadResolution(12);
    analogSetAttenuation(ADC_11db); // For full voltage range

    // Initialize dust sensor
    if (dustSensor.begin())
    {
        Serial.println("✓ PM2.5 dust sensor initialized");
    }
    else
    {
        Serial.println("✗ Failed to initialize dust sensor!");
    }

    // Initialize SHT30 sensor
    if (sht30.begin(SHT30_SDA_PIN, SHT30_SCL_PIN))
    {
        Serial.println("✓ SHT30 temperature/humidity sensor initialized");

        // Take initial reading
        if (sht30.readData())
        {
            Serial.print("  Initial temperature: ");
            Serial.print(sht30.getTemperature(), 1);
            Serial.print("°C, humidity: ");
            Serial.print(sht30.getHumidity(), 1);
            Serial.println("%");
        }
    }
    else
    {
        Serial.println("✗ Failed to initialize SHT30 sensor!");
        Serial.println("  Check connections and try again.");
    }

    // MQ135 sensor setup
    Serial.println("✓ MQ135 gas sensor ready");
    Serial.println("  NOTE: For accurate CO2 readings, sensor needs 24-48 hours warmup");

    // Optional: Run calibration routine once
    Serial.println("\n=== MQ135 CALIBRATION ===");
    Serial.println("Calculating baseline RZERO in current air conditions...");
    float rzero_sum = 0;
    int readings = 10;

    for (int i = 0; i < readings; i++)
    {
        // Get temperature and humidity for correction
        sht30.readData();
        float temp = sht30.getTemperature();
        float humidity = sht30.getHumidity();

        // Add calibrated reading
        rzero_sum += gasSensor.getCorrectedRZero(temp, humidity);
        delay(100);
    }

    float calibration_value = rzero_sum / readings;
    Serial.print("Calibration Value: RZERO = ");
    Serial.println(calibration_value);
    Serial.println("For better accuracy, replace default RZERO value in code.");

    // Set the calibrated value
    gasSensor.setRZero(calibration_value);

    // Connect to WiFi
    connectToWiFi();

    // Initialize Firebase
    initFirebase();

    // Print header for data
    Serial.println("\n=== Air Quality Monitor ===");
    Serial.println("=======================================================================");
    Serial.println("Temp (°C) | Humidity (%) | PM2.5 (μg/m³) | CO2 (ppm) | CO2 Corr (ppm)");
    Serial.println("-----------------------------------------------------------------------");
}

void loop()
{
    // Read temperature and humidity from SHT30
    if (sht30.readData())
    {
        // Get temperature and humidity
        float temperature = sht30.getTemperature();
        float humidity = sht30.getHumidity();

        // Read PM2.5 dust sensor
        float dustDensity = dustSensor.read();

        // Read MQ135 gas sensor with temperature and humidity correction
        float co2ppm = gasSensor.getPPM();
        float correctedCO2ppm = gasSensor.getCorrectedPPM(temperature, humidity);

        // Print all values
        Serial.print(temperature, 1);
        Serial.print(" °C\t| ");
        Serial.print(humidity, 1);
        Serial.print(" %\t| ");
        Serial.print(dustDensity, 1);
        Serial.print(" μg/m³\t| ");
        Serial.print(co2ppm, 1);
        Serial.print(" ppm\t| ");
        Serial.print(correctedCO2ppm, 1);
        Serial.println(" ppm");

        // Check if it's time to upload data
        unsigned long currentTime = millis();
        if (currentTime - lastUploadTime >= DATA_UPLOAD_INTERVAL)
        {
            // Send data to Firebase instead of server
            sendDataToFirebase(temperature, humidity, dustDensity, co2ppm, correctedCO2ppm);
            lastUploadTime = currentTime;
        }
    }
    else
    {
        Serial.println("Error reading from SHT30 sensor!");
    }

    delay(900);
}