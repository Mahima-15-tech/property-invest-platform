import axios from "./axios";


// ==========================================
// INVESTMENT APPROVE
// ==========================================

export const approveInvestment = (id, data) => {
  return axios.put(
    `/admin/investments/${id}/approve`,
    data
  );
};


// ==========================================
// INVESTMENT REJECT
// ==========================================

export const rejectInvestment = (id) => {
  return axios.put(
    `/admin/investments/${id}/reject`
  );
};


// ==========================================
// VERIFY PAYMENT
// ==========================================

export const verifyPayment = (id) => {
  return axios.put(
    `/admin/investments/${id}/verify-payment`
  );
};


// ==========================================
// REJECT PAYMENT
// ==========================================

export const rejectPayment = (id) => {
  return axios.put(
    `/admin/investments/${id}/reject-payment`
  );
};


// ==========================================
// UPDATE INVESTMENT
// ==========================================

export const updateInvestment = (id, data) => {
  return axios.put(
    `/admin/investments/${id}`,
    data
  );
};