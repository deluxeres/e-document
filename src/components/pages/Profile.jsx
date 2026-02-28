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
  Separator, // Если используете Chakra v3, иначе просто Box с границей
} from "@chakra-ui/react";
import { toaster } from "../ui/toaster";
import { setUser } from "../reducers/userSlice";
import axios from "axios";
import InputMask from "react-input-mask";
import TwoFactorAuth from "../TwoFactorAuth";

const API = axios.create({ baseURL: "http://localhost:4000" });

function Profile() {
  const { user, token } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    patronymic: user?.patronymic || "",
    phone: user?.phone || "",
    birth_date: user?.birth_date || "",
    photo_url: user?.photo_url || "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preview, setPreview] = useState(user?.photo_url);
  const [loading, setLoading] = useState(false);

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
    if (!oldPassword || !newPassword) {
      toaster.create({ title: "Введіть паролі", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toaster.create({ title: "Паролі не співпадають", type: "error" });
      return;
    }
    try {
      await API.put(`/users/${user.id}/password`, { oldPassword, newPassword });
      toaster.create({ title: "Пароль оновлено", type: "success" });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toaster.create({
        title: "Помилка",
        description: err.response?.data?.error,
        type: "error",
      });
    }
  };

  const handleSaveInfo = async () => {
    setLoading(true);
    try {
      await API.put(`/users/${user.id}`, formData);
      dispatch(setUser({ user: { ...user, ...formData }, token }));
      toaster.create({ title: "Дані збережено", type: "success" });
    } catch (err) {
      toaster.create({ title: "Помилка", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="1200px" mx="auto" py={10} px={5}>
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
        {/* ЛЕВАЯ ПАНЕЛЬ */}
        <Box
          bg="white"
          p={8}
          borderRadius="24px"
          boxShadow="sm"
          height="fit-content"
          textAlign="center"
        >
          <VStack spacing={6}>
            <Box position="relative">
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
                ID: {user?.id}
              </Text>
            </VStack>
            <Box w="100%" p={3} bg="green.50" borderRadius="xl">
              <Text fontSize="xs" fontWeight="bold" color="green.700">
                ВЕРИФІКОВАНО
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* ПРАВАЯ ПАНЕЛЬ */}
        <Stack gap={6} gridColumn={{ lg: "span 2" }}>
          {/* Блок 1: Личные данные */}
          <Box bg="white" p={10} borderRadius="24px" boxShadow="sm">
            <Heading size="md" mb={8}>
              Особисті дані
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={2}>
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
                <Text fontSize="xs" fontWeight="bold" mb={2}>
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
                <Text fontSize="xs" fontWeight="bold" mb={2}>
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
                <Text fontSize="xs" fontWeight="bold" mb={2}>
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
                <Text fontSize="xs" fontWeight="bold" mb={2}>
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

          {/* Блок 2: Двухфакторная аутентификация (отдельной карточкой) */}
          <TwoFactorAuth
            user={user}
            token={token}
            onUpdate={(status) =>
              dispatch(
                setUser({
                  user: { ...user, two_factor_enabled: status },
                  token,
                }),
              )
            }
          />

          {/* Блок 3: Безопасность (Пароль) */}
          <Box bg="white" p={10} borderRadius="24px" boxShadow="sm">
            <Heading size="md" mb={8}>
              Зміна паролю
            </Heading>
            <VStack gap={6} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={2}>
                  ПОТОЧНИЙ ПАРОЛЬ
                </Text>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.oldPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, oldPassword: e.target.value })
                  }
                />
              </Box>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" mb={2}>
                    НОВИЙ ПАРОЛЬ
                  </Text>
                  <Input
                    type="password"
                    placeholder="Мінімум 4 символи"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" mb={2}>
                    ПІДТВЕРДЖЕННЯ
                  </Text>
                  <Input
                    type="password"
                    placeholder="Повторіть новий пароль"
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
                mt={4}
                w="full"
                variant="outline"
                borderColor="black"
                h="56px"
                borderRadius="12px"
                onClick={handleUpdatePassword}
              >
                Оновити пароль
              </Button>
            </VStack>
          </Box>
        </Stack>
      </SimpleGrid>
    </Box>
  );
}

export default Profile;
