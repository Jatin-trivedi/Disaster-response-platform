import { useState, useEffect } from 'react';
import { Box, Typography, Chip, Button, ToggleButton, ToggleButtonGroup, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import React from 'react';

// Fix for leaflet marker icons
const createCustomIcon = () => {
  const defaultIcon = L.Icon.Default.prototype as any;
  delete defaultIcon._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};
createCustomIcon();

type Location = {
  id: string;
  type: 'disaster' | 'relief';
  disasterType?: 'earthquake' | 'flood' | 'fire' | 'medical';
  latitude: number;
  longitude: number;
  severity?: 'low' | 'medium' | 'high';
  description?: string;
  capacity?: number;
};

const DisasterIcon = ({ type, size = 24 }: { type: string; size?: number }) => {
  return L.divIcon({
    html: `
      <div style="
        color: ${type === 'relief' ? '#4CAF50' : '#F44336'};
        font-size: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 0 2px rgba(152, 108, 108, 0.5));
        transform: translate(-50%, -50%);
      ">
        ${type === 'relief' ? '🟢' : '🔴'}
      </div>
    `,
    className: 'custom-disaster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const HeatmapLayer = ({ locations }: { locations: Location[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const disasterLocations = locations.filter(l => l.type === 'disaster');
    const heatPoints = disasterLocations.map(loc => [loc.latitude, loc.longitude, loc.severity === 'high' ? 1 : 0.5]);

    // @ts-ignore - Leaflet.heat not properly typed
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      minOpacity: 0.5,
      gradient: { 0.4: 'blue', 0.6: 'lime', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, locations]);

  return null;
};

const LiveDisasterMap = () => {
  const [center] = useState({ lat: 20.5937, lng: 78.9629 });
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    // Mock data
    const mockLocations: Location[] = [
      {
        id: '1',
        type: 'disaster',
        disasterType: 'flood',
        latitude: 19.0760,
        longitude: 72.8777,
        severity: 'high',
        description: 'Severe flooding in downtown area'
      },
      {
        id: '2',
        type: 'disaster',
        disasterType: 'fire',
        latitude: 28.7041,
        longitude: 77.1025,
        severity: 'medium',
        description: 'Forest fire spreading rapidly'
      },
      {
        id: 'r1',
        type: 'relief',
        latitude: 19.0860,
        longitude: 72.8877,
        description: 'Main evacuation center',
        capacity: 200
      }
    ];
    setLocations(mockLocations);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        alignItems: 'left',
        justifyContent: 'flex-start',
        px: 2,
        pt: { xs: 10, md: 8 },
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1200,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Live Disaster Map
            <Chip
              label={`${locations.filter(l => l.type === 'disaster').length} Active Incidents`}
              color="error"
              sx={{ ml: 2 }}
            />
          </Typography>

          <ToggleButtonGroup
            value={showHeatmap}
            exclusive
            onChange={() => setShowHeatmap(!showHeatmap)}
            aria-label="heatmap toggle"
            size="small"
          >
            <ToggleButton value={true}>Toggle Heatmap</ToggleButton>
          </ToggleButtonGroup>
        </Box>
          {/* LEFT PANEL */}
    <Box
      sx={{
        width: 300,
        height: { xs: 300, sm: 400, md: 500 },
        overflowY: 'auto',
        p: 1,
        borderRadius: 2,
        boxShadow: 2,
        backgroundColor: '#fafafa',
      }}
    >
      {locations
        .filter(loc => loc.type === 'disaster')
        .map(loc => (
          <Paper key={loc.id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">
              {loc.disasterType === 'flood' && '🌀'}
              {loc.disasterType === 'fire' && '🔥'}
              {loc.disasterType === 'earthquake' && '🌋'} {loc.disasterType?.toUpperCase()}
            </Typography>
            <Typography variant="body2">📍 {loc.latitude}, {loc.longitude}</Typography>
            <Typography variant="body2">🕒 {new Date().toLocaleTimeString()}</Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 1 }}
              fullWidth
              onClick={() => setSelectedLocation(loc)}
            >
              Respond
            </Button>
          </Paper>
        ))}
    </Box>
        {/* CENTER PANEL - MAP */}
    <Box
      sx={{
        flex: 1,
        height: { xs: 300, sm: 400, md: 500 },
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 3,
      }}
    >
          <MapContainer center={[center.lat, center.lng]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {showHeatmap && <HeatmapLayer locations={locations} />}
            {locations.map(location => (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                eventHandlers={{ click: () => setSelectedLocation(location) }}
                icon={DisasterIcon({ type: location.type })}
              />
            ))}
            {selectedLocation && (
              <Popup
                position={[selectedLocation.latitude, selectedLocation.longitude]}
                eventHandlers={{ remove: () => setSelectedLocation(null) }}
                closeButton
              >
                <Paper sx={{ p: 2, minWidth: 250 }}>
                  {selectedLocation.type === 'disaster' ? (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                        {selectedLocation.disasterType?.toUpperCase()}
                        {selectedLocation.severity && (
                          <Chip
                            label={selectedLocation.severity}
                            size="small"
                            color={
                              selectedLocation.severity === 'high'
                                ? 'error'
                                : selectedLocation.severity === 'medium'
                                  ? 'warning'
                                  : 'success'
                            }
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedLocation.description}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                        RELIEF CENTER
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedLocation.description}
                      </Typography>
                      {selectedLocation.capacity && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Capacity: {selectedLocation.capacity} people
                        </Typography>
                      )}
                    </>
                  )}
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 2 }}
                    startIcon={<LocationOnIcon />}
                    fullWidth
                  >
                    {selectedLocation.type === 'disaster' ? 'Respond' : 'View Details'}
                  </Button>
                </Paper>
              </Popup>
            )}
          </MapContainer>
        </Box>
      </Box>
       {/* RIGHT PANEL - Floating Buttons */}
    <Box
      sx={{
        width: 150,
        position: 'relative',
        height: { xs: 300, sm: 400, md: 500 },
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button variant="contained" color="warning" fullWidth>
          📢 Report Incident
        </Button>
        <Button variant="contained" color="error" fullWidth>
          🩺 Request Medical Help
        </Button>
        <Button variant="contained" color="primary" fullWidth>
          💧 Water/Food Needed
        </Button>
      </Box>
    </Box>
  </Box>
  );
};

export default LiveDisasterMap;
