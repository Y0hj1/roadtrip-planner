import { AppShell, Group, Anchor, Container } from "@mantine/core";
import { NavLink, Outlet } from "react-router-dom";

function navStyle({ isActive }: { isActive: boolean }) {
  return {
    textDecoration: "none",
    fontWeight: isActive ? 700 : 500,
    opacity: isActive ? 1 : 0.85
  } as const;
}

export function AppLayout() {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Container h="100%" size="lg">
          <Group h="100%" justify="space-between">
            <Anchor
              component={NavLink}
              to="/"
              fw={800}
              underline="never"
              style={({ isActive }) => ({
                ...navStyle({ isActive }),
                letterSpacing: 0.2
              })}
            >
              RoadTrip Planner
            </Anchor>

            <Group gap="md">
              <Anchor component={NavLink} to="/" style={navStyle} underline="never">
                Главная
              </Anchor>
              <Anchor component={NavLink} to="/routes" style={navStyle} underline="never">
                Маршруты
              </Anchor>
              <Anchor component={NavLink} to="/manage" style={navStyle} underline="never">
                Управление
              </Anchor>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
