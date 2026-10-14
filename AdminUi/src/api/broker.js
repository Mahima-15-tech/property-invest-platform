import axios from "./axios";

export const getBrokers = () => axios.get("/brokers/all");

// broker.js
export const getCommissionBreakdown = () =>
  axios.get("/brokers/breakdown");

  export const getBrokerById = (id) =>
  axios.get(`/brokers/${id}`);

  export const approveBroker = (id) => {
    return axios.patch(`/brokers/${id}/approve`);
  };

  export const updateBrokerPaymentStatus = (brokerId, paymentStatus) =>
  axios.patch(`/brokers/${brokerId}/payment-status`, {
    paymentStatus,
  });

  // export const updateCommissionStatus = (commissionId, status) =>
  // axios.patch(`/api/brokers/commissions/${commissionId}/status`, {
  //   status,
  // });


export const markCommissionPaid = (commissionId) => {
  return axios.patch(
    `/brokers/commissions/${commissionId}/paid`
  );
};


export const updateCommissionStatus = (commissionId, status) => {
  return axios.patch(
    `/brokers/commissions/${commissionId}/status`,
    { status }
  );
};
