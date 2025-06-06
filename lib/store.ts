import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Board, Column, User } from "@prisma/client";
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
  user: User | null;

  getDefaultBoard: () => Promise<Board[] | void>;

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
  user: null,
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
    // Optimistically update the UI
    const currentCards = [...get().cards];
    const updatedCard = currentCards.find((c) => c.id === cardId);

    if (updatedCard) {
      set({
        cards: currentCards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                ...data,
                keywords: data.keywords
                  ? data.keywords.map((name) => ({
                      id: "",
                      name,
                      cardId,
                      userId: card.keywords[0]?.userId ?? "", // Use existing userId or empty string
                    }))
                  : card.keywords,
                factSources: data.factSources
                  ? data.factSources.map((source) => ({
                      id: "",
                      cardId,
                      title: source.title,
                      userId: card.factSources?.[0]?.userId ?? "", // Use existing userId or empty string
                      url: source.url ?? null,
                      quote: source.quote ?? null,
                      screenshot: card.factSources?.[0]?.screenshot ?? null, // Use existing screenshot or null
                    }))
                  : card.factSources,
              }
            : card
        ),
      });
    }

    const result = await cardActions.updateCard(cardId, data);
    if ("error" in result) {
      // Revert on error
      set({ cards: currentCards, error: result.error });
      set({ error: result.error });
      return;
    }
    if (get().activeBoard?.id) {
    } else if (get().activeBoard?.id) {
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

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetState {
  isMinimized: boolean;
  position: WidgetPosition;
  size: WidgetSize;
  zIndex: number;
}

interface UIState {
  // Widget states
  focusFortress: WidgetState;
  timeGuardian: WidgetState;
  postureChecker: WidgetState;

  // Global UI state
  highestZIndex: number;

  // Actions
  toggleMinimized: (
    widget: keyof Pick<
      UIState,
      "focusFortress" | "timeGuardian" | "postureChecker"
    >
  ) => void;
  updatePosition: (
    widget: keyof Pick<
      UIState,
      "focusFortress" | "timeGuardian" | "postureChecker"
    >,
    position: WidgetPosition
  ) => void;
  updateSize: (
    widget: keyof Pick<
      UIState,
      "focusFortress" | "timeGuardian" | "postureChecker"
    >,
    size: WidgetSize
  ) => void;
  bringToFront: (
    widget: keyof Pick<
      UIState,
      "focusFortress" | "timeGuardian" | "postureChecker"
    >
  ) => void;
  resetPositions: () => void;
}

const defaultWidgetState: WidgetState = {
  isMinimized: false,
  position: { x: 20, y: 20 },
  size: { width: 300, height: 400 },
  zIndex: 1000,
};

const getDefaultPosition = (index: number): WidgetPosition => ({
  x: 20 + index * 20,
  y: 20 + index * 20,
});

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial widget states with offset positions to avoid overlap
      focusFortress: {
        ...defaultWidgetState,
        position: getDefaultPosition(0),
        zIndex: 1000,
      },
      timeGuardian: {
        ...defaultWidgetState,
        position: getDefaultPosition(1),
        zIndex: 1001,
      },
      postureChecker: {
        ...defaultWidgetState,
        position: getDefaultPosition(2),
        zIndex: 1002,
      },

      highestZIndex: 1002,

      toggleMinimized: (widget) =>
        set((state) => ({
          [widget]: {
            ...state[widget],
            isMinimized: !state[widget].isMinimized,
          },
        })),

      updatePosition: (widget, position) =>
        set((state) => ({
          [widget]: {
            ...state[widget],
            position,
          },
        })),

      updateSize: (widget, size) =>
        set((state) => ({
          [widget]: {
            ...state[widget],
            size,
          },
        })),

      bringToFront: (widget) =>
        set((state) => {
          const newZIndex = state.highestZIndex + 1;
          return {
            [widget]: {
              ...state[widget],
              zIndex: newZIndex,
            },
            highestZIndex: newZIndex,
          };
        }),

      resetPositions: () =>
        set((state) => ({
          focusFortress: {
            ...state.focusFortress,
            position: getDefaultPosition(0),
            isMinimized: false,
          },
          timeGuardian: {
            ...state.timeGuardian,
            position: getDefaultPosition(1),
            isMinimized: false,
          },
          postureChecker: {
            ...state.postureChecker,
            position: getDefaultPosition(2),
            isMinimized: false,
          },
        })),
    }),
    {
      name: "ui-preferences",
      // Only persist certain parts of the state
      partialize: (state) => ({
        focusFortress: state.focusFortress,
        timeGuardian: state.timeGuardian,
        postureChecker: state.postureChecker,
        highestZIndex: state.highestZIndex,
      }),
    }
  )
);
