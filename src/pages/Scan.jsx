import { useEffect, useState } from "react";
import { mockApi } from "@/lib/mockApi";
import QrScanner from "@/components/charge/QrScanner";
import ChargingSession from "@/components/ChargingSession";

export default function Scan() {
  const [vehicle, setVehicle] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    mockApi.entities.Vehicle.filter({ is_active: true }, "-updated_date", 1)
      .then((vs) => setVehicle(vs?.[0] || null))
      .catch(() => setVehicle(null));
  }, []);

  // a scanned QR hands the station straight to the live charging session
  const startSession = (station) => {
    setSession({
      ...station,
      power_kw: station.max_power_kw || station.power_kw || 22,
      connector_type: station.connector_type || station.connector_types?.[0] || "CCS2",
    });
  };

  return (
    <div>
      <QrScanner onFound={startSession} />
      {session && <ChargingSession station={session} vehicle={vehicle} onClose={() => setSession(null)} />}
    </div>
  );
}
