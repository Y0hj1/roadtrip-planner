import {
  AspectRatio,
  Badge,
  Card,
  Group,
  Rating,
  Stack,
  Text,
  Title,
  Divider
} from "@mantine/core";
import { Link } from "react-router-dom";

import { SmartImage } from "../../../shared/ui/SmartImage";

import type { Route, Season } from "../../../shared/types/route";

type Props = {
  route: Route;
};

function seasonLabel(s: Season) {
  return s === "summer" ? "Лето" : "Зима";
}

function collectBadges(route: Route) {
  const items: string[] = [];

  // сезон
  for (const s of route.seasons) items.push(seasonLabel(s));

  // туристичность
  items.push(`Туризм: ${route.sceneryScore}/5`);

  // теги инфраструктуры
  if (route.tags.goodRoad) items.push("Хорошая дорога");
  if (route.tags.tollRoad) items.push("Платная");
  if (route.tags.hasMotels) items.push("Мотели");
  if (route.tags.hasGasStations) items.push("Заправки");

  return items;
}

function highlightsLine(route: Route) {
  const items = route.highlights ?? [];
  if (items.length === 0) return null;
  const shown = items.slice(0, 2);
  const rest = items.length - shown.length;
  return rest > 0 ? `${shown.join(" · ")} · +${rest}` : shown.join(" · ");
}

export function RouteCard({ route }: Props) {
  const badges = collectBadges(route);
  const hl = highlightsLine(route);

  return (
    <Card
      withBorder
      radius="lg"
      component={Link}
      to={`/routes/${route.id}`}
      style={{ textDecoration: "none" }}
      shadow="sm"
      p="md"
    >
      <Card.Section>
        <AspectRatio ratio={16 / 9}>
          <SmartImage
            src={route.coverImage || "https://picsum.photos/seed/roadtrip/1200/675"}
            alt={route.title}
            fit="cover"
          />
        </AspectRatio>
      </Card.Section>

      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" gap="md" wrap="nowrap">
          <div>
            <Title order={4} lineClamp={2}>
              {route.title}
            </Title>
            <Text c="dimmed" size="sm">
              {route.fromCity} → {route.toCity}
            </Text>
          </div>

          <Stack gap={2} align="flex-end">
            <Rating value={route.avgRating} fractions={2} readOnly />
            <Text size="xs" c="dimmed">
              {route.avgRating.toFixed(1)}
            </Text>
          </Stack>
        </Group>

        <Group gap="md" wrap="wrap">
          <Text size="sm">{route.distanceKm} км</Text>
          <Text size="sm">≈ {route.durationHours} ч</Text>
        </Group>

        <Divider />

        <Group gap="xs" wrap="wrap">
          {badges.map((label) => (
            <Badge key={label} variant="light">
              {label}
            </Badge>
          ))}
        </Group>

        {hl && (
          <Text size="sm" fw={500}>
            По пути: <Text span c="dimmed" fw={400}>{hl}</Text>
          </Text>
        )}

        <Text size="sm" c="dimmed" lineClamp={2}>
          {route.description}
        </Text>
      </Stack>
    </Card>
  );
}
