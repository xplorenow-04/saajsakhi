import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, KeyRound, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { userApi } from "../../api/user.api";
import { adminApi } from "../../api/admin.api";
import { userAuthStore } from "../../store/userStore";
import { authContext } from "../../context/AuthProvider";

export default function AdminLogin() {
  const navigate = useNavigate();
  const authData = useContext(authContext);
  const setUser = userAuthStore((s) => s.setUser);

  const [mode, setMode] = useState("existing");
  const [form, setForm] = useState({ email: "", password: "", secretKey: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "existing") {
      const res = await userApi.loginUser({ email: form.email, password: form.password });
      if (res.success) {
        const user = res.data;
        if (user.role === "admin") {
          authData.login(user);
          setUser(user);
          toast.success("Welcome back, Admin!");
          navigate("/admin");
        } else {
          toast.error("You do not have admin privileges");
        }
      } else {
        toast.error(res.message);
      }
    } else {
      if (!form.secretKey) { toast.error("Secret key is required"); setLoading(false); return; }
      const res = await adminApi.createAdmin({ email: form.email, password: form.password, secretKey: form.secretKey });
      if (res.success) {
        toast.success(res.message || "Admin access granted");
        const loginRes = await userApi.loginUser({ email: form.email, password: form.password });
        if (loginRes.success) { authData.login(loginRes.data); setUser(loginRes.data); }
        navigate("/admin");
      } else {
        toast.error(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-lux-bg flex items-center justify-center px-4 py-12">
      {/* Warm ambient glow */}
      <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] rounded-full bg-lux-accent/6 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <p className="font-display text-2xl font-bold tracking-[0.15em] text-lux-text">SAAJSAKHEE</p>
            <p className="text-[9px] tracking-[0.35em] uppercase text-lux-accent font-medium">Admin Portal</p>
          </Link>
          <div className="w-14 h-14 rounded-2xl bg-lux-accent flex items-center justify-center mx-auto mb-4 shadow-warm-md">
            <Shield size={24} color="#fff" />
          </div>
          <h1 className="font-display text-2xl font-bold text-lux-text">Admin Access</h1>
          <p className="text-sm text-lux-muted mt-1">Sign in to manage your store</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-lux-border shadow-card p-8 space-y-6">
          {/* Mode toggle */}
          <div className="flex bg-lux-bg rounded-xl p-1 gap-1">
            <button
              onClick={() => setMode("existing")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === "existing" ? "bg-lux-accent text-white shadow-warm-sm" : "text-lux-muted hover:text-lux-text"
              }`}
            >
              Existing Admin
            </button>
            <button
              onClick={() => setMode("admin")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === "admin" ? "bg-lux-accent text-white shadow-warm-sm" : "text-lux-muted hover:text-lux-text"
              }`}
            >
              New Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-lux-text uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-dim pointer-events-none" />
                <input className="luxury-input pl-10" type="email" name="email" placeholder="admin@email.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-lux-text uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-dim pointer-events-none" />
                <input className="luxury-input pl-10" type="password" name="password" placeholder="Enter password" value={form.password} onChange={handleChange} required />
              </div>
            </div>

            {mode === "admin" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-lux-text uppercase tracking-wider">Secret Key</label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-dim pointer-events-none" />
                  <input className="luxury-input pl-10" type="password" name="secretKey" placeholder="Admin secret key" value={form.secretKey} onChange={handleChange} />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-luxury w-full justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Signing In…" : mode === "existing" ? "Sign In as Admin" : "Create Admin"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <p className="text-center text-xs text-lux-dim">
            <Link to="/login" className="text-lux-accent hover:text-lux-hover transition-colors font-medium">
              ← Back to user login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
