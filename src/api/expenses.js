import api from "./axiosInstance";

export const createExpense = (groupId, data) =>
  api.post(`/groups/${groupId}/expenses`, data);
export const getExpense = (id) => api.get(`/expenses/${id}`);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const getComments = (id) => api.get(`/expenses/${id}/comments`);
export const postComment = (id, content) =>
  api.post(`/expenses/${id}/comments`, { content });
