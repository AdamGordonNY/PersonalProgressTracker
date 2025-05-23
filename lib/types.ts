import { User, Keyword, FactSource } from "@prisma/client";

export interface Card {
  id: string;
  title: string;
  description: string | null;
  status: string;
  keywords: Keyword[];
  attachments: Attachment[];
  factSources: FactSource[];
}

// export interface Keyword {
//   id: string;
//   name: string;
// }

export interface Attachment {
  id: string;
  name: string;
  url: string;
  fileType: string;
  provider: string;
  cardId: string;
  createdAt: Date;
}

// export interface FactSource {
//   id: string;
//   title: string;
//   url: string | null;
//   quote: string | null;
//   screenshot: string | null;
//   cardId: string;
// }
export interface CloudAccess {
  google: boolean;
  microsoft: boolean;
}

export interface CloudTokens {
  google?: string;
  microsoft?: string;
}

export type SubscriptionTier = "free" | "pro";

export interface UserSession extends User {
  cloudAccess: CloudAccess;
  subscriptionTier: SubscriptionTier;
}

export interface NewsriverResponse {
  title: string;
  url: string;
  domain: string;
}

export interface FeedEntry {
  id: string;
  title: string;
  content: string;
  url: string;
  published: Date;
}

export interface Feed {
  id: string;
  url: string;
  title: string | null;
  lastChecked: Date;
  lastHash: string | null;
  entries: FeedEntry[];
}
