import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGroups,
  createGroup,
  getGroup,
  getGroupBalances,
  getGroupExpenses,
  getGroupActivity,
  getGroupSettlements,
} from "../api/groups";
import toast from "react-hot-toast";

export const useGroups = () =>
  useQuery({
    queryKey: ["groups"],
    queryFn: () => getGroups().then((r) => r.data.data),
  });

export const useGroup = (id) =>
  useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroup(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useGroupBalances = (id) =>
  useQuery({
    queryKey: ["balances", id],
    queryFn: () => getGroupBalances(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useGroupExpenses = (id) =>
  useQuery({
    queryKey: ["expenses", id],
    queryFn: () => getGroupExpenses(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useGroupActivity = (id) =>
  useQuery({
    queryKey: ["activity", id],
    queryFn: () => getGroupActivity(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useGroupSettlements = (id) =>
  useQuery({
    queryKey: ["settlements", id],
    queryFn: () => getGroupSettlements(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries(["groups"]);
      toast.success("Group created!");
    },
    onError: () => toast.error("Failed to create group"),
  });
};
