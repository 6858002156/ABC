import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Car, Sparkles } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import TripPlanForm from "@/components/trip/TripPlanForm";
import TripPlanLoading from "@/components/trip/TripPlanLoading";
import TripPlanResult from "@/components/trip/TripPlanResult";
import PopularRoutes from "@/components/trip/PopularRoutes";

export default function TripPlanner() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [batteryStart, setBatteryStart] = useState(70);
  const [batteryTarget, setBatteryTarget] = useState(85);
  const [planning, setPlanning] = useState(false);
  const [plan, setPlan] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    mockApi.entities.UserVehicles.list()
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : rows?.items || [];
        setVehicles(list);
        const active = list.find((v) => v.is_active) || list[0];
        if (active) setVehicleId(active.id);
      })
      .catch(() => setVehicles([]))
      .finally(() => setVehiclesLoaded(true));
  }, []);

  const clearPlan = () => {
    setPlan(null);
    setSaved(false);
    setError("");
  };

  const pickOrigin = (loc) => {
    setOrigin(loc);
    clearPlan();
  };

  const pickDestination = (loc) => {
    setDestination(loc);
    clearPlan();
  };

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
    clearPlan();
  };

  const changeStart = (value) => {
    setBatteryStart(Math.max(5, Math.min(value, batteryTarget - 5)));
    clearPlan();
  };

  const changeTarget = (value) => {
    setBatteryTarget(Math.min(100, Math.max(value, batteryStart + 5)));
    clearPlan();
  };

  const changeVehicle = (id) => {
    setVehicleId(id);
    clearPlan();
  };

  const runPlan = async () => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!origin || !destination || !vehicle || planning) return;
    setPlanning(true);
    setPlan(null);
    setSaved(false);
    setError("");
    try {
      const res = await mockApi.functions.invoke("planEvTrip", {
        origin: { name: origin.name, lat: origin.lat ?? origin.latitude, lng: origin.lng ?? origin.longitude },
        destination: { name: destination.name, lat: destination.lat ?? destination.latitude, lng: destination.lng ?? destination.longitude },
        vehicle: {
          brand: vehicle.brand,
          model: vehicle.model,
          battery_capacity_kwh: vehicle.battery_capacity_kwh,
          preferred_connector: vehicle.preferred_connector,
        },
        battery_start_pct: batteryStart,
        battery_target_pct: batteryTarget,
      });
      if (res.data?.error) throw new Error(res.data.error);
      const data = res.data;
      setPlan(data);

      try {
        await mockApi.entities.Trip.create({
          origin: data.origin,
          destination: data.destination,
          distance_km: data.distance_km,
          estimated_duration_minutes: data.total_duration_minutes,
          total_duration_minutes: data.total_duration_minutes,
          estimated_cost: data.estimated_cost,
          energy_kwh: data.energy_kwh,
          battery_start_pct: data.start_pct,
          battery_target_pct: data.target_pct,
          arrival_battery_pct: data.arrival_pct,
          summary: data.summary,
          vehicle_model: data.vehicle_model,
          charging_stops: data.charging_stops,
        });
        setSaved(true);
      } catch {
        setSaved(false);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Could not plan this trip. Please try again.");
    } finally {
      setPlanning(false);
    }
  };

  const noVehicles = vehiclesLoaded && vehicles.length === 0;

  return (
    <div className="px-5 pt-5 pb-6 space-y-4">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          <Sparkles className="h-3 w-3" /> AI trip planner
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Plan your route</h1>
        <p className="text-[12.5px] font-medium text-slate-400">
          Route, charging stops and cost, planned for your car
        </p>
      </div>

      {noVehicles ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
            <Car className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="mt-3 text-[15px] font-bold text-slate-900">Add your EV first</h2>
          <p className="mx-auto mt-1 max-w-[260px] text-[12px] leading-relaxed text-slate-500">
            The planner uses your real battery size and connector to choose charging stops.
          </p>
          <Link
            to="/garage"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white"
          >
            Add a vehicle
          </Link>
        </div>
      ) : (
        <TripPlanForm
          origin={origin}
          destination={destination}
          onOrigin={pickOrigin}
          onDestination={pickDestination}
          onSwap={swap}
          vehicles={vehicles}
          vehicleId={vehicleId}
          onVehicle={changeVehicle}
          batteryStart={batteryStart}
          onBatteryStart={changeStart}
          batteryTarget={batteryTarget}
          onBatteryTarget={changeTarget}
          onPlan={runPlan}
          planning={planning}
        />
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-[12px] leading-relaxed text-red-600">
          {error}
        </div>
      )}

      {planning && <TripPlanLoading origin={origin?.name} destination={destination?.name} />}

      {plan && !planning && <TripPlanResult plan={plan} saved={saved} onReset={clearPlan} />}

      {!plan && !planning && !noVehicles && (
        <PopularRoutes
          onPick={(from, to) => {
            setOrigin(from);
            setDestination(to);
            clearPlan();
          }}
        />
      )}
    </div>
  );
}
