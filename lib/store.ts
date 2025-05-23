import { create } from "zustand";
import { Board, Column, Card } from "@prisma/client";
import * as boardActions from "@/actions/board";
import * as columnActions from "@/actions/column";
import * as cardActions from "@/actions/card";
import { debounce } from "lodash-es";

interface BoardState {
  boards: Board[];
  activeBoard: Board | null;
  columns: Column[];
  cards: Card[];
  isLoading: boolean;
  isReordering: boolean;
  error: string | null;

  // Board actions
  getDefaultBoard: () => Promise<void>;
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
  isReordering: false,
  error: null,

  // Default board handling
  getDefaultBoard: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await boardActions.getDefaultBoard();
      if ("error" in result) {
        set({ error: result.error, isLoading: false });
      } else if (result.board) {
        set({
          activeBoard: result.board,
          columns: result.board.columns,
          cards: result.board.columns.flatMap((col) => col.cards),
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ error: "Failed to load default board", isLoading: false });
    }
  },

  // Board management
  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await boardActions.getBoards();
      if ("error" in result) {
        set({ error: result.error, isLoading: false });
      } else {
        const sortedBoards = result.boards.sort((a, b) => a.order - b.order);
        set({ boards: sortedBoards, isLoading: false });
        if (!get().activeBoard && sortedBoards.length > 0) {
          await get().setActiveBoard(sortedBoards[0].id);
        }
      }
    } catch (error) {
      set({ error: "Failed to fetch boards", isLoading: false });
    }
  },

  setActiveBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    const prevState = { columns: get().columns, cards: get().cards };

    try {
      const result = await boardActions.getBoardDetails(boardId);
      if ("error" in result) {
        set({ error: result.error, isLoading: false });
      } else {
        set({
          activeBoard: result.board,
          columns: result.board?.columns || prevState.columns,
          cards:
            result.board?.columns.flatMap((col) => col.cards) ||
            prevState.cards,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: "Failed to load board details", isLoading: false });
    }
  },

  createBoard: async (data) => {
    const result = await boardActions.createBoard(data);
    "error" in result ? set({ error: result.error }) : get().fetchBoards();
  },

  updateBoard: async (boardId, data) => {
    const result = await boardActions.updateBoard(boardId, data);
    "error" in result ? set({ error: result.error }) : get().fetchBoards();
  },

  deleteBoard: async (boardId) => {
    const result = await boardActions.deleteBoard(boardId);
    "error" in result ? set({ error: result.error }) : get().fetchBoards();
  },

  reorderBoards: async (updates) => {
    const result = await boardActions.reorderBoards(updates);
    result.error && set({ error: result.error });
  },

  // Column management
  createColumn: async (data) => {
    const boardId = get().activeBoard?.id;
    if (!boardId) return;

    const result = await columnActions.createColumn(boardId, data);
    "error" in result
      ? set({ error: result.error })
      : get().setActiveBoard(boardId);
  },

  updateColumn: async (columnId, data) => {
    const result = await columnActions.updateColumn(columnId, data);
    "error" in result
      ? set({ error: result.error })
      : get().setActiveBoard(get().activeBoard?.id!);
  },

  deleteColumn: async (columnId) => {
    const result = await columnActions.deleteColumn(columnId);
    "error" in result
      ? set({ error: result.error })
      : get().setActiveBoard(get().activeBoard?.id!);
  },

  reorderColumns: async (updates) => {
    const result = await columnActions.reorderColumns(updates);
    result.error && set({ error: result.error });
  },

  // Card management
  addCard: async (data) => {
    const result = await cardActions.createCard(data);
    "error" in result
      ? set({ error: result.error })
      : get().setActiveBoard(get().activeBoard?.id!);
  },

  updateCard: async (cardId, data) => {
    const result = await cardActions.updateCard(cardId, data);
    "error" in result
      ? set({ error: result.error })
      : get().setActiveBoard(get().activeBoard?.id!);
  },

  deleteCard: async (cardId) => {
    const result = await cardActions.deleteCard(cardId);
    "error" in result
      ? set({ error: result.error })
      : get().setActiveBoard(get().activeBoard?.id!);
  },

  reorderCards: debounce(async (updates) => {
    const { cards, columns } = get();
    set({ isReordering: true });

    try {
      // Optimistic update
      const updatedCards = cards
        .map((card) => {
          const update = updates.find((u: any) => u.id === card.id);
          return update ? { ...card, ...update } : card;
        })
        .sort((a, b) => a.order - b.order);

      const updatedColumns = columns.map((column) => ({
        ...column,
        cards: updatedCards.filter((c) => c.columnId === column.id),
      }));

      set({ cards: updatedCards, columns: updatedColumns });
      await cardActions.reorderCards(updates);
    } catch (error) {
      // Rollback on error
      set({ cards, columns });
      set({ error: "Failed to reorder cards" });
    } finally {
      set({ isReordering: false });
    }
  }, 300) as unknown as BoardState["reorderCards"], // Type assertion for debounced promise
}));
