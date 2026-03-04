import { useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Route, RoutesFilters, Season } from "../shared/types/route";
import { createRoute, deleteRoute, updateRoute } from "../features/routes/api/routesApi";
import { RoutesFiltersPanel } from "../features/routes/components/RoutesFiltersPanel";
import { RouteFormModal, type RouteFormValues } from "../features/routes/components/RouteFormModal";
import { useRoutesQuery } from "../features/routes/hooks/useRoutesQuery";

function parseHighlights(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function seasonLabel(s: Season) {
  return s === "summer" ? "Лето" : "Зима";
}

function toCreatePayload(values: RouteFormValues) {
  return {
    title: values.title,
    fromCity: values.fromCity,
    toCity: values.toCity,
    distanceKm: values.distanceKm,
    durationHours: values.durationHours,
    seasons: values.seasons,
    sceneryScore: values.sceneryScore,
    highlights: parseHighlights(values.highlightsRaw),
    coverImage: values.coverImage || undefined,
    coverCredit: values.coverCredit || undefined,
    tags: {
      goodRoad: values.goodRoad,
      tollRoad: values.tollRoad,
      hasMotels: values.hasMotels,
      hasGasStations: values.hasGasStations
    },
    description: values.description
  };
}

export function ManageRoutesPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<RoutesFilters>({ q: "" });
  const stableFilters = useMemo(() => filters, [filters]);

  const routesQuery = useRoutesQuery(stableFilters);

  const [createOpened, setCreateOpened] = useState(false);
  const [editRoute, setEditRoute] = useState<Route | null>(null);

  const createMutation = useMutation({
    mutationFn: createRoute,
    onSuccess: async () => {
      notifications.show({ title: "Готово", message: "Маршрут создан", color: "green" });
      await queryClient.invalidateQueries({ queryKey: ["routes"] });
      setCreateOpened(false);
    },
    onError: (e) => {
      notifications.show({
        title: "Ошибка",
        message: e instanceof Error ? e.message : "Не удалось создать маршрут",
        color: "red"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (args: { id: string; input: Parameters<typeof updateRoute>[1] }) =>
      updateRoute(args.id, args.input),
    onSuccess: async () => {
      notifications.show({ title: "Готово", message: "Маршрут обновлён", color: "green" });
      await queryClient.invalidateQueries({ queryKey: ["routes"] });
      await queryClient.invalidateQueries({ queryKey: ["route"] });
      setEditRoute(null);
    },
    onError: (e) => {
      notifications.show({
        title: "Ошибка",
        message: e instanceof Error ? e.message : "Не удалось обновить маршрут",
        color: "red"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoute,
    onSuccess: async () => {
      notifications.show({ title: "Готово", message: "Маршрут удалён", color: "green" });
      await queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
    onError: (e) => {
      notifications.show({
        title: "Ошибка",
        message: e instanceof Error ? e.message : "Не удалось удалить маршрут",
        color: "red"
      });
    }
  });

  const rows = (routesQuery.data ?? []).map((r) => (
    <Table.Tr key={r.id}>
      <Table.Td>
        <Text fw={600}>{r.title}</Text>
        <Text size="xs" c="dimmed">
          {r.fromCity} → {r.toCity}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="wrap">
          {(r.seasons ?? []).map((s) => (
            <Badge key={s} variant="light">
              {seasonLabel(s)}
            </Badge>
          ))}
        </Group>
      </Table.Td>
      <Table.Td>{r.distanceKm} км</Table.Td>
      <Table.Td>≈ {r.durationHours} ч</Table.Td>
      <Table.Td>{r.sceneryScore}/5</Table.Td>
      <Table.Td>{r.avgRating.toFixed(1)}</Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          <ActionIcon variant="light" aria-label="Редактировать" onClick={() => setEditRoute(r)}>
            ✏️
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            aria-label="Удалить"
            onClick={() => {
              const ok = window.confirm(`Удалить маршрут "${r.title}"?`);
              if (ok) deleteMutation.mutate(r.id);
            }}
          >
            🗑️
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <div>
          <Title order={2}>Управление маршрутами</Title>
        </div>
        <Button onClick={() => setCreateOpened(true)}>Добавить маршрут</Button>
      </Group>

      <RoutesFiltersPanel value={filters} onChange={setFilters} showSeasonFilter={false} />

      {routesQuery.isLoading && <Loader />}

      {routesQuery.isError && (
        <Alert color="red" title="Ошибка загрузки">
          {(routesQuery.error as Error)?.message ?? "Не удалось загрузить список"}
        </Alert>
      )}

      {routesQuery.data && (
        <Table withTableBorder withColumnBorders highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Маршрут</Table.Th>
              <Table.Th>Сезон</Table.Th>
              <Table.Th>Дистанция</Table.Th>
              <Table.Th>Время</Table.Th>
              <Table.Th>Туризм</Table.Th>
              <Table.Th>Рейтинг</Table.Th>
              <Table.Th style={{ width: 120 }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}

      <RouteFormModal
        opened={createOpened}
        onClose={() => setCreateOpened(false)}
        title="Новый маршрут"
        submitLabel="Создать"
        loading={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(toCreatePayload(values));
        }}
      />

      <RouteFormModal
        opened={Boolean(editRoute)}
        onClose={() => setEditRoute(null)}
        title="Редактирование маршрута"
        submitLabel="Сохранить"
        initial={editRoute ?? undefined}
        loading={updateMutation.isPending}
        onSubmit={async (values) => {
          if (!editRoute) return;
          await updateMutation.mutateAsync({
            id: editRoute.id,
            input: {
              title: values.title,
              fromCity: values.fromCity,
              toCity: values.toCity,
              distanceKm: values.distanceKm,
              durationHours: values.durationHours,
              seasons: values.seasons,
              sceneryScore: values.sceneryScore,
              highlights: parseHighlights(values.highlightsRaw),
    coverImage: values.coverImage || undefined,
    coverCredit: values.coverCredit || undefined,
              description: values.description,
              tags: {
                goodRoad: values.goodRoad,
                tollRoad: values.tollRoad,
                hasMotels: values.hasMotels,
                hasGasStations: values.hasGasStations
              }
            }
          });
        }}
      />
    </Stack>
  );
}
