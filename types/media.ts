export interface MediaPost {
  id: string;
  image: string;
  video: string;
  title: string;
  description: string;
  created_at: number;
  user: {
    name: string;
    avatar: string;
    lightning_address?: string;
  };
}
