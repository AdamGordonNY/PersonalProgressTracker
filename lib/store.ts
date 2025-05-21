import { create } from "zustand";
import { Board, Column, Card } from "@prisma/client";
import * as boardActions from "@/actions/board";
import * as columnActions from "@/actions/column";
import * as cardActions from "@/actions/card";

interface BoardState {
  boards: Board[];
  activeBoard: Board | null;
  columns: Column[];
  cards: Card[];
  isLoading: boolean;
  error: string | null;

  // Board actions
  fetchBoards: () => Promise<void>;
  setActiveBoard: (boardId: string) => Promise<void>;
  createBoard: (data: { title: string; description?: string }) => Promise<void>;
  updateBoard: (
    boardId: string,
    data: { title?: string; description?: string; color?: string }
  ) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  reorderBoards: (updates: { id: string; order: number }[]) => Promise<void>;

  // Column actions
  createColumn: (data: { title: string }) => Promise<void>;
  updateColumn: (columnId: string, data: { title: string }) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  reorderColumns: (updates: { id: string; order: number }[]) => Promise<void>;

  // Card actions
  addCard: (data: {
    title: string;
    description?: string;
    columnId: string;
    keywords: string[];
  }) => Promise<void>;
  updateCard: (
    cardId: string,
    data: {
      title?: string;
      description?: string;
      columnId?: string;
      keywords?: string[];
    }
  ) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  reorderCards: (
    updates: { id: string; columnId: string; order: number }[]
  ) => Promise<void>;
}

export const useBoard = create<BoardState>((set, get) => ({
  boards: [],
  activeBoard: null,
  columns: [],
  cards: [],
  isLoading: false,
  error: null,

  // Board actions
  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    const result = await boardActions.getBoards();
    if ("error" in result) {
      set({ error: result.error, isLoading: false });
    } else {
      set({ boards: result.boards, isLoading: false });
    }
  },

  setActiveBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    const result = await boardActions.getBoard(boardId);
    if ("error" in result) {
      set({ error: result.error, isLoading: false });
    } else {
      set({
        activeBoard: result.board,
        columns: result.board?.columns,
        cards: result.board?.columns.flatMap((col) => col.cards),
        isLoading: false,
      });
    }
  },

  createBoard: async (data) => {
    const result = await boardActions.createBoard(data);
    if ("error" in result) {
      set({ error: result.error });
    } else {
      await get().fetchBoards();
    }
  },

  updateBoard: async (boardId, data) => {
    const result = await boardActions.updateBoard(boardId, data);
    if ("error" in result) {
      set({ error: result.error });
    } else {
      await get().fetchBoards();
    }
  },

  deleteBoard: async (boardId) => {
    const result = await boardActions.deleteBoard(boardId);
    if ("error" in result) {
      set({ error: result.error });
    } else {
      await get().fetchBoards();
    }
  },

  reorderBoards: async (updates) => {
    const result = await boardActions.reorderBoards(updates);
    if ("error" in result) {
      set({ error: result.error });
    } else {
      await get().fetchBoards();
    }
  },

  // Column actions
  createColumn: async (data) => {
    if (!get().activeBoard?.id) return;
    const result = await columnActions.createColumn(
      get().activeBoard?.id!,
      data
    );
    if ("error" in result) {
      set({ error: result.error });
    } else {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  updateColumn: async (columnId, data) => {
    const result = await columnActions.updateColumn(columnId, data);
    if ("error" in result) {
      set({ error: result.error });
    } else if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  deleteColumn: async (columnId) => {
    const result = await columnActions.deleteColumn(columnId);
    if ("error" in result) {
      set({ error: result.error });
    } else if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  reorderColumns: async (updates) => {
    const result = await columnActions.reorderColumns(updates);
    if ("error" in result) {
      set({ error: result.error });
    } else if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  // Card actions
  addCard: async (data) => {
    const result = await cardActions.createCard(data);
    if ("error" in result) {
      set({ error: result.error });
    } else if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  updateCard: async (cardId, data) => {
    const result = await cardActions.updateCard(cardId, data);
    if ("error" in result) {
      set({ error: result.error });
    } else if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  deleteCard: async (cardId) => {
    const result = await cardActions.deleteCard(cardId);
    if ("error" in result) {
      set({ error: result.error });
    } else if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  reorderCards: async (updates) => {
    const result = await cardActions.reorderCards(updates);
    if ("error" in result) {
      set({ error: result.error });
    } else if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },
}));
