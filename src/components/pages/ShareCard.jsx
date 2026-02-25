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
} from "@chakra-ui/react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "—") return "—";
  return new Date(dateStr).toLocaleDateString("uk-UA");
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
  const isDriver = doc.type_id === 3;
  const qrData = `Документ: ${doc.type?.name}\nНомер: ${doc.display_number}\nВласник: ${user?.surname} ${user?.name}`;

  return (
    <Center minH="80vh" p={4}>
      <VStack gap={8}>
        <VStack gap={1}>
          <Text fontSize="2xl" fontWeight="bold">
            Цифровий документ
          </Text>
          <Text color="gray.500" fontSize="sm">
            Перевірено сервісом e-document
          </Text>
        </VStack>

        <div
          className="card"
          style={{
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
          }}
        >
          <div className="card-wrapper">
            <div className="card-header">
              <span className="card-country">
                {doc.display_country?.toUpperCase()}
              </span>
              <p>{doc.type?.name}</p>
            </div>

            <div className="card-general">
              <div className="card-info__top">
                <div className="card-info__img">
                  <Image
                    src={user?.photo_url}
                    alt="User"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                </div>

                <div className="card-info__text">
                  {!isDriver && (
                    <div className="card-info__text__birth">
                      <span className="card-info__title">Дата народження:</span>
                      <span className="card-info__subtitle">
                        {formatDate(user?.birth_date)}
                      </span>
                    </div>
                  )}
                  {isDriver && (
                    <div className="card-info__text__birth">
                      <span className="card-info__title">Категорії:</span>
                      <span className="card-info__subtitle">
                        {doc.categories || "B"}
                      </span>
                    </div>
                  )}
                  <div className="card-info__text__expiry">
                    <span className="card-info__title">Дійсний до:</span>
                    <span className="card-info__subtitle">
                      {formatDate(doc.expiry_date)}
                    </span>
                  </div>
                  <div className="card-info__text__sex">
                    <span className="card-info__title">Виданий:</span>
                    <span className="card-info__subtitle">
                      {formatDate(doc.issue_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-info__bottom">
                <div className="card-info__text__surname">
                  <span
                    className="card-info__subtitle"
                    style={{
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    {user?.surname} {user?.name} {user?.patronymic}
                  </span>
                </div>

                <HStack gap={10} align="flex-start">
                  <div className="card-info__text__name">
                    <span className="card-info__title">Номер документа</span>
                    <span
                      className="card-info__subtitle"
                      style={{ color: "#2b6cb0", fontWeight: "bold" }}
                    >
                      {doc.display_number}
                    </span>
                  </div>
                </HStack>
              </div>

              <Box
                style={{
                  position: "absolute",
                  bottom: 20,
                  right: 10,
                  zIndex: 9,
                }}
                className="card-qr"
                p={1}
                bg="white"
                borderRadius="md"
              >
                <QRCodeSVG value={qrData} size={65} />
              </Box>
            </div>
          </div>
        </div>

        <Text fontSize="xs" color="gray.400">
          Цей документ є офіційним підтвердженням особи в межах платформи.
        </Text>
      </VStack>
    </Center>
  );
};

export default ShareCard;
