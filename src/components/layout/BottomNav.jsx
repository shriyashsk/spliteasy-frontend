import { Link, useLocation } from "react-router-dom";
import { Home, Users, User } from "lucide-react";

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex items-center justify-around py-2">
      <Link
        to="/dashboard"
        className={`flex flex-col items-center text-xs gap-1 ${pathname === "/dashboard" ? "text-green-600" : "text-gray-500"}`}
      >
        <Home size={20} /> Home
      </Link>
      <Link
        to="/profile"
        className={`flex flex-col items-center text-xs gap-1 ${pathname === "/profile" ? "text-green-600" : "text-gray-500"}`}
      >
        <User size={20} /> Profile
      </Link>
    </nav>
  );
}
