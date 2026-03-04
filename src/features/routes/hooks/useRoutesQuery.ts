import { useQuery } from "@tanstack/react-query";

import type { RoutesFilters } from "../../../shared/types/route";
import { getRoutes } from "../api/routesApi";

export function routesQueryKey(filters: RoutesFilters) {
  return ["routes", filters] as const;
}

export function useRoutesQuery(filters: RoutesFilters) {
  return useQuery({
    queryKey: routesQueryKey(filters),
    queryFn: () => getRoutes(filters),
    staleTime: 60_000
  });
}
