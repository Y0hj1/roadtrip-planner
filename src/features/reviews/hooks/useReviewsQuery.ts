import { useQuery } from "@tanstack/react-query";

import { getReviewsByRouteId } from "../api/reviewsApi";

export function reviewsQueryKey(routeId: string) {
  return ["reviews", routeId] as const;
}

export function useReviewsQuery(routeId: string | undefined) {
  return useQuery({
    queryKey: routeId ? reviewsQueryKey(routeId) : ["reviews", "__missing"],
    queryFn: () => {
      if (!routeId) throw new Error("Missing routeId");
      return getReviewsByRouteId(routeId);
    },
    enabled: Boolean(routeId),
    staleTime: 30_000
  });
}
