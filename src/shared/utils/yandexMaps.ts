export function buildYandexMapsRouteUrl(from: string, to: string) {
  const fromEnc = encodeURIComponent(from.trim());
  const toEnc = encodeURIComponent(to.trim());
  return `https://yandex.ru/maps/?rtext=${fromEnc}~${toEnc}&rtt=auto`;
}

export function buildYandexMapsSearchUrl(query: string) {
  const q = encodeURIComponent(query.trim());
  return `https://yandex.ru/maps/?text=${q}`;
}
