import axios from "./axios";

export const getSupportRequests = (params = {}) =>
  axios.get("/contact", { params });

export const resolveSupportRequest = (id, data) =>
  axios.put(`/contact/${id}/resolve`, data);