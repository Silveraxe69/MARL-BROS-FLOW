'use client';

import { Box, Typography, Paper } from '@mui/material';
import LiveFleetMap from '@/lib/components/LiveFleetMap_Leaflet';

export default function MapPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Live Fleet Map
      </Typography>

      <Paper sx={{ p: 3, height: '70vh', position: 'relative' }}>
        <LiveFleetMap />
      </Paper>
    </Box>
  );
}
