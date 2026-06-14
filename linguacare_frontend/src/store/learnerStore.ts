import { create } from 'zustand';

export interface ZpdEvaluation {
  status: 'below_goal' | 'at_goal' | 'above_goal';
  targetCefr: string;
  currentCefr: string;
  microHints: Record<string, string>;
  enhancements: Record<string, string[]>;
}

interface LearnerState {
  userId: string;
  mood: string | null;
  originalStory: string;
  transformedStory: string;
  originalCefr: string;
  lumiMessage: string;
  extractedVocabulary: any[];
  quizStructure: any;
  zpdTarget: any;
  isLoading: boolean;
  error: string | null;
  quotaMessage: string | null;
  quotaStatus: 'idle' | 'success' | 'exceeded';
  examGoal: string;
  examTarget: string;
  streak: number;
  leaves: number;

  setUserId: (id: string) => void;
  setMood: (mood: string | null) => void;
  setOriginalStory: (story: string) => void;
  setExamGoal: (goal: string) => void;
  setExamTarget: (target: string) => void;
  incrementLeaves: () => void;
  
  processStory: (story: string, forceCloud?: boolean) => Promise<void>;
  fetchNextZpdItem: (topic: string) => Promise<void>;
  updateBkt: (wordId: string, score: number) => Promise<void>;
  registerAssessment: (type: 'practice' | 'strict_self' | 'strict_tutor') => Promise<void>;
  resetQuotaStatus: () => void;
  resetStorySession: () => void;
  getZpdEvaluation: () => ZpdEvaluation;
}

const CORE_API_URL = "http://127.0.0.1:8001/api/v1";
const SIDECAR_API_URL = "http://127.0.0.1:8000/api/v1";

export const useLearnerStore = create<LearnerState>((set, get) => ({
  userId: "test_user_123",
  mood: null,
  originalStory: "",
  transformedStory: "",
  originalCefr: "A1",
  lumiMessage: "",
  extractedVocabulary: [],
  quizStructure: null,
  zpdTarget: null,
  isLoading: false,
  error: null,
  quotaMessage: null,
  quotaStatus: 'idle',
  examGoal: "IELTS",
  examTarget: "Band 6.5",
  streak: 5,
  leaves: 2,

  setUserId: (id) => set({ userId: id }),
  setMood: (mood) => set({ mood }),
  setOriginalStory: (story) => set({ originalStory: story }),
  setExamGoal: (examGoal) => set({ examGoal }),
  setExamTarget: (examTarget) => set({ examTarget }),
  incrementLeaves: () => set((state) => ({ leaves: Math.min(5, state.leaves + 1) })),
  resetQuotaStatus: () => set({ quotaStatus: 'idle', quotaMessage: null }),
  resetStorySession: () => set({
    originalStory: "",
    transformedStory: "",
    originalCefr: "A1",
    lumiMessage: "",
    extractedVocabulary: [],
    quizStructure: null,
    error: null
  }),

  processStory: async (story, forceCloud = false) => {
    set({ isLoading: true, error: null, originalStory: story });
    try {
      const formData = new FormData();
      const blob = new Blob([story], { type: 'text/plain' });
      formData.append('file', blob, 'story.txt');
      if (forceCloud) {
        formData.append('force_cloud', 'true');
      }

      const response = await fetch(`${SIDECAR_API_URL}/parse-material`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to parse material via ML Sidecar');
      const data = await response.json();
      
      set({ 
        extractedVocabulary: data.extracted_vocabulary || [],
        quizStructure: data.quiz_structure || null,
        transformedStory: data.transformed_story || "I took a stroll in the park and encountered a stray cat.",
        originalCefr: data.original_cefr || "A1",
        lumiMessage: data.lumi_message || "Great job sharing your story! Let's practice.",
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchNextZpdItem: async (topic) => {
    try {
      const response = await fetch(`${CORE_API_URL}/zpd/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: get().userId, current_topic: topic }),
      });
      if (response.ok) {
        const data = await response.json();
        set({ zpdTarget: data.target_node });
      }
    } catch (err) {
      console.error("ZPD fetch error", err);
    }
  },

  updateBkt: async (wordId, score) => {
    try {
      await fetch(`${CORE_API_URL}/bkt/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: get().userId, word_id: wordId, score }),
      });
    } catch (err) {
      console.error("BKT update error", err);
    }
  },

  registerAssessment: async (type) => {
    set({ isLoading: true, error: null, quotaStatus: 'idle', quotaMessage: null });
    try {
      const response = await fetch(`${CORE_API_URL}/assessments/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: get().userId, test_type: type }),
      });

      const data = await response.json();
      if (!response.ok) {
        // Quota exceeded
        set({ 
          quotaStatus: 'exceeded', 
          quotaMessage: data.detail || "Quota exceeded for this type of exam.",
          isLoading: false
        });
      } else {
        set({
          quotaStatus: 'success',
          quotaMessage: data.message || "Successfully registered for exam!",
          isLoading: false
        });
      }
    } catch (err: any) {
      set({ 
        quotaStatus: 'exceeded', 
        quotaMessage: "Failed to connect to core API for registration.",
        isLoading: false 
      });
    }
  },

  getZpdEvaluation: () => {
    const { examGoal, examTarget, extractedVocabulary } = get();
    
    // Map Target to CEFR Target
    let targetCefr = "B2";
    if (examGoal === "IELTS") {
      if (examTarget === "Band 4.0" || examTarget === "Band 5.0") targetCefr = "B1";
      else if (examTarget === "Band 6.0" || examTarget === "Band 6.5") targetCefr = "B2";
      else if (examTarget === "Band 7.0") targetCefr = "C1";
      else targetCefr = "C2";
    } else if (examGoal === "Vietnam English Grade 1-12") {
      const grade = parseInt(examTarget.replace("Grade ", ""));
      if (grade <= 5) targetCefr = "A1";
      else if (grade <= 9) targetCefr = "A2";
      else targetCefr = "B1";
    } else if (examGoal === "Flyer") {
      const shields = parseInt(examTarget.replace(" Shields", "").replace(" Shield", ""));
      if (shields <= 2) targetCefr = "A1";
      else targetCefr = "A2";
    } else if (examGoal === "TOEIC") {
      if (examTarget === "450+") targetCefr = "B1";
      else if (examTarget === "600+") targetCefr = "B2";
      else if (examTarget === "750+") targetCefr = "C1";
      else targetCefr = "C2";
    }

    // Determine current CEFR level from originalCefr
    const cefrValues: Record<string, number> = { "A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6 };
    let currentCefr = get().originalCefr || "A1";

    const targetVal = cefrValues[targetCefr] || 4;
    const currentVal = cefrValues[currentCefr] || 1;

    let status: 'below_goal' | 'at_goal' | 'above_goal' = 'at_goal';
    if (currentVal < targetVal) {
      status = 'below_goal';
    } else if (currentVal > targetVal) {
      status = 'above_goal';
    }

    // Generate Micro hints for words
    const microHints: Record<string, string> = {};
    extractedVocabulary.forEach((v: any) => {
      const w = v.word || v.phrase || "";
      if (w.length > 3) {
        const first = w[0];
        const last = w[w.length - 1];
        const middle = "_".repeat(w.length - 2);
        microHints[w] = `${first}${middle}${last}`;
      } else {
        microHints[w] = w;
      }
    });

    // Stylistic Enhancements dictionary mapping
    const enhancementsDict: Record<string, string[]> = {
      "cat": ["feline companion", "stray feline"],
      "cute": ["adorable", "charming", "endearing"],
      "saw": ["spotted", "encountered", "observed"],
      "went": ["strolled", "ventured", "made my way to"],
      "park": ["recreational area", "scenic parkland"],
      "sad": ["melancholy", "downcast", "heavyhearted"],
      "happy": ["elated", "jubilant", "cheerful"],
      "good": ["excellent", "superb", "commendable"],
      "bad": ["dreadful", "subpar", "unfavorable"],
      "very": ["exceedingly", "remarkably", "exceptionally"]
    };

    const enhancements: Record<string, string[]> = {};
    extractedVocabulary.forEach((v: any) => {
      const w = (v.word || v.phrase || "").toLowerCase();
      if (enhancementsDict[w]) {
        enhancements[v.word] = enhancementsDict[w];
      }
    });

    return {
      status,
      targetCefr,
      currentCefr,
      microHints,
      enhancements
    };
  }
}));
