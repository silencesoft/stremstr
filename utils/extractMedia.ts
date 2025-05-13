export interface MediaUrls {
  image?: string;
  video?: string;
}

export const extractMediaUrls = (content: string): MediaUrls => {
  const urls = content.match(/https?:\/\/[^\s)"]+/gi);

  if (!urls) return {};

  const image = urls.find((url) => /\.(jpg|jpeg|png|gif)$/i.test(url));
  const video = urls.find((url) => /\.(mp4|webm)$/i.test(url));

  const youtubeUrl = urls.find((url) =>
    /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(url)
  );

  let youtubeEmbed;

  if (youtubeUrl) {
    const videoIdMatch = youtubeUrl.match(
      /(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (videoIdMatch) {
      youtubeEmbed = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
  }

  return { image, video: video || youtubeEmbed };
};
