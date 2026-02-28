import React, { useState } from "react";
import {
  Tabs,
  Box,
  Image,
  HStack,
  Center,
  VStack,
  Button,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import axios from "axios";
import { HiOutlineTrash } from "react-icons/hi";
import { deleteDocument } from "../requests/api";
import { toaster } from "./ui/toaster";
import ExportDocument from "../dialogs/ExportDocument";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "—" || dateStr === "Безстроково")
    return dateStr || "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("uk-UA");
};

function Card({ documents, onRefresh }) {
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(false);
  const [tempBase64, setTempBase64] = useState(null);

  if (!documents?.length) return null;

  const handleExport = async (docId, format) => {
    const element = document.getElementById(`card-to-save-${docId}`);
    if (!element) return;

    setLoading(true);
    try {
      if (user.photo_url) {
        const response = await axios.get(
          `http://localhost:4000/get-base64?url=${encodeURIComponent(user.photo_url)}`,
        );
        setTempBase64(response.data.base64);
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      if (format === "png") {
        const dataUrl = await htmlToImage.toPng(element, {
          quality: 1,
          pixelRatio: 3,
          backgroundColor: "#ffffff",
        });
        const link = document.createElement("a");
        link.download = `document-${docId}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const canvas = await htmlToImage.toCanvas(element, {
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`document-${docId}.pdf`);
      }
      toaster.create({ title: "Файл успішно сформовано", type: "success" });
    } catch (error) {
      console.error("Помилка при скачуванні:", error);
      toaster.create({ title: "Помилка при експорті", type: "error" });
    } finally {
      setTempBase64(null);
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
                _selected={{ bg: "white", color: "black", boxShadow: "sm" }}
              >
                {doc.type?.name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Center>

        {documents.map((doc) => {
          const isCustom = doc.type?.is_custom === 1;
          const qrData = `Документ: ${doc.type?.name}\nВласник: ${user?.surname} ${user?.name}`;
          const shareUrl = `${window.location.origin}/share/doc/${doc.id}`;

          const customFields = (doc.custom_fields || []).filter(
            (f) => f.field_name !== "Назва документа",
          );

          return (
            <Tabs.Content key={doc.id} value={doc.id.toString()}>
              <VStack gap={6}>
                <div
                  id={`card-to-save-${doc.id}`}
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
                      <span className="card-country">УКРАЇНА</span>
                      <p>{doc.type?.name}</p>
                    </div>

                    <div className="card-general">
                      {/* ВЕРХНИЙ БЛОК: Фото + 3 поля справа */}
                      <HStack align="stretch" gap={4} mb={4}>
                        <Box
                          className="card-info__img"
                          w="120px"
                          h="150px"
                          flexShrink={0}
                        >
                          <Image
                            src={tempBase64 || user?.photo_url}
                            alt="User Photo"
                            w="100%"
                            h="100%"
                            objectFit="cover"
                            borderRadius="12px"
                            crossOrigin="anonymous"
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
                                <Text className="card-info__title">
                                  Дійсний до:
                                </Text>
                                <Text className="card-info__subtitle">
                                  {formatDate(doc.expiry_date)}
                                </Text>
                              </div>
                              <div>
                                <Text className="card-info__title">
                                  Виданий:
                                </Text>
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
                                  {field.field_value}
                                </Text>
                              </div>
                            ))
                          )}
                        </VStack>
                      </HStack>

                      {/* СРЕДНИЙ БЛОК: ФИО */}
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

                      {/* НИЖНИЙ БЛОК: Сетка полей */}
                      <SimpleGrid columns={2} gap={4} mb={2}>
                        {!isCustom ? (
                          <>
                            <Box>
                              <Text className="card-info__title">
                                Номер документа
                              </Text>
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
                                <Text className="card-info__title">
                                  РНОКПП (ІПН)
                                </Text>
                                <Text
                                  className="card-info__subtitle"
                                  fontWeight="bold"
                                >
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
                              <Text
                                className="card-info__subtitle"
                                fontWeight="bold"
                              >
                                {field.field_value}
                              </Text>
                            </Box>
                          ))
                        )}
                      </SimpleGrid>

                      {/* ДОПОЛНИТЕЛЬНОЕ ПОЛЕ (Орган) */}
                      {!isCustom && doc.display_authority && (
                        <Box mt={2}>
                          <Text className="card-info__title">
                            Орган що видав
                          </Text>
                          <Text className="card-info__subtitle">
                            {doc.display_authority}
                          </Text>
                        </Box>
                      )}

                      {/* QR-КОД (позиционирован абсолютно относительно card-general) */}
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

                <HStack gap={4}>
                  <ExportDocument
                    loading={loading}
                    shareUrl={shareUrl}
                    onExport={(format) => handleExport(doc.id, format)}
                    onCopy={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toaster.create({
                        title: "Посилання скопійовано",
                        type: "info",
                      });
                    }}
                  />
                  <Button
                    onClick={() => deleteCard(doc.id)}
                    colorPalette="red"
                    variant="ghost"
                    borderRadius="full"
                  >
                    <HiOutlineTrash /> Видалити документ
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
