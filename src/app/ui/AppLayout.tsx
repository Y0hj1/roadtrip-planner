import { AppShell, Group, Container } from "@mantine/core";
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
            <NavLink
              to="/"
              style={({ isActive }) => ({
                ...navStyle({ isActive }),
                letterSpacing: 0.2,
                fontWeight: 800
              })}
            >
              RoadTrip Planner
            </NavLink>

            <Group gap="md">
              <NavLink to="/" style={navStyle}>
                Главная
              </NavLink>
              <NavLink to="/routes" style={navStyle}>
                Маршруты
              </NavLink>
              <NavLink to="/manage" style={navStyle}>
                Управление
              </NavLink>
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
