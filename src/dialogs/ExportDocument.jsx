import React from "react";
import {
  Dialog,
  Portal,
  Button,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
  Stack,
  Box,
} from "@chakra-ui/react";
import {
  HiOutlineShare,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineClipboardCopy,
} from "react-icons/hi";

const ExportDocument = ({ loading, shareUrl, onExport, onCopy }) => {
  return (
    <Dialog.Root size="md" placement="center">
      <Dialog.Trigger asChild>
        <Button colorPalette="blue" variant="subtle" borderRadius="full" px={8}>
          <HiOutlineShare /> Поділитися / Експорт
        </Button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="2xl" bg="white" p={6} boxShadow="xl">
            <Dialog.Header>
              <Dialog.Title fontSize="xl">Керування документом</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={6} align="stretch" mt={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.600">
                    Пряме посилання
                  </Text>
                  <HStack>
                    <Input
                      readOnly
                      value={shareUrl}
                      variant="subtle"
                      borderRadius="lg"
                    />
                    <IconButton
                      aria-label="Copy link"
                      onClick={onCopy}
                      colorPalette="blue"
                      borderRadius="lg"
                    >
                      <HiOutlineClipboardCopy />
                    </IconButton>
                  </HStack>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={3} color="gray.600">
                    Завантажити файл
                  </Text>
                  <Stack direction="row" gap={4}>
                    <Button
                      flex={1}
                      height="100px"
                      variant="outline"
                      flexDirection="column"
                      gap={2}
                      onClick={() => onExport("png")}
                      loading={loading}
                      borderRadius="xl"
                    >
                      <HiOutlinePhotograph size="24px" /> PNG
                    </Button>
                    <Button
                      flex={1}
                      height="100px"
                      variant="outline"
                      flexDirection="column"
                      gap={2}
                      onClick={() => onExport("pdf")}
                      loading={loading}
                      borderRadius="xl"
                    >
                      <HiOutlineDocumentText size="24px" /> PDF
                    </Button>
                  </Stack>
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer mt={4}>
              <Dialog.ActionTrigger asChild>
                <Button variant="ghost" borderRadius="full">
                  Закрити
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ExportDocument;
