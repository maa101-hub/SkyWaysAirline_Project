import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Marker } from "react-leaflet";

const INDIA_MAP_CENTER = [22.9734, 78.6569];
const INDIA_MAP_BOUNDS = [
  [6.0, 67.5],
  [37.5, 97.5],
];

export default function AdminMapView({
  animatedRouteLines,
  mappedRouteLines,
  unmappedRoutes,
  mapCityPins,
  lineDashOffset,
  createPlaneIcon,
  onRouteClick,
}) {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <div>
          <h1 className="tab-title">Flight Map</h1>
          <p className="tab-sub">India route map for all routes</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-num">{mappedRouteLines.length}</p>
          <p className="stat-label">Mapped Routes</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">{mapCityPins.length}</p>
          <p className="stat-label">Cities Connected</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">{animatedRouteLines.length}</p>
          <p className="stat-label">Active Routes</p>
        </div>
      </div>

      <div className="map-layout">
        <div className="india-map-card">
          <p className="section-head">India Air Network</p>
          <div className="india-map-canvas">
            <MapContainer
              className="india-real-map"
              center={INDIA_MAP_CENTER}
              zoom={5}
              minZoom={4}
              maxZoom={8}
              maxBounds={INDIA_MAP_BOUNDS}
              maxBoundsViscosity={1.0}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {animatedRouteLines.map((route) => (
                <Polyline
                  key={route.routeId}
                  positions={[
                    [route.sourcePoint.lat, route.sourcePoint.lng],
                    [route.destinationPoint.lat, route.destinationPoint.lng],
                  ]}
                  pathOptions={{
                    color: "#4fa3e3",
                    weight: 1.5,
                    opacity: 0.9,
                    dashArray: "8 10",
                    dashOffset: `${lineDashOffset}`,
                  }}
                />
              ))}

              {animatedRouteLines.map((route) => (
                <Marker
                  key={`${route.routeId}-plane`}
                  position={[route.planeLat, route.planeLng]}
                  icon={createPlaneIcon(route.bearing)}
                  eventHandlers={{
                    mouseover: (e) => {
                      e.target.openPopup();
                    },
                    mouseout: (e) => {
                      e.target.closePopup();
                    },
                    click: () => onRouteClick(route),
                  }}
                >
                  <Popup className="plane-popup" closeButton={false} autoPan={false}>
                    <div className="plane-popup-card">
                      <div className="plane-popup-topline">
                        <span className="plane-popup-badge">Live</span>
                        <span className="plane-popup-subtle">Hover to inspect • click for route detail</span>
                      </div>

                      <p className="plane-popup-title">
                        {route.source} → {route.destination}
                      </p>

                      <div className="plane-popup-chips">
                        <span className="plane-popup-chip">Route: {route.routeId}</span>
                        <span className="plane-popup-chip">Schedules: {route.scheduleCount}</span>
                        <span className="plane-popup-chip">Flights: {route.linkedFlightIds.length || 0}</span>
                      </div>

                      <div className="plane-popup-meta-grid">
                        <div className="plane-popup-meta-block">
                          <span className="plane-popup-meta-label">Linked Flights</span>
                          <span className="plane-popup-meta-value">
                            {route.linkedFlightIds.length ? route.linkedFlightIds.join(", ") : "Not linked"}
                          </span>
                        </div>

                        <div className="plane-popup-meta-block">
                          <span className="plane-popup-meta-label">Primary Schedule</span>
                          <span className="plane-popup-meta-value">
                            {route.linkedSchedules?.[0]
                              ? `${route.linkedSchedules[0].departureTime || "—"} • ${route.linkedSchedules[0].travelDuration || "—"} min`
                              : "No schedule"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {mapCityPins.map((city) => (
                <CircleMarker
                  key={city.key}
                  center={[city.lat, city.lng]}
                  radius={4}
                  pathOptions={{
                    color: "#f0a500",
                    fillColor: "#f0a500",
                    fillOpacity: 0.95,
                    weight: 1,
                  }}
                >
                  <Popup>{city.label}</Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="map-route-list-card">
          <p className="section-head">Visible Routes</p>
          <div className="map-route-list">
            {mappedRouteLines.length === 0 && (
              <p className="map-empty">
                No routes could be plotted on the map yet.
              </p>
            )}

            {mappedRouteLines.map((route) => (
              <div key={route.routeId} className="map-route-row">
                <p className="map-route-title">
                  {route.source} → {route.destination}
                </p>
                <p className="map-route-meta">
                  {route.routeId} · {route.scheduleCount} schedule
                  {route.scheduleCount > 1 ? "s" : ""}
                </p>
                <p className="map-route-meta">
                  Flights:{" "}
                  {route.linkedFlightIds.length
                    ? route.linkedFlightIds.join(", ")
                    : "Not linked"}
                </p>
              </div>
            ))}
          </div>

          {unmappedRoutes.length > 0 && (
            <p className="map-note">
              {unmappedRoutes.length} route(s) are hidden because
              source/destination names could not be geocoded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
