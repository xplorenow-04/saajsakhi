import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, KeyRound, Zap, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { userApi } from "../../api/user.api";
import { adminApi } from "../../api/admin.api";
import { userAuthStore } from "../../store/userStore";
import { useContext } from "react";
import { authContext } from "../../context/AuthProvider";

export default function AdminLogin() {
  const navigate = useNavigate();
  const authData = useContext(authContext);
  const setUser = userAuthStore((s) => s.setUser);

  const [mode, setMode] = useState("existing");
  const [form, setForm] = useState({
    email: "",
    password: "",
    secretKey: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "existing") {
      const res = await userApi.loginUser({
        email: form.email,
        password: form.password,
      });

      if (res.success) {
        const user = res.data;

        if (user.role === 'admin') {
          authData.login(user);
          setUser(user);
          toast.success("Welcome back, Admin!");
          navigate("/admin");
        } else {
          toast.error("You do not have admin privileges");
          // Do NOT persist auth state for non-admins
        }
      } else {
        toast.error(res.message);
      }
    } else {
      if (!form.secretKey) {
        toast.error("Secret key is required");
        setLoading(false);
        return;
      }
      const res = await adminApi.createAdmin({
        email: form.email,
        password: form.password,
        secretKey: form.secretKey,
      });

      if (res.success) {
        toast.success(res.message || "Admin access granted");
        const loginRes = await userApi.loginUser({
          email: form.email,
          password: form.password,
        });
        if (loginRes.success) {
          authData.login(loginRes.data);
          setUser(loginRes.data);
        }
        navigate("/admin");
      } else {
        toast.error(res.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-surface-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-[10%] left-[30%] w-[500px] h-[500px] rounded-full pointer-events-none bg-accent/10 blur-[80px]" />
      <div className="absolute -bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full pointer-events-none bg-violet/10 blur-[80px]" />

      <div className="relative w-full max-w-md bg-surface-800 border border-white/[0.06] rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />

        <div className="flex flex-col items-center pt-12 pb-8 px-8 relative z-10">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5 shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 24px rgba(99,102,241,0.5)" }}
          >
            <Shield size={24} color="#fff" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Admin Access</h1>
          <p className="text-sm text-text-dim mt-2">Sign in to manage your store</p>
        </div>

        <div className="h-px bg-white/[0.06] mx-8" />

        <div className="flex mx-8 mt-6 bg-surface-700 rounded-xl p-1">
          <button
            onClick={() => setMode("existing")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              mode === "existing"
                ? "bg-accent text-white shadow-md"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Existing Admin
          </button>
          <button
            onClick={() => setMode("admin")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              mode === "admin"
                ? "bg-accent text-white shadow-md"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            New Admin
          </button>
        </div>

        <form className="flex flex-col gap-4 px-8 pt-6 pb-10 relative z-10" onSubmit={handleSubmit}>
          <div className="relative group">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none transition-colors group-focus-within:text-accent-light" />
            <input
              className="w-full bg-surface-700 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-dim focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative group">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none transition-colors group-focus-within:text-accent-light" />
            <input
              className="w-full bg-surface-700 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-dim focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {mode === "admin" && (
            <div className="relative group">
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none transition-colors group-focus-within:text-accent-light" />
              <input
                className="w-full bg-surface-700 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-dim focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                type="password"
                name="secretKey"
                placeholder="Enter secret key"
                value={form.secretKey}
                onChange={handleChange}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl text-white text-sm font-semibold tracking-wide cursor-pointer transition-all duration-200 hover:shadow-[0_8px_24px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "existing" ? "Sign In as Admin" : "Create Admin"}
          </button>

          <p className="text-center text-xs text-text-dim mt-2">
            <Link to="/login" className="text-accent-light hover:text-violet-light transition-colors duration-150 font-medium">
              Back to user login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
