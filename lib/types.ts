import {
  User,
  Card as PrismaCard,
  Keyword,
  Attachment,
  FactSource,
} from "@prisma/client";

export interface Card extends PrismaCard {
  keywords: Keyword[];
  attachments: Attachment[];
  factSources: FactSource[];
}

export interface CloudAccess {
  google: boolean;
  microsoft: boolean;
}

export interface CloudTokens {
  google?: string;
  microsoft?: string;
}

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
// export interface Keyword {
//   id: string;
//   name: string;
// }

// export interface Attachment {
//   id: string;
//   name: string;
//   url: string;
//   fileType: string;
//   provider: string;
//   cardId: string;
//   createdAt: Date;
// }

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
// types.ts
declare module "@clerk/nextjs/server" {
  interface PublicMetadata {
    cloudAccess: {
      google: boolean;
      microsoft: boolean;
    };
    tokenHash?: string | null;
    microsoftVerified?: boolean;
    lastTokenRefresh?: string;
  }
}
export interface PostureSettings {
  enabled: boolean;
  interval: number; // in minutes
  workStartHour: number; // 0-23
  workEndHour: number; // 0-23
  workDays: number[]; // 0-6 (Sunday-Saturday)
  soundEnabled: boolean;
  soundVolume: number; // 0-1
  notificationsEnabled: boolean;
  autoPauseInMeetings: boolean;
  autoPauseDuringFocus: boolean;
  snoozeOptions: number[]; // in minutes
}

export interface PainLog {
  id: string;
  timestamp: number; // Unix timestamp
  level: number; // 0-10
  location: PainLocation;
  notes?: string;
}

export enum PainLocation {
  NECK = "neck",
  UPPER_BACK = "upper_back",
  LOWER_BACK = "lower_back",
  SHOULDERS = "shoulders",
  WRISTS = "wrists",
  OTHER = "other",
}

export interface PostureState {
  isActive: boolean;
  lastReminder: number | null; // Unix timestamp
  nextReminder: number | null; // Unix timestamp
  snoozeUntil: number | null; // Unix timestamp
  inMeeting: boolean;
  inFocusMode: boolean;
  painLogs: PainLog[];
}

export interface PostureAlarmHook {
  settings: PostureSettings;
  state: PostureState;
  updateSettings: (newSettings: Partial<PostureSettings>) => void;
  startReminders: () => void;
  stopReminders: () => void;
  snooze: (minutes: number) => void;
  logPain: (level: number, location: PainLocation, notes?: string) => void;
  clearLogs: () => void;
  getPainLogs: (days?: number) => PainLog[];
  dismissReminder: () => void;
  setInMeeting: (inMeeting: boolean) => void;
  setInFocusMode: (inFocusMode: boolean) => void;
}
export interface BoardsWithColumnsAndCards {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  columns: {
    id: string;
    title: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
    cards: Card[];
  }[];
}
