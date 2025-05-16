export interface Card {
  id: string;
  title: string;
  description: string | null;
  status: string;
  keywords: Keyword[];
  attachments: Attachment[];
  factSources: FactSource[];
}

export interface Keyword {
  id: string;
  name: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  fileType: string;
  provider: string;
  cardId: string;
  createdAt: Date;
}

export interface FactSource {
  id: string;
  title: string;
  url: string | null;
  quote: string | null;
  screenshot: string | null;
  cardId: string;
}