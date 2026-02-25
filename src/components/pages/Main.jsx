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
  SimpleGrid,
  Icon,
  Stack,
  Circle,
  HStack,
} from "@chakra-ui/react";
import {
  HiOutlinePlusCircle,
  HiOutlineQrcode,
  HiOutlineDocumentSearch,
} from "react-icons/hi";

function Main() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  return (
    <Box className="main-page" pt={10} pb={20}>
      <Container maxW="container.md" centerContent>
        {/* Header Section */}
        <VStack mb={12} spacing={4} textAlign="center">
          <Heading className="brand-logo" fontSize={{ base: "4xl", md: "5xl" }}>
            E-document
          </Heading>
          <Text fontSize="lg" fontWeight="medium" color="gray.600" maxW="600px">
            Цифровий простір для вашої особистості. <br />
            Ваші документи завжди поруч — у безпечному та зручному форматі.
          </Text>
        </VStack>

        {/* Central Icon */}
        <Box mb={16}>
          <Box
            w="120px"
            h="120px"
            bg="linear-gradient(135deg, #000000 0%, #002e73 100%)"
            color="white"
            borderRadius="35px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="50px"
            boxShadow="0 25px 50px -12px rgba(0, 82, 204, 0.5)"
          >
            🇺🇦
          </Box>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={20} w="100%">
          <Feature
            icon={HiOutlinePlusCircle}
            title="Додавай документи"
            text="Швидко завантажуй ID-картку, закордонний паспорт чи посвідчення водія."
          />
          <Feature
            icon={HiOutlineQrcode}
            title="Генеруй QR-коди"
            text="Використовуй QR для миттєвої перевірки твоїх даних іншими користувачами."
          />
          <Feature
            icon={HiOutlineDocumentSearch}
            title="Ділися доступом"
            text="Створюй публічні посилання, щоб показати документ навіть без реєстрації."
          />
        </SimpleGrid>

        {/* Action Buttons */}
        <VStack spacing={4} w="100%" maxW="350px">
          {user ? (
            <Button
              className="diia-button-primary"
              size="lg"
              w="100%"
              h="60px"
              onClick={() => navigate("/home")}
            >
              Мій кабінет
            </Button>
          ) : (
            <>
              <Button
                className="diia-button-primary"
                size="lg"
                w="100%"
                h="60px"
                onClick={() => navigate("/login")}
              >
                Авторизуватися
              </Button>

              <Button
                className="diia-button-secondary"
                variant="outline"
                size="lg"
                w="100%"
                h="60px"
                onClick={() => navigate("/register")}
              >
                Зареєструватися
              </Button>
            </>
          )}
        </VStack>

        {/* Academic Footer */}
        <VStack mt={24} spacing={2} opacity={0.8}>
          <Box h="1px" w="100px" bg="gray.300" mb={2} />
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="gray.600"
            textAlign="center"
          >
            Дипломний проект бакалавра
          </Text>
          <Text
            fontSize="xs"
            color="gray.500"
            textAlign="center"
            lineHeight="tall"
          >
            Виконав: Стеблевський Р.О. <br />
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

// Допоміжний компонент для функцій
const Feature = ({ title, text, icon }) => {
  return (
    <Stack align="center" textAlign="center" spacing={4}>
      <Circle size="60px" bg="blue.50" color="blue.600">
        <Icon as={icon} boxSize={8} />
      </Circle>
      <VStack spacing={1}>
        <Text fontWeight="bold" fontSize="lg">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {text}
        </Text>
      </VStack>
    </Stack>
  );
};

// Допоміжний компонент для кроків
const Step = ({ number, title, text }) => {
  return (
    <HStack align="start" spacing={4}>
      <Circle
        size="30px"
        bg="blue.600"
        color="white"
        fontWeight="bold"
        fontSize="sm"
      >
        {number}
      </Circle>
      <VStack align="start" spacing={0}>
        <Text fontWeight="bold" fontSize="sm">
          {title}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {text}
        </Text>
      </VStack>
    </HStack>
  );
};

export default Main;
