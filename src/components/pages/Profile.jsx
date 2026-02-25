import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Image,
  SimpleGrid,
  Stack,
  Heading,
} from "@chakra-ui/react";
import { toaster } from "../ui/toaster";
import { setUser } from "../reducers/userSlice";
import axios from "axios";
import InputMask from "react-input-mask";

const API = axios.create({ baseURL: "http://localhost:4000" });

function Profile() {
  const { user, token } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // Состояние для данных профиля
  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    patronymic: user?.patronymic || "",
    phone: user?.phone || "",
    birth_date: user?.birth_date || "",
    photo_url: user?.photo_url || "",
  });

  // Состояние для паролей
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preview, setPreview] = useState(user?.photo_url);
  const [loading, setLoading] = useState(false);

  // Загрузка нового фото
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("photo", file);

    try {
      const { data } = await API.post("/upload", uploadData);
      setFormData((prev) => ({ ...prev, photo_url: data.url }));
      setPreview(data.url);
      toaster.create({ title: "Фото оновлено", type: "success" });
    } catch (err) {
      toaster.create({ title: "Помилка завантаження", type: "error" });
    }
  };

  const handleUpdatePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwords;

    // Валидация на фронте
    if (!oldPassword || !newPassword) {
      toaster.create({
        title: "Введіть старий та новий паролі",
        type: "error",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toaster.create({ title: "Нові паролі не співпадають", type: "error" });
      return;
    }
    if (newPassword.length < 4) {
      toaster.create({
        title: "Пароль має бути не менше 4 символів",
        type: "error",
      });
      return;
    }

    try {
      const res = await API.put(`/users/${user.id}/password`, {
        oldPassword,
        newPassword,
      });

      toaster.create({ title: res.data.message, type: "success" });

      // Очищаем поля после успеха
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toaster.create({
        title: "Помилка",
        description: err.response?.data?.error || "Не вдалося змінити пароль",
        type: "error",
      });
    }
  };

  // Сохранение текстовых данных
  const handleSaveInfo = async () => {
    if (!formData.name || !formData.surname) {
      toaster.create({ title: "Ім'я та прізвище обов'язкові", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await API.put(`/users/${user.id}`, formData);
      // Обновляем Redux
      dispatch(setUser({ user: { ...user, ...formData }, token }));
      toaster.create({ title: "Дані успішно збережено", type: "success" });
    } catch (err) {
      toaster.create({ title: "Помилка при збереженні", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Используем Box как обертку вместо проблемного Container
    <Box maxW="1200px" mx="auto" py={10} px={5}>
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
        {/* ЛЕВАЯ ПАНЕЛЬ: Аватар */}
        <Box
          bg="white"
          p={8}
          borderRadius="24px"
          boxShadow="sm"
          height="fit-content"
          textAlign="center"
        >
          <VStack spacing={6}>
            <Box position="relative" display="inline-block">
              <Image
                src={preview || "https://via.placeholder.com/150"}
                w="180px"
                h="180px"
                rounded="full"
                objectFit="cover"
                border="5px solid #f7f8fa"
              />
              <Button
                size="xs"
                position="absolute"
                bottom="2"
                right="2"
                rounded="full"
                bg="black"
                color="white"
                onClick={() => fileInputRef.current.click()}
              >
                Змінити
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Box>

            <VStack spacing={1}>
              <Heading size="md">
                {formData.name} {formData.surname}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                ID користувача: {user?.id}
              </Text>
            </VStack>

            <Box w="100%" p={3} bg="green.50" borderRadius="xl">
              <Text fontSize="xs" fontWeight="bold" color="green.700">
                СТАТУС: ВЕРИФІКОВАНО
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* ПРАВАЯ ПАНЕЛЬ: Формы */}
        <Stack gap={6} gridColumn={{ lg: "span 2" }}>
          {/* Блок 1: Личные данные */}
          <Box bg="white" p={10} borderRadius="24px" boxShadow="sm">
            <Heading size="md" mb={8}>
              Особисті дані
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <Box>
                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="bold">
                  ПРІЗВИЩЕ
                </Text>
                <Input
                  value={formData.surname}
                  onChange={(e) =>
                    setFormData({ ...formData, surname: e.target.value })
                  }
                />
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="bold">
                  ІМ'Я
                </Text>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="bold">
                  ПО БАТЬКОВІ
                </Text>
                <Input
                  value={formData.patronymic}
                  onChange={(e) =>
                    setFormData({ ...formData, patronymic: e.target.value })
                  }
                />
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="bold">
                  ДАТА НАРОДЖЕННЯ
                </Text>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_date: e.target.value })
                  }
                />
              </Box>
              <Box gridColumn="span 2">
                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="bold">
                  ТЕЛЕФОН
                </Text>
                <InputMask
                  mask="+380 (99) 999 99 99"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                >
                  {(inputProps) => <Input {...inputProps} />}
                </InputMask>
              </Box>
            </SimpleGrid>
            <Button
              mt={8}
              w="full"
              bg="black"
              color="white"
              h="56px"
              borderRadius="12px"
              onClick={handleSaveInfo}
              isLoading={loading}
            >
              Зберегти зміни
            </Button>
          </Box>

          {/* Блок 2: Безопасность */}
          {/* Блок 2: Безпека */}
          <Box bg="white" p={10} borderRadius="24px" boxShadow="sm">
            <Heading size="md" mb={8}>
              Безпека
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              {/* ДОБАВЛЕНО ПОЛЕ ДЛЯ СТАРОГО ПАРОЛЯ */}
              <Box gridColumn="span 2">
                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="bold">
                  ПОТОЧНИЙ ПАРОЛЬ
                </Text>
                <Input
                  type="password"
                  placeholder="Введіть поточний пароль"
                  value={passwords.oldPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, oldPassword: e.target.value })
                  }
                />
              </Box>

              <Box gridColumn="span 2">
                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="bold">
                  НОВИЙ ПАРОЛЬ
                </Text>
                <Input
                  type="password"
                  placeholder="Введіть новий пароль"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                />
              </Box>
              <Box gridColumn="span 2">
                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="bold">
                  ПІДТВЕРДЖЕННЯ
                </Text>
                <Input
                  type="password"
                  placeholder="Повторіть пароль"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </Box>
            </SimpleGrid>
            <Button
              mt={8}
              w="full"
              variant="outline"
              borderColor="black"
              h="56px"
              borderRadius="12px"
              _hover={{ bg: "gray.50" }}
              onClick={handleUpdatePassword}
            >
              Оновити пароль
            </Button>
          </Box>
        </Stack>
      </SimpleGrid>
    </Box>
  );
}

export default Profile;
