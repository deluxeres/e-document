import React, { useState, useEffect } from "react";
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Heading,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import {
  HiOutlineDocumentDuplicate,
  HiOutlineShieldCheck,
  HiOutlineUserCircle,
  HiOutlineBell,
} from "react-icons/hi";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getUserDocuments } from "../../requests/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Dashboard = ({ user = {} }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!user?.id) return;
      try {
        const { data } = await getUserDocuments(user.id);
        setDocuments(data || []);
      } catch (e) {
        console.error("Помилка завантаження", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [user?.id]);

  const safeDocs = Array.isArray(documents) ? documents : [];

  const chartData = safeDocs.reduce((acc, doc) => {
    const typeName = doc.type?.name || "Інше";
    const existing = acc.find((item) => item.name === typeName);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: typeName, value: 1 });
    }
    return acc;
  }, []);

  const expiringSoon = safeDocs
    .filter((doc) => doc.expiry_date && doc.expiry_date !== "Безстроково")
    .slice(0, 3);

  const profileFields = [
    user?.name,
    user?.surname,
    user?.photo_url,
    user?.birth_date,
    user?.phone,
  ];
  const profileCompletion = profileFields.filter(Boolean).length * 20;

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack align="flex-start" gap={6} w="100%">
        <Text fontSize="3xl" fontWeight="bold">
          👋 {user?.name || "Руслан"}, вітаємо!
        </Text>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="100%">
          <StatCard
            title="Усього документів"
            value={safeDocs.length}
            IconComponent={HiOutlineDocumentDuplicate}
            color="blue"
          />
          <StatCard
            title="Заповненість профілю"
            value={`${profileCompletion}%`}
            IconComponent={HiOutlineUserCircle}
            color="green"
            progress={profileCompletion}
          />
          <StatCard
            title="Безпека 2FA"
            value={user?.two_factor_enabled ? "Активно" : "Вимкнено"}
            IconComponent={HiOutlineShieldCheck}
            color={user?.two_factor_enabled ? "teal" : "red"}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} w="100%">
          {/* ГРАФИК */}
          <Box
            p={6}
            bg="white"
            borderRadius="20px"
            shadow="sm"
            borderWidth="1px"
            h="400px"
          >
            <Text fontWeight="bold" mb={4}>
              Розподіл за типами документів
            </Text>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Flex h="100%" align="center" justify="center">
                <Text color="gray.400">Немає документів для аналізу</Text>
              </Flex>
            )}
          </Box>

          <Box
            p={6}
            bg="white"
            borderRadius="20px"
            shadow="sm"
            borderWidth="1px"
          >
            <Text fontWeight="bold" mb={4}>
              Важливі події
            </Text>
            <VStack gap={3} align="stretch">
              {expiringSoon.length > 0 ? (
                expiringSoon.map((doc) => (
                  <Box key={doc.id} p={3} bg="orange.50" borderRadius="md">
                    <HStack>
                      <HiOutlineBell size={20} color="orange" />
                      <Box>
                        <Text fontSize="sm" fontWeight="bold">
                          {doc.type?.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Термін дії закінчується: {doc.expiry_date}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))
              ) : (
                <Text color="gray.500" fontSize="sm">
                  Усі документи дійсні.
                </Text>
              )}

              <Box p={3} bg="blue.50" borderRadius="md">
                <HStack>
                  <HiOutlineShieldCheck size={20} color="blue" />
                  <Box>
                    <Text fontSize="sm" fontWeight="bold">
                      Порада з безпеки
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Ваші дані зберігаються локально.
                    </Text>
                  </Box>
                </HStack>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>

      <VStack mt={24} spacing={2} opacity={0.8}>
        <Box h="1px" w="100px" bg="gray.300" mb={2} />
        <Text fontSize="sm" color="gray.600" textAlign="center">
          E-document v1.0.4 • 2026 Всі права захищені
        </Text>
      </VStack>
    </Box>
  );
};

const StatCard = ({ title, value, IconComponent, color, progress }) => (
  <Box p={6} bg="white" borderRadius="20px" shadow="sm" borderWidth="1px">
    <Flex justify="space-between" align="center">
      <Box>
        <Text
          fontSize="xs"
          color="gray.500"
          fontWeight="bold"
          textTransform="uppercase"
        >
          {title}
        </Text>
        <Heading size="md" mt={1}>
          {value}
        </Heading>
      </Box>
      <Box p={3} bg={`${color}.50`} borderRadius="12px">
        <IconComponent size={24} color={color} />
      </Box>
    </Flex>
    {progress !== undefined && (
      <Box
        w="100%"
        h="6px"
        bg="gray.100"
        borderRadius="full"
        mt={4}
        overflow="hidden"
      >
        <Box w={`${progress}%`} h="100%" bg="green.400" />
      </Box>
    )}
  </Box>
);

export default Dashboard;
