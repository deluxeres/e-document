import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  VStack,
  Text,
  Heading,
  Button,
  Container,
} from "@chakra-ui/react";

function Main() {
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);

  return (
    <Box className="main-page">
      <Container maxW="container.sm" centerContent>
        <VStack mb={12} spacing={2}>
          <Heading className="brand-logo">E-document</Heading>
          <Text className="brand-subtitle">
            Держава в кишені. <br />
            Усі ваші документи в одному місці.
          </Text>
        </VStack>

        <Box mb={12}>
          <Box
            w="120px"
            h="120px"
            bg="black"
            color="white"
            borderRadius="30px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="40px"
          >
            🇺🇦
          </Box>
        </Box>

        <VStack spacing={4} w="100%" maxW="320px">
          {user ? (
            <Button
              className="diia-button-primary"
              onClick={() => navigate("/home")}
            >
              Перейти до документів
            </Button>
          ) : (
            <>
              <Button
                className="diia-button-primary"
                onClick={() => navigate("/login")}
              >
                Увійти
              </Button>

              <Button
                className="diia-button-secondary"
                variant="outline"
                onClick={() => navigate("/register")}
              >
                Зареєструватися
              </Button>
            </>
          )}
        </VStack>

        <Text mt={20} fontSize="xs" color="gray.400" textAlign="center">
          © 2026 Стеблевський Р.О <br />
          Розроблено для дипломного проекту
        </Text>
      </Container>
    </Box>
  );
}

export default Main;
