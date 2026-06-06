import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Home, Users } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { logout } from "../../api/auth";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    clearAuth();
    navigate("/login");
    toast.success("Logged out");
  };

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b px-6 py-3 items-center justify-between">
      <Link to="/dashboard" className="text-xl font-bold text-green-600">
        SplitEasy
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600"
        >
          <Home size={16} /> Dashboard
        </Link>
        <Link
          to="/profile"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600"
        >
          <User size={16} /> {user?.full_name?.split(" ")[0]}
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}
