import { useQuery } from "@tanstack/react-query";

import { getRouteById } from "../api/routesApi";

export function routeQueryKey(id: string) {
  return ["route", id] as const;
}

export function useRouteQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? routeQueryKey(id) : ["route", "__missing"],
    queryFn: () => {
      if (!id) throw new Error("Missing route id");
      return getRouteById(id);
    },
    enabled: Boolean(id),
    staleTime: 60_000
  });
}
