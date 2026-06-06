import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpense,
  createExpense,
  deleteExpense,
  getComments,
  postComment,
} from "../api/expenses";
import toast from "react-hot-toast";

export const useExpense = (id) =>
  useQuery({
    queryKey: ["expense", id],
    queryFn: () => getExpense(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useComments = (id) =>
  useQuery({
    queryKey: ["comments", id],
    queryFn: () => getComments(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useCreateExpense = (groupId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createExpense(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses", groupId]);
      queryClient.invalidateQueries(["balances", groupId]);
      toast.success("Expense added!");
    },
    onError: (e) =>
      toast.error(e.response?.data?.detail?.message || "Failed to add expense"),
  });
};

export const useDeleteExpense = (groupId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses", groupId]);
      queryClient.invalidateQueries(["balances", groupId]);
      toast.success("Expense deleted");
    },
    onError: () => toast.error("Failed to delete expense"),
  });
};

export const usePostComment = (expenseId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content) => postComment(expenseId, content),
    onSuccess: () => queryClient.invalidateQueries(["comments", expenseId]),
    onError: () => toast.error("Failed to post comment"),
  });
};
