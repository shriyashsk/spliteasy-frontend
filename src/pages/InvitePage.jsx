import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { token: authToken } = useAuthStore();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/invites/${token}`)
      .then((r) => setInvite(r.data.data))
      .catch(() => toast.error("Invalid or expired invite"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!authToken) {
      localStorage.setItem("pending_invite", token);
      navigate("/login");
      return;
    }
    try {
      const res = await api.post(`/invites/${token}/accept`);
      toast.success("Joined group!");
      navigate(`/groups/${res.data.data.group_id}`);
    } catch {
      toast.error("Failed to accept invite");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">👋</span>
        </div>
        <h1 className="text-xl font-bold mb-2">You're invited!</h1>
        {invite ? (
          <>
            <p className="text-gray-500 mb-1">
              {invite.inviter_name} invited you to join
            </p>
            <p className="text-2xl font-bold text-green-600 mb-6">
              {invite.group_name}
            </p>
            <button
              onClick={handleAccept}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
            >
              Accept Invitation
            </button>
          </>
        ) : (
          <p className="text-red-500">This invite is invalid or has expired.</p>
        )}
      </div>
    </div>
  );
}
