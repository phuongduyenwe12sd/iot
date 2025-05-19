import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.component.css';

const LocationMap = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const markerMapRef = useRef({}); // To store marker references by location ID

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

    // Generate random sensor data
    const generateRandomData = () => {
        return {
            id: Math.floor(Math.random() * 1000),
            temperature: parseFloat((Math.random() * (35 - 25) + 25).toFixed(1)),
            humidity: parseFloat((Math.random() * (80 - 40) + 40).toFixed(1)),
            pm25: parseFloat((Math.random() * (500 - 100) + 100).toFixed(1)),
            co2: parseFloat((Math.random() * (800 - 300) + 300).toFixed(1)),
            co: parseFloat((Math.random() * (300 - 100) + 100).toFixed(1)),
            timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
    };

    // Helper function to create popup content
    const createPopupContent = (location) => {
        let popupContent = `<div class="sensor-popup"><h3>${location.name}</h3>`;

        if (location.data) {
            // Add sensor data
            popupContent += `<p>Temperature: ${location.data.temperature}°C</p>`;
            popupContent += `<p>Humidity: ${location.data.humidity}%</p>`;

            // Add PM2.5 data (labeled differently from the API response)
            if (location.name === 'Tòa Trung Tâm') {
                popupContent += `<p>PM2.5: ${location.data.pm25} µg/m³</p>`;
                popupContent += `<p>CO2: ${location.data.co2} ppm</p>`;
                popupContent += `<p>CO: ${location.data.co} ppm</p>`;
                popupContent += `<p class="data-source"><em>Real-time data</em></p>`;
            } else {
                popupContent += `<p>PM2.5: ${location.data.pm25} µg/m³</p>`;
                popupContent += `<p>CO2: ${location.data.co2} ppm</p>`;
                popupContent += `<p>CO: ${location.data.co} ppm</p>`;
                popupContent += `<p class="data-source"><em>Simulated data</em></p>`;
            }

            popupContent += `<p class="timestamp">Last update: ${location.data.timestamp}</p>`;
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

            const marker = L.marker([location.latitude, location.longitude], { icon: redDotIcon })
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
                fillOpacity: 0.1,
                radius: 40
            }).addTo(mapInstanceRef.current);

            markersRef.current.push(marker);
            markersRef.current.push(circle);
        });
    };

    // Fetch data from the API
    const fetchLocationData = async () => {
        try {
            // Create a new array to hold updated locations
            const updatedLocations = [...locations];

            // Only fetch real data for Tòa Trung Tâm (index 2)
            const response = await fetch('http://localhost/sht30/test_data.php?action=latest');
            const apiResponse = await response.json();
            console.log('Fetched location data:', apiResponse);

            if (apiResponse.success && apiResponse.data) {
                // Update Tòa Trung Tâm with real data
                updatedLocations[2] = {
                    ...updatedLocations[2],
                    data: apiResponse.data
                };
            }

            // Generate random data for other locations
            for (let i = 0; i < updatedLocations.length; i++) {
                if (i !== 2) { // Skip Tòa Trung Tâm as it has real data
                    updatedLocations[i] = {
                        ...updatedLocations[i],
                        data: generateRandomData()
                    };
                }
            }

            console.log('Updated locations:', updatedLocations);

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

            // Only create new markers if they don't exist yet
            if (markersRef.current.length === 0) {
                updateMarkers();
            }

            return updatedLocations;
        } catch (error) {
            console.error('Error fetching location data:', error);

            // If API fails, generate random data for all locations
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

            // Only create new markers if they don't exist yet
            if (markersRef.current.length === 0) {
                updateMarkers();
            }

            return allRandomData;
        }
    };

    useEffect(() => {
        // Initialize map
        if (!mapInstanceRef.current) {
            // Center map on average of all locations
            const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
            const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;

            mapInstanceRef.current = L.map(mapRef.current).setView([avgLat, avgLng], 16);

            L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                {
                    attribution:
                        'Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, ' +
                        'Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                }
            ).addTo(mapInstanceRef.current);

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

    return (
        <div className="App">
            <div ref={mapRef} id="map" className="map-container"></div>
        </div>
    );
};

export default LocationMap;