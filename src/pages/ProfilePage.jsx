import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { changePassword } from "../api/auth";
import api from "../api/axiosInstance";
import { logout } from "../api/auth";
import Navbar from "../components/layout/Navbar";
import BottomNav from "../components/layout/BottomNav";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    preferred_currency: user?.preferred_currency || "USD",
  });
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/users/me", form);
      updateUser({ ...user, ...form });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await changePassword(pwForm);
      toast.success("Password changed");
      setPwForm({ current_password: "", new_password: "" });
    } catch {
      toast.error("Failed to change password");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="md:pt-16 pb-20 md:pb-0 max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Profile</h1>

        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-700">
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user?.full_name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                value={form.full_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, full_name: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Preferred Currency
              </label>
              <select
                value={form.preferred_currency}
                onChange={(e) =>
                  setForm((f) => ({ ...f, preferred_currency: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {["USD", "INR", "EUR", "GBP"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
          <h2 className="font-semibold mb-3">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              required
              value={pwForm.current_password}
              onChange={(e) =>
                setPwForm((f) => ({ ...f, current_password: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Current password"
            />
            <input
              type="password"
              required
              value={pwForm.new_password}
              onChange={(e) =>
                setPwForm((f) => ({ ...f, new_password: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="New password"
            />
            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-900"
            >
              Change Password
            </button>
          </form>
        </div>

        <button
          onClick={handleLogout}
          className="w-full border border-red-300 text-red-500 py-2 rounded-lg text-sm font-medium hover:bg-red-50"
        >
          Log Out
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
