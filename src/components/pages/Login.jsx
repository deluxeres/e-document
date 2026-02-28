import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, VStack, Text, Button } from "@chakra-ui/react";
import { toaster } from "../ui/toaster";
import { useDispatch } from "react-redux";
import { setUser } from "../reducers/userSlice";
import axios from "axios";
import InputMask from "react-input-mask";

const API = axios.create({ baseURL: "http://localhost:4000" });

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (require2FA) {
      if (twoFactorCode.length !== 6) {
        toaster.create({ title: "Код має містити 6 цифр", type: "error" });
        return;
      }

      setLoading(true);
      try {
        const { data } = await API.post("/login/2fa", {
          userId: tempUserId,
          code: twoFactorCode,
        });
        finishLogin(data);
      } catch (e) {
        toaster.create({
          title: "Невірний код",
          description: e.response?.data?.error || "Код не підійшов",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (cleanPhone.length !== 12) {
      toaster.create({ title: "Невірний номер телефону", type: "error" });
      return;
    }

    if (!password) {
      toaster.create({ title: "Введіть пароль", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/login", {
        phone: cleanPhone,
        password,
      });

      if (data.require2FA) {
        setRequire2FA(true);
        setTempUserId(data.userId);
        toaster.create({
          title: "Потрібне підтвердження",
          description: "Введіть код з Google Authenticator",
          type: "info",
        });
      } else {
        finishLogin(data);
      }
    } catch (e) {
      toaster.create({
        title: "Помилка логіна",
        description: e.response?.data?.error || "Невірний логін або пароль",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = (data) => {
    dispatch(setUser({ user: data.user, token: data.token }));
    toaster.create({ title: "Успішний вхід", type: "success" });
    navigate("/dashboard");
  };

  return (
    <div className="login">
      <div className="login-wrapper">
        <div className="login-container">
          <span className="login-title">👋 Особистий кабінет</span>
          <span className="login-subtitle">E-document</span>

          <div className="login-form">
            {!require2FA ? (
              // Форма логина
              <>
                <InputMask
                  mask="+380 (99) 999 99 99"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                >
                  {(inputProps) => (
                    <Input
                      {...inputProps}
                      className="inputNumber"
                      placeholder="+380 (__) ___ __ __"
                      type="tel"
                      style={{ outline: "none", border: "none" }}
                    />
                  )}
                </InputMask>

                <Input
                  placeholder="Пароль"
                  maxLength={40}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ outline: "none", border: "none" }}
                />
              </>
            ) : (
              // Форма 2FA
              <VStack gap={4} py={2}>
                <Text fontSize="sm" textAlign="center" color="gray.600">
                  Введіть 6-значний код підтвердження з вашого застосунку
                </Text>
                <Input
                  placeholder="000000"
                  maxLength={6}
                  textAlign="center"
                  fontSize="2xl"
                  fontWeight="bold"
                  letterSpacing="8px"
                  value={twoFactorCode}
                  onChange={(e) =>
                    setTwoFactorCode(e.target.value.replace(/\D/g, ""))
                  }
                  autoFocus
                  style={{
                    outline: "none",
                    border: "none",
                    background: "#f1f3f5",
                  }}
                />
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setRequire2FA(false)}
                  color="gray.500"
                >
                  Повернутися до вводу пароля
                </Button>
              </VStack>
            )}
          </div>

          <div className="login-button">
            <button
              style={{ width: "100%", opacity: loading ? 0.7 : 1 }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading
                ? "Зачекайте..."
                : require2FA
                  ? "Підтвердити код"
                  : "Увійти в систему"}
            </button>
          </div>

          {!require2FA && (
            <div className="login-forgot">
              <Link to="/register">Зареєструватися</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
