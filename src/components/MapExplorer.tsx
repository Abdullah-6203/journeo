import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { OptimizedItinerary, ItineraryStop } from '../engine/itineraryOptimizer';
import { HeritageSite } from '../data/heritageSites';

interface MapExplorerProps {
  itinerary: OptimizedItinerary;
  selectedSite: HeritageSite;
  onSelectSite: (site: HeritageSite) => void;
}

export const MapExplorer: React.FC<MapExplorerProps> = ({
  itinerary,
  selectedSite,
  onSelectSite
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2200],
      zoom: 12,
      scrollWheelZoom: true
    });
    mapInstanceRef.current = map;

    // CartoDB Positron / Voyager clean heritage map tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers and route whenever itinerary or selectedSite changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const latLngs: L.LatLngExpression[] = [];

    // Starting Point Marker
    const startPoint = itinerary.startingPoint;
    latLngs.push([startPoint.lat, startPoint.lng]);

    const startIcon = L.divIcon({
      className: 'custom-start-marker',
      html: `
        <div style="background-color: #44352F; color: #F9F5ED; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; border: 2px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          🏁
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const startMarker = L.marker([startPoint.lat, startPoint.lng], { icon: startIcon });
    startMarker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
        <strong style="color: #44352F;">Starting Point</strong>
        <p style="margin: 4px 0 0; font-size: 12px; color: #82766B;">${startPoint.address}</p>
      </div>
    `);
    markersLayer.addLayer(startMarker);

    // Itinerary Stops Markers
    itinerary.stops.forEach((stop: ItineraryStop) => {
      latLngs.push([stop.site.location.lat, stop.site.location.lng]);

      const isSelected = stop.site.id === selectedSite.id;
      const markerColor = isSelected ? '#844C49' : (stop.isMustVisit ? '#B89A60' : '#44352F');
      const markerSize = isSelected ? 36 : 30;

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div style="
            background: ${markerColor};
            color: #FFFFFF;
            width: ${markerSize}px;
            height: ${markerSize}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Cinzel', serif;
            font-weight: 800;
            font-size: ${isSelected ? 16 : 14}px;
            border: 3px solid #FFFFFF;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            transition: all 0.2s ease;
          ">
            ${stop.stopOrder}
          </div>
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2]
      });

      const marker = L.marker([stop.site.location.lat, stop.site.location.lng], { icon: stopIcon });

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="background: #844C49; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">Stop ${stop.stopOrder}</span>
            <span style="font-size: 11px; color: #82766B; font-weight: 600;">${stop.arrivalTime} - ${stop.departureTime}</span>
          </div>
          <strong style="color: #44352F; font-size: 14px; font-family: 'Cinzel', serif; display: block; margin-bottom: 4px;">
            ${stop.site.name}
          </strong>
          <p style="font-size: 11px; color: #683634; margin: 0 0 6px; line-height: 1.3;">
            📜 ${stop.site.verification.verifiedBy}
          </p>
          <img src="${stop.site.image}" alt="${stop.site.name}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
          <button id="view-3d-${stop.site.id}" style="width: 100%; background: #D6B995; border: none; padding: 5px; border-radius: 4px; font-size: 11px; font-weight: 700; color: #44352F; cursor: pointer;">
            🏛️ Focus & View 3D Model
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectSite(stop.site);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-3d-${stop.site.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectSite(stop.site);
            map.closePopup();
          };
        }
      });

      markersLayer.addLayer(marker);
    });

    // Draw route polyline
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#844C49',
        weight: 4,
        opacity: 0.85,
        dashArray: '7, 8'
      }).addTo(map);
      polylineRef.current = polyline;

      // Fit map bounds to encompass all stops
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [itinerary, selectedSite]);

  return (
    <div className="relative w-full h-[480px] rounded-xl overflow-hidden border border-border-soft shadow-soft-lg">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-sandstone-light shadow-soft-sm text-xs text-espresso font-semibold">
        📍 {itinerary.stops.length} Heritage Stops • {itinerary.totalTravelDistanceKm} km Circuit
      </div>
    </div>
  );
};
