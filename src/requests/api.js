import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000",
});

// Добавляем токен автоматически, если нужно
export const setToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

// Авторизация
export const loginUser = (phone, password) => {
  return API.post("/login", { phone, password });
};

// Регистрация
export const registerUser = (phone, password, name) => {
  return API.post("/register", { phone, password, name });
};

// Создать документ
export const createDocument = (userId, typeId, fields) => {
  return API.post("/documents", {
    user_id: userId,
    type_id: typeId,
    ...fields,
  });
};

export const deleteDocument = (userId, documentId) => {
  return API.delete(`/documents/${userId}/${documentId}`);
};

// Получить документы пользователя
export const getUserDocuments = (userId) => {
  return API.get(`/documents/${userId}`);
};

export const getDocumentTypes = () => {
  return API.get("/document-types");
};

export const getPublicDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: [
            "name",
            "surname",
            "patronymic",
            "photo_url",
            "birth_date",
          ],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ message: "Документ не знайдено" });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export default API;
