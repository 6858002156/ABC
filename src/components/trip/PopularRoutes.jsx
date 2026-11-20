import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { mockApi } from "@/lib/mockApi";

const POPULAR = [
  { origin: "Siam Paragon", destination: "Central Pattaya Beach" },
  { origin: "Suvarnabhumi Airport", destination: "Pattaya Beach" },
  { origin: "Siam Paragon", destination: "Hua Hin Beach" },
  { origin: "Iconsiam", destination: "Mega Bangna" },
  { origin: "CentralWorld", destination: "Chiang Mai Old City" },
];

export default function PopularRoutes({ onPick }) {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    mockApi.entities.Location.list("name", 200)
      .then((rows) => setLocations(rows || []))
      .catch(() => setLocations([]));
  }, []);

  const pick = (route) => {
    const from = locations.find((l) => l.name === route.origin);
    const to = locations.find((l) => l.name === route.destination);
    if (from && to) onPick(from, to);
  };

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
        Popular routes
      </h3>
      <div className="flex flex-wrap gap-2">
        {POPULAR.map((route) => (
          <button
            key={`${route.origin}-${route.destination}`}
            onClick={() => pick(route)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
          >
            {route.origin} → {route.destination}
          </button>
        ))}
      </div>
    </div>
  );
}
