import axios from "./axios";

export const getInvestors = (page) =>  axios.get(`/user/investors?page=${page}`);

export const getInvestorDetails = (id) =>
  axios.get(`/user/investor/${id}`);


  export const updateKyc = (id, status, data = {}) =>
    axios.put(`/user/kyc/${id}`, {
      status,
      ...data,
    });


  export const exportInvestors = () =>
  axios.get("/user/investors/export", {
    responseType: "blob",
  });

  // export const updateKycDetails = (id, data) =>
  // axios.put(
  //   `/kyc/investors/${id}/kyc`,
  //   data
  // );

export const getUsers = () => {
  return axios.get("/admin/users");
};

  export const getUsersList = () => axios.get("/user/list");

  export const updateKycDetails = (id, formData) =>
  axios.put(`/kyc/investors/${id}/kyc`, formData);

  export const updateInvestorPhone = (id, phone) =>
  axios.put(`/user/investor/${id}/phone`, { phone });

  export const rejectKyc = (id, data) =>
  axios.put(`/user/kyc/${id}/reject`, data);