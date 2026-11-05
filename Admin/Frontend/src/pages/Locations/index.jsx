import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiEdit2,
  FiMapPin,
  FiNavigation,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  createOfficeLocation,
  deleteOfficeLocation,
  getOfficeLocations,
  updateOfficeLocation,
} from "../../services/officeLocationService";
import LocationModal from "./components/LocationModal";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await getOfficeLocations();
      if (res?.success) {
        setLocations(res.data || []);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load office locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreate = () => {
    setSelectedLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = async (location) => {
    if (location.assignedEmployeesCount > 0) {
      toast.error(
        `Cannot delete this location: ${location.assignedEmployeesCount} employee(s) are assigned to it. Reassign them first.`
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${location.officeName}"?`)) {
      return;
    }

    try {
      const res = await deleteOfficeLocation(location._id);
      if (res?.success) {
        toast.success("Office location deleted successfully");
        fetchLocations();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete office location");
    }
  };

  const handleToggleStatus = async (location) => {
    try {
      const res = await updateOfficeLocation(location._id, {
        isActive: !location.isActive,
      });
      if (res?.success) {
        toast.success(
          `Location "${location.officeName}" marked ${!location.isActive ? "Active" : "Inactive"}`
        );
        fetchLocations();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update location status");
    }
  };

  const handleSaveLocation = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedLocation) {
        const res = await updateOfficeLocation(selectedLocation._id, formData);
        if (res?.success) {
          toast.success("Office location updated successfully");
          setIsModalOpen(false);
          fetchLocations();
        }
      } else {
        const res = await createOfficeLocation(formData);
        if (res?.success) {
          toast.success("Office location created successfully");
          setIsModalOpen(false);
          fetchLocations();
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save office location");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
              <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                <FiMapPin className="w-5 h-5" />
              </span>
              Office Locations
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage office branches, GPS geofences, and permitted attendance boundaries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLocations}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh locations"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <FiPlus className="w-4 h-4" />
              Add Office Location
            </button>
          </div>
        </div>

        {/* Informative Guidance Banner */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
          <FiNavigation className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <span className="font-semibold">How Geofencing Works:</span> Employees assigned to an
            office location must be physically located within the specified radius (e.g. 100 meters)
            when checking in or out. The employee portal automatically queries browser GPS and validates
            distance directly on the backend.
          </div>
        </div>

        {/* Locations List / Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
            <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-3">
              <FiMapPin className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              No Office Locations Configured
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Add your salon headquarters or branch addresses to enable GPS-verified attendance for
              your employees.
            </p>
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Add First Office Location
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {locations.map((loc) => (
              <div
                key={loc._id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                        <FiMapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white">
                          {loc.officeName}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(loc)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        loc.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {loc.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>

                  {/* Physical Address */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {loc.address}
                  </p>

                  {/* Geofence Specs */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-4 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Permitted Radius</span>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {loc.allowedRadius} meters
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Assigned Staff</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <FiUsers className="w-3 h-3" />
                        {loc.assignedEmployeesCount || 0} employees
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <a
                    href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline"
                  >
                    <FiNavigation className="w-3 h-3" />
                    Open in Maps
                  </a>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(loc)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit location"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(loc)}
                      className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete location"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Location Modal */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLocation}
        location={selectedLocation}
        isSubmitting={isSubmitting}
      />
    </DashboardLayout>
  );
}
