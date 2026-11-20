import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Mail, ShieldAlert, Trash2, Loader2 } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    mockApi.auth.me().then(setUser).catch(() => {});
  }, []);

  const deleteAccount = async () => {
    setError("");
    setDeleting(true);
    try {
      const res = await mockApi.functions.invoke("deleteAccount", { confirm: "DELETE" });
      if (res.data?.error) throw new Error(res.data.error);
      await mockApi.auth.logout("/login");
      window.location.href = "/login";
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Could not delete the account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="px-5 pt-5 space-y-5">
      <div className="flex items-center gap-2">
        <Link to="/" aria-label="Back" className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-slate-400 active:bg-slate-800">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-white font-display">Settings</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Account</div>
        <div className="flex items-center gap-3 mt-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-[15px] shrink-0">
            {(user?.full_name || user?.email || "V").slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-slate-900 truncate">{user?.full_name || "EV driver"}</div>
            <div className="text-[12px] text-slate-500 truncate inline-flex items-center gap-1">
              <Mail className="w-3 h-3" /> {user?.email || "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-red-100 p-4">
        <div className="flex items-center gap-2 text-red-600">
          <ShieldAlert className="w-4 h-4" />
          <h2 className="text-[14px] font-bold">Delete account</h2>
        </div>
        <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed">
          This permanently removes your account and the vehicles and bookings saved to it. Your wallet balance and charging history cannot be recovered.
        </p>
        {error && <p className="text-[12px] text-red-600 mt-2">{error}</p>}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={deleting}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-[13.5px] active:scale-[0.99] disabled:opacity-60 transition-transform"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {deleting ? "Deleting…" : "Delete my account"}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl max-w-[92vw] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                Your profile, saved vehicles and bookings will be deleted and you will be signed out. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Keep my account</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteAccount}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
