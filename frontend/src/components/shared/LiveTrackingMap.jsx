import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

function AnimatedMarker({ position, icon, popupTitle, popupBody }) {
  const [currentPosition, setCurrentPosition] = useState(position || [24.8607, 67.0011]);

  useEffect(() => {
    if (!position) return;

    const from = currentPosition;
    const to = position;
    const startTime = performance.now();
    const duration = Math.max(400, Math.min(1000, Math.hypot(to[0] - from[0], to[1] - from[1]) * 5000));

    let frameId;
    const animate = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextLat = from[0] + (to[0] - from[0]) * eased;
      const nextLng = from[1] + (to[1] - from[1]) * eased;
      setCurrentPosition([nextLat, nextLng]);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [position?.[0], position?.[1]]);

  return (
    <Marker position={currentPosition} icon={icon}>
      <Popup>
        <strong>{popupTitle}</strong>
        {popupBody ? <><br />{popupBody}</> : null}
      </Popup>
    </Marker>
  );
}

function RoutingLayer({ workerLocation, customerLocation, onRouteInfo, color }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !workerLocation || !customerLocation) return undefined;

    const control = L.Routing.control({
      waypoints: [
        L.latLng(workerLocation.latitude, workerLocation.longitude),
        L.latLng(customerLocation.latitude, customerLocation.longitude)
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color, weight: 4, opacity: 0.8 }]
      },
      fitSelectedRoutes: true
    });

    control.addTo(map);

    control.on('routesfound', (event) => {
      const [route] = event.routes;
      if (route) {
        const distanceKm = Number((route.summary.totalDistance / 1000).toFixed(1));
        const etaMinutes = Math.max(1, Math.round(route.summary.totalTime / 60));
        onRouteInfo?.({ distanceKm, etaMinutes, route });
      }
    });

    control.on('routingerror', () => {
      onRouteInfo?.({ distanceKm: null, etaMinutes: null, route: null });
    });

    return () => {
      map.removeControl(control);
    };
  }, [map, workerLocation?.latitude, workerLocation?.longitude, customerLocation?.latitude, customerLocation?.longitude, color]);

  return null;
}

export default function LiveTrackingMap({
  customerLocation,
  workerLocation,
  role = 'customer',
  onRouteInfo,
  height = '380px',
  initialCenter = [24.8607, 67.0011],
  compact = false
}) {
  const workerIcon = useMemo(() => L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: linear-gradient(135deg, #10b981, #059669); width: 32px; height: 32px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }), []);

  const customerIcon = useMemo(() => L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: linear-gradient(135deg, #ff6b00, #e05e00); width: 32px; height: 32px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }), []);

  const mapCenter = useMemo(() => {
    if (workerLocation && customerLocation) {
      return [
        (Number(workerLocation.latitude) + Number(customerLocation.latitude)) / 2,
        (Number(workerLocation.longitude) + Number(customerLocation.longitude)) / 2
      ];
    }
    return initialCenter;
  }, [workerLocation?.latitude, workerLocation?.longitude, customerLocation?.latitude, customerLocation?.longitude, initialCenter]);

  const workerPosition = workerLocation ? [Number(workerLocation.latitude), Number(workerLocation.longitude)] : null;
  const customerPosition = customerLocation ? [Number(customerLocation.latitude), Number(customerLocation.longitude)] : null;

  return (
    <div style={{ height, width: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-grey)', position: 'relative' }}>
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {customerPosition && (
          <AnimatedMarker
            position={customerPosition}
            icon={customerIcon}
            popupTitle={role === 'worker' ? 'Customer Location' : 'Your Location'}
            popupBody={role === 'worker' ? 'Customer destination' : 'Your pickup point'}
          />
        )}

        {workerPosition && (
          <AnimatedMarker
            position={workerPosition}
            icon={workerIcon}
            popupTitle={role === 'worker' ? 'Your Location' : 'Worker Location'}
            popupBody={role === 'worker' ? 'Live GPS tracking' : 'Driver is on the way'}
          />
        )}

        {workerPosition && customerPosition && (
          <>
            <RoutingLayer
              workerLocation={workerLocation}
              customerLocation={customerLocation}
              onRouteInfo={onRouteInfo}
              color={role === 'worker' ? '#10b981' : '#ff6b00'}
            />
            <Polyline
              positions={[workerPosition, customerPosition]}
              color={role === 'worker' ? '#10b981' : '#ff6b00'}
              weight={3}
              opacity={0.45}
              dashArray="8, 8"
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
