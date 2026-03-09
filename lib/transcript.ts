import { YoutubeTranscript } from "youtube-transcript";

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/**
 * Извлекает ID видео из URL YouTube или youtu.be.
 */
export function getYouTubeVideoId(url: string): string | null {
  const match = url.trim().match(YOUTUBE_REGEX);
  return match ? match[1]! : null;
}

/**
 * Получает транскрипт YouTube-видео. Для TikTok и других источников возвращает null.
 */
export async function fetchTranscript(videoUrl: string): Promise<string> {
  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) {
    throw new Error(
      "Неверный URL. Поддерживается только YouTube (youtube.com/watch, youtube.com/shorts, youtu.be). Для TikTok вставьте транскрипт вручную в будущей версии."
    );
  }

  const items = await YoutubeTranscript.fetchTranscript(videoId);
  const text = items.map((item) => item.text).join(" ");
  if (!text.trim()) {
    throw new Error("У этого видео нет доступного транскрипта.");
  }
  return text;
}
