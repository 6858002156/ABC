import { Outlet, Link, useLocation } from "react-router-dom";
import { Map as MapIcon, Car, Settings, QrCode, Zap, Users, Route as RouteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LEFT = [
  { to: "/", label: "Map", icon: MapIcon },
  { to: "/my-ev", label: "My EV", icon: Car },
];

const NAV_RIGHT = [
  { to: "/plan", label: "Plan", icon: RouteIcon },
  { to: "/community", label: "Community", icon: Users },
];

const HIDDEN_HEADER_PATHS = ["/", "/scan"];

function NavItem({ to, label, icon: Icon, pathname }) {
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <Link to={to} className="flex flex-col items-center gap-1 px-2 py-1.5 transition-transform active:scale-95">
      <div className={cn("w-9 h-7 rounded-full flex items-center justify-center transition-colors", active ? "bg-emerald-500/15" : "")}>
        <Icon className={cn("w-5 h-5 transition-colors", active ? "text-emerald-400" : "text-slate-500")} strokeWidth={active ? 2.6 : 2} />
      </div>
      <span className={cn("text-[10px] font-semibold transition-colors", active ? "text-emerald-400" : "text-slate-500")}>{label}</span>
    </Link>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const hideHeader = HIDDEN_HEADER_PATHS.includes(pathname);
  const scanActive = pathname.startsWith("/scan");

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header
        className={cn(
          "sticky top-0 z-30 pt-[env(safe-area-inset-top)] bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80",
          hideHeader && "hidden",
        )}
      >
        <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 text-slate-950" fill="currentColor" />
            </div>
            <div className="leading-none">
              <div className="text-[16px] font-bold tracking-tight text-white font-display">VOLT JAI</div>
              <div className="text-[9px] font-semibold text-emerald-400/80 tracking-[0.2em] uppercase">Thailand EV</div>
            </div>
          </Link>
          <Link to="/settings" aria-label="Settings" className="text-slate-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full pb-[calc(7.5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
        <div className="relative max-w-md mx-auto px-2 h-16 flex items-center justify-around">
          {NAV_LEFT.map((item) => (
            <NavItem key={item.to} {...item} pathname={pathname} />
          ))}

          <div className="w-16" aria-hidden="true" />

          {NAV_RIGHT.map((item) => (
            <NavItem key={item.to} {...item} pathname={pathname} />
          ))}

          <Link
            to="/scan"
            aria-label="Scan QR to charge"
            className="absolute left-1/2 -translate-x-1/2 -top-7 flex flex-col items-center active:scale-95 transition-transform"
          >
            <div
              className={cn(
                "w-[62px] h-[62px] rounded-full flex items-center justify-center ring-[6px] ring-slate-950 shadow-xl transition-colors",
                scanActive
                  ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/50"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-600/40",
              )}
            >
              <QrCode className="w-8 h-8 text-slate-950" strokeWidth={2.4} />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 mt-1">Scan</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}