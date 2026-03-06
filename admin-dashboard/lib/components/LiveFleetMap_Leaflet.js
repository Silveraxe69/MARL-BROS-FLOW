'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import MapContent from './MapContent';

// Bus marker colors based on service type
const BUS_COLORS = {
  'Women_Free': '#E91E63', // Pink
  'Intercity': '#FFC107',  // Yellow
  'Superfast': '#2196F3',  // Blue
  'Deluxe': '#F44336',     // Red
  'Sleeper': '#9C27B0',    // Purple
  'Stopped': '#9E9E9E',    // Grey
  'default': '#4CAF50'     // Green
};

export default function LiveFleetMap() {
  const [busData, setBusData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial bus data from backend API
  useEffect(() => {
    const loadBusData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/buses');
        const result = await response.json();
        
        // Transform backend data to match map component format
        const transformedData = result.buses
          .filter(bus => bus.current_location) // Only buses with location data
          .map(bus => ({
            bus_id: bus.bus_id,
            latitude: bus.current_location.latitude,
            longitude: bus.current_location.longitude,
            speed: bus.current_location.speed || 0,
            route_id: bus.route_id,
            service_type: bus.service_type,
            status: bus.status,
            current_capacity: bus.current_capacity || 0,
            total_capacity: bus.total_capacity || 50,
            timestamp: bus.current_location.timestamp
          }));
        
        setBusData(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading bus data:', error);
        // Fallback to static JSON if backend is unavailable
        try {
          const fallbackResponse = await fetch('/data/live_bus_location.json');
          const fallbackData = await fallbackResponse.json();
          setBusData(fallbackData);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
        setLoading(false);
      }
    };

    loadBusData();
    
    // Refresh data from backend every 10 seconds
    const refreshInterval = setInterval(loadBusData, 10000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Note: Real-time updates now come from backend API refresh
  // The backend has its own bus simulation service
  // No local simulation needed - data refreshes every 10 seconds from backend

  // Service type legend
  const serviceTypes = [
    { label: 'Women Free', color: BUS_COLORS.Women_Free },
    { label: 'Intercity', color: BUS_COLORS.Intercity },
    { label: 'Superfast', color: BUS_COLORS.Superfast },
    { label: 'Deluxe', color: BUS_COLORS.Deluxe },
    { label: 'Sleeper', color: BUS_COLORS.Sleeper },
    { label: 'Stopped', color: BUS_COLORS.Stopped },
  ];

  return (
    <Box sx={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Header with bus count and LIVE indicator */}
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        left: 16, 
        zIndex: 1000,
        display: 'flex',
        gap: 2
      }}>
        <Paper sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" fontWeight="bold" color="primary">
            {busData.length} Buses Tracked
          </Typography>
        </Paper>
        
        <Chip 
          label="LIVE" 
          color="error" 
          size="small"
          sx={{ 
            fontWeight: 'bold',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.6 }
            }
          }}
        />
      </Box>

      {/* Service type legend */}
      <Paper sx={{ 
        position: 'absolute', 
        bottom: 16, 
        left: 16, 
        zIndex: 1000,
        p: 2,
        maxWidth: 200
      }}>
        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
          Service Types:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {serviceTypes.map(type => (
            <Box key={type.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 16, 
                height: 16, 
                borderRadius: '50%', 
                backgroundColor: type.color,
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
              <Typography variant="caption">{type.label}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Map container */}
      <Box sx={{ flex: 1, height: '100%', minHeight: '500px' }}>
        {loading ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <Typography>Loading buses...</Typography>
          </Box>
        ) : (
          <MapContent busData={busData} />
        )}
      </Box>
    </Box>
  );
}
