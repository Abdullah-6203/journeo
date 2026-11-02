import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  order?: number;
  isMustVisit?: boolean;
  status?: string; // PENDING, VISITED, SKIPPED
  imageUrl?: string;
  description?: string;
  timing?: string;
}

interface MapComponentProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  showRoute?: boolean;
  selectedMarkerId?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  height?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  markers,
  center = [28.6139, 77.2200],
  zoom = 12,
  showRoute = true,
  selectedMarkerId,
  onMarkerClick,
  height = '480px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    // CartoDB Voyager clean editorial map tiles
    const map = L.map(containerRef.current, {
      center,
      zoom,
      scrollWheelZoom: true
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    markerLayerRef.current = layer;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (markers.length === 0) return;

    const latLngs: L.LatLngExpression[] = [];

    markers.forEach(m => {
      latLngs.push([m.lat, m.lng]);
      const isSelected = m.id === selectedMarkerId;

      let markerBg = '#344B38'; // deep green default
      if (m.isMustVisit) markerBg = '#C87950'; // terracotta accent
      if (m.status === 'VISITED') markerBg = '#2E7D32'; // green
      if (m.status === 'SKIPPED') markerBg = '#9E9E9E'; // grey
      if (isSelected) markerBg = '#87977B'; // sage highlight

      const size = isSelected ? 34 : 28;

      const icon = L.divIcon({
        className: 'journeo-map-pin',
        html: `
          <div style="
            background: ${markerBg};
            color: #FFFFFF;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            font-size: ${isSelected ? 14 : 12}px;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(48,47,41,0.3);
            transition: transform 0.2s;
          ">
            ${m.order !== undefined ? m.order : '•'}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const leafletMarker = L.marker([m.lat, m.lng], { icon });

      leafletMarker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; width: 220px; padding: 4px;">
          ${m.order ? `<div style="font-size: 10px; font-weight: 700; color: #49634F; text-transform: uppercase;">Stop ${m.order} ${m.isMustVisit ? '• Must Visit' : ''}</div>` : ''}
          <div style="font-family: 'Playfair Display', serif; font-weight: 700; font-size: 14px; color: #344B3C; margin-top: 2px;">
            ${m.title}
          </div>
          ${m.timing ? `<div style="font-size: 11px; color: #667363; margin-top: 2px;">⏰ ${m.timing}</div>` : ''}
          ${m.imageUrl ? `<img src="${m.imageUrl}" style="width: 100%; height: 85px; object-fit: cover; border-radius: 6px; margin-top: 6px;" />` : ''}
          ${m.description ? `<p style="font-size: 11px; color: #667363; margin: 6px 0 0; line-height: 1.3;">${m.description.slice(0, 100)}...</p>` : ''}
        </div>
      `);

      leafletMarker.on('click', () => {
        if (onMarkerClick) onMarkerClick(m);
      });

      layer.addLayer(leafletMarker);
    });

    if (showRoute && latLngs.length > 1) {
      const poly = L.polyline(latLngs, {
        color: '#C87950',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '6, 6'
      }).addTo(map);
      polylineRef.current = poly;
      map.fitBounds(poly.getBounds(), { padding: [35, 35] });
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 13);
    }
  }, [markers, showRoute, selectedMarkerId]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border shadow-soft-md" style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-text flex items-center gap-1.5 shadow-soft-sm">
        <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
        <span>Demonstration Mode • Verified Geo-Coordinates</span>
      </div>
    </div>
  );
};
