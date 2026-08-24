import axios from "./axios";

export const approveInvestment = (id, data) => {
  return axios.put(
    `/admin/investments/${id}/approve`,
    data
  );
};

export const rejectInvestment = (id) => {
  return axios.put(`/admin/investments/${id}/reject`);
};

export const updateInvestment = (id, data) => {
  return axios.put(
      `/admin/investments/${id}`,
      data
  );
};