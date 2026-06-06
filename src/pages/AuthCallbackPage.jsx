import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { getMe } from "../api/auth";

export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/login");
      return;
    }
    localStorage.setItem("token", token);
    getMe()
      .then((r) => {
        setAuth(token, r.data.data);
        navigate("/dashboard");
      })
      .catch(() => navigate("/login"));
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      Signing you in...
    </div>
  );
}
