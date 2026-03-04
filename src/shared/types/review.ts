export type Review = {
  id: string;
  routeId: string;
  author: string;
  rating: number; // 1..5
  text: string;
  createdAt: string;
};
