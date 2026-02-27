import React, { useState } from "react";
import {
  Tabs,
  Box,
  Image,
  HStack,
  Center,
  VStack,
  Button,
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

          // Для кастомных исключаем "Назва документа", чтобы не дублировать
          const customFields = (doc.custom_fields || []).filter(
            (f) => f.field_name !== "Назва документа",
          );

          return (
            <Tabs.Content key={doc.id} value={doc.id.toString()}>
              <VStack gap={6}>
                <div
                  id={`card-to-save-${doc.id}`}
                  className="card"
                  style={{ background: "white", borderRadius: "20px" }}
                >
                  <div className="card-wrapper">
                    <div className="card-header">
                      <span className="card-country">УКРАЇНА</span>
                      <p>{doc.type?.name}</p>
                    </div>

                    <div className="card-general">
                      <div className="card-info__top">
                        <div className="card-info__img">
                          <Image
                            src={tempBase64 || user?.photo_url}
                            alt="User Photo"
                            w="100%"
                            h="100%"
                            objectFit="cover"
                            crossOrigin="anonymous"
                          />
                        </div>

                        <div className="card-info__text">
                          {!isCustom ? (
                            <>
                              <div className="card-info__text__birth">
                                <span className="card-info__title">
                                  Дата народження:
                                </span>
                                <span className="card-info__subtitle">
                                  {formatDate(user?.birth_date)}
                                </span>
                              </div>
                              <div className="card-info__text__expiry">
                                <span className="card-info__title">
                                  Дійсний до:
                                </span>
                                <span className="card-info__subtitle">
                                  {formatDate(doc.expiry_date)}
                                </span>
                              </div>
                              <div className="card-info__text__sex">
                                <span className="card-info__title">
                                  Виданий:
                                </span>
                                <span className="card-info__subtitle">
                                  {formatDate(doc.issue_date)}
                                </span>
                              </div>
                            </>
                          ) : (
                            // Кастомные поля (верхний блок - первые 3 поля)
                            customFields.slice(0, 3).map((field, idx) => (
                              <div key={idx} className="card-info__text__birth">
                                <span className="card-info__title">
                                  {field.field_name}:
                                </span>
                                <span className="card-info__subtitle">
                                  {field.field_value}
                                </span>
                              </div>
                            ))
                          )}
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

                        <HStack gap={10} align="flex-start" wrap="wrap">
                          {!isCustom ? (
                            <>
                              <div className="card-info__text__name">
                                <span className="card-info__title">
                                  Номер документа
                                </span>
                                <span
                                  className="card-info__subtitle"
                                  style={{
                                    color: "#2b6cb0",
                                    fontWeight: "bold",
                                  }}
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
                            </>
                          ) : (
                            // Кастомные поля (нижний блок - всё что после 3-го поля)
                            customFields.slice(3).map((field, idx) => (
                              <div key={idx} className="card-info__text__name">
                                <span className="card-info__title">
                                  {field.field_name}
                                </span>
                                <span
                                  className="card-info__subtitle"
                                  style={{ fontWeight: "bold" }}
                                >
                                  {field.field_value}
                                </span>
                              </div>
                            ))
                          )}
                        </HStack>

                        {!isCustom && doc.display_authority && (
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
