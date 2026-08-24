import axios from "./axios";

export const getBrokers = () => axios.get("/brokers/all");

// broker.js
export const getCommissionBreakdown = () =>
  axios.get("/brokers/breakdown");