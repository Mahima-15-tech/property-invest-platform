import axios from "./axios";

export const getAuditLogs = () => axios.get("/audit-logs");