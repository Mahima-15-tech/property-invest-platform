import axios from "./axios";

export const getReports = (period = "6months") =>
  axios.get("/reports", {
    params: { period },
  });