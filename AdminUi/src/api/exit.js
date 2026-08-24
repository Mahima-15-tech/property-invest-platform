import axios from "./axios";

export const getExitRequests = () =>
  axios.get("/admin/exit-requests");

export const approveExit = (id) =>
  axios.put(`/admin/exit-requests/${id}/approve`);

export const rejectExit = (id) =>
  axios.put(`/admin/exit-requests/${id}/reject`);

export const updateInvestment = (id, data) =>
  axios.put(`/admin/investments/${id}`, data);

  export const updateExit = (id, data) => {
    return axios.put(`/admin/exits/${id}`, data);
  };