import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, VStack, Text, Box, Container } from "@chakra-ui/react";
import Card from "./Card";
import AddDocumentModal from "../dialogs/Document";
import { getUserDocuments } from "../requests/api";

function Home() {
  const user = useSelector((state) => state.user.user);
  const [documents, setDocuments] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // ОБЪЯВЛЯЕМ СОСТОЯНИЕ
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    if (!user?.id) return;
    try {
      const { data } = await getUserDocuments(user.id);
      setDocuments(data);
    } catch (e) {
      console.error("Помилка завантаження", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "E-document";
    fetchDocs();
  }, [user?.id]);

  return (
    <Container maxW="container.md" py={10}>
      <VStack gap={6} align="center" textAlign="center" mb={10}>
        <VStack gap={1}>
          <Text fontSize="3xl" fontWeight="bold">
            👋 {user?.name || "Руслан"}, вітаємо!
          </Text>
          <Text fontSize="lg" color="gray.500">
            Ваші цифрові документи в одному місці
          </Text>
        </VStack>

        <Button
          colorPalette="black"
          onClick={() => setIsOpen(true)}
          borderRadius="full"
          size="lg"
          px={8}
          shadow="md"
        >
          + Додати документ
        </Button>
      </VStack>

      <div
        className="wrapper"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {documents.length > 0 ? (
          <div className="cards-grid">
            <Card documents={documents} onRefresh={fetchDocs} />
          </div>
        ) : (
          <Box
            textAlign="center"
            py={16}
            px={6}
            border="2px dashed"
            borderColor="gray.200"
            borderRadius="3xl"
            bg="gray.50/50"
          >
            <Text fontSize="5xl" mb={4}>
              📄
            </Text>
            <Text fontSize="xl" fontWeight="semibold" color="gray.700" mb={2}>
              Список документів порожній
            </Text>
            <Text color="gray.500">Тут з'являться ваші додані документи</Text>
          </Box>
        )}
      </div>

      <AddDocumentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onRefresh={fetchDocs}
        existingDocs={documents}
      />
    </Container>
  );
}

export default Home;
