import axios from "./axios";

export const approveInvestment = (id) => {
  return axios.put(`/admin/investments/${id}/approve`);
};

export const rejectInvestment = (id) => {
  return axios.put(`/admin/investments/${id}/reject`);
};