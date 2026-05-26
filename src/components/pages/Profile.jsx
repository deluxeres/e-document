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
import InputMask from "react-input-mask";
import TwoFactorAuth from "../TwoFactorAuth";
import API from "../../requests/api";

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
  const [verificationLoading, setVerificationLoading] = useState(false);

  const isProfileVerified = user?.verification_status === "verified";
  const verificationChecks = [
    { label: "ПІБ", done: Boolean(user?.surname && user?.name) },
    { label: "Телефон", done: Boolean(user?.phone) },
    { label: "Дата народження", done: Boolean(user?.birth_date) },
    { label: "Фото профілю", done: Boolean(user?.photo_url) },
    { label: "2FA", done: Boolean(user?.two_factor_enabled) },
  ];

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
      dispatch(
        setUser({
          user: {
            ...user,
            ...formData,
            verification_status: "not_verified",
            verified_at: null,
          },
          token,
        }),
      );
      toaster.create({ title: "Дані збережено", type: "success" });
    } catch (err) {
      toaster.create({ title: "Помилка", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProfile = async () => {
    setVerificationLoading(true);
    try {
      const { data } = await API.post(`/users/${user.id}/verify-profile`);
      dispatch(setUser({ user: data.user, token }));

      if (data.verified) {
        toaster.create({ title: "Профіль верифіковано", type: "success" });
      } else {
        toaster.create({
          title: "Верифікацію не пройдено",
          description: `Заповніть: ${data.missingFields.join(", ")}`,
          type: "warning",
        });
      }
    } catch (err) {
      toaster.create({ title: "Помилка верифікації", type: "error" });
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <Box maxW="1200px" mx="auto" py={10} px={5}>
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
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
            <Box
              w="100%"
              p={4}
              bg={isProfileVerified ? "green.50" : "orange.50"}
              borderRadius="xl"
            >
              <Text
                fontSize="xs"
                fontWeight="bold"
                color={isProfileVerified ? "green.700" : "orange.700"}
              >
                {isProfileVerified ? "ВЕРИФІКОВАНО" : "НЕ ВЕРИФІКОВАНО"}
              </Text>
              {user?.verified_at && (
                <Text mt={1} fontSize="xs" color="gray.500">
                  {new Date(user.verified_at).toLocaleDateString("uk-UA")}
                </Text>
              )}
            </Box>
            <VStack w="100%" align="stretch" spacing={2}>
              {verificationChecks.map((item) => (
                <Text
                  key={item.label}
                  fontSize="xs"
                  color={item.done ? "green.600" : "gray.500"}
                >
                  {item.done ? "✓" : "•"} {item.label}
                </Text>
              ))}
            </VStack>
            <Button
              w="100%"
              size="sm"
              borderRadius="xl"
              colorPalette={isProfileVerified ? "green" : "orange"}
              variant={isProfileVerified ? "subtle" : "solid"}
              onClick={handleVerifyProfile}
              isLoading={verificationLoading}
            >
              Перевірити профіль
            </Button>
          </VStack>
        </Box>

        <Stack gap={6} gridColumn={{ lg: "span 2" }}>
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

          <TwoFactorAuth
            user={user}
            token={token}
            onUpdate={(status) =>
              dispatch(
                setUser({
                  user: {
                    ...user,
                    two_factor_enabled: status,
                    verification_status: status
                      ? user.verification_status
                      : "not_verified",
                    verified_at: status ? user.verified_at : null,
                  },
                  token,
                }),
              )
            }
          />

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
