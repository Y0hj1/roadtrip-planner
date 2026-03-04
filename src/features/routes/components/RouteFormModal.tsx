import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  AspectRatio,
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Textarea,
  MultiSelect
} from "@mantine/core";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { SmartImage } from "../../../shared/ui/SmartImage";

import type { Route, Season } from "../../../shared/types/route";

const seasonData: { value: Season; label: string }[] = [
  { value: "summer", label: "Лето" },
  { value: "winter", label: "Зима" }
];

const routeFormSchema = z.object({
  title: z.string().min(3, "Введите название (минимум 3 символа)"),
  fromCity: z.string().min(2, "Укажите город отправления"),
  toCity: z.string().min(2, "Укажите город назначения"),
  distanceKm: z.coerce.number().int().positive("Дистанция должна быть > 0"),
  durationHours: z.coerce.number().positive("Время в пути должно быть > 0"),

  seasons: z
    .array(z.enum(["summer", "winter"]))
    .min(1, "Выберите сезон (можно несколько)"),
  sceneryScore: z.coerce.number().int().min(1).max(5),
  highlightsRaw: z.string().optional(),

  coverImage: z
    .union([z.string().url("Введите корректный URL картинки"), z.literal("")])
    .optional(),
  coverCredit: z.string().max(120).optional(),

  goodRoad: z.boolean(),
  tollRoad: z.boolean(),
  hasMotels: z.boolean(),
  hasGasStations: z.boolean(),

  description: z
    .string()
    .min(10, "Добавьте описание (минимум 10 символов)")
    .max(500, "Описание слишком длинное (макс. 500 символов)")
});

export type RouteFormValues = z.infer<typeof routeFormSchema>;

type Props = {
  opened: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  initial?: Route;
  loading?: boolean;
  onSubmit: (values: RouteFormValues) => void | Promise<void>;
};

const emptyValues: RouteFormValues = {
  title: "",
  fromCity: "",
  toCity: "",
  distanceKm: 1,
  durationHours: 1,

  seasons: ["summer"],
  sceneryScore: 3,
  highlightsRaw: "",
  coverImage: "",
  coverCredit: "",

  goodRoad: false,
  tollRoad: false,
  hasMotels: false,
  hasGasStations: false,
  description: ""
};

export function RouteFormModal({
  opened,
  onClose,
  title,
  submitLabel,
  initial,
  loading,
  onSubmit
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: emptyValues,
    mode: "onBlur"
  });

  const coverPreview = watch("coverImage");

  const initialValues = useMemo<RouteFormValues>(() => {
    if (!initial) return emptyValues;
    return {
      title: initial.title,
      fromCity: initial.fromCity,
      toCity: initial.toCity,
      distanceKm: initial.distanceKm,
      durationHours: initial.durationHours,

      seasons: initial.seasons,
      sceneryScore: initial.sceneryScore,
      highlightsRaw: (initial.highlights ?? []).join("\n"),
      coverImage: initial.coverImage ?? "",
      coverCredit: initial.coverCredit ?? "",

      goodRoad: initial.tags.goodRoad,
      tollRoad: initial.tags.tollRoad,
      hasMotels: initial.tags.hasMotels,
      hasGasStations: initial.tags.hasGasStations,

      description: initial.description
    };
  }, [initial]);

  // Сбрасываем форму при открытии/смене initial
  useEffect(() => {
    if (opened) reset(initialValues);
  }, [opened, initialValues, reset]);

  return (
    <Modal
      opened={opened}
      onClose={() => {
        reset(initialValues);
        onClose();
      }}
      title={title}
      size="lg"
      centered
    >
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          reset(values);
        })}
      >
        <Stack gap="sm">
          <TextInput
            label="Название"
            placeholder="Алтай: Чуйский тракт до Кош-Агача"
            {...register("title")}
            error={errors.title?.message}
          />

          <Group grow>
            <TextInput
              label="Откуда"
              placeholder="Бийск"
              {...register("fromCity")}
              error={errors.fromCity?.message}
            />
            <TextInput
              label="Куда"
              placeholder="Кош-Агач"
              {...register("toCity")}
              error={errors.toCity?.message}
            />
          </Group>

          <Group grow>
            <Controller
              control={control}
              name="distanceKm"
              render={({ field }) => (
                <NumberInput
                  label="Дистанция (км)"
                  min={1}
                  {...field}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  error={errors.distanceKm?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="durationHours"
              render={({ field }) => (
                <NumberInput
                  label="Время в пути (ч)"
                  min={0.5}
                  step={0.5}
                  {...field}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  error={errors.durationHours?.message}
                />
              )}
            />
          </Group>

          <Group grow align="flex-end">
            <Controller
              control={control}
              name="seasons"
              render={({ field }) => (
                <MultiSelect
                  label="Сезон"
                  placeholder="Выберите"
                  data={seasonData}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.seasons?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="sceneryScore"
              render={({ field }) => (
                <NumberInput
                  label="Туристичность (1–5)"
                  min={1}
                  max={5}
                  {...field}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  error={errors.sceneryScore?.message}
                />
              )}
            />
          </Group>

          <Textarea
            label="Что посмотреть по пути"
            description="Можно построчно — каждую точку с новой строки"
            minRows={3}
            placeholder="Горный парк Рускеала\nВодопады Ахвенкоски\nЛадожские шхеры"
            {...register("highlightsRaw")}
          />


          <TextInput
            label="Обложка (URL картинки)"
            placeholder="https://commons.wikimedia.org/wiki/Special:FilePath/....jpg?width=1400"
            {...register("coverImage")}
            error={errors.coverImage?.message}
          />

          {coverPreview ? (
            <Card withBorder radius="md" p="xs">
              <Card.Section>
                <AspectRatio ratio={16 / 9}>
                  <SmartImage src={coverPreview} alt="Превью обложки" fit="cover" />
                </AspectRatio>
              </Card.Section>
            </Card>
          ) : null}

          <TextInput
            label="Подпись к фото (необязательно)"
            placeholder="Автор / источник"
            {...register("coverCredit")}
          />

          <Group gap="md" wrap="wrap">
            <Controller
              control={control}
              name="goodRoad"
              render={({ field }) => (
                <Checkbox
                  label="Хорошая дорога"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="tollRoad"
              render={({ field }) => (
                <Checkbox label="Платная" checked={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="hasMotels"
              render={({ field }) => (
                <Checkbox label="Мотели" checked={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="hasGasStations"
              render={({ field }) => (
                <Checkbox label="Заправки" checked={field.value} onChange={field.onChange} />
              )}
            />
          </Group>

          <Textarea
            label="Описание"
            minRows={4}
            placeholder="Покрытие, пробки, особенности (серпантины/грунтовка), платные участки..."
            {...register("description")}
            error={errors.description?.message}
          />

          <Text size="xs" c="dimmed">
            Подсказка: после создания можно перейти на страницу маршрута и добавить отзывы — средний рейтинг
            пересчитается автоматически.
          </Text>

          <Group justify="flex-end" mt="sm">
            <Button
              type="button"
              variant="subtle"
              onClick={() => {
                reset(initialValues);
                onClose();
              }}
            >
              Отмена
            </Button>
            <Button type="submit" loading={loading} disabled={initial ? !isDirty : false}>
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
