import { useState } from "react";
import { BRANDS, brandShort } from "@/lib/brands";

// Renders the real brand logo; falls back to a colored letter badge if the logo fails to load.
export default function BrandLogo({ brand, size = 44, className = "" }) {
  const data = BRANDS[brand];
  const [err, setErr] = useState(false);
  const dim = { width: size, height: size };

  if (!data?.logo || err) {
    return (
      <div style={{ ...dim, background: data?.color || "#64748b" }} className={`rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${className}`}>
        <span style={{ fontSize: size * 0.28 }}>{brandShort(brand)}</span>
      </div>
    );
  }

  return (
    <div style={{ ...dim, background: "#fff" }} className={`rounded-xl overflow-hidden shrink-0 border border-slate-100 ${className}`}>
      <img src={data.logo} alt={brand} loading="lazy" onError={() => setErr(true)} className="w-full h-full object-contain p-1" />
    </div>
  );
}