import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, BookOpen, AlertCircle, CheckCircle, XCircle, 
  ChevronRight, Sparkles, TrendingUp, ShieldAlert, Award
} from 'lucide-react';
import { Button, Chip } from '../components/UI';

interface Student {
  id: string;
  name: string;
  avatar: string;
  target: string;
  level: string;
  streak: number;
  avgMood: string;
  status: 'active' | 'struggling' | 'inactive';
  lastActive: string;
  recentWords: string[];
}

const COHORT_STUDENTS: Student[] = [
  {
    id: "stud_1",
    name: "Felix",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=4ECDC4",
    target: "IELTS 6.5",
    level: "B2",
    streak: 5,
    avgMood: "Happy",
    status: "active",
    lastActive: "Today",
    recentWords: ["encounter", "stroll", "stray"]
  },
  {
    id: "stud_2",
    name: "Sarah",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=FF8A80",
    target: "Grade 9 Exam",
    level: "A2",
    streak: 12,
    avgMood: "Okay",
    status: "active",
    lastActive: "Yesterday",
    recentWords: ["vocabulary", "garden", "exercise"]
  },
  {
    id: "stud_3",
    name: "Leo",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=FAD02C",
    target: "TOEIC 750",
    level: "B1",
    streak: 0,
    avgMood: "Sad",
    status: "struggling",
    lastActive: "3 days ago",
    recentWords: ["orchestration", "telemetry"]
  }
];

interface ReviewItem {
  id: string;
  word: string;
  cefr: string;
  similarity: number;
  prerequisite: string;
  proposedEdge: string;
}

export default function TutorDashboard() {
  const [students, setStudents] = useState<Student[]>(COHORT_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(COHORT_STUDENTS[0]);
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([
    { id: "q1", word: "encountered", cefr: "B2", similarity: 0.88, prerequisite: "meet", proposedEdge: "[:SEMANTIC_SIMILAR]" },
    { id: "q2", word: "stroll", cefr: "B2", similarity: 0.79, prerequisite: "walk", proposedEdge: "[:SEMANTIC_SIMILAR]" },
    { id: "q3", word: "orchestration", cefr: "C1", similarity: 0.65, prerequisite: "arrange", proposedEdge: "[:SEMANTIC_SIMILAR]" }
  ]);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async (item: ReviewItem) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/expand-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedStudent?.id || "tutor_shared_123",
          vocabulary: [{ word: item.word, cefr: item.cefr, meaning: "Approve via tutor panel" }]
        })
      });
      if (response.ok) {
        const data = await response.json();
        setReviewStatus(`Approved "${item.word}". Graph expanded: created ${data.edges_created} edges.`);
        setReviewQueue(prev => prev.filter(q => q.id !== item.id));
      } else {
        setReviewStatus(`Failed to expand graph for "${item.word}".`);
      }
    } catch (err) {
      setReviewStatus(`Error connecting to AI Sidecar: ${err}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setReviewStatus(null), 4000);
    }
  };

  const handleReject = (item: ReviewItem) => {
    setReviewQueue(prev => prev.filter(q => q.id !== item.id));
    setReviewStatus(`Rejected proposed edge for "${item.word}".`);
    setTimeout(() => setReviewStatus(null), 3000);
  };

  return (
    <div className="space-y-8 pb-12 text-text">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-secondary">Tutor Copilot Dashboard</h1>
          <p className="text-text/70 mt-1">Cohort monitoring, student metrics, and Human-in-the-Loop review queue.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white border border-primary/10 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
            <Users className="text-secondary" />
            <div>
              <p className="text-xs text-text/50 font-medium">Active Students</p>
              <p className="text-lg font-heading font-bold">{students.length}</p>
            </div>
          </div>
          <div className="bg-white border border-primary/10 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
            <AlertCircle className="text-accent" />
            <div>
              <p className="text-xs text-text/50 font-medium">Attention Required</p>
              <p className="text-lg font-heading font-bold">1</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Cohort List */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-primary/10 space-y-4">
          <h2 className="font-heading font-bold text-lg border-b border-primary/10 pb-3 flex items-center gap-2">
            <Users size={18} className="text-secondary" />
            Class Cohort
          </h2>
          <div className="space-y-2">
            {students.map((student) => {
              const isSelected = selectedStudent?.id === student.id;
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center justify-between border ${
                    isSelected 
                      ? 'bg-secondary/10 border-secondary' 
                      : 'bg-background/40 hover:bg-background border-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full border border-primary/20" />
                    <div>
                      <p className="font-heading font-bold text-sm text-text">{student.name}</p>
                      <p className="text-xs text-text/50">{student.target} • {student.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.status === 'struggling' && (
                      <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse"></span>
                    )}
                    <ChevronRight size={16} className="text-text/30" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Col: Student Mastery Details */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-primary/10 space-y-6">
          <h2 className="font-heading font-bold text-lg border-b border-primary/10 pb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Student Mastery
          </h2>
          {selectedStudent ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-14 h-14 rounded-full border border-secondary" />
                <div>
                  <h3 className="font-heading font-bold text-xl text-text">{selectedStudent.name}</h3>
                  <p className="text-sm text-text/50">Current Goal: {selectedStudent.target}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background rounded-2xl p-3 border border-primary/10 text-center">
                  <p className="text-xs text-text/50 font-medium">Weekly Streak</p>
                  <p className="text-lg font-heading font-bold text-primary">{selectedStudent.streak} days</p>
                </div>
                <div className="bg-background rounded-2xl p-3 border border-primary/10 text-center">
                  <p className="text-xs text-text/50 font-medium">Recent Mood</p>
                  <p className="text-lg font-heading font-bold text-secondary">{selectedStudent.avgMood}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-heading font-semibold text-sm text-text">Knowledge Base & Scaffolding</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-background rounded-xl text-xs space-y-1">
                    <p className="font-bold text-text/80">Active ZPD Nodes</p>
                    <p className="text-text/60">Target: Grammar structure: S + have/has + V3</p>
                  </div>
                  <div className="p-3 bg-background rounded-xl text-xs space-y-1">
                    <p className="font-bold text-text/80">Recently Polished Vocabulary</p>
                    <div className="flex gap-1.5 flex-wrap mt-1">
                      {selectedStudent.recentWords.map(w => (
                        <span key={w} className="px-2 py-1 bg-white border border-primary/10 rounded-lg font-mono text-[10px]">{w}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {selectedStudent.status === 'struggling' && (
                <div className="bg-accent/10 p-4 rounded-2xl border border-accent/20 flex gap-2.5 items-start text-xs">
                  <ShieldAlert className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-text">Scaffolding Warning</p>
                    <p className="text-text/70 mt-0.5">Learner struggled on "orchestration" twice. Scaffold triggered priority synonym expansion.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-text/40 text-center py-12">Select a student from cohort.</p>
          )}
        </div>

        {/* Right Col: HITL Review Queue */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-primary/10 space-y-4">
          <h2 className="font-heading font-bold text-lg border-b border-primary/10 pb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            HITL Review Queue
          </h2>
          <p className="text-xs text-text/60">
            Review proposed word nodes and edges extracted from learner check-ins before merging to graph.
          </p>

          <AnimatePresence>
            {reviewStatus && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-2xl bg-primary/10 text-xs border border-primary/20 flex items-center gap-2 text-text"
              >
                <CheckCircle size={16} className="text-success shrink-0" />
                <p>{reviewStatus}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3 pt-2">
            {reviewQueue.map((item) => (
              <div 
                key={item.id} 
                className="bg-background/50 border border-primary/10 p-4 rounded-2xl space-y-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-base text-text">{item.word}</p>
                    <p className="text-xs text-text/50">CEFR: {item.cefr} • Sim: {(item.similarity*100).toFixed(0)}%</p>
                  </div>
                  <Chip variant="primary" className="text-[10px] px-2 py-0.5">{item.proposedEdge}</Chip>
                </div>
                
                <div className="text-[11px] text-text/70 bg-white p-2.5 rounded-xl border border-primary/5">
                  Proposed link: <strong>{item.word}</strong> connects with prerequisite <strong>{item.prerequisite}</strong>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(item)}
                    disabled={isSubmitting}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-success hover:bg-success/80 text-text flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(item)}
                    disabled={isSubmitting}
                    className="px-3 py-2 rounded-xl text-xs font-bold border border-accent/20 hover:bg-accent/10 text-accent flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}

            {reviewQueue.length === 0 && (
              <div className="text-center py-12 space-y-2">
                <CheckCircle size={32} className="text-success mx-auto" />
                <p className="text-sm font-heading font-medium">All reviews completed!</p>
                <p className="text-xs text-text/40">Queue is currently empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
