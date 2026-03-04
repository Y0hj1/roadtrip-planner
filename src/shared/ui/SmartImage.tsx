import { Image, type ImageProps } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

type Props = Omit<ImageProps, "src"> & {
  src?: string | null;
  /**
   * Картинка-заглушка, если основная не загрузилась.
   * По умолчанию используем надёжный внешний placeholder.
   */
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK = "https://picsum.photos/seed/roadtrip-fallback/1200/700";

/**
 * Надёжный компонент для изображений:
 * - если URL битый/заблокирован/не прогрузился, автоматически подставляет fallback.
 * - помогает избежать «пустых карточек».
 */
export function SmartImage({ src, fallbackSrc = DEFAULT_FALLBACK, ...props }: Props) {
  const initial = useMemo(() => (src && src.trim().length ? src : fallbackSrc), [src, fallbackSrc]);
  const [currentSrc, setCurrentSrc] = useState<string>(initial);

  // если пришёл новый src из данных — обновляем изображение
  useEffect(() => {
    setCurrentSrc(initial);
  }, [initial]);

  return (
    <Image
      {...props}
      src={currentSrc}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
