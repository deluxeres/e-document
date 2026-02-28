import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Center,
  Spinner,
  Text,
  VStack,
  Image,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "—" || dateStr === "Безстроково")
    return dateStr || "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("uk-UA");
};

const ShareCard = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/public-document/${id}`)
      .then((res) => {
        setDoc(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Документ не знайдено або доступ обмежено");
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <Center h="80vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  if (error)
    return (
      <Center h="80vh">
        <Text color="red.500">{error}</Text>
      </Center>
    );

  const user = doc.user;
  const isCustom = doc.type?.is_custom === 1 || doc.type_id === 99;
  const customFields = (doc.custom_fields || []).filter(
    (f) => f.field_name !== "Назва документа",
  );
  const qrData = `Документ: ${doc.type?.name}\nВласник: ${user?.surname} ${user?.name}`;

  return (
    <Center minH="100vh" p={4}>
      <VStack gap={8} w="100%">
        <VStack gap={1} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold">
            Цифровий документ
          </Text>
          <Text color="gray.500" fontSize="sm">
            Перевірено сервісом e-document
          </Text>
        </VStack>

        <div
          id="card-to-save"
          className="card"
          style={{
            background: "white",
            borderRadius: "20px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div className="card-wrapper">
            <div className="card-header">
              <span className="card-country">
                {doc.display_country?.toUpperCase() || "УКРАЇНА"}
              </span>
              <p>
                {isCustom
                  ? doc.custom_fields?.find(
                      (f) => f.field_name === "Назва документа",
                    )?.field_value || doc.type?.name
                  : doc.type?.name}
              </p>
            </div>

            <div className="card-general">
              <HStack align="stretch" gap={4} mb={4}>
                <Box
                  className="card-info__img"
                  w="120px"
                  h="150px"
                  flexShrink={0}
                >
                  <Image
                    src={doc.photo_url || user?.photo_url}
                    alt="User"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    borderRadius="12px"
                  />
                </Box>

                <VStack
                  align="flex-start"
                  justify="space-between"
                  flex={1}
                  py={1}
                >
                  {!isCustom ? (
                    <>
                      <div>
                        <Text className="card-info__title">
                          Дата народження:
                        </Text>
                        <Text className="card-info__subtitle">
                          {formatDate(user?.birth_date)}
                        </Text>
                      </div>
                      <div>
                        <Text className="card-info__title">Дійсний до:</Text>
                        <Text className="card-info__subtitle">
                          {formatDate(doc.expiry_date)}
                        </Text>
                      </div>
                      <div>
                        <Text className="card-info__title">Виданий:</Text>
                        <Text className="card-info__subtitle">
                          {formatDate(doc.issue_date)}
                        </Text>
                      </div>
                    </>
                  ) : (
                    customFields.slice(0, 3).map((field, idx) => (
                      <div key={idx}>
                        <Text className="card-info__title">
                          {field.field_name}:
                        </Text>
                        <Text className="card-info__subtitle">
                          {field.field_value || "—"}
                        </Text>
                      </div>
                    ))
                  )}
                </VStack>
              </HStack>

              <Box mb={4}>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  textTransform="uppercase"
                  lineHeight="1.2"
                >
                  {user?.surname} {user?.name} {user?.patronymic}
                </Text>
              </Box>

              <SimpleGrid columns={2} gap={4} mb={2}>
                {!isCustom ? (
                  <>
                    <Box>
                      <Text className="card-info__title">Номер документа</Text>
                      <Text
                        className="card-info__subtitle"
                        color="#2b6cb0"
                        fontWeight="bold"
                      >
                        {doc.display_number}
                      </Text>
                    </Box>
                    {doc.tax_id && (
                      <Box>
                        <Text className="card-info__title">РНОКПП (ІПН)</Text>
                        <Text className="card-info__subtitle" fontWeight="bold">
                          {doc.tax_id}
                        </Text>
                      </Box>
                    )}
                  </>
                ) : (
                  customFields.slice(3).map((field, idx) => (
                    <Box key={idx}>
                      <Text className="card-info__title">
                        {field.field_name}
                      </Text>
                      <Text className="card-info__subtitle" fontWeight="bold">
                        {field.field_value || "—"}
                      </Text>
                    </Box>
                  ))
                )}
              </SimpleGrid>

              {!isCustom && doc.display_authority && (
                <Box mt={2}>
                  <Text className="card-info__title">Орган що видав</Text>
                  <Text className="card-info__subtitle">
                    {doc.display_authority}
                  </Text>
                </Box>
              )}

              <Box
                position="absolute"
                bottom="20px"
                right="20px"
                p={1}
                bg="white"
                borderRadius="md"
                boxShadow="sm"
              >
                <QRCodeSVG value={qrData} size={60} />
              </Box>
            </div>
          </div>
        </div>

        <Text fontSize="xs" color="gray.400" textAlign="center" maxW="300px">
          Цей документ є офіційним підтвердженням особи в межах платформи.
        </Text>
      </VStack>
    </Center>
  );
};

export default ShareCard;
