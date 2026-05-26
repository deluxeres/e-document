import axios from "axios";

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  let savedUser = null;

  try {
    savedUser = JSON.parse(localStorage.getItem("userData")) || null;
  } catch {
    localStorage.removeItem("userData");
  }

  const token = savedUser?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const setToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

export const loginUser = (phone, password) => {
  return API.post("/login", { phone, password });
};

export const registerUser = (phone, password, name) => {
  return API.post("/register", { phone, password, name });
};

export const createDocument = (userId, typeId, fields, photoUrl) => {
  return API.post("/documents", {
    type_id: typeId,
    fields: fields,
    photo_url: photoUrl,
  });
};

export const deleteDocument = (userId, documentId) => {
  return API.delete(`/documents/${userId}/${documentId}`);
};

export const getUserDocuments = (userId) => {
  return API.get(`/documents/${userId}`);
};

export const getDocumentTypes = () => {
  return API.get("/document-types");
};

export const getPublicDocument = (shareToken) => {
  return API.get(`/public-document/${shareToken}`);
};

export const getImageAsBase64 = (url) => {
  return API.get(`/get-base64?url=${encodeURIComponent(url)}`);
};

export default API;
