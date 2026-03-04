import { http } from "../../../shared/api/http";
import type { Review } from "../../../shared/types/review";

function makeId(): string {
  const c: unknown = globalThis.crypto;
  if (c && typeof c === "object" && "randomUUID" in c) {
    const maybe = (c as { randomUUID?: () => string }).randomUUID;
    if (typeof maybe === "function") return maybe();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function getReviewsByRouteId(routeId: string): Promise<Review[]> {
  const res = await http.get<Review[]>("/reviews", { params: { routeId } });
  // Сортировка на клиенте, чтобы не зависеть от параметров json-server
  return [...res.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type ReviewCreateInput = Omit<Review, "id" | "createdAt"> & { createdAt?: string };

export async function createReview(input: ReviewCreateInput): Promise<Review> {
  const payload: Review = {
    id: makeId(),
    ...input,
    createdAt: input.createdAt ?? new Date().toISOString()
  };
  const res = await http.post<Review>("/reviews", payload);
  return res.data;
}

export async function deleteReview(id: string): Promise<void> {
  await http.delete(`/reviews/${id}`);
}
