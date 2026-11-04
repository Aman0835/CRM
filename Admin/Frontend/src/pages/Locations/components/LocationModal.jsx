import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiAlertCircle, FiCheck, FiMapPin, FiSearch, FiX } from "react-icons/fi";

// Fix standard Leaflet icon paths in React bundle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function LocationModal({ isOpen, onClose, onSave, location, isSubmitting }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [formData, setFormData] = useState({
    officeName: "",
    address: "",
    latitude: 19.076,
    longitude: 72.8777,
    allowedRadius: 100,
    isActive: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [formError, setFormError] = useState("");

  // Populate formData when location is passed or modal opens
  useEffect(() => {
    if (location) {
      setFormData({
        officeName: location.officeName || "",
        address: location.address || "",
        latitude: Number(location.latitude) || 19.076,
        longitude: Number(location.longitude) || 72.8777,
        allowedRadius: Number(location.allowedRadius) || 100,
        isActive: location.isActive !== undefined ? location.isActive : true,
      });
    } else {
      setFormData({
        officeName: "",
        address: "",
        latitude: 19.076,
        longitude: 72.8777,
        allowedRadius: 100,
        isActive: true,
      });
    }
    setSearchQuery("");
    setSearchResults([]);
    setFormError("");
  }, [location, isOpen]);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const lat = Number(formData.latitude) || 19.076;
    const lng = Number(formData.longitude) || 72.8777;
    const radius = Number(formData.allowedRadius) || 100;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    const circle = L.circle([lat, lng], {
      radius,
      color: "#3b82f6",
      fillColor: "#60a5fa",
      fillOpacity: 0.25,
      weight: 2,
    }).addTo(map);

    // Sync marker drag
    marker.on("dragend", async (e) => {
      const pos = e.target.getLatLng();
      circle.setLatLng(pos);
      setFormData((prev) => ({
        ...prev,
        latitude: Number(pos.lat.toFixed(6)),
        longitude: Number(pos.lng.toFixed(6)),
      }));

      // Reverse geocode to auto-fill address if not locked
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`
        );
        const data = await res.json();
        if (data && data.display_name) {
          setFormData((prev) => ({
            ...prev,
            address: data.display_name,
          }));
        }
      } catch (err) {
        // reverse geocoding is best-effort
      }
    });

    // Map click to move marker & radius circle
    map.on("click", async (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      marker.setLatLng([clickLat, clickLng]);
      circle.setLatLng([clickLat, clickLng]);
      setFormData((prev) => ({
        ...prev,
        latitude: Number(clickLat.toFixed(6)),
        longitude: Number(clickLng.toFixed(6)),
      }));

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickLat}&lon=${clickLng}`
        );
        const data = await res.json();
        if (data && data.display_name) {
          setFormData((prev) => ({
            ...prev,
            address: data.display_name,
          }));
        }
      } catch (err) {}
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    // Fix grey tiles issue when container renders in modal
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update circle radius when allowedRadius changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(Number(formData.allowedRadius) || 100);
    }
  }, [formData.allowedRadius]);

  // Handle Nominatim Address Search
  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=5`
      );
      const results = await res.json();
      setSearchResults(results || []);
      if (!results || results.length === 0) {
        toast?.error?.("No locations found for this address");
      }
    } catch (err) {
      setFormError("Address search failed. Please check internet connection.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = Number(Number(result.lat).toFixed(6));
    const lng = Number(Number(result.lon).toFixed(6));

    setFormData((prev) => ({
      ...prev,
      address: result.display_name,
      latitude: lat,
      longitude: lng,
    }));

    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
      circleRef.current.setLatLng([lat, lng]);
    }

    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.officeName.trim()) {
      setFormError("Office name is required");
      return;
    }
    if (!formData.address.trim()) {
      setFormError("Office address is required");
      return;
    }
    if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      setFormError("Valid latitude is required (-90 to 90)");
      return;
    }
    if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      setFormError("Valid longitude is required (-180 to 180)");
      return;
    }
    if (isNaN(formData.allowedRadius) || formData.allowedRadius < 10) {
      setFormError("Permitted radius must be at least 10 meters");
      return;
    }

    onSave({
      ...formData,
      allowedRadius: Number(formData.allowedRadius),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <FiMapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {location ? "Edit Office Location" : "Add New Office Location"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set geofenced boundary coordinates for employee attendance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Office Name & Radius */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Office / Branch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Headquarters, Downtown Salon, Branch 2"
                value={formData.officeName}
                onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Permitted Radius (Meters) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="5"
                  value={formData.allowedRadius}
                  onChange={(e) => setFormData({ ...formData, allowedRadius: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="text-xs font-medium text-slate-500 shrink-0">meters</span>
              </div>
            </div>
          </div>

          {/* Address Search Bar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Search Address or Landmark (OpenStreetMap)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Type an address or landmark to position the pin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddressSearch(e)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FiSearch className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
              <button
                type="button"
                onClick={handleAddressSearch}
                disabled={isSearching}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left p-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-start gap-2"
                  >
                    <FiMapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{res.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Leaflet Map Picker */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click map or drag the pin to pin-point location
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400">
                Blue circle shows permitted {formData.allowedRadius}m boundary
              </span>
            </div>
            <div
              ref={mapContainerRef}
              className="w-full h-64 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner z-0"
              style={{ minHeight: "250px" }}
            />
          </div>

          {/* Coordinates and Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Latitude & Longitude
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-mono"
                  placeholder="Latitude"
                  required
                />
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-mono"
                  placeholder="Longitude"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {formData.isActive ? "Active (Employees can check in here)" : "Inactive"}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Physical Address <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 101, Luxury Heights, Link Road, Mumbai, Maharashtra 400053"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FiCheck className="w-4 h-4" />
              {isSubmitting ? "Saving..." : location ? "Update Location" : "Save Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
