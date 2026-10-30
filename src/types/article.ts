export type ArticleCategory =
  | 'beginner'
  | 'vertical-farming'
  | 'growth-stages'
  | 'sustainability-3rs'
  | 'troubleshooting';

export interface EditorialArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: ArticleCategory;
  categoryLabel?: string;
  coverImageUrl?: string;
  content?: string;
  publishedAt?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  keyTakeaways?: string[];
}
