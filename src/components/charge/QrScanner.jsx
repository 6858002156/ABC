import { useEffect, useRef, useState } from "react";
import { CameraOff, Loader2, QrCode } from "lucide-react";
import { findStationFromCode } from "@/lib/stationQr";

export default function QrScanner({ onFound }) {
  const videoRef = useRef(null);
  const handledRef = useRef(false);
  const failedRef = useRef("");
  const [status, setStatus] = useState("starting"); // starting | scanning | resolving
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");

  const accept = async (payload) => {
    if (handledRef.current) return;
    handledRef.current = true;
    setStatus("resolving");
    setMessage("");
    const station = await findStationFromCode(payload).catch(() => null);
    if (station) {
      onFound(station);
      return;
    }
    handledRef.current = false;
    failedRef.current = String(payload);
    setStatus(videoRef.current?.srcObject ? "scanning" : "scanned-none");
    setMessage("No charger matched that code — try the station name instead.");
  };

  useEffect(() => {
    let stream = null;
    let timer = null;
    let stopped = false;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("scanned-none");
        setMessage("This device can't open a camera — type the station name below.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("scanning");

        if (!("BarcodeDetector" in window)) {
          setMessage("This browser can't read QR codes — type the station name below.");
          return;
        }
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        timer = setInterval(async () => {
          if (handledRef.current || !videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const found = await detector.detect(videoRef.current);
            const raw = found?.[0]?.rawValue;
            if (raw && raw !== failedRef.current) accept(raw);
          } catch {
            // a single unreadable frame is not an error
          }
        }, 350);
      } catch {
        setStatus("scanned-none");
        setMessage("Camera access was blocked — type the station name below.");
      }
    };

    start();
    return () => {
      stopped = true;
      clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitCode = (e) => {
    e.preventDefault();
    if (code.trim()) accept(code.trim());
  };

  return (
    <div className="bg-slate-950 min-h-[calc(100vh-6rem)] px-5 pt-5 pb-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-[20px] font-bold text-white font-display">Scan to charge</h1>
        <p className="text-[12px] text-white/50 mt-0.5">Point the camera at the QR on the charger</p>

        <div className="relative mt-5 rounded-3xl overflow-hidden bg-black border border-white/10 aspect-[4/3]">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

          {status !== "resolving" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[62%] aspect-square rounded-2xl border-2 border-emerald-400/70">
                <span className="absolute -top-px -left-px w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl" />
                <span className="absolute -top-px -right-px w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl" />
                <span className="absolute -bottom-px -left-px w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl" />
                <span className="absolute -bottom-px -right-px w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl" />
              </div>
            </div>
          )}

          {status === "starting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
          )}

          {status === "scanned-none" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80 text-center px-6">
              <CameraOff className="w-7 h-7 text-white/40" />
              <p className="text-[12px] text-white/60">Camera unavailable</p>
            </div>
          )}

          {status === "resolving" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              <p className="text-[12px] text-white/70">Finding charging station…</p>
            </div>
          )}
        </div>

        <form onSubmit={submitCode} className="flex gap-2 mt-5">
          <div className="relative flex-1">
            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Or type the station name / code"
              className="w-full bg-white/10 border border-white/15 rounded-xl pl-9 pr-3 py-3 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400"
            />
          </div>
          <button
            type="submit"
            disabled={!code.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-900 font-semibold px-4 rounded-xl text-[13px] transition-colors"
          >
            Find
          </button>
        </form>

        {message && <p className="text-[12px] text-amber-300/90 mt-3 leading-snug">{message}</p>}

        <p className="text-[11px] text-white/35 mt-3 leading-snug">
          Scanning a charger's own link works too — the station is matched automatically.
        </p>
      </div>
    </div>
  );
}