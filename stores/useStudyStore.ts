import { create } from "zustand";
import type { GraphPayload, OptionId, QuestionPayload } from "@/lib/types";

interface StudyState {
  sessionId: string | null;
  questions: QuestionPayload[];
  graphs: Record<string, GraphPayload>; // por graph_id
  current: number;
  selected: OptionId | null;
  hydrate: (sessionId: string, questions: QuestionPayload[], graphs: GraphPayload[]) => void;
  select: (id: OptionId) => void;
  next: () => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  sessionId: null,
  questions: [],
  graphs: {},
  current: 0,
  selected: null,
  hydrate: (sessionId, questions, graphs) =>
    set({
      sessionId,
      questions,
      graphs: Object.fromEntries(graphs.map((g) => [g.graph_id, g])),
      current: 0,
      selected: null,
    }),
  select: (selected) => set({ selected }),
  next: () => set((s) => ({ current: s.current + 1, selected: null })),
}));
