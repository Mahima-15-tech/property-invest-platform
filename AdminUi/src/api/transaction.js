import axios from "./axios";

export const getTransactions = () =>
  axios.get("/transactions");

export const updateTransaction = (id, status) =>
  axios.put(`/transactions/${id}`, { status });

  export const createManualTransaction = (data) =>
  axios.post("/transactions/manual", data);