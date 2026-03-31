import { useState, useEffect, memo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function MapView({ filters }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ start: filters.start, end: filters.end });
    fetch(`/api/analytics/locations?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setLocations(data.filter((d) => d.lat && d.lon));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters.start, filters.end]);

  const maxCount = Math.max(1, ...locations.map((l) => l.count));

  return (
    <div className="bg-dark-850 rounded-xl border border-gray-800 p-5 relative">
      <h2 className="text-lg font-semibold mb-4">Visitor Map</h2>

      {loading ? (
        <div className="skeleton h-[400px] rounded-lg" />
      ) : (
        <div className="relative">
          <ComposableMap
            projectionConfig={{ scale: 147, center: [0, 20] }}
            style={{ width: '100%', height: 'auto' }}
          >
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#1e293b"
                      stroke="#334155"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: '#334155', outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>
              {locations.map((loc, i) => {
                const size = 4 + (loc.count / maxCount) * 16;
                return (
                  <Marker
                    key={i}
                    coordinates={[loc.lon, loc.lat]}
                    onMouseEnter={() => setTooltip({ ...loc, x: loc.lon, y: loc.lat })}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <circle
                      r={size}
                      fill="#3B82F6"
                      fillOpacity={0.6}
                      stroke="#3B82F6"
                      strokeWidth={1}
                      strokeOpacity={0.3}
                      style={{ cursor: 'pointer' }}
                    />
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {tooltip && (
            <div className="absolute top-4 right-4 bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-sm pointer-events-none">
              <p className="font-medium">{tooltip.city}, {tooltip.country}</p>
              <p className="text-gray-400">{tooltip.count} visit{tooltip.count !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}

      {!loading && locations.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-8">No location data available</p>
      )}
    </div>
  );
}

export default memo(MapView);
