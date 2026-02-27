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
  IconButton,
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

  // Состояние для кастомных полей (когда выбран тип "Власний документ" ID 99)
  const [customFields, setCustomFields] = useState([
    { id: Date.now(), name: "", value: "" },
  ]);

  // Загрузка типов из БД
  useEffect(() => {
    if (isOpen) {
      getDocumentTypes()
        .then((res) => setDbTypes(res.data))
        .catch((err) => console.error("Помилка завантаження типів", err));
    }
  }, [isOpen]);

  // Загрузка стран
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,flags,translations")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .map((c) => ({
            label: `${c.translations?.ukr?.common || c.name.common}`,
            value: c.translations?.ukr?.common || c.name.common,
            flag: c.flags.png,
          }))
          .sort((a, b) => a.label.localeCompare(b.label, "uk-UA"));
        setCountries(sorted);
      })
      .catch((err) => console.error("Помилка завантаження країн:", err));
  }, []);

  const countryCollection = useMemo(
    () => createListCollection({ items: countries }),
    [countries],
  );

  // "Власний документ" (99) всегда доступен, остальные — если их еще нет у юзера
  const availableTypes = useMemo(() => {
    return dbTypes.filter(
      (t) => t.id === 99 || !existingDocs.some((doc) => doc.type_id === t.id),
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

  // Управление динамическими полями
  const addCustomField = () => {
    setCustomFields([...customFields, { id: Date.now(), name: "", value: "" }]);
  };

  const removeCustomField = (id) => {
    if (customFields.length > 1) {
      setCustomFields(customFields.filter((f) => f.id !== id));
    }
  };

  const handleCustomFieldChange = (id, key, val) => {
    setCustomFields(
      customFields.map((f) => (f.id === id ? { ...f, [key]: val } : f)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка выбора типа
    if (!selectedType) {
      toaster.create({ title: "Оберіть тип документа", type: "error" });
      return;
    }

    // Проверка гражданства для стандартных типов (1-5)
    if (selectedType !== "99" && !formData.country) {
      toaster.create({ title: "Оберіть громадянство", type: "error" });
      return;
    }

    setLoading(true);
    try {
      let payload = { ...formData };

      // Если кастомный документ — собираем поля из массива в объект
      if (selectedType === "99") {
        const dynamicFields = {};
        // Добавляем основное название
        dynamicFields["Назва документа"] =
          formData["Назва документа"] || "Мій документ";
        // Добавляем дополнительные поля
        customFields.forEach((f) => {
          if (f.name.trim()) dynamicFields[f.name] = f.value;
        });
        payload = dynamicFields;
      }

      await createDocument(user.id, parseInt(selectedType), payload);

      toaster.create({ title: "Документ успішно створено", type: "success" });

      // Сброс формы
      setSelectedType(null);
      setFormData({});
      setCustomFields([{ id: Date.now(), name: "", value: "" }]);
      onClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      toaster.create({
        title: "Помилка",
        description: "Не вдалося зберегти документ",
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
                  {/* Выбор типа */}
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

                  {/* Выбор страны (не показываем для кастомного типа 99) */}
                  {selectedType && selectedType !== "99" && (
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
                    {/* РЕЖИМ: ВЛАСНИЙ ДОКУМЕНТ (99) */}
                    {selectedType === "99" && (
                      <Stack gap={3}>
                        <Input
                          name="Назва документа"
                          placeholder="Назва (напр. Студентський квиток)"
                          required
                          onChange={handleInputChange}
                        />
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          mt={2}
                          color="gray.500"
                        >
                          ДОДАТКОВІ ПОЛЯ:
                        </Text>
                        {customFields.map((field) => (
                          <HStack key={field.id} gap={2}>
                            <Input
                              placeholder="Назва поля"
                              value={field.name}
                              onChange={(e) =>
                                handleCustomFieldChange(
                                  field.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Значення"
                              value={field.value}
                              onChange={(e) =>
                                handleCustomFieldChange(
                                  field.id,
                                  "value",
                                  e.target.value,
                                )
                              }
                            />
                            <IconButton
                              aria-label="Delete"
                              variant="ghost"
                              colorPalette="red"
                              size="sm"
                              onClick={() => removeCustomField(field.id)}
                              disabled={customFields.length === 1}
                            >
                              ✕
                            </IconButton>
                          </HStack>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addCustomField}
                          width="full"
                          mt={1}
                        >
                          + Додати поле
                        </Button>
                      </Stack>
                    )}

                    {/* ШАБЛОН: ID КАРТА (1) */}
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

                    {/* ШАБЛОН: ПАСПОРТ КНИЖЕЧКА (2) */}
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

                    {/* ШАБЛОН: ВОДІЙСЬКЕ (3) */}
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

                    {/* ШАБЛОН: ПОСВІДКА / ЗАКОРДОННИЙ (4, 5) */}
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
