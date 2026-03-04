import {
  Badge,
  Button,
  Card,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title
} from "@mantine/core";
import { Link } from "react-router-dom";

export function LandingPage() {
  const HERO_IMAGE = "https://media.zenfs.com/en/the_hollywood_reporter_ecomm_237/4a3bdc121db933b13e0d01baf3c22502";
  return (
    <Stack gap="md">
      <Paper
        radius="xl"
        p="xl"
        withBorder
        style={{
          backgroundColor: "#0b1220",
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 70%), url(${HERO_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white"
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap="sm" maw={620}>
            <Group gap="xs" wrap="wrap">
              <Badge variant="light">Маршруты + отзывы</Badge>
              <Badge variant="light">Фильтры по сезону</Badge>
              <Badge variant="light">Платные/бесплатные дороги</Badge>
            </Group>

            <Title order={1} c="white">RoadTrip Planner</Title>
            <Text size="lg" style={{ color: "rgba(255,255,255,0.88)" }}>
              Приложение-помощник для автопутешествий: выбирай популярные туристические маршруты,
              фильтруй по городам и сезону, смотри что посетить по пути и оставляй отзывы.
            </Text>

            <Group gap="md" mt="xs">
              <Button component={Link} to="/routes" size="md">
                Открыть маршруты
              </Button>
              <Button variant="light" component={Link} to="/manage" size="md">
                Управление (CRUD)
              </Button>
            </Group>
          </Stack>

          <Text fz={56} aria-hidden className="landing-car" style={{ lineHeight: 1 }}>
            🚙
          </Text>
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Card withBorder radius="lg" shadow="sm" p="lg">
          <Stack gap={6}>
            <Text fz={28} aria-hidden>
              🗺️
            </Text>
            <Text fw={700}>Подбор маршрута</Text>
            <Text c="dimmed" size="sm">
              Выбор города отправления и назначения, сезон (лето/зима), фильтры инфраструктуры.
            </Text>
          </Stack>
        </Card>

        <Card withBorder radius="lg" shadow="sm" p="lg">
          <Stack gap={6}>
            <Text fz={28} aria-hidden>
              🏞️
            </Text>
            <Text fw={700}>Туристические точки</Text>
            <Text c="dimmed" size="sm">
              Для каждого маршрута есть блок «Что посмотреть по пути» и оценка туристичности.
            </Text>
          </Stack>
        </Card>

        <Card withBorder radius="lg" shadow="sm" p="lg">
          <Stack gap={6}>
            <Text fz={28} aria-hidden>
              ⭐
            </Text>
            <Text fw={700}>Отзывы и рейтинг</Text>
            <Text c="dimmed" size="sm">
              Пользователи оставляют отзывы, а средний рейтинг маршрута пересчитывается автоматически.
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
