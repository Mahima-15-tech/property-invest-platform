import axios from "./axios";

export const getReports = () => axios.get("/reports");