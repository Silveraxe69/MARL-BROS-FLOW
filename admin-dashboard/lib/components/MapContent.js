'use client';

import { useEffect, useRef, useState } from 'react';

// Bus marker colors
const BUS_COLORS = {
  'Women_Free': '#E91E63',
  'Intercity': '#FFC107',
  'Superfast': '#2196F3',
  'Deluxe': '#F44336',
  'Sleeper': '#9C27B0',
  'Stopped': '#9E9E9E',
  'default': '#4CAF50'
};

function MapContent({ busData }) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet library
    if (typeof window !== 'undefined' && !window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setIsLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.L) {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapContainer.current || mapInstance.current) return;

    // Initialize map
    const L = window.L;
    const map = L.map(mapContainer.current).setView([11.0168, 76.9558], 12);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoaded]);

  useEffect(() => {
    if (!mapInstance.current || !isLoaded || !busData.length) return;

    const L = window.L;
    const map = mapInstance.current;

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    busData.forEach(bus => {
      const color = BUS_COLORS[bus.service_type] || BUS_COLORS.default;
      
      // Create custom icon
      const icon = L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transform: translate(-50%, -50%);
          ">🚌</div>
        `,
        className: 'custom-bus-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      // Create marker
      const marker = L.marker([bus.latitude, bus.longitude], { icon }).addTo(map);

      // Create popup content
      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <div style="margin-bottom: 8px;">
            <strong style="font-size: 14px;">🚌 ${bus.bus_id}</strong>
          </div>
          <div style="font-size: 12px; line-height: 1.6;">
            <div><strong>Route:</strong> ${bus.route_id}</div>
            <div><strong>Service:</strong> ${bus.service_type}</div>
            <div><strong>Speed:</strong> ${bus.speed} km/h</div>
            <div><strong>Status:</strong> ${bus.status}</div>
            <div><strong>Capacity:</strong> ${bus.current_capacity}/${bus.total_capacity}</div>
            <div style="margin-top: 8px; color: #666; font-size: 11px;">
              Last updated: ${new Date(bus.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current[bus.bus_id] = marker;
    });
  }, [busData, isLoaded]);

  if (!isLoaded) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading map...</div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        height: '100%', 
        width: '100%',
        position: 'relative',
        zIndex: 0
      }} 
    />
  );
}

export default React.memo(MapContent);
