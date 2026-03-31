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
      .then((data) => { setLocations(data.filter((d) => d.lat && d.lon)); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filters.start, filters.end]);

  const maxCount = Math.max(1, ...locations.map((l) => l.count));

  return (
    <div className="bg-white rounded-xl border border-surface-border p-5 relative shadow-card">
      <h2 className="font-display text-lg font-bold text-text-primary mb-4">Visitor Map</h2>

      {loading ? (
        <div className="skeleton h-[380px] rounded-lg" />
      ) : (
        <div className="relative rounded-lg overflow-hidden bg-surface-raised border border-surface-border">
          <ComposableMap projectionConfig={{ scale: 147, center: [0, 20] }} style={{ width: '100%', height: 'auto' }}>
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#E5E7EB"
                      stroke="#D1D5DB"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: '#D1D5DB', outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>
              {locations.map((loc, i) => {
                const size = 4 + (loc.count / maxCount) * 14;
                return (
                  <Marker key={i} coordinates={[loc.lon, loc.lat]} onMouseEnter={() => setTooltip(loc)} onMouseLeave={() => setTooltip(null)}>
                    <circle r={size} fill="#2E5A88" fillOpacity={0.45} stroke="#2E5A88" strokeWidth={1.5} strokeOpacity={0.6} style={{ cursor: 'pointer' }} />
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {tooltip && (
            <div className="absolute top-3 right-3 bg-white border border-surface-border rounded-lg px-3 py-2 text-[12px] pointer-events-none shadow-raised">
              <p className="font-semibold text-text-primary">{tooltip.city}, {tooltip.country}</p>
              <p className="text-text-muted">{tooltip.count} visit{tooltip.count !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}

      {!loading && locations.length === 0 && (
        <p className="text-text-muted text-sm text-center py-10">No location data available</p>
      )}
    </div>
  );
}

export default memo(MapView);
