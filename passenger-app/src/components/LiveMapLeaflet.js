import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { colors } from '../utils/theme';

const LiveMapLeaflet = ({ buses = [], stops = [], height = 400 }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet CSS and JS from CDN
    const loadLeaflet = () => {
      // Add CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Add JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          setTimeout(initializeMap, 100);
        };
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const L = window.L;
      
      // Create map centered on Coimbatore
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([11.0168, 76.9558], 12);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when buses change
  useEffect(() => {
    if (!mapReady || !mapRef.current || typeof window === 'undefined') return;

    const L = window.L;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Bus colors based on service type
    const busColors = {
      'Women_Free': '#E91E63',
      'Intercity': '#FFC107',
      'Superfast': '#2196F3',
      'Deluxe': '#F44336',
      'Sleeper': '#9C27B0',
      'default': '#4CAF50'
    };

    // Add bus markers
    buses.forEach(bus => {
      if (!bus.latitude || !bus.longitude) return;

      const color = busColors[bus.service_type] || busColors.default;
      
      // Create custom icon
      const icon = L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
          ">
            🚌
          </div>
        `,
        className: 'bus-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([bus.latitude, bus.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong style="font-size: 14px;">${bus.bus_id}</strong><br/>
            <span style="color: ${color}; font-weight: bold;">${bus.service_type}</span><br/>
            ${bus.women_bus === 'Yes' ? '<span style="color: #E91E63;">💗 Women Bus</span><br/>' : ''}
            <strong>Speed:</strong> ${bus.speed || 0} km/h<br/>
            <strong>Status:</strong> ${bus.status || 'Running'}<br/>
            ${bus.current_capacity !== undefined ? 
              `<strong>Capacity:</strong> ${bus.current_capacity}/${bus.total_capacity || 50}` : ''}
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Add stop markers
    stops.forEach(stop => {
      if (!stop.latitude || !stop.longitude) return;

      const icon = L.divIcon({
        html: `
          <div style="
            background-color: white;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid #666;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          "></div>
        `,
        className: 'stop-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 120px;">
            <strong>${stop.stop_name}</strong><br/>
            ${stop.stop_id}
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Fit bounds if we have buses
    if (buses.length > 0) {
      const bounds = buses
        .filter(b => b.latitude && b.longitude)
        .map(b => [b.latitude, b.longitude]);
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [buses, stops, mapReady]);

  return (
    <View style={[styles.container, { height }]}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: 8,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 8,
  },
});

export default LiveMapLeaflet;
