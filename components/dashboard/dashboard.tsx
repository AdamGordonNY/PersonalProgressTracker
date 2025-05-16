"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TimeGuardian } from "@/components/time-guardian/time-guardian";
import { FocusFortress } from "@/components/focus-fortress/focus-fortress";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/lib/types";

// Sample data for demo purposes
const SAMPLE_CARDS: Card[] = [
  {
    id: "1",
    title: "Social Media Trends 2025",
    description:
      "Research on emerging social media platforms and user behaviors.",
    status: "Ideas",
    keywords: [
      { id: "1", name: "Research" },
      { id: "2", name: "Social Media" },
    ],
    attachments: [],
    factSources: [],
  },
  {
    id: "2",
    title: "Climate Change Documentary",
    description: "Documentary exploring climate change impacts globally.",
    status: "Research",
    keywords: [
      { id: "3", name: "Environment" },
      { id: "4", name: "Educational" },
    ],
    attachments: [],
    factSources: [
      {
        id: "1",
        title: "NASA Climate Report 2024",
        url: "https://climate.nasa.gov/",
        quote: "Global temperatures continue to rise at an unprecedented rate.",
        screenshot: null,
        cardId: "1",
      },
    ],
  },
  {
    id: "3",

    title: "AI Ethics Series",
    description:
      "Video series exploring ethical considerations in AI development.",
    status: "Ideas",
    keywords: [
      { id: "4", name: "Educational" },
      { id: "5", name: "Technology" },
    ],
    attachments: [],
    factSources: [],
  },
  {
    id: "4",
    title: "Sustainable Fashion Guide",
    description:
      "Guide for sustainable fashion choices and industry practices.",
    status: "Scripting",
    keywords: [
      { id: "6", name: "Fashion" },
      { id: "7", name: "Sustainability" },
    ],
    attachments: [
      {
        id: "1",
        name: "Fashion Industry Report.pdf",
        url: "#",
        fileType: "pdf",
        provider: "GoogleDrive",
        cardId: "3",
        createdAt: new Date(),
      },
    ],
    factSources: [],
  },
  {
    id: "5",
    title: "Remote Work Productivity Tips",
    description:
      "Video with practical tips for staying productive while working remotely.",
    status: "Recording",
    keywords: [
      { id: "8", name: "Productivity" },
      { id: "9", name: "Career" },
    ],
    attachments: [],
    factSources: [],
  },
];

const COLUMNS = [
  "Ideas",
  "Research",
  "Scripting",
  "Recording",
  "Ready to Publish",
];

export default function Dashboard({ userId }: { userId: string }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterKeyword, setFilterKeyword] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading data from API
    const loadData = () => {
      setTimeout(() => {
        setCards(SAMPLE_CARDS);
        setIsLoading(false);
      }, 800);
    };

    loadData();
  }, []);

  // Filter cards based on keyword
  const filteredCards = filterKeyword
    ? cards.filter((card) =>
        card.keywords.some(
          (keyword) =>
            keyword.name.toLowerCase() === filterKeyword.toLowerCase()
        )
      )
    : cards;

  const handleCardStatusChange = (cardId: string, newStatus: string) => {
    setCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, status: newStatus } : card
      )
    );

    toast({
      title: "Card Updated",
      description: `Card moved to ${newStatus}`,
    });
  };

  const handleAddCard = (newCard: Card) => {
    setCards([...cards, newCard]);

    toast({
      title: "Card Created",
      description: "New content card has been created",
    });
  };

  const handleUpdateCard = (updatedCard: Card) => {
    setCards(
      cards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );

    toast({
      title: "Card Updated",
      description: "Content card has been updated",
    });
  };

  const handleDeleteCard = (cardId: string) => {
    setCards(cards.filter((card) => card.id !== cardId));

    toast({
      title: "Card Deleted",
      description: "Content card has been deleted",
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/20">
      <Sidebar
        onFilterByKeyword={setFilterKeyword}
        activeFilter={filterKeyword}
        cards={cards}
      />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4">
          <KanbanBoard
            cards={filteredCards}
            columns={COLUMNS}
            onCardStatusChange={handleCardStatusChange}
            onAddCard={handleAddCard}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
          />
        </main>
      </div>
      <TimeGuardian />
      <FocusFortress />
    </div>
  );
}
