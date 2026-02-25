import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  InputGroup,
  Stack,
  Text,
  SimpleGrid,
  Box,
  Button,
  Image,
} from "@chakra-ui/react";
import { toaster } from "../ui/toaster";
import axios from "axios";
import InputMask from "react-input-mask";

const API = axios.create({ baseURL: "http://localhost:4000" });

function Registration() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // Для показа выбранного фото
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toaster.create({ title: "Можна тільки зображення!", type: "error" });
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleRegister = async () => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 12) {
      toaster.create({ title: "Невірний номер", type: "error" });
      return;
    }

    if (!name || !surname || !file) {
      toaster.create({
        title: "Заповніть всі поля та додайте фото",
        type: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      toaster.create({ title: "Паролі не співпадають", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const uploadRes = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const photoUrlFromServer = uploadRes.data.url;

      await API.post("/register", {
        phone: cleanPhone,
        password,
        name,
        surname,
        patronymic,
        birth_date: birthDate,
        photo_url: photoUrlFromServer,
      });

      toaster.create({ title: "Реєстрація успішна", type: "success" });
      navigate("/");
    } catch (e) {
      toaster.create({
        title: "Помилка",
        description: e.response?.data?.error || e.message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login">
      <div className="login-wrapper">
        <div
          className="login-container"
          style={{ maxWidth: "600px", width: "100%" }}
        >
          <span className="login-title">📋 Реєстрація</span>

          <div className="login-form">
            <SimpleGrid columns={2} gap={4}>
              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  Прізвище
                </Text>
                <Input
                  placeholder="Прізвище"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                />
              </Box>
              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  Ім'я
                </Text>
                <Input
                  placeholder="Імʼя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Box>

              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  По батькові
                </Text>
                <Input
                  placeholder="По батькові"
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}
                />
              </Box>
              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  Дата народження
                </Text>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={today}
                />
              </Box>

              <Box gridColumn="span 2">
                <Text fontSize="xs" mb={1} color="gray.500">
                  Номер телефону
                </Text>
                <InputGroup width="100%">
                  <InputMask
                    mask="+380 (99) 999 99 99"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  >
                    {(inputProps) => (
                      <Input
                        {...inputProps}
                        type="tel"
                        placeholder="+380 (__) ___ __ __"
                      />
                    )}
                  </InputMask>
                </InputGroup>
              </Box>

              <Box gridColumn="span 2">
                <Text fontSize="xs" mb={1} color="gray.500">
                  Фото профілю
                </Text>
                <Stack direction="row" align="center" gap={4} width="100%">
                  {preview && (
                    <Image
                      src={preview}
                      minW="50px"
                      w="50px"
                      h="50px"
                      rounded="full"
                      objectFit="cover"
                      border="1px solid #e2e8f0"
                    />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current.click()}
                    flex="1"
                    whiteSpace="normal"
                    height="auto"
                    py={2}
                  >
                    {file ? file.name : "Оберіть файл на ПК"}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </Stack>
              </Box>

              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  Пароль
                </Text>
                <Input
                  placeholder="Пароль"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Box>
              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  Підтвердження
                </Text>
                <Input
                  placeholder="Повторіть пароль"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Box>
            </SimpleGrid>
          </div>

          <div className="login-button" style={{ marginTop: "20px" }}>
            <button
              style={{ width: "100%" }}
              onClick={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Завантаження..." : "Зареєструватися"}
            </button>
          </div>

          <div
            className="login-forgot"
            style={{ marginTop: "15px", textAlign: "center" }}
          >
            <span
              onClick={() => navigate("/")}
              style={{ cursor: "pointer", color: "black" }}
            >
              Вже є аккаунт? Увійти
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;
