import axios from "./axios";

<<<<<<< HEAD
export const approveInvestment = (id) => {
  return axios.put(`/admin/investments/${id}/approve`);
=======
export const approveInvestment = (id, data) => {
  return axios.put(
    `/admin/investments/${id}/approve`,
    data
  );
>>>>>>> backup-local
};

export const rejectInvestment = (id) => {
  return axios.put(`/admin/investments/${id}/reject`);
<<<<<<< HEAD
=======
};

export const updateInvestment = (id, data) => {
  return axios.put(
      `/admin/investments/${id}`,
      data
  );
>>>>>>> backup-local
};