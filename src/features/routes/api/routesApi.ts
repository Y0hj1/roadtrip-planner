import { http } from "../../../shared/api/http";
import type { Route, RouteTags, RoutesFilters } from "../../../shared/types/route";

function makeId(): string {
  // Храним id как строку, чтобы routeId в отзывах всегда совпадал.
  // json-server принимает наш id и использует его.
  const c: unknown = globalThis.crypto;
  if (c && typeof c === "object" && "randomUUID" in c) {
    const maybe = (c as { randomUUID?: () => string }).randomUUID;
    if (typeof maybe === "function") return maybe();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toJsonServerParams(filters: RoutesFilters) {
  // json-server умеет:
  // - q=... (полнотекстовый поиск)
  // - field=value (фильтрация)
  // - вложенные поля можно через "tags.goodRoad" и т.п.
  const params: Record<string, string> = {};

  if (filters.q && filters.q.trim()) params.q = filters.q.trim();

  if (filters.fromCity && filters.fromCity.trim()) params.fromCity = filters.fromCity.trim();
  if (filters.toCity && filters.toCity.trim()) params.toCity = filters.toCity.trim();

  const boolKeys: (keyof RouteTags)[] = [
    "goodRoad",
    "tollRoad",
    "hasMotels",
    "hasGasStations"
  ];

  for (const key of boolKeys) {
    const v = filters[key];
    // Фильтруем только по включённым чекбоксам.
    if (v === true) params[`tags.${key}`] = "true";
  }

  // season фильтруем на клиенте, потому что в json-server это массив.
  return params;
}

export async function getRoutes(filters: RoutesFilters): Promise<Route[]> {
  const params = toJsonServerParams(filters);
  const res = await http.get<Route[]>("/routes", { params });
  return res.data;
}

export async function getRouteById(id: string): Promise<Route> {
  const res = await http.get<Route>(`/routes/${id}`);
  return res.data;
}

export type RouteCreateInput = Omit<Route, "id" | "avgRating" | "createdAt"> & {
  avgRating?: number;
  createdAt?: string;
};

export type RouteUpdateInput = Partial<Omit<Route, "id">>;

export async function createRoute(input: RouteCreateInput): Promise<Route> {
  const payload: Route = {
    id: makeId(),
    ...input,
    avgRating: input.avgRating ?? 0,
    createdAt: input.createdAt ?? new Date().toISOString()
  };
  const res = await http.post<Route>("/routes", payload);
  return res.data;
}

export async function updateRoute(id: string, input: RouteUpdateInput): Promise<Route> {
  const res = await http.patch<Route>(`/routes/${id}`, input);
  return res.data;
}

export async function deleteRoute(id: string): Promise<void> {
  await http.delete(`/routes/${id}`);
}
