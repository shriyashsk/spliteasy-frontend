import api from "./axiosInstance";

export const getGroups = () => api.get("/groups");
export const createGroup = (data) => api.post("/groups", data);
export const getGroup = (id) => api.get(`/groups/${id}`);
export const getGroupBalances = (id) => api.get(`/groups/${id}/balances`);
export const getGroupExpenses = (id, page = 1) =>
  api.get(`/groups/${id}/expenses?page=${page}`);
export const getGroupSettlements = (id) => api.get(`/groups/${id}/settlements`);
export const getGroupActivity = (id) => api.get(`/groups/${id}/activity`);
export const sendInvite = (groupId, email) =>
  api.post(`/groups/${groupId}/invites`, { email });
export const removeMember = (groupId, userId) =>
  api.delete(`/groups/${groupId}/members/${userId}`);
export const createSettlement = (groupId, data) =>
  api.post(`/groups/${groupId}/settlements`, data);
