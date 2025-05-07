export interface MediaUrls {
  image?: string;
  video?: string;
}

export const extractMediaUrls = (content: string): MediaUrls => {
  const urls = content.match(/https?:\/\/\S+\.(jpg|jpeg|png|gif|mp4|webm)/gi);
  if (!urls) return {};
  const image = urls.find((url) => /\.(jpg|jpeg|png|gif)$/i.test(url));
  const video = urls.find((url) => /\.(mp4|webm)$/i.test(url));
  return { image, video };
};
