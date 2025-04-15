export interface Resource {
  id: string;
  title: string;
  body: string;
  status: "published" | "awaiting";
  url: string;
  created_at?: string;
  category: string;
  image: string;
}
