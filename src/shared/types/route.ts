export type RouteTags = {
  goodRoad: boolean;
  tollRoad: boolean;
  hasMotels: boolean;
  hasGasStations: boolean;
};

export type Season = "summer" | "winter";
export type SeasonFilter = "all" | Season;

export type Route = {
  id: string;
  title: string;
  fromCity: string;
  toCity: string;
  distanceKm: number;
  durationHours: number;
  tags: RouteTags;

  // Туристические атрибуты
  seasons: Season[]; // когда лучше ехать
  sceneryScore: number; // 1..5 (насколько живописно / туристически)
  highlights: string[]; // что посмотреть по пути

  // Визуальная обложка маршрута
  coverImage?: string; // URL картинки (например, Wikimedia / CDN)
  coverCredit?: string; // подпись/автор (по желанию)

  avgRating: number;
  description: string;
  createdAt: string;
};

export type RoutesFilters = Partial<RouteTags> & {
  q?: string;

  // фильтры по городам
  fromCity?: string;
  toCity?: string;

  // сезонный фильтр (на клиенте)
  season?: SeasonFilter;
};
