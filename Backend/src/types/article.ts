export type SocialNetwork = "linkedin" | "facebook" | "instagram" | "x";

export type Article = {
  id: string;
  title: string;
  url: string;
  category: string;
  date: string;
  socialNetwork: SocialNetwork;
  autoText: string;
  autoImageUrl: string | null;
  createdAt: string;
};
