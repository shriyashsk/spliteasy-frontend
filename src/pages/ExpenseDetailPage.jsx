import { useParams, useNavigate } from "react-router-dom";
import {
  useExpense,
  useComments,
  usePostComment,
  useDeleteExpense,
} from "../hooks/useExpenses";
import { useSocket } from "../providers/SocketProvider";
import useAuthStore from "../store/authStore";
import Navbar from "../components/layout/Navbar";
import BottomNav from "../components/layout/BottomNav";
import { ArrowLeft, Trash2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const socketRef = useSocket();

  const { data: expense, isLoading } = useExpense(id);
  const { data: comments = [] } = useComments(id);
  const postComment = usePostComment(id);
  const deleteExpense = useDeleteExpense(expense?.group_id);

  const [comment, setComment] = useState("");

  useEffect(() => {
    if (socketRef?.current) {
      socketRef.current.emit("join_expense", { expense_id: id });
    }
  }, [id, socketRef]);

  const handleDelete = async () => {
    if (!confirm("Delete this expense? This will reverse all balance changes."))
      return;
    try {
      await deleteExpense.mutateAsync(id);
      navigate(-1);
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await postComment.mutateAsync(comment);
    setComment("");
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (!expense)
    return (
      <div className="flex items-center justify-center h-screen">
        Expense not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="md:pt-16 pb-20 md:pb-0 max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-xl font-bold text-gray-800">
            {expense.title}
          </h1>
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-600"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Expense Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {expense.currency} {parseFloat(expense.amount).toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Paid by {expense.paid_by_name}
              </p>
            </div>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full capitalize">
              {expense.split_type}
            </span>
          </div>

          {expense.note && (
            <p className="text-sm text-gray-500 mb-4 italic">
              "{expense.note}"
            </p>
          )}

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-500 mb-2">
              Split breakdown
            </p>
            {expense.splits?.map((s, i) => (
              <div key={i} className="flex justify-between items-center py-1.5">
                <p className="text-sm text-gray-700">{s.user_name}</p>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {expense.currency} {parseFloat(s.amount).toFixed(2)}
                  </p>
                  {s.percentage && (
                    <p className="text-xs text-gray-400">{s.percentage}%</p>
                  )}
                  {s.share_count && (
                    <p className="text-xs text-gray-400">
                      {s.share_count} shares
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-sm font-medium text-gray-500 mb-3">Comments</p>

          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400">No comments yet</p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className={`flex gap-2 ${c.user_id === user?.id ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                    {c.user_name?.[0]?.toUpperCase()}
                  </div>
                  <div
                    className={`max-w-[75%] ${c.user_id === user?.id ? "items-end" : "items-start"} flex flex-col`}
                  >
                    <p className="text-xs text-gray-400 mb-0.5">
                      {c.user_name}
                    </p>
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${c.user_id === user?.id ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"}`}
                    >
                      {c.content}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Add a comment..."
            />
            <button
              type="submit"
              disabled={postComment.isPending}
              className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
