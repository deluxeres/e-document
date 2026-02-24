import React, { useState } from "react";
import {
  Tabs,
  Box,
  Text,
  Image,
  Button,
  HStack,
  Center,
  VStack,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import axios from "axios";
import { deleteDocument } from "../requests/api";
import { toaster } from "./ui/toaster";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "—") return "—";
  return new Date(dateStr).toLocaleDateString("uk-UA");
};

function Card({ documents, onRefresh }) {
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(false);
  const [tempBase64, setTempBase64] = useState(null);

  if (!documents?.length) return null;

  const downloadCard = async (docId) => {
    const element = document.getElementById(`card-to-save-${docId}`);
    if (!element) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:4000/get-base64?url=${encodeURIComponent(user.photo_url)}`,
      );
      setTempBase64(response.data.base64);

      setTimeout(async () => {
        const dataUrl = await htmlToImage.toPng(element, {
          quality: 1,
          pixelRatio: 3,
          backgroundColor: "#ffffff",
        });

        const link = document.createElement("a");
        link.download = `document-${docId}.png`;
        link.href = dataUrl;
        link.click();

        setTempBase64(null);
        setLoading(false);
      }, 150);
    } catch (error) {
      console.error("Помилка при скачуванні:", error);
      setLoading(false);
    }
  };

  const deleteCard = async (documentId) => {
    if (window.confirm("Ви дійсно бажаєте видалити документ?")) {
      try {
        await deleteDocument(user.id, documentId);

        toaster.create({ title: "Документ видалено", type: "success" });

        if (onRefresh) onRefresh();
      } catch (err) {
        toaster.create({ title: "Помилка видалення", type: "error" });
      }
    }
  };

  return (
    <Box width="100%" display="flex" flexDirection="column" alignItems="center">
      <Tabs.Root
        defaultValue={documents[0].id.toString()}
        variant="plain"
        width="100%"
      >
        <Center>
          <Tabs.List
            bg="gray.100"
            p="1"
            borderRadius="full"
            mb={8}
            display="inline-flex"
          >
            {documents.map((doc) => (
              <Tabs.Trigger
                key={doc.id}
                value={doc.id.toString()}
                px={6}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="medium"
                color="gray.600"
                _selected={{ bg: "white", color: "black", boxShadow: "sm" }}
              >
                {doc.type?.name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Center>

        {documents.map((doc) => {
          const isDriver = doc.type_id === 3;
          const qrData = `Документ: ${doc.type?.name}\nНомер: ${doc.display_number}\nВласник: ${user?.surname} ${user?.name}`;

          return (
            <Tabs.Content key={doc.id} value={doc.id.toString()}>
              <VStack gap={4}>
                <div
                  id={`card-to-save-${doc.id}`}
                  className="card"
                  style={{ background: "white", borderRadius: "20px" }}
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
                          {" "}
                          {tempBase64 && (
                            <Image
                              src={tempBase64}
                              alt="User Photo"
                              w="100%"
                              h="100%"
                              objectFit="cover"
                              crossOrigin="anonymous"
                            />
                          )}{" "}
                          {!tempBase64 && (
                            <Image
                              src={user?.photo_url}
                              alt="User Photo"
                              w="100%"
                              h="100%"
                              objectFit="cover"
                            />
                          )}{" "}
                        </div>

                        <div className="card-info__text">
                          {!isDriver && (
                            <div className="card-info__text__birth">
                              <span className="card-info__title">
                                Дата народження:
                              </span>
                              <span className="card-info__subtitle">
                                {formatDate(user?.birth_date)}
                              </span>
                            </div>
                          )}

                          {isDriver && (
                            <div className="card-info__text__birth">
                              <span className="card-info__title">
                                Категорії:
                              </span>
                              <span className="card-info__subtitle">
                                {doc.categories || "B"}
                              </span>
                            </div>
                          )}

                          <div className="card-info__text__expiry">
                            <span className="card-info__title">
                              Дійсний до:
                            </span>
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
                            <span className="card-info__title">
                              Номер документа
                            </span>
                            <span
                              className="card-info__subtitle"
                              style={{ color: "#2b6cb0", fontWeight: "bold" }}
                            >
                              {doc.display_number}
                            </span>
                          </div>

                          {doc.tax_id && (
                            <div className="card-info__text__name">
                              <span className="card-info__title">
                                РНОКПП (ІПН)
                              </span>
                              <span
                                className="card-info__subtitle"
                                style={{ fontWeight: "bold" }}
                              >
                                {doc.tax_id}
                              </span>
                            </div>
                          )}
                        </HStack>

                        {doc.display_authority && (
                          <div
                            className="card-info__text__patronimyc"
                            style={{ marginTop: "8px" }}
                          >
                            <span className="card-info__title">
                              Орган що видав
                            </span>
                            <span className="card-info__subtitle">
                              {doc.display_authority}
                            </span>
                          </div>
                        )}
                      </div>

                      <Box
                        style={{
                          position: "absolute",
                          bottom: 20,
                          right: 10,
                          zIndex: 999,
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

                <HStack mt={4}>
                  <Button
                    onClick={() => downloadCard(doc.id)}
                    colorPalette="blue"
                    variant="subtle"
                    borderRadius="full"
                    loading={loading}
                  >
                    💾 Експортувати документ
                  </Button>
                  <Button
                    onClick={() => deleteCard(doc.id)}
                    colorPalette="red"
                    variant="subtle"
                    borderRadius="full"
                    loading={loading}
                  >
                    Видалити документ
                  </Button>
                </HStack>
              </VStack>
            </Tabs.Content>
          );
        })}
      </Tabs.Root>
    </Box>
  );
}

export default Card;
