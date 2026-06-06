import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGroup,
  useGroupBalances,
  useGroupExpenses,
  useGroupSettlements,
  useGroupActivity,
} from "../hooks/useGroups";
import { useCreateExpense, useDeleteExpense } from "../hooks/useExpenses";
import { sendInvite, removeMember, createSettlement } from "../api/groups";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../store/authStore";
import Navbar from "../components/layout/Navbar";
import BottomNav from "../components/layout/BottomNav";
import {
  Plus,
  ArrowLeft,
  Trash2,
  MessageSquare,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useSocket } from "../providers/SocketProvider";
import { useEffect } from "react";
import toast from "react-hot-toast";

const SPLIT_TYPES = ["equal", "unequal", "percentage", "shares"];

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const socketRef = useSocket();

  const { data: group, isLoading } = useGroup(id);
  const { data: balances = [] } = useGroupBalances(id);
  const { data: expenses = [] } = useGroupExpenses(id);
  const { data: settlements = [] } = useGroupSettlements(id);
  const { data: activity = [] } = useGroupActivity(id);

  const createExpense = useCreateExpense(id);
  const deleteExpense = useDeleteExpense(id);

  const [tab, setTab] = useState("expenses");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [settleForm, setSettleForm] = useState({
    paid_to_user_id: "",
    amount: "",
    note: "",
  });

  const [expForm, setExpForm] = useState({
    title: "",
    amount: "",
    currency: group?.currency || "USD",
    paid_by_user_id: user?.id || "",
    split_type: "equal",
    participants: [],
    note: "",
    category: "other",
  });
  const [splitDetails, setSplitDetails] = useState({});

  useEffect(() => {
    if (group) {
      setExpForm((f) => ({
        ...f,
        currency: group.currency,
        paid_by_user_id: user?.id,
      }));
      const activeMembers = group.members || [];
      setExpForm((f) => ({
        ...f,
        participants: activeMembers.map((m) => m.id),
      }));
    }
  }, [group]);

  useEffect(() => {
    if (socketRef?.current) {
      socketRef.current.emit("join_group", { group_id: id });
    }
  }, [id, socketRef]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const members = group?.members || [];
    let participants = expForm.participants.map((uid) => {
      const base = { user_id: uid };
      if (expForm.split_type === "unequal")
        base.amount = parseFloat(splitDetails[uid] || 0);
      if (expForm.split_type === "percentage")
        base.percentage = parseFloat(splitDetails[uid] || 0);
      if (expForm.split_type === "shares")
        base.share_count = parseInt(splitDetails[uid] || 1);
      return base;
    });
    try {
      await createExpense.mutateAsync({
        group_id: id,
        title: expForm.title,
        amount: parseFloat(expForm.amount),
        currency: expForm.currency,
        paid_by_user_id: expForm.paid_by_user_id,
        split_type: expForm.split_type,
        participants,
        category: expForm.category,
        note: expForm.note,
      });
      setShowAddExpense(false);
      socketRef?.current?.emit("balance_updated", { group_id: id });
    } catch (err) {
      toast.error(
        err.response?.data?.detail?.message || "Failed to add expense",
      );
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await sendInvite(id, inviteEmail);
      toast.success(`Invite sent to ${inviteEmail}`);
      setShowInvite(false);
      setInviteEmail("");
    } catch {
      toast.error("Failed to send invite");
    }
  };

  const handleRemoveMember = async (uid) => {
    if (!confirm("Remove this member?")) return;
    try {
      await removeMember(id, uid);
      toast.success("Member removed");
      queryClient.invalidateQueries(["group", id]);
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    try {
      await createSettlement(id, {
        paid_by_user_id: user.id,
        paid_to_user_id: settleForm.paid_to_user_id,
        amount: parseFloat(settleForm.amount),
        currency: group.currency,
        note: settleForm.note,
      });
      toast.success("Settlement recorded!");
      queryClient.invalidateQueries(["balances", id]);
      queryClient.invalidateQueries(["settlements", id]);
      setShowSettle(false);
    } catch {
      toast.error("Failed to record settlement");
    }
  };

  const isAdmin = group?.created_by_user_id === user?.id;
  const members = group?.members || [];

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="md:pt-16 pb-20 md:pb-0 max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{group?.name}</h1>
            <p className="text-xs text-gray-400 capitalize">
              {group?.category} · {group?.currency}
            </p>
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {["expenses", "balances", "members", "activity"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition ${tab === t ? "bg-white shadow text-green-600" : "text-gray-500"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Expenses Tab */}
        {tab === "expenses" && (
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No expenses yet</p>
            ) : (
              expenses.map((e) => (
                <div
                  key={e.id}
                  onClick={() => navigate(`/expenses/${e.id}`)}
                  className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{e.title}</p>
                      <p className="text-xs text-gray-400">
                        {e.paid_by_name} paid · {e.split_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {e.currency} {parseFloat(e.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">{e.expense_date}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Balances Tab */}
        {tab === "balances" && (
          <div className="space-y-3">
            <button
              onClick={() => setShowSettle(true)}
              className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Record Settlement
            </button>
            {balances.length === 0 ? (
              <p className="text-center text-gray-400 py-8">All settled up!</p>
            ) : (
              balances.map((b, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 shadow-sm border"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">{b.user_1_name}</p>
                      <p className="text-xs text-gray-400">→ {b.user_2_name}</p>
                    </div>
                    <p
                      className={`font-bold ${b.net_amount > 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {Math.abs(b.net_amount).toFixed(2)} {b.currency}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Settlements
              </p>
              {settlements.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl p-3 shadow-sm border mb-2"
                >
                  <p className="text-sm">
                    {s.paid_by_name} paid {s.paid_to_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {s.currency} {parseFloat(s.amount).toFixed(2)}{" "}
                    {s.note && `· ${s.note}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {tab === "members" && (
          <div className="space-y-3">
            <button
              onClick={() => setShowInvite(true)}
              className="w-full border border-green-600 text-green-600 py-2 rounded-lg text-sm font-medium hover:bg-green-50 flex items-center justify-center gap-1"
            >
              <UserPlus size={14} /> Invite Member
            </button>
            {members.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{m.full_name}</p>
                  <p className="text-xs text-gray-400">
                    {m.email} · {m.role}
                  </p>
                </div>
                {isAdmin && m.id !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <UserMinus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Activity Tab */}
        {tab === "activity" && (
          <div className="space-y-2">
            {activity.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No activity yet</p>
            ) : (
              activity.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-xl p-3 shadow-sm border"
                >
                  <p className="text-sm text-gray-700">{a.description}</p>
                  <p className="text-xs text-gray-400">
                    {a.changed_by} ·{" "}
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white rounded-t-2xl md:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-4">Add Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <input
                required
                value={expForm.title}
                onChange={(e) =>
                  setExpForm((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Expense title"
              />
              <div className="flex gap-2">
                <input
                  required
                  type="number"
                  step="0.01"
                  value={expForm.amount}
                  onChange={(e) =>
                    setExpForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Amount"
                />
                <select
                  value={expForm.currency}
                  onChange={(e) =>
                    setExpForm((f) => ({ ...f, currency: e.target.value }))
                  }
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {["USD", "INR", "EUR", "GBP"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Paid by
                </label>
                <select
                  value={expForm.paid_by_user_id}
                  onChange={(e) =>
                    setExpForm((f) => ({
                      ...f,
                      paid_by_user_id: e.target.value,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Split type
                </label>
                <div className="flex gap-1">
                  {SPLIT_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() =>
                        setExpForm((f) => ({ ...f, split_type: t }))
                      }
                      className={`flex-1 py-1 rounded-lg text-xs font-medium border ${expForm.split_type === t ? "bg-green-600 text-white border-green-600" : "text-gray-500"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Participants
                </label>
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={expForm.participants.includes(m.id)}
                      onChange={(e) => {
                        setExpForm((f) => ({
                          ...f,
                          participants: e.target.checked
                            ? [...f.participants, m.id]
                            : f.participants.filter((id) => id !== m.id),
                        }));
                      }}
                    />
                    <span className="text-sm flex-1">{m.full_name}</span>
                    {expForm.split_type !== "equal" &&
                      expForm.participants.includes(m.id) && (
                        <input
                          type="number"
                          step="0.01"
                          value={splitDetails[m.id] || ""}
                          onChange={(e) =>
                            setSplitDetails((d) => ({
                              ...d,
                              [m.id]: e.target.value,
                            }))
                          }
                          className="w-20 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                          placeholder={
                            expForm.split_type === "shares"
                              ? "shares"
                              : expForm.split_type === "percentage"
                                ? "%"
                                : "amt"
                          }
                        />
                      )}
                  </div>
                ))}
              </div>

              <input
                value={expForm.note}
                onChange={(e) =>
                  setExpForm((f) => ({ ...f, note: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Note (optional)"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createExpense.isPending}
                  className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {createExpense.isPending ? "Adding..." : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">Invite Member</h2>
            <form onSubmit={handleInvite} className="space-y-3">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="friend@email.com"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 border rounded-lg py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Modal */}
      {showSettle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">Record Settlement</h2>
            <form onSubmit={handleSettle} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Paying to
                </label>
                <select
                  required
                  value={settleForm.paid_to_user_id}
                  onChange={(e) =>
                    setSettleForm((f) => ({
                      ...f,
                      paid_to_user_id: e.target.value,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select member</option>
                  {members
                    .filter((m) => m.id !== user?.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                </select>
              </div>
              <input
                required
                type="number"
                step="0.01"
                value={settleForm.amount}
                onChange={(e) =>
                  setSettleForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Amount"
              />
              <input
                value={settleForm.note}
                onChange={(e) =>
                  setSettleForm((f) => ({ ...f, note: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Note (optional)"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettle(false)}
                  className="flex-1 border rounded-lg py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium"
                >
                  Record
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
