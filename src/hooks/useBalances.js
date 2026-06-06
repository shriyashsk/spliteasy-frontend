import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance";

export const useDashboardBalances = () =>
  useQuery({
    queryKey: ["dashboard-balances"],
    queryFn: () => api.get("/users/me/balances").then((r) => r.data.data),
  });
