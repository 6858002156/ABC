import { Navigation } from "lucide-react";
import { openDirections } from "@/lib/directions";
import { cn } from "@/lib/utils";

export default function DirectionsButton({ lat, lng, label = "Directions", iconOnly = false, className = "" }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openDirections(lat, lng);
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        className={cn("w-7 h-7 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 flex items-center justify-center transition-colors", className)}
        aria-label="Get directions"
      >
        <Navigation className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn("inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-[14px] transition-colors", className)}
    >
      <Navigation className="w-4 h-4" /> {label}
    </button>
  );
}