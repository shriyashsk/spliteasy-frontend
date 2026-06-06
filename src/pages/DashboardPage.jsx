import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroups, useCreateGroup } from "../hooks/useGroups";
import { useDashboardBalances } from "../hooks/useBalances";
import Navbar from "../components/layout/Navbar";
import BottomNav from "../components/layout/BottomNav";
import { Plus, Users, TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: balances } = useDashboardBalances();
  const createGroup = useCreateGroup();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "other",
    currency: "USD",
  });

  const netTotal = balances?.net_total || 0;
  const details = balances?.details || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    await createGroup.mutateAsync(form);
    setShowCreate(false);
    setForm({ name: "", category: "other", currency: "USD" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="md:pt-16 pb-20 md:pb-0 max-w-2xl mx-auto px-4 py-6">
        {/* Net Position Card */}
        <div
          className={`rounded-2xl p-6 mb-6 text-white ${netTotal > 0 ? "bg-green-600" : netTotal < 0 ? "bg-red-500" : "bg-gray-400"}`}
        >
          <p className="text-sm opacity-80 mb-1">Overall Balance</p>
          <p className="text-3xl font-bold">
            {netTotal > 0 ? "+" : ""}
            {netTotal.toFixed(2)}
          </p>
          <p className="text-sm opacity-80 mt-1">
            {netTotal > 0
              ? "you are owed"
              : netTotal < 0
                ? "you owe"
                : "all settled up"}
          </p>
        </div>

        {/* Priority Actions */}
        {details.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 mb-2">
              Outstanding
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {details.map((d, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm border min-w-[160px]"
                >
                  <p className="text-xs text-gray-500">{d.group_name}</p>
                  <p className="font-medium text-sm">{d.other_user_name}</p>
                  <p
                    className={`text-sm font-bold ${d.net_amount > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {d.net_amount > 0 ? "+" : ""}
                    {d.net_amount.toFixed(2)} {d.currency}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups List */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Your Groups</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            <Plus size={14} /> New Group
          </button>
        </div>

        {groupsLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={40} className="mx-auto mb-2 opacity-40" />
            <p>No groups yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => (
              <div
                key={g.id}
                onClick={() => navigate(`/groups/${g.id}`)}
                className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{g.name}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {g.category} · {g.currency}
                    </p>
                  </div>
                  <div className="text-green-600">
                    <Users size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">Create Group</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Group Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Goa Trip"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="trip">Trip</option>
                  <option value="home">Home</option>
                  <option value="couple">Couple</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currency: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGroup.isPending}
                  className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {createGroup.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
