import api from "./axiosInstance";

export const reverseSettlement = (id) => api.post(`/settlements/${id}/reverse`);
