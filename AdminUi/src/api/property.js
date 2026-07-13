import axios from "./axios";

// CREATE
export const createProperty = async (data) => {
  const res = await axios.post("/properties/create", data);
  return res.data;
};

// GET ALL
export const getProperties = () => {
  return axios.get("/properties");
};

// GET SINGLE
export const getPropertyById = (id) => {
  return axios.get(`/properties/${id}`);
};


// UPDATE
export const updateProperty = (id, data) => {
  return axios.put(`/properties/${id}`, data);
};

export const getPropertiesList = () => axios.get("/properties/list");

// DELETE
export const deleteProperty = (id) => {
  return axios.delete(`/properties/${id}`);
};