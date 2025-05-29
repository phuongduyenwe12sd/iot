import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.component.css';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzuloKPhOSsoDTKw4Ks4Gx0mvw_h6Sj3s",
    authDomain: "project-3680597276515843100.firebaseapp.com",
    databaseURL: "https://project-3680597276515843100-default-rtdb.firebaseio.com",
    projectId: "project-3680597276515843100",
    storageBucket: "project-3680597276515843100.firebasestorage.app",
    messagingSenderId: "731837625507",
    appId: "1:731837625507:web:796e97dd31c11f88307b16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig, "location-map");
const database = getDatabase(app);

const LocationMap = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const markerMapRef = useRef({}); // To store marker references by location ID
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [locations, setLocations] = useState([
        {
            id: '1',
            roomId: "62616bb00aa850983c21b11b",
            name: 'Khu D',
            latitude: 10.85224,
            longitude: 106.77161,
            data: null
        },
        {
            id: '2',
            roomId: "62616bcfadb8c6e0f01e49dc",
            name: 'Sân vận động',
            latitude: 10.85041,
            longitude: 106.77310,
            data: null
        },
        {
            id: '3',
            roomId: "62618a2af73fe211513926c8",
            name: 'Tòa Trung Tâm',
            latitude: 10.85105,
            longitude: 106.77194,
            data: null
        },
        {
            id: '4',
            roomId: "62a9dc30092f09dc52362d94",
            name: 'Khu E',
            latitude: 10.85135,
            longitude: 106.77051,
            data: null
        }
    ]);

    // Custom icon
    const redDotIcon = L.icon({
        iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    const greenDotIcon = L.icon({
        iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    // Generate random sensor data for simulation
    const generateRandomData = () => {
        return {
            temperature: parseFloat((Math.random() * (35 - 25) + 25).toFixed(1)),
            humidity: parseFloat((Math.random() * (80 - 40) + 40).toFixed(1)),
            pm25: parseFloat((Math.random() * (50 - 10) + 10).toFixed(1)),
            co2: parseFloat((Math.random() * (800 - 300) + 300).toFixed(1)),
            co_corrected: parseFloat((Math.random() * (15 - 5) + 5).toFixed(1)),
            timestamp: Date.now()
        };
    };

    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';

        // Handle different timestamp formats
        let date;
        if (typeof timestamp === 'number') {
            // Unix timestamp (in seconds or milliseconds)
            date = new Date(timestamp * (timestamp < 10000000000 ? 1000 : 1));
        } else if (typeof timestamp === 'string') {
            // ISO string or other date string
            date = new Date(timestamp);
        } else {
            return 'Invalid date';
        }

        // Check if date is valid
        if (isNaN(date.getTime())) return 'Invalid date';

        // Format for Vietnam timezone (UTC+7)
        const options = {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false // Use 24-hour format
        };

        // Return formatted date string
        return new Intl.DateTimeFormat('vi-VN', options).format(date);
    };

    // Helper function to create popup content
    const createPopupContent = (location) => {
        let popupContent = `<div class="sensor-popup"><h3>${location.name}</h3>`;

        if (location.data) {
            // Add sensor data
            popupContent += `<p>Temperature: ${location.data.temperature}°C</p>`;
            popupContent += `<p>Humidity: ${location.data.humidity}%</p>`;
            popupContent += `<p>PM2.5: ${location.data.pm25} µg/m³</p>`;
            popupContent += `<p>CO2: ${location.data.co2} ppm</p>`;
            popupContent += `<p>CO: ${location.data.co_corrected} ppm</p>`;

            // Indicate data source
            if (location.name === 'Tòa Trung Tâm') {
                popupContent += `<p class="data-source"><em>Real-time data from Firebase</em></p>`;
            } else {
                popupContent += `<p class="data-source"><em>Simulated data</em></p>`;
            }

            popupContent += `<p class="timestamp">Last update: ${formatTimestamp(location.data.timestamp)}</p>`;
        } else {
            popupContent += `<p>Loading data...</p>`;
        }

        popupContent += `</div>`;
        return popupContent;
    };

    // Update markers when location data changes
    const updateMarkers = () => {
        // Clear existing markers
        markersRef.current.forEach(marker => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(marker);
            }
        });
        markersRef.current = [];
        markerMapRef.current = {}; // Clear marker map

        // Add new markers
        locations.forEach(location => {
            if (!mapInstanceRef.current) return;

            // Use green icon for Tòa Trung Tâm (real data) and red for others
            const icon = location.name === 'Tòa Trung Tâm' ? greenDotIcon : redDotIcon;

            const marker = L.marker([location.latitude, location.longitude], { icon: icon })
                .addTo(mapInstanceRef.current);

            // Store reference to this marker by ID
            markerMapRef.current[location.id] = marker;

            // Create popup content based on available data
            let popupContent = createPopupContent(location);
            marker.bindPopup(popupContent);

            // Add click event to ensure popup opens
            marker.on('click', function () {
                console.log(`Clicked on marker: ${location.name}`);
                this.openPopup();
            });

            // Add circle around marker with different color for Tòa Trung Tâm
            const circle = L.circle([location.latitude, location.longitude], {
                color: location.name === 'Tòa Trung Tâm' ? 'green' : 'red',
                fillColor: location.name === 'Tòa Trung Tâm' ? '#3f3' : '#f03',
                fillOpacity: 0.2,
                radius: 50
            }).addTo(mapInstanceRef.current);

            markersRef.current.push(marker);
            markersRef.current.push(circle);
        });
    };

    // Fetch data from Firebase
    const fetchLocationData = async () => {
        try {
            setLoading(true);

            // Create a new array to hold updated locations
            const updatedLocations = [...locations];

            // Get real-time data from Firebase for Tòa Trung Tâm
            const latestRef = ref(database, '/air_quality/latest');

            return new Promise((resolve) => {
                onValue(latestRef, (snapshot) => {
                    try {
                        const firebaseData = snapshot.val();
                        console.log('Firebase data:', firebaseData);

                        if (firebaseData) {
                            // Use real Firebase data for Tòa Trung Tâm (index 2)
                            updatedLocations[2] = {
                                ...updatedLocations[2],
                                data: {
                                    temperature: parseFloat(firebaseData.temperature),
                                    humidity: parseFloat(firebaseData.humidity),
                                    pm25: parseFloat(firebaseData.pm25),
                                    co2: parseFloat(firebaseData.co2),
                                    co_corrected: parseFloat(firebaseData.co_corrected),
                                    timestamp: firebaseData.timestamp
                                }
                            };

                            // Generate random data for other locations
                            for (let i = 0; i < updatedLocations.length; i++) {
                                if (i !== 2) { // Skip Tòa Trung Tâm as it has real data
                                    const randomData = generateRandomData();
                                    updatedLocations[i] = {
                                        ...updatedLocations[i],
                                        data: randomData
                                    };
                                }
                            }

                            console.log('Updated locations with Firebase data:', updatedLocations);

                            // Update state with new data
                            setLocations(updatedLocations);

                            // Update any open popups with new data
                            updatedLocations.forEach(location => {
                                const marker = markerMapRef.current[location.id];
                                if (marker && marker.isPopupOpen()) {
                                    console.log(`Updating open popup for ${location.name}`);
                                    marker.setPopupContent(createPopupContent(location));
                                }
                            });

                            // Create markers if they don't exist yet
                            if (markersRef.current.length === 0) {
                                updateMarkers();
                            }

                            setLoading(false);
                            resolve(updatedLocations);
                        }
                    } catch (error) {
                        console.error('Error processing Firebase data:', error);
                        handleError(error);
                        resolve(generateAllRandomData());
                    }
                }, (error) => {
                    console.error('Firebase error:', error);
                    handleError(error);
                    resolve(generateAllRandomData());
                });
            });

        } catch (error) {
            console.error('Error in fetchLocationData:', error);
            return handleError(error);
        }
    };

    // Handle errors by generating random data
    const handleError = (error) => {
        setError(error.message);
        setLoading(false);
        return generateAllRandomData();
    };

    // Generate random data for all locations
    const generateAllRandomData = () => {
        const allRandomData = locations.map(loc => ({
            ...loc,
            data: generateRandomData()
        }));

        setLocations(allRandomData);

        // Update any open popups with new data
        allRandomData.forEach(location => {
            const marker = markerMapRef.current[location.id];
            if (marker && marker.isPopupOpen()) {
                marker.setPopupContent(createPopupContent(location));
            }
        });

        // Create markers if they don't exist yet
        if (markersRef.current.length === 0) {
            updateMarkers();
        }

        return allRandomData;
    };

    useEffect(() => {
        // Initialize map
        if (!mapInstanceRef.current) {
            // Center map on average of all locations
            const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
            const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;

            mapInstanceRef.current = L.map(mapRef.current).setView([avgLat, avgLng], 16);

            // Add satellite imagery basemap
            L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                {
                    attribution:
                        'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, ' +
                        'Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                }
            ).addTo(mapInstanceRef.current);

            // Add OpenStreetMap as an option
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstanceRef.current);

            // Add layer control
            const baseMaps = {
                "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'),
                "Streets": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
            };

            L.control.layers(baseMaps).addTo(mapInstanceRef.current);

            // Initial fetch and marker setup
            fetchLocationData();
        }

        // Fetch data periodically (every 30 seconds)
        const intervalId = setInterval(fetchLocationData, 30000);

        return () => {
            clearInterval(intervalId);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }
        };
    }, []);

    // Add leaflet-specific CSS adjustments
    useEffect(() => {
        // Add custom CSS for the popup
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .sensor-popup h3 {
                color: #2c3e50;
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 16px;
            }
            .sensor-popup p {
                margin: 5px 0;
                font-size: 14px;
            }
            .sensor-popup .data-source {
                font-size: 12px;
                color: #7f8c8d;
                margin-top: 10px;
            }
            .sensor-popup .timestamp {
                font-size: 12px;
                color: #7f8c8d;
                margin-top: 5px;
                font-style: italic;
            }
            .leaflet-popup-content {
                width: 200px !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="map-container-wrapper">
            <h2 style={{ padding: '10px', textAlign: 'center' }}>Air Quality Monitoring Locations</h2>
            <div ref={mapRef} id="map" className="map-container" style={{ height: '600px', width: '100%' }}></div>
            <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                <p>Green marker: Real-time data from Firebase | Red markers: Simulated data</p>
            </div>
        </div>
    );
};

export default LocationMap;