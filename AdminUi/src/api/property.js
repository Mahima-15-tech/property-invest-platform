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

<<<<<<< HEAD

=======
>>>>>>> backup-local
// UPDATE
export const updateProperty = (id, data) => {
  return axios.put(`/properties/${id}`, data);
};

<<<<<<< HEAD
=======
// ✅ ADD THIS
export const toggleFeatured = (id, isFeatured) => {
  return axios.patch(`/properties/${id}/featured`, {
    isFeatured,
  });
};

>>>>>>> backup-local
export const getPropertiesList = () => axios.get("/properties/list");

// DELETE
export const deleteProperty = (id) => {
  return axios.delete(`/properties/${id}`);
};