import React, { useState } from "react";
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  HStack,
  Badge,
  Heading,
  Image,
} from "@chakra-ui/react";
import { toaster } from "./ui/toaster";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:4000" });

const TwoFactorAuth = ({ user, token, onUpdate }) => {
  const [setupData, setSetupData] = useState({
    qrCode: "",
    secret: "",
    code: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data } = await API.post(`/users/${user.id}/2fa/setup`);
      setSetupData((prev) => ({
        ...prev,
        qrCode: data.qrCode,
        secret: data.secret,
      }));
    } catch (err) {
      toaster.create({ title: "Помилка ініціалізації", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (setupData.code.length !== 6) {
      toaster.create({ title: "Введіть 6 цифр коду", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await API.post(`/users/${user.id}/2fa/verify`, {
        code: setupData.code,
        secret: setupData.secret,
      });
      onUpdate(1); // Сообщаем родителю (Profile), что 2FA включена
      setSetupData({ qrCode: "", secret: "", code: "" });
      toaster.create({ title: "Активовано", type: "success" });
    } catch (err) {
      toaster.create({
        title: "Невірний код",
        description: "Перевірте код у додатку",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!window.confirm("Ви впевнені, що хочете вимкнути 2FA?")) return;
    try {
      await API.post(`/users/${user.id}/2fa/disable`);
      onUpdate(0); // Сообщаем родителю, что 2FA выключена
      toaster.create({ title: "Вимкнено", type: "info" });
    } catch (err) {
      toaster.create({ title: "Помилка", type: "error" });
    }
  };

  return (
    <Box bg="white" p={10} borderRadius="24px" boxShadow="sm">
      <HStack justify="space-between" mb={8}>
        <Heading size="md">Безпека акаунту</Heading>
        <Badge
          colorPalette={user?.two_factor_enabled ? "green" : "gray"}
          variant="solid"
        >
          {user?.two_factor_enabled ? "АКТИВНО" : "ВИМКНЕНО"}
        </Badge>
      </HStack>

      {!user?.two_factor_enabled ? (
        !setupData.qrCode ? (
          <VStack align="start" gap={4}>
            <Text fontSize="sm" color="gray.600">
              Додайте додатковий рівень безпеки за допомогою Google
              Authenticator.
            </Text>
            <Button
              onClick={handleSetup}
              isLoading={loading}
              colorPalette="blue"
            >
              Увімкнути 2FA
            </Button>
          </VStack>
        ) : (
          <VStack gap={4} align="center">
            <Text fontSize="sm" fontWeight="bold">
              Відскануйте цей код:
            </Text>

            {/* ИСПРАВЛЕНО: Используем обычный Image для Base64 строки */}
            <Box
              p={2}
              bg="white"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="md"
            >
              <Image
                src={setupData.qrCode}
                alt="QR Code"
                boxSize="160px"
                fallbackSrc="https://via.placeholder.com/160?text=Loading+QR"
              />
            </Box>

            <Text fontSize="xs" color="gray.500" textAlign="center">
              Відскануйте код у додатку Google Authenticator або Authy
            </Text>

            <Input
              placeholder="000 000"
              textAlign="center"
              fontSize="xl"
              letterSpacing="4px"
              maxLength={6}
              value={setupData.code}
              onChange={(e) =>
                setSetupData({
                  ...setupData,
                  code: e.target.value.replace(/\D/g, ""),
                })
              }
            />
            <Button
              w="full"
              colorPalette="green"
              onClick={handleVerify}
              isLoading={loading}
            >
              Підтвердити та активувати
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSetupData({ ...setupData, qrCode: "" })}
            >
              Скасувати
            </Button>
          </VStack>
        )
      ) : (
        <VStack align="start" gap={4}>
          <Text color="green.600" fontSize="sm">
            Двофакторна аутентифікація активна. Ваш акаунт захищено.
          </Text>
          <Button
            variant="outline"
            colorPalette="red"
            size="sm"
            onClick={handleDisable}
          >
            Вимкнути 2FA
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default TwoFactorAuth;
