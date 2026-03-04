import {
  Checkbox,
  Group,
  Stack,
  TextInput,
  Select,
  SegmentedControl,
  Paper,
  Text
} from "@mantine/core";

import type { RoutesFilters, SeasonFilter } from "../../../shared/types/route";

type Props = {
  value: RoutesFilters;
  onChange: (next: RoutesFilters) => void;

  cityOptions?: string[];

  showSeasonFilter?: boolean;
};

const seasonOptions: { label: string; value: SeasonFilter }[] = [
  { label: "Все", value: "all" },
  { label: "Лето", value: "summer" },
  { label: "Зима", value: "winter" }
];

export function RoutesFiltersPanel({
  value,
  onChange,
  cityOptions,
  showSeasonFilter = false
}: Props) {
  const showCities = Boolean(cityOptions && cityOptions.length > 0);

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <TextInput
          label="Поиск"
          placeholder="Москва, Казань, М-11, Байкал..."
          value={value.q ?? ""}
          onChange={(e) => onChange({ ...value, q: e.currentTarget.value })}
        />

        {(showCities || showSeasonFilter) && (
          <Group align="flex-end" wrap="wrap" gap="md">
            {showCities && (
              <>
                <Select
                  label="Откуда"
                  placeholder="Любой город"
                  searchable
                  clearable
                  data={cityOptions ?? []}
                  value={value.fromCity ?? null}
                  onChange={(v) => onChange({ ...value, fromCity: v ?? undefined })}
                />
                <Select
                  label="Куда"
                  placeholder="Любой город"
                  searchable
                  clearable
                  data={cityOptions ?? []}
                  value={value.toCity ?? null}
                  onChange={(v) => onChange({ ...value, toCity: v ?? undefined })}
                />
              </>
            )}

            {showSeasonFilter && (
              <div>
                <Text size="sm" fw={500} mb={6}>
                  Сезон
                </Text>
                <SegmentedControl
                  value={value.season ?? "all"}
                  data={seasonOptions}
                  onChange={(v) => onChange({ ...value, season: v as SeasonFilter })}
                />
              </div>
            )}
          </Group>
        )}

        <Group align="flex-end" wrap="wrap" gap="md">
          <Checkbox
            label="Хорошая дорога"
            checked={Boolean(value.goodRoad)}
            onChange={(e) => onChange({ ...value, goodRoad: e.currentTarget.checked })}
          />
          <Checkbox
            label="Платные участки"
            checked={Boolean(value.tollRoad)}
            onChange={(e) => onChange({ ...value, tollRoad: e.currentTarget.checked })}
          />
          <Checkbox
            label="Мотели по пути"
            checked={Boolean(value.hasMotels)}
            onChange={(e) => onChange({ ...value, hasMotels: e.currentTarget.checked })}
          />
          <Checkbox
            label="Заправки по пути"
            checked={Boolean(value.hasGasStations)}
            onChange={(e) => onChange({ ...value, hasGasStations: e.currentTarget.checked })}
          />
        </Group>
      </Stack>
    </Paper>
  );
}
