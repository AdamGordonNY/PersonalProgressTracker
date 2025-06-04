"use client";

import { useState, useEffect } from "react";
import { Card, Keyword, Attachment, FactSource } from "@prisma/client";

interface CardWithRelations extends Card {
  keywords: Keyword[];
  attachments: Attachment[];
  factSources: FactSource[];
}

export function useCard(cardId: string) {
  const [card, setCard] = useState<CardWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cardId) return;

    const fetchCard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/cards/${cardId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch card");
        }

        const data = await response.json();
        setCard(data);
      } catch (error) {
        console.error("Error fetching card:", error);
        setError("Failed to load card data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCard();
  }, [cardId]);

  return {
    card,
    keywords: card?.keywords,
    attachments: card?.attachments,
    factSources: card?.factSources,
    isLoading,
    error,
  };
}
