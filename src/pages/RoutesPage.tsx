import { useMemo, useState } from "react";
import {
  Alert,
  Divider,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Paper
} from "@mantine/core";

import { RoutesFiltersPanel } from "../features/routes/components/RoutesFiltersPanel";
import { RouteCard } from "../features/routes/components/RouteCard";
import { useRoutesQuery } from "../features/routes/hooks/useRoutesQuery";

import type { Route, RoutesFilters, SeasonFilter } from "../shared/types/route";

function uniqueCities(routes: Route[]): string[] {
  const set = new Set<string>();
  for (const r of routes) {
    if (r.fromCity) set.add(r.fromCity);
    if (r.toCity) set.add(r.toCity);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
}

function routeScore(r: Route) {
  return r.avgRating * 10 + r.sceneryScore * 2;
}

function filterBySeason(routes: Route[], season: SeasonFilter): Route[] {
  if (season === "all") return routes;
  return routes.filter((r) => (r.seasons ?? []).includes(season));
}

export function RoutesPage() {
  const [filters, setFilters] = useState<RoutesFilters>({
    q: "",
    fromCity: undefined,
    toCity: undefined,
    season: "all",
    goodRoad: false,
    tollRoad: false,
    hasMotels: false,
    hasGasStations: false
  });

  const metaQuery = useRoutesQuery({ q: "" });
  const allRoutes = metaQuery.data ?? [];

  const cityOptions = useMemo(() => uniqueCities(allRoutes), [allRoutes]);
  const serverFilters = useMemo<RoutesFilters>(() => {
    const { season, ...rest } = filters;
    return rest;
  }, [filters]);

  const { data, isLoading, isError, error } = useRoutesQuery(serverFilters);

  const season = filters.season ?? "all";

  const filtered = useMemo(() => filterBySeason(data ?? [], season), [data, season]);

  const topTouristic = useMemo(() => {
    return [...allRoutes].sort((a, b) => routeScore(b) - routeScore(a)).slice(0, 3);
  }, [allRoutes]);

  const recommendation = useMemo(() => {
    if (!filters.fromCity || !filters.toCity) return null;
    const list = filterBySeason(data ?? [], season);
    if (list.length === 0) return null;
    return [...list].sort((a, b) => routeScore(b) - routeScore(a))[0];
  }, [data, filters.fromCity, filters.toCity, season]);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <div>
          <Title order={2}>Маршруты</Title>
          <Text c="dimmed">
            Выберите города, сезон и инфраструктуру — покажем лучшие варианты.
          </Text>
        </div>
        <Text c="dimmed" size="sm">
          Данных: {allRoutes.length}
        </Text>
      </Group>

      <RoutesFiltersPanel
        value={filters}
        onChange={setFilters}
        cityOptions={cityOptions}
        showSeasonFilter
      />

      {isLoading && <Loader />}

      {isError && (
        <Alert color="red" title="Ошибка загрузки">
          {(error as Error)?.message ?? "Не удалось загрузить маршруты"}
        </Alert>
      )}

      {recommendation && (
        <Paper withBorder radius="lg" p="md">
          <Title order={3}>Рекомендация</Title>
          <Text c="dimmed" size="sm" mb="sm">
            Лучший маршрут по выбранным городам (учтён сезон и фильтры).
          </Text>
          <RouteCard route={recommendation} />
        </Paper>
      )}

      <Divider my="sm" />

      <Title order={3}>Топ туристических маршрутов</Title>
      {metaQuery.isLoading && <Loader />}
      {!metaQuery.isLoading && topTouristic.length > 0 && (
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {topTouristic.map((r) => (
            <RouteCard key={r.id} route={r} />
          ))}
        </SimpleGrid>
      )}

      <Divider my="sm" />

      <Group justify="space-between" align="baseline" wrap="wrap">
        <Title order={3}>Подходящие маршруты</Title>
        <Text c="dimmed" size="sm">
          Найдено: {filtered.length}
        </Text>
      </Group>

      {data && filtered.length === 0 && (
        <Alert color="yellow" title="Ничего не найдено">
          Попробуй убрать часть фильтров или выбрать другой сезон.
        </Alert>
      )}

      {data && filtered.length > 0 && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {filtered.map((r) => (
            <RouteCard key={r.id} route={r} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
