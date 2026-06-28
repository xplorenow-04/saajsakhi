import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  Camera,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { userApi } from "../../api/user.api";
import { userAuthStore } from "../../store/userStore";
import Navbar from "../../components/ecommerce/Navbar";
import Footer from "../../components/ecommerce/Footer";
import LoadingSkeleton from "../../components/ecommerce/LoadingSkeleton";

export default function ProfilePage() {
  const { user, setUser } = userAuthStore();

  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await userApi.authMe();
        if (res.success && res.data) {
          setUser(res.data);
          setProfileForm({
            name: res.data.name || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            address: res.data.address || "",
          });
        } else {
          toast.error("Failed to load profile");
        }
      } catch {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      fetchUser();
    } else {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
      setLoading(false);
    }
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (passwordErrors[e.target.name]) {
      setPasswordErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword)
      errors.currentPassword = "Current password is required";
    if (!passwordForm.newPassword)
      errors.newPassword = "New password is required";
    else if (passwordForm.newPassword.length < 6)
      errors.newPassword = "Must be at least 6 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await userApi.updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        address: profileForm.address,
      });
      if (res.success) {
        setUser(res.data);
        toast.success("Profile updated");
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setSavingPassword(true);
    try {
      const res = await userApi.updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.success) {
        toast.success("Password changed");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(res.message || "Failed to change password");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <LoadingSkeleton type="detail" count={1} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const inputClass = (hasError) =>
    `w-full bg-surface-700 border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 transition-all ${
      hasError
        ? "border-danger focus:border-danger focus:ring-danger/30"
        : "border-surface-600 focus:border-accent focus:ring-accent/30"
    }`;

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Profile Settings
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Manage your personal information and security
            </p>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-10">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-surface-700 border-2 border-surface-600 flex items-center justify-center overflow-hidden">
                {user?.avatar?.url || user?.avatar ? (
                  <img
                    src={user.avatar.url || user.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-text-muted" />
                )}
              </div>
              <button className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {profileForm.name || "User"}
              </h2>
              <p className="text-sm text-text-muted">{profileForm.email}</p>
            </div>
          </div>

          {/* Personal Info Card */}
          <form onSubmit={handleSaveProfile}>
            <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-6 sm:p-8 space-y-6 mb-6">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <User size={18} className="text-accent" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className={inputClass(false)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className={inputClass(false)}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="9876543210"
                      className={inputClass(false)}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Address
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3.5 top-3.5 text-text-muted"
                  />
                  <textarea
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileChange}
                    placeholder="Your address..."
                    rows={2}
                    className="w-full bg-surface-700 border border-surface-600 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Save */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 bg-accent hover:bg-accent/90 disabled:bg-surface-600 disabled:text-text-muted disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                >
                  {savingProfile ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>

          {/* Change Password Card */}
          <form onSubmit={handleChangePassword}>
            <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <Lock size={18} className="text-accent" />
                Change Password
              </h2>

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className={inputClass(!!passwordErrors.currentPassword)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-danger mt-1">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className={inputClass(!!passwordErrors.newPassword)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        new: !prev.new,
                      }))
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-danger mt-1">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className={inputClass(!!passwordErrors.confirmPassword)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-danger mt-1">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Save */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 bg-accent hover:bg-accent/90 disabled:bg-surface-600 disabled:text-text-muted disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                >
                  {savingPassword ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
