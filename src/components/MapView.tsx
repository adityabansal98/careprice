"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Star, Phone, MapPin, DollarSign, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HospitalResult } from "@/types";

// Fix for default marker icons in Leaflet with webpack
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom marker for best price
const bestPriceIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
    width: 36px;
    height: 36px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    border: 3px solid white;
  ">
    <span style="transform: rotate(45deg); font-size: 14px;">🏆</span>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Regular hospital marker
const hospitalIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
    border: 3px solid white;
  ">
    <span style="transform: rotate(45deg); font-size: 12px;">🏥</span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapViewProps {
  results: HospitalResult[];
  onSelectHospital?: (hospital: HospitalResult) => void;
}

// Component to fit map bounds to markers
function FitBounds({ results }: { results: HospitalResult[] }) {
  const map = useMap();

  useEffect(() => {
    if (results.length > 0) {
      const bounds = L.latLngBounds(
        results.map((r) => [r.hospital.coordinates.lat, r.hospital.coordinates.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [results, map]);

  return null;
}

function PriceDisplay({ priceInfo }: { priceInfo: HospitalResult["priceInfo"] }) {
  if (priceInfo.type === "cash") {
    return (
      <span className="text-lg font-bold text-primary-600">
        {formatCurrency(priceInfo.value ?? 0)}
      </span>
    );
  }

  return (
    <span className="text-lg font-bold text-primary-600">
      {formatCurrency(priceInfo.min ?? 0)} - {formatCurrency(priceInfo.max ?? 0)}
    </span>
  );
}

export function MapView({ results, onSelectHospital }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);

  // Ensure we only render on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-[500px] bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center">
        <span className="text-slate-400">Loading map...</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-full h-[500px] bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
        <span className="text-slate-400">No results to display on map</span>
      </div>
    );
  }

  // Calculate center from all results
  const center: [number, number] = [
    results.reduce((sum, r) => sum + r.hospital.coordinates.lat, 0) / results.length,
    results.reduce((sum, r) => sum + r.hospital.coordinates.lng, 0) / results.length,
  ];

  // Sort results by price to determine best price
  const sortedResults = [...results].sort((a, b) => {
    const priceA = a.priceInfo.type === "cash" ? a.priceInfo.value ?? 0 : a.priceInfo.min ?? 0;
    const priceB = b.priceInfo.type === "cash" ? b.priceInfo.value ?? 0 : b.priceInfo.min ?? 0;
    return priceA - priceB;
  });
  const bestPriceId = sortedResults[0]?.hospital.id;

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg">
      <MapContainer
        center={center}
        zoom={12}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds results={results} />
        
        {results.map((result) => {
          const isBestPrice = result.hospital.id === bestPriceId;
          
          return (
            <Marker
              key={result.hospital.id}
              position={[result.hospital.coordinates.lat, result.hospital.coordinates.lng]}
              icon={isBestPrice ? bestPriceIcon : hospitalIcon}
            >
              <Popup className="hospital-popup" minWidth={280} maxWidth={320}>
                <div className="p-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 text-base leading-tight">
                      {result.hospital.name}
                    </h3>
                    {isBestPrice && (
                      <Badge variant="success" className="text-xs whitespace-nowrap">
                        Best Price
                      </Badge>
                    )}
                  </div>

                  {/* Location & Rating */}
                  <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {result.hospital.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      {result.hospital.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="bg-gradient-to-r from-primary-50 to-teal-50 rounded-lg p-3 mb-3">
                    <div className="text-xs text-slate-500 mb-1">
                      {result.priceInfo.type === "cash" 
                        ? "Cash Price" 
                        : result.priceInfo.planName 
                          ? `${result.priceInfo.planName} Plan Rate` 
                          : "Insurance Rate Range"}
                    </div>
                    <PriceDisplay priceInfo={result.priceInfo} />
                  </div>

                  {/* Procedure */}
                  <div className="text-xs text-slate-600 mb-3 bg-slate-50 rounded-lg p-2">
                    <span className="font-medium">{result.procedure.name}</span>
                    <span className="text-slate-400 ml-1">({result.procedure.cpt_code})</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => window.open(`tel:${result.hospital.phone}`, "_self")}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => onSelectHospital?.(result)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// Default export for dynamic import
export default MapView;
