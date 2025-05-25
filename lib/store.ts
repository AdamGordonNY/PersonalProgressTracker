import { create } from "zustand";
import { Board, Column } from "@prisma/client";
import { Card } from "@/lib/types";
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
  isReordering: boolean;

  getDefaultBoard: () => Promise<void>;

  // Board actions
  fetchBoards: () => Promise<Board[] | void>;
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
      factSources?: Array<{
        title: string;
        url?: string;
        quote?: string;
      }>;
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
  isReordering: false,
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
  // Board actions
  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    const result = await boardActions.getBoards();
    if ("error" in result) {
      set({ error: result.error, isLoading: false });
      return;
    }
    set({ boards: result.boards, isLoading: false });
    return result.boards;
  },

  setActiveBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    const result = await boardActions.getBoard(boardId);
    if ("error" in result) {
      set({ error: result.error, isLoading: false });
      return;
    }
    set({
      activeBoard: result.board,
      columns: result.board?.columns,
      cards: result.board?.columns.flatMap((col: any) => col.cards) as Card[],
      isLoading: false,
    });
  },

  createBoard: async (data) => {
    const result = await boardActions.createBoard(data);
    if ("error" in result) {
      set({ error: result.error });
      return;
    }
    const boards = await get().fetchBoards();
    if (boards) {
      set({ boards });
    }
  },

  updateBoard: async (boardId, data) => {
    // Optimistically update the UI
    const currentBoard = get().activeBoard;
    if (currentBoard) {
      set({
        activeBoard: { ...currentBoard, ...data },
        boards: get().boards.map((board) =>
          board.id === boardId ? { ...board, ...data } : board
        ),
      });
    }

    // Make the API call
    const result = await boardActions.updateBoard(boardId, data);
    if ("error" in result) {
      // Revert on error
      set({ error: result.error });
      if (currentBoard) {
        set({
          activeBoard: currentBoard,
          boards: get().boards.map((board) =>
            board.id === boardId ? currentBoard : board
          ),
        });
      }
    }
  },

  deleteBoard: async (boardId) => {
    const result = await boardActions.deleteBoard(boardId);
    if ("error" in result) {
      set({ error: result.error });
      return;
    }
    const boards = await get().fetchBoards();
    if (boards) {
      set({ boards });
    }
  },

  reorderBoards: async (updates) => {
    // Optimistically update the UI
    const currentBoards = [...get().boards];
    set({
      boards: get().boards.map((board) => {
        const update = updates.find((u) => u.id === board.id);
        return update ? { ...board, order: update.order } : board;
      }),
    });

    // Make the API call
    const result = await boardActions.reorderBoards(updates);
    if ("error" in result) {
      // Revert on error
      set({ boards: currentBoards, error: result.error });
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
      return;
    }
    if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  updateColumn: async (columnId, data) => {
    // Optimistically update the UI
    const currentColumns = [...get().columns];
    set({
      columns: get().columns.map((col) =>
        col.id === columnId ? { ...col, ...data } : col
      ),
    });

    // Make the API call
    const result = await columnActions.updateColumn(columnId, data);
    if ("error" in result) {
      // Revert on error
      set({ columns: currentColumns, error: result.error });
    }
  },

  deleteColumn: async (columnId) => {
    const result = await columnActions.deleteColumn(columnId);
    if ("error" in result) {
      set({ error: result.error });
      return;
    }
    if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  reorderColumns: async (updates) => {
    // Optimistically update the UI
    const currentColumns = [...get().columns];
    set({
      columns: get().columns.map((col) => {
        const update = updates.find((u) => u.id === col.id);
        return update ? { ...col, order: update.order } : col;
      }),
    });

    // Make the API call
    const result = await columnActions.reorderColumns(updates);
    if ("error" in result) {
      // Revert on error
      set({ columns: currentColumns, error: result.error });
    }
  },

  // Card actions
  addCard: async (data) => {
    const result = await cardActions.createCard(data);
    if ("error" in result) {
      set({ error: result.error });
      return;
    }
    if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  updateCard: async (cardId, data) => {
    const result = await cardActions.updateCard(cardId, data);
    if ("error" in result) {
      set({ error: result.error });
      return;
    }
    if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  deleteCard: async (cardId) => {
    const result = await cardActions.deleteCard(cardId);
    if ("error" in result) {
      set({ error: result.error });
      return;
    }
    if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },

  reorderCards: async (updates) => {
    const result = await cardActions.reorderCards(updates);
    if ("error" in result) {
      set({ error: result.error });
      return;
    }
    if (get().activeBoard?.id) {
      await get().setActiveBoard(get().activeBoard?.id!);
    }
  },
}));
