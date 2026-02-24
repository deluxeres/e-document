import { useState, useMemo, useEffect } from "react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Button,
  Input,
  Stack,
  createListCollection,
  Select,
  Text,
  HStack,
  Portal,
  DialogBackdrop,
  DialogPositioner,
  Box,
  VStack,
  Image,
} from "@chakra-ui/react";
import { toaster } from "../components/ui/toaster";
import { createDocument, getDocumentTypes } from "../requests/api";
import { useSelector } from "react-redux";

function AddDocumentModal({ isOpen, onClose, onRefresh, existingDocs = [] }) {
  const user = useSelector((state) => state.user.user);
  const [dbTypes, setDbTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);

  // Загрузка типов из БД
  useEffect(() => {
    if (isOpen) {
      getDocumentTypes()
        .then((res) => setDbTypes(res.data))
        .catch((err) => console.error("Помилка завантаження типів", err));
    }
  }, [isOpen]);

  useEffect(() => {
    // Добавляем поле translations в запрос
    fetch("https://restcountries.com/v3.1/all?fields=name,flags,translations")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .map((c) => ({
            label: `${c.translations?.ukr?.common || c.name.common}`,
            value: c.translations?.ukr?.common || c.name.common,
            flag: c.flags.png,
          }))
          // Сортируем по украинскому алфавиту
          .sort((a, b) => a.label.localeCompare(b.label, "uk-UA"));
        setCountries(sorted);
      })
      .catch((err) => console.error("Помилка завантаження країн:", err));
  }, []);

  const countryCollection = useMemo(
    () => createListCollection({ items: countries }),
    [countries],
  );

  const availableTypes = useMemo(() => {
    return dbTypes.filter(
      (t) => !existingDocs.some((doc) => doc.type_id === t.id),
    );
  }, [dbTypes, existingDocs]);

  const collection = useMemo(
    () =>
      createListCollection({
        items: availableTypes.map((t) => ({
          label: t.name,
          value: t.id.toString(),
        })),
      }),
    [availableTypes],
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType || !formData.country) {
      toaster.create({ title: "Оберіть тип та громадянство", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await createDocument(user.id, parseInt(selectedType), formData);
      toaster.create({ title: "Документ успішно створено", type: "success" });
      setSelectedType(null);
      setFormData({});
      onClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      toaster.create({
        title: "Помилка",
        description: "Не вдалося зберегти",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="center"
    >
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent
            borderRadius="2xl"
            bg="white"
            alignSelf="center"
            maxW="500px"
          >
            <DialogHeader fontSize="xl" fontWeight="bold">
              Новий документ
            </DialogHeader>
            <DialogCloseTrigger />
            <form onSubmit={handleSubmit}>
              <DialogBody>
                <VStack gap={4} align="stretch">
                  {/* Выбор типа документа */}
                  <Select.Root
                    collection={collection}
                    value={selectedType ? [selectedType] : []}
                    onValueChange={(e) => {
                      setSelectedType(e.value[0]);
                      setFormData({});
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText
                        placeholder={
                          availableTypes.length === 0
                            ? "Всі типи додано"
                            : "Оберіть тип документа"
                        }
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {availableTypes.map((item) => (
                        <Select.Item
                          item={{ label: item.name, value: item.id.toString() }}
                          key={item.id}
                        >
                          {item.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  {selectedType && (
                    <Select.Root
                      collection={countryCollection}
                      onValueChange={(e) =>
                        setFormData({ ...formData, country: e.value[0] })
                      }
                    >
                      <Select.Trigger>
                        <Select.ValueText placeholder="Оберіть громадянство" />
                      </Select.Trigger>
                      <Select.Content>
                        {countries.map((c) => (
                          <Select.Item item={c} key={c.value}>
                            <HStack gap={2}>
                              <Image src={c.flag} w="24px" alt="Flag" />
                              <Text>{c.label}</Text>
                            </HStack>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}

                  <Box minH="240px">
                    {/* ID КАРТА (1) */}
                    {selectedType === "1" && (
                      <Stack gap={3}>
                        <Input
                          name="number"
                          placeholder="Номер документа (9 цифр)"
                          required
                          onChange={handleInputChange}
                        />
                        <Input
                          name="record_number"
                          placeholder="Запис № (УНЗР)"
                          required
                          onChange={handleInputChange}
                        />
                        <Input
                          name="authority"
                          placeholder="Орган що видав"
                          onChange={handleInputChange}
                        />
                        <HStack gap={4}>
                          <VStack align="start" flex={1}>
                            <Text fontSize="xs">Виданий:</Text>
                            <Input
                              name="issue_date"
                              type="date"
                              required
                              onChange={handleInputChange}
                            />
                          </VStack>
                          <VStack align="start" flex={1}>
                            <Text fontSize="xs">Дійсний до:</Text>
                            <Input
                              name="expiry_date"
                              type="date"
                              required
                              onChange={handleInputChange}
                            />
                          </VStack>
                        </HStack>
                      </Stack>
                    )}

                    {/* ПАСПОРТ КНИЖЕЧКА (2) */}
                    {selectedType === "2" && (
                      <Stack gap={3}>
                        <HStack>
                          <Input
                            name="series"
                            placeholder="Серія"
                            maxLength={2}
                            required
                            onChange={handleInputChange}
                          />
                          <Input
                            name="number"
                            placeholder="Номер"
                            maxLength={6}
                            required
                            onChange={handleInputChange}
                          />
                        </HStack>
                        <Input
                          name="issued_by"
                          placeholder="Ким виданий"
                          required
                          onChange={handleInputChange}
                        />
                        <VStack align="start">
                          <Text fontSize="xs">Дата видачі:</Text>
                          <Input
                            name="issue_date"
                            type="date"
                            required
                            onChange={handleInputChange}
                          />
                        </VStack>
                      </Stack>
                    )}

                    {/* ВОДІЙСЬКЕ (3) */}
                    {selectedType === "3" && (
                      <Stack gap={3}>
                        <Input
                          name="number"
                          placeholder="Номер посвідчення"
                          required
                          onChange={handleInputChange}
                        />
                        <Input
                          name="categories"
                          placeholder="Категорії (напр. B, C)"
                          required
                          onChange={handleInputChange}
                        />
                        <HStack gap={4}>
                          <VStack align="start" flex={1}>
                            <Text fontSize="xs">Виданий:</Text>
                            <Input
                              name="issue_date"
                              type="date"
                              required
                              onChange={handleInputChange}
                            />
                          </VStack>
                          <VStack align="start" flex={1}>
                            <Text fontSize="xs">Дійсний до:</Text>
                            <Input
                              name="expiry_date"
                              type="date"
                              required
                              onChange={handleInputChange}
                            />
                          </VStack>
                        </HStack>
                      </Stack>
                    )}

                    {/* ПОСВІДКА НА ПРОЖИВАННЯ (4) И ЗАКОРДОННИЙ (5) */}
                    {(selectedType === "4" || selectedType === "5") && (
                      <Stack gap={3}>
                        <Input
                          name="number"
                          placeholder="Номер документа"
                          required
                          onChange={handleInputChange}
                        />
                        <Input
                          name="tax_id"
                          placeholder="РНОКПП (ІПН)"
                          onChange={handleInputChange}
                        />
                        <Input
                          name="authority"
                          placeholder="Орган що видав"
                          required
                          onChange={handleInputChange}
                        />
                        <HStack gap={4}>
                          <VStack align="start" flex={1}>
                            <Text fontSize="xs">Дата видачі:</Text>
                            <Input
                              name="issue_date"
                              type="date"
                              required
                              onChange={handleInputChange}
                            />
                          </VStack>
                          <VStack align="start" flex={1}>
                            <Text fontSize="xs">Дійсний до:</Text>
                            <Input
                              name="expiry_date"
                              type="date"
                              required
                              onChange={handleInputChange}
                            />
                          </VStack>
                        </HStack>
                      </Stack>
                    )}

                    {!selectedType && (
                      <Box
                        h="200px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        border="2px dashed"
                        borderColor="gray.100"
                        borderRadius="xl"
                      >
                        <Text color="gray.400" textAlign="center">
                          Оберіть тип документа для заповнення
                        </Text>
                      </Box>
                    )}
                  </Box>
                </VStack>
              </DialogBody>
              <DialogFooter>
                <Button variant="ghost" onClick={onClose}>
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  colorPalette="blue"
                  loading={loading}
                  disabled={!selectedType}
                >
                  Зберегти
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
}

export default AddDocumentModal;
