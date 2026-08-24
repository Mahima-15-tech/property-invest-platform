import axios from "./axios";

export const getInvestors = (page) =>  axios.get(`/user/investors?page=${page}`);

export const getInvestorDetails = (id) =>
  axios.get(`/user/investor/${id}`);

export const updateKyc = (id, status) =>
  axios.put(`/user/kyc/${id}`, { status });

  export const exportInvestors = () =>
  axios.get("/user/investors/export", {
    responseType: "blob",
  });

<<<<<<< HEAD
=======


export const getUsers = () => {
  return axios.get("/admin/users");
};

>>>>>>> backup-local
  export const getUsersList = () => axios.get("/user/list");