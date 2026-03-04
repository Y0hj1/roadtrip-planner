import { zodResolver } from "@hookform/resolvers/zod";
import {
  AspectRatio,
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  List,
  Rating,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";

import { updateRoute } from "../features/routes/api/routesApi";
import { useRouteQuery } from "../features/routes/hooks/useRouteQuery";
import {
  createReview,
  deleteReview,
  getReviewsByRouteId
} from "../features/reviews/api/reviewsApi";
import { useReviewsQuery } from "../features/reviews/hooks/useReviewsQuery";
import type { Review } from "../shared/types/review";
import type { Season } from "../shared/types/route";
import {
  buildYandexMapsRouteUrl,
  buildYandexMapsSearchUrl
} from "../shared/utils/yandexMaps";
import { SmartImage } from "../shared/ui/SmartImage";

const reviewSchema = z.object({
  author: z.string().min(2, "Введите имя"),
  rating: z.coerce.number().min(1).max(5),
  text: z.string().min(10, "Минимум 10 символов").max(400, "Максимум 400 символов")
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function seasonLabel(s: Season) {
  return s === "summer" ? "Лето" : "Зима";
}

export function RouteDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const routeQuery = useRouteQuery(id);
  const reviewsQuery = useReviewsQuery(id);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { author: "", rating: 5, text: "" },
    mode: "onBlur"
  });

  async function recalcAndSaveAvgRating(routeId: string) {
    const reviews = await getReviewsByRouteId(routeId);
    const avg = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    await updateRoute(routeId, { avgRating: Number(avg.toFixed(2)) });
  }

  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: async () => {
      if (!id) return;
      notifications.show({ title: "Готово", message: "Отзыв добавлен", color: "green" });
      await queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      await recalcAndSaveAvgRating(id);
      await queryClient.invalidateQueries({ queryKey: ["route", id] });
      await queryClient.invalidateQueries({ queryKey: ["routes"] });
      form.reset({ author: "", rating: 5, text: "" });
    },
    onError: (e) => {
      notifications.show({
        title: "Ошибка",
        message: e instanceof Error ? e.message : "Не удалось добавить отзыв",
        color: "red"
      });
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: async (_, deletedId) => {
      if (!id) return;
      notifications.show({ title: "Готово", message: "Отзыв удалён", color: "green" });
      await queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      await recalcAndSaveAvgRating(id);
      await queryClient.invalidateQueries({ queryKey: ["route", id] });
      await queryClient.invalidateQueries({ queryKey: ["routes"] });
      await queryClient.removeQueries({ queryKey: ["review", deletedId] });
    },
    onError: (e) => {
      notifications.show({
        title: "Ошибка",
        message: e instanceof Error ? e.message : "Не удалось удалить отзыв",
        color: "red"
      });
    }
  });

  if (routeQuery.isLoading) return <Loader />;

  if (routeQuery.isError) {
    return (
      <Alert color="red" title="Ошибка">
        {(routeQuery.error as Error)?.message ?? "Не удалось загрузить маршрут"}
      </Alert>
    );
  }

  const route = routeQuery.data;
  if (!route || !id) {
    return (
      <Alert color="yellow" title="Не найдено">
        Маршрут не найден. {" "}
        <Button component={Link} to="/routes" variant="subtle">
          Назад
        </Button>
      </Alert>
    );
  }

  const reviews: Review[] = reviewsQuery.data ?? [];

  const yandexRouteUrl = buildYandexMapsRouteUrl(route.fromCity, route.toCity);

  return (
    <Stack gap="md">
      <Card withBorder radius="lg" p={0} style={{ overflow: "hidden" }}>
        <Card.Section>
          <AspectRatio ratio={16 / 7}>
            <SmartImage
              src={route.coverImage || "https://picsum.photos/seed/roadtrip/1400/600"}
              alt={route.title}
              fit="cover"
            />
          </AspectRatio>
        </Card.Section>
        {route.coverCredit ? (
          <Text size="xs" c="dimmed" px="md" py={6}>
            Фото: {route.coverCredit}
          </Text>
        ) : null}
      </Card>


      <Group justify="space-between" align="flex-end" wrap="wrap">
        <div>
          <Title order={2}>{route.title}</Title>
          <Text c="dimmed">
            {route.fromCity} → {route.toCity} · {route.distanceKm} км · ≈ {route.durationHours} ч
          </Text>
        </div>
        <Stack gap={2} align="flex-end">
          <Rating value={route.avgRating} fractions={2} readOnly />
          <Text size="xs" c="dimmed">
            Средний рейтинг: {route.avgRating.toFixed(1)}
          </Text>
        </Stack>
      </Group>

      <Card withBorder radius="md">
        <Group justify="space-between" align="center" wrap="wrap">
          <div>
            <Text fw={600}>Навигация</Text>
            <Text size="sm" c="dimmed">
              Откроем готовый маршрут в Яндекс Картах в новой вкладке.
            </Text>
          </div>
          <Button
            component="a"
            href={yandexRouteUrl}
            target="_blank"
            rel="noreferrer"
          >
            Проложить в Яндекс Картах
          </Button>
        </Group>
        <Text size="xs" c="dimmed" mt="xs">
          Если хочешь строго без платных участков — в Яндекс Картах включи параметр «Объехать платные дороги».
        </Text>
      </Card>

      <Group gap="xs" wrap="wrap">
        {(route.seasons ?? []).map((s) => (
          <Badge key={s} variant="light">
            {seasonLabel(s)}
          </Badge>
        ))}
        <Badge variant="light">Туризм: {route.sceneryScore}/5</Badge>
        {route.tags.goodRoad && <Badge variant="light">Хорошая дорога</Badge>}
        {route.tags.tollRoad && <Badge variant="light">Платные участки</Badge>}
        {route.tags.hasMotels && <Badge variant="light">Мотели</Badge>}
        {route.tags.hasGasStations && <Badge variant="light">Заправки</Badge>}
      </Group>

      <Card withBorder radius="md">
        <Text>{route.description}</Text>
      </Card>

      {(route.highlights ?? []).length > 0 && (
        <Card withBorder radius="md">
          <Title order={4} mb="xs">
            Что посмотреть по пути
          </Title>
          <List spacing="xs">
            {route.highlights.map((h) => (
              <List.Item key={h}>
                <Group gap="xs" wrap="wrap">
                  <Text>{h}</Text>
                  <Button
                    size="xs"
                    variant="subtle"
                    component="a"
                    href={buildYandexMapsSearchUrl(h)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    На карте
                  </Button>
                </Group>
              </List.Item>
            ))}
          </List>
        </Card>
      )}

      <Divider my="sm" />

      <Title order={3}>Отзывы</Title>

      {reviewsQuery.isLoading && <Loader />}

      {reviewsQuery.isError && (
        <Alert color="red" title="Ошибка">
          {(reviewsQuery.error as Error)?.message ?? "Не удалось загрузить отзывы"}
        </Alert>
      )}

      {reviews.length === 0 && !reviewsQuery.isLoading && (
        <Text c="dimmed">Пока нет отзывов. Будь первым 🙂</Text>
      )}

      <Stack gap="sm">
        {reviews.map((rev) => (
          <Card key={rev.id} withBorder radius="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Group gap="sm">
                  <Text fw={600}>{rev.author}</Text>
                  <Rating value={rev.rating} readOnly />
                </Group>
                <Text size="xs" c="dimmed">
                  {formatDate(rev.createdAt)}
                </Text>
              </div>

              <Button
                variant="subtle"
                color="red"
                size="xs"
                loading={deleteReviewMutation.isPending}
                onClick={() => {
                  const ok = window.confirm("Удалить этот отзыв?");
                  if (ok) deleteReviewMutation.mutate(rev.id);
                }}
              >
                Удалить
              </Button>
            </Group>

            <Text mt="sm">{rev.text}</Text>
          </Card>
        ))}
      </Stack>

      <Title order={3}>Добавить отзыв</Title>

      <Card withBorder radius="md" p="md">
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await createReviewMutation.mutateAsync({
              routeId: id,
              author: values.author,
              rating: values.rating,
              text: values.text
            });
          })}
        >
          <Stack gap="sm">
            <TextInput
              label="Ваше имя"
              placeholder="Игорь"
              {...form.register("author")}
              error={form.formState.errors.author?.message}
            />

            <Controller
              name="rating"
              control={form.control}
              render={({ field }) => (
                <div>
                  <Text size="sm" fw={500} mb={4}>
                    Оценка
                  </Text>
                  <Rating value={Number(field.value)} onChange={field.onChange} />
                </div>
              )}
            />
            {form.formState.errors.rating?.message && (
              <Text size="xs" c="red">
                {form.formState.errors.rating.message}
              </Text>
            )}

            <Textarea
              label="Текст"
              minRows={4}
              placeholder="Что понравилось / не понравилось?"
              {...form.register("text")}
              error={form.formState.errors.text?.message}
            />

            <Group justify="flex-end">
              <Button type="submit" loading={createReviewMutation.isPending}>
                Отправить
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
