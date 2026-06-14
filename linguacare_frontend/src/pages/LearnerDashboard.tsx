import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Mic, Sparkles, CheckCircle2, ArrowRight, Star, 
  PenTool, MessageCircle, Target, ChevronDown, 
  Smile, Frown, Meh, RotateCcw, Volume2, Loader2, Award, Info
} from 'lucide-react';
import { Button, Chip, Mascot, ProgressTree } from '../components/UI';
import { useLearnerStore } from '../store/learnerStore';

const EXAM_TARGETS: Record<string, string[]> = {
  "IELTS": ["Band 4.0", "Band 5.0", "Band 6.0", "Band 6.5", "Band 7.0", "Band 8.0+"],
  "Vietnam English Grade 1-12": ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  "Flyer": ["1 Shield", "2 Shields", "3 Shields", "4 Shields", "5 Shields"],
  "TOEIC": ["450+", "600+", "750+", "900+"]
};

const ALL_TAGS = ["Speaking", "Collocations", "Word form", "Rewrite sentences", "Reading", "Listening", "Writing"];

const Screen1Landing: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { examGoal, setExamGoal, examTarget, setExamTarget } = useLearnerStore();
  const [activeTags, setActiveTags] = useState(["Speaking", "Vocabulary"]);

  const examKeys = Object.keys(EXAM_TARGETS);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start"
    >
      {/* Welcome Content (Left Aligned) */}
      <div className="lg:col-span-7 space-y-lg">
        <div className="space-y-sm">
          <div className="inline-flex items-center px-sm py-xs bg-primary-fixed text-on-primary-fixed rounded-full font-label-sm text-label-sm">
            Chào mừng bạn quay lại
          </div>
          <h2 className="font-display text-display text-on-surface max-w-[15ch]">Sẵn sàng cho hành trình mới?</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[50ch]">
            Lumi đã chuẩn bị không gian học tập yên tĩnh cho bạn. Hãy chọn mục tiêu của hôm nay để chúng mình bắt đầu nhé.
          </p>
        </div>

        {/* Goal Selection */}
        <div className="space-y-md">
          <div className="bg-surface border border-whisper shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] rounded-[24px] p-md transition-all">
            <label className="mb-2 block text-on-surface-variant font-medium font-label-sm text-label-sm">KỲ THI MỤC TIÊU</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
              {examKeys.map(exam => (
                <button 
                  key={exam}
                  onClick={() => {
                    setExamGoal(exam);
                    setExamTarget(EXAM_TARGETS[exam][0]);
                  }}
                  className={`border border-whisper p-sm rounded-xl text-center font-headline-md text-headline-md hover:bg-surface-container-low transition-colors active:translate-y-[1px] ${examGoal === exam ? 'bg-primary-container text-on-primary-container border-transparent' : ''}`}
                >
                  {exam.includes('Grade') ? 'School' : exam}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-whisper shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] rounded-[24px] p-md transition-all">
            <label className="mb-2 block text-on-surface-variant font-medium font-label-sm text-label-sm">ĐIỂM SỐ MỤC TIÊU ({examGoal})</label>
            <div className="relative">
               <select 
                value={examTarget} 
                onChange={(e) => setExamTarget(e.target.value)} 
                className="w-full appearance-none bg-surface-container-low rounded-xl p-sm pr-8 border border-whisper font-medium text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {EXAM_TARGETS[examGoal]?.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Skill Priority */}
          <div className="space-y-sm">
            <label className="mb-2 block text-on-surface-variant font-medium font-label-sm text-label-sm">KỸ NĂNG ƯU TIÊN</label>
            <div className="flex flex-wrap gap-xs">
              {["Vocabulary", "Grammar", "Speaking", "Writing"].map(skill => {
                const isActive = activeTags.includes(skill);
                const icons: Record<string, string> = { Vocabulary: "menu_book", Grammar: "spellcheck", Speaking: "record_voice_over", Writing: "edit_note" };
                return (
                  <button 
                    key={skill}
                    onClick={() => setActiveTags(prev => isActive ? prev.filter(t => t !== skill) : [...prev, skill])}
                    className={`px-md py-sm rounded-full border border-whisper transition-all font-body-md text-body-md flex items-center gap-xs active:translate-y-[1px] ${isActive ? 'bg-primary-container text-on-primary-container' : 'bg-surface hover:bg-surface-container-low'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{icons[skill]}</span>
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-sm">
          <button 
            onClick={onNext}
            className="w-full md:w-auto px-xl py-md bg-primary text-on-primary rounded-full font-headline-md text-headline-md shadow-lg shadow-primary/10 hover:bg-primary-container hover:text-on-primary-container transition-all flex justify-center items-center gap-sm active:translate-y-[1px]"
          >
            Bắt đầu phiên học 5 phút
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Mascot Area (Right Aligned) */}
      <div className="lg:col-span-5 relative flex flex-col justify-center items-center py-xl">
        <div className="absolute -z-10 w-[300px] h-[300px] bg-primary-fixed/20 blur-[100px] rounded-full"></div>
        <Mascot state="welcome" />
        <div className="mt-md bg-surface p-sm rounded-2xl border border-whisper shadow-sm relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface border-t border-l border-whisper rotate-45"></div>
          <p className="font-body-md text-body-md italic text-primary">"Hôm nay là một ngày tuyệt vời để học từ mới đó!"</p>
        </div>
      </div>
    </motion.div>
  );
};

const Screen2Story: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { mood, setMood, originalStory, setOriginalStory, processStory, isLoading, error } = useLearnerStore();
  const [isRecording, setIsRecording] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const handleTransform = async () => {
    await processStory(originalStory);
    onNext();
  };

  const moods = [
    { id: 'Rất Tuyệt', icon: 'sentiment_very_satisfied', color: 'text-tertiary' },
    { id: 'Ổn Áp', icon: 'sentiment_satisfied', color: 'text-primary' },
    { id: 'Bình Thường', icon: 'sentiment_neutral', color: 'text-on-surface-variant' },
    { id: 'Mệt Mỏi', icon: 'sentiment_dissatisfied', color: 'text-secondary' },
    { id: 'Rất Tệ', icon: 'sentiment_very_dissatisfied', color: 'text-error' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="max-w-max-content-width mx-auto pb-12 flex flex-col items-center w-full"
    >
      <div className="w-full max-w-4xl space-y-lg">
        {/* Mood Check-in */}
        <div className="bg-surface border border-whisper shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] rounded-[24px] p-md">
          <h2 className="font-heading text-lg text-on-surface mb-4">Cậu cảm thấy thế nào ngay lúc này?</h2>
          <div className="grid grid-cols-5 gap-xs">
            {moods.map(m => (
              <button 
                key={m.id}
                onClick={() => setMood(m.id)} 
                className={`flex flex-col items-center justify-center p-sm rounded-[16px] transition-all hover:-translate-y-1 active:translate-y-[1px] group border ${mood === m.id ? 'border-surface-tint bg-on-primary-container scale-105' : 'bg-surface border-whisper'}`}
              >
                <span className={`material-symbols-outlined text-[32px] ${m.color} mb-1 transition-transform group-hover:scale-110`} style={{ fontVariationSettings: "'FILL' 0" }}>{m.icon}</span>
                <span className="font-label-sm text-[10px] text-clay text-center leading-tight">{m.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Story Selection / Prompts Carousel */}
        <section className="mb-lg overflow-hidden w-full">
          <h2 className="font-headline-md text-headline-md text-primary mb-md">What's the story today?</h2>
          <div className="flex gap-md overflow-x-auto no-scrollbar pb-xs snap-x">
            <button onClick={() => setActivePrompt("Gaming Epic")} className={`flex-shrink-0 w-64 group text-left snap-start p-md rounded-[24px] border shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] transition-all active:translate-y-[1px] ${activePrompt === "Gaming Epic" ? "bg-primary-container text-on-primary-container border-primary" : "bg-surface border-whisper hover:border-secondary"}`}>
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container mb-md">
                <span className="material-symbols-outlined text-[28px]">sports_esports</span>
              </div>
              <div className="font-headline-md text-[20px] mb-xs">Gaming Epic</div>
              <p className="font-body-md text-label-sm opacity-90">Talk about your latest victory or a clutch moment in the game.</p>
            </button>
            <button onClick={() => setActivePrompt("School Drama")} className={`flex-shrink-0 w-64 group text-left snap-start p-md rounded-[24px] border shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] transition-all active:translate-y-[1px] ${activePrompt === "School Drama" ? "bg-primary-container text-on-primary-container border-primary" : "bg-surface border-whisper hover:border-secondary"}`}>
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant mb-md">
                <span className="material-symbols-outlined text-[28px]">school</span>
              </div>
              <div className="font-headline-md text-[20px] mb-xs">School Drama</div>
              <p className="font-body-md text-label-sm opacity-90">Did something funny happen in the hallways today?</p>
            </button>
            <button onClick={() => setActivePrompt("The Crush")} className={`flex-shrink-0 w-64 group text-left snap-start p-md rounded-[24px] border shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] transition-all active:translate-y-[1px] ${activePrompt === "The Crush" ? "bg-primary-container text-on-primary-container border-primary" : "bg-surface border-whisper hover:border-secondary"}`}>
              <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-on-error-container mb-md">
                <span className="material-symbols-outlined text-[28px]">favorite</span>
              </div>
              <div className="font-headline-md text-[20px] mb-xs">The Crush</div>
              <p className="font-body-md text-label-sm opacity-90">Spill the tea. How did that eye contact feel?</p>
            </button>
            <button onClick={() => setActivePrompt("Free Flow")} className={`flex-shrink-0 w-64 group text-left snap-start p-md rounded-[24px] border shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] transition-all active:translate-y-[1px] ${activePrompt === "Free Flow" ? "bg-primary-container text-on-primary-container border-primary" : "bg-surface border-whisper hover:border-secondary"}`}>
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-[28px]">edit_note</span>
              </div>
              <div className="font-headline-md text-[20px] mb-xs">Free Flow</div>
              <p className="font-body-md text-label-sm opacity-90">Just start talking. No prompts, no rules, just you.</p>
            </button>
          </div>
        </section>

        {/* Main Input Canvas */}
        <section className="relative bg-surface rounded-[32px] p-md md:p-lg border border-whisper shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] mb-md w-full">
          <div className="flex flex-col md:flex-row gap-lg items-start">
            <div className="w-full relative group">
              <label className="block font-label-sm text-label-sm text-clay mb-sm" htmlFor="story-input">LIVE STORY CAPTURE (Vietnamese or English)</label>
              <textarea 
                id="story-input"
                value={originalStory}
                onChange={(e) => setOriginalStory(e.target.value)}
                placeholder="Hôm nay mình đi park chơi, tình cờ bắt gặp một stray cat rất dễ thương..."
                disabled={isLoading}
                className="w-full min-h-[250px] bg-transparent border-2 border-whisper focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-2xl p-md font-body-lg text-body-lg resize-none transition-all placeholder:text-surface-variant text-on-surface outline-none"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-xs pointer-events-none opacity-50 transition-opacity">
                <span className="font-label-sm text-[10px] text-clay uppercase tracking-widest">{isLoading ? 'Lumi is working...' : (isRecording ? 'Lumi is listening...' : 'Lumi is ready')}</span>
                <div className="w-16 h-16 relative">
                   <Mascot state={isRecording ? 'listening' : (isLoading ? 'polishing' : 'welcome')} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-lg flex flex-col items-center gap-md">
            <button 
              onClick={() => {
                if (!isRecording) {
                  setIsRecording(true);
                  setOriginalStory("Hôm nay tui đi dạo ở công viên thấy một chú mèo hoang.");
                  setTimeout(() => setIsRecording(false), 2000);
                }
              }}
              disabled={isLoading}
              className="group flex flex-col items-center gap-sm"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-error animate-pulse scale-105' : 'bg-primary-container hover:scale-105'}`}>
                <span className={`material-symbols-outlined text-[40px] ${isRecording ? 'text-surface' : 'text-on-primary-container'}`}>
                  {isRecording ? 'stop' : 'mic'}
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-clay tracking-widest uppercase">
                {isRecording ? 'Listening...' : 'Tap to record'}
              </span>
            </button>
            {error && <p className="text-error text-sm mt-2">{error}</p>}
          </div>
        </section>

        <button 
          onClick={handleTransform} 
          disabled={!originalStory || isLoading}
          className="w-full px-xl py-md bg-primary text-on-primary rounded-full font-headline-md text-headline-md shadow-lg shadow-primary/10 hover:bg-primary-container hover:text-on-primary-container transition-all flex justify-center items-center gap-sm active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Transforming..." : "Transform My Story → English"}
          {!isLoading && <span className="material-symbols-outlined">auto_awesome</span>}
        </button>
      </div>
    </motion.div>
  );
};

const Screen3Transform: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { transformedStory, extractedVocabulary, fetchNextZpdItem, getZpdEvaluation, lumiMessage } = useLearnerStore();
  const zpd = getZpdEvaluation();

  const handlePractice = async () => {
    // Note: ZPD item fetching would normally happen via Sidecar API
    await fetchNextZpdItem("general");
    onNext();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 1.05 }} 
      className="max-w-max-content-width mx-auto pb-32"
    >
      <div className="flex flex-col md:flex-row items-center gap-lg mb-xl">
        <div className="w-48 h-48 md:w-64 md:h-64 relative flex-shrink-0">
          <Mascot state={zpd.status === 'below_goal' ? 'welcome' : 'cheering'} speech={lumiMessage} />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-charcoal/5 blur-xl rounded-full"></div>
        </div>
        <div className="max-w-[65ch]">
          <h1 className="font-display text-display text-primary mb-sm">Lộ trình học của bạn</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Lumi đã phân tích bài viết của cậu đối chiếu với mục tiêu <strong>{zpd.targetCefr}</strong>. Đây là kết quả:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Story Card */}
        <div className="col-span-1 md:col-span-8 bg-surface border border-whisper rounded-[24px] p-lg shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] hover:border-primary/20 transition-all flex flex-col">
          <div className="flex items-center gap-xs mb-md">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Câu chuyện hoàn thiện</span>
          </div>
          <div className="bg-surface-container-low rounded-xl p-md border-l-4 border-secondary mb-md flex-grow">
            <p className="font-body-lg text-body-lg text-on-surface italic leading-relaxed">
              "{transformedStory}"
            </p>
          </div>
          <div className="flex flex-wrap gap-sm">
            <span className="px-sm py-xs bg-secondary/10 text-secondary rounded-full font-label-sm text-label-sm">
              Trình độ hiện tại: {zpd.currentCefr}
            </span>
            <span className="px-sm py-xs bg-secondary/10 text-secondary rounded-full font-label-sm text-label-sm">
              Mục tiêu: {zpd.targetCefr}
            </span>
          </div>
        </div>

        {/* Vocabulary Cards */}
        {extractedVocabulary && extractedVocabulary.length > 0 ? extractedVocabulary.map((vocab: any, index: number) => {
          const wordKey = vocab.word || vocab.phrase || "";
          const hasEnhancements = zpd.enhancements[wordKey] && zpd.enhancements[wordKey].length > 0;

          return (
            <div key={index} className={`col-span-1 md:col-span-4 bg-surface border border-whisper rounded-[24px] p-lg shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] flex flex-col ${index % 2 === 1 ? 'bg-gradient-to-br from-white to-surface-container-lowest' : ''}`}>
              <div className="flex items-center gap-xs mb-sm">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-container">
                  Từ vựng ({vocab.cefr || "A2"})
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-xs">{wordKey}</h3>
              <p className="font-label-sm text-label-sm text-clay mb-md">{vocab.phonetic || '/.../'}</p>
              <p className="text-on-surface-variant flex-grow mb-md">{vocab.meaning || vocab.translation}</p>

              {/* Show Micro hints if below goal */}
              {zpd.status === 'below_goal' && zpd.microHints[wordKey] && (
                <div className="bg-surface-container-low p-sm rounded-xl border border-whisper mt-sm text-xs">
                  <span className="font-semibold text-primary block mb-1">Gợi ý từ ZPD:</span>
                  <span className="font-mono tracking-widest text-on-surface-variant">{zpd.microHints[wordKey]}</span>
                </div>
              )}

              {/* Show enhancements if at/above goal */}
              {(zpd.status === 'at_goal' || zpd.status === 'above_goal') && hasEnhancements && (
                <div className="bg-primary-container/10 p-sm rounded-xl border border-primary/20 mt-sm text-xs">
                  <span className="font-semibold text-secondary block mb-1">Nâng cấp từ vựng phong phú:</span>
                  <div className="flex flex-wrap gap-xs">
                    {zpd.enhancements[wordKey].map((enhance: string, idx: number) => (
                      <span key={idx} className="bg-surface border border-whisper px-xs py-0.5 rounded text-secondary font-medium">
                        {enhance}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="col-span-1 md:col-span-4 bg-surface border border-whisper rounded-[24px] p-lg shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] flex flex-col justify-center items-center text-center">
             <span className="material-symbols-outlined text-clay text-[48px] mb-2">hourglass_empty</span>
             <p className="text-on-surface-variant font-body-md text-body-md">Không có từ vựng nào được trích xuất.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-xl flex flex-col items-center">
        <button 
          onClick={handlePractice}
          className="group bg-primary text-on-primary px-xl py-md rounded-full font-headline-md text-headline-md flex items-center gap-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:translate-y-[1px] transition-all duration-300"
        >
          Bắt đầu rèn luyện thôi!
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
        <p className="mt-md text-on-surface-variant font-label-sm text-label-sm">Dự kiến hoàn thành trong 10 phút</p>
      </div>
    </motion.div>
  );
};

const Screen4Practice: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const { transformedStory, quizStructure, fetchNextZpdItem, zpdTarget, incrementLeaves, updateBkt, getZpdEvaluation } = useLearnerStore();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [graded, setGraded] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const zpd = getZpdEvaluation();

  useEffect(() => {
    fetchNextZpdItem("General");
  }, [fetchNextZpdItem]);

  const handleSubmitQuiz = () => {
    if (!quizStructure?.questions) return;
    const grading: Record<number, boolean> = {};
    quizStructure.questions.forEach((q: any, idx: number) => {
      const uAns = (answers[idx] || "").trim().toLowerCase();
      const cAns = q.answer.trim().toLowerCase();
      const isRight = uAns === cAns || (cAns.includes(uAns) && uAns.length > 2);
      grading[idx] = isRight;
      
      updateBkt(q.question, isRight ? 1.0 : 0.0);
    });
    setGraded(grading);
    setSubmitted(true);
    incrementLeaves();
  };

  const handleRetryQuestion = (idx: number) => {
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[idx];
      return updated;
    });
    setGraded(prev => {
      const updated = { ...prev };
      delete updated[idx];
      return updated;
    });
    
    // Check if there are any other graded questions remaining
    const remainingGraded = Object.keys(graded).length - 1;
    if (remainingGraded <= 0) {
      setSubmitted(false);
    }
  };

  const getAnswerHint = (answer: string) => {
    if (!answer) return "";
    return answer.split(" ").map(word => {
      if (word.length <= 2) return word;
      return word[0] + "_".repeat(word.length - 2) + word[word.length - 1];
    }).join(" ");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-[800px] mx-auto pb-32"
    >
      {/* Progress Indicator */}
      <div className="mb-lg">
        <div className="flex justify-between items-end mb-xs">
          <span className="font-label-sm text-label-sm text-clay">Luyện tập thích ứng • ZPD Engine</span>
          <span className="font-metric-lg text-metric-lg text-primary">
            {submitted ? "100%" : "50%"}
          </span>
        </div>
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700 w-[50%]"></div>
        </div>
      </div>

      <section className="space-y-md">
        {/* Story Context Card */}
        <div className="bg-surface-container-lowest border border-whisper shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] rounded-[24px] p-md">
          <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
            <span className="material-symbols-outlined">menu_book</span>
            <span className="font-label-sm text-label-sm">STORY CONTEXT</span>
          </div>
          <p className="font-body-lg text-body-lg italic text-on-surface">
            "{transformedStory}"
          </p>
        </div>

        {/* Questions */}
        {quizStructure?.questions?.map((q: any, i: number) => {
          const isQuestionGraded = graded[i] !== undefined;
          const isQuestionCorrect = graded[i] === true;
          const answerClue = getAnswerHint(q.answer);

          return (
            <div key={i} className="bg-surface border border-whisper shadow-[0_4px_20px_-2px_rgba(28,25,23,0.03)] rounded-[24px] p-lg">
              <div className="flex justify-between items-start mb-md">
                <span className="font-label-sm text-label-sm text-clay">Câu hỏi {i + 1}</span>
                {zpd.status === 'below_goal' && !isQuestionGraded && (
                  <button 
                    onClick={() => setShowHints(prev => ({ ...prev, [i]: !prev[i] }))}
                    className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                    {showHints[i] ? "Ẩn gợi ý" : "Xem gợi ý ZPD"}
                  </button>
                )}
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">
                {q.question}
              </h2>

              {/* Cloze or Micro hint area */}
              {showHints[i] && !isQuestionGraded && (
                <div className="mb-md p-sm bg-surface-container-low rounded-xl border border-whisper text-xs">
                  <span className="font-semibold text-primary block mb-1">Gợi ý từ Lumi:</span>
                  <span className="font-mono tracking-widest text-on-surface-variant">{answerClue}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                {q.options ? q.options.map((opt: string, optIdx: number) => {
                  const isSelected = answers[i] === opt;
                  const letter = String.fromCharCode(65 + optIdx);
                  const isCorrect = isQuestionGraded && isQuestionCorrect && isSelected;
                  const isWrong = isQuestionGraded && !isQuestionCorrect && isSelected;

                  return (
                    <button 
                      key={opt}
                      disabled={isQuestionGraded}
                      onClick={() => setAnswers(prev => ({ ...prev, [i]: opt }))}
                      className={`p-md text-left border rounded-[24px] transition-all group active:translate-y-[1px] ${
                        isSelected 
                          ? (isCorrect ? 'bg-primary-container/20 ring-2 ring-primary border-transparent' 
                             : isWrong ? 'bg-error-container/20 ring-2 ring-error border-transparent' 
                             : 'bg-primary-container/20 ring-2 ring-primary border-transparent')
                          : 'border-whisper hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-md">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-label-sm transition-colors ${
                          isSelected ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary group-hover:text-white'
                        }`}>{letter}</span>
                        <span className="font-body-md text-body-md text-on-surface">{opt}</span>
                      </div>
                    </button>
                  );
                }) : (
                   <input 
                      type="text" 
                      placeholder="Nhập câu trả lời của bạn..."
                      disabled={isQuestionGraded}
                      value={answers[i] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                      className="w-full col-span-1 md:col-span-2 bg-surface border border-whisper rounded-xl p-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    />
                )}
              </div>

              {/* No-Op Guardrail & Adaptive Feedback Loops */}
              {isQuestionGraded && !isQuestionCorrect && (
                <div className="mt-md bg-surface p-md border-t-4 border-clay overflow-hidden relative rounded-xl shadow-sm">
                  <div className="flex flex-col md:flex-row items-center gap-md">
                    <div className="w-24 h-24 flex-shrink-0">
                      <Mascot state="welcome" speech="Gần đúng rồi!" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Cùng xem lại gợi ý nhé</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                        Gợi ý cấu trúc: <span className="font-mono tracking-widest text-primary font-bold">{answerClue}</span>
                      </p>
                      <button 
                        onClick={() => handleRetryQuestion(i)}
                        className="px-md py-sm bg-surface border border-whisper hover:bg-surface-container-low rounded-xl font-label-sm text-label-sm text-primary flex items-center gap-xs shadow-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">replay</span> Thử lại câu này
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {isQuestionGraded && isQuestionCorrect && (
                 <div className="mt-md bg-surface p-md border-t-4 border-primary overflow-hidden relative rounded-xl shadow-sm">
                  <div className="flex flex-col md:flex-row items-center gap-md">
                    <div className="w-24 h-24 flex-shrink-0">
                      <Mascot state="cheering" speech="Hoàn hảo!" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Chính xác! Cậu làm tốt lắm.</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Đã ghi nhận độ thành thạo vào BKT.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {(!quizStructure || !quizStructure.questions) && (
          <div className="bg-surface p-lg rounded-[24px] text-center border border-whisper">
            <p className="text-on-surface-variant font-body-md">Không có bài luyện tập thích ứng nào.</p>
          </div>
        )}

        <div className="pt-md flex flex-col md:flex-row gap-sm items-center justify-center">
          {!submitted && quizStructure?.questions && (
            <button 
              onClick={handleSubmitQuiz} 
              className="w-full md:w-auto px-xl py-md bg-primary text-on-primary rounded-full font-headline-md shadow-lg hover:bg-primary-container active:translate-y-[1px] transition-all flex items-center justify-center gap-xs"
            >
              Nộp bài kiểm tra <span className="material-symbols-outlined">check_circle</span>
            </button>
          )}
          {submitted && (
            <button 
              onClick={onReset} 
              className="w-full md:w-auto px-xl py-md bg-primary text-on-primary rounded-full font-headline-md shadow-lg hover:bg-primary-container active:translate-y-[1px] transition-all flex items-center justify-center gap-xs"
            >
              Hoàn thành & Quay lại <span className="material-symbols-outlined">home</span>
            </button>
          )}
        </div>
      </section>
    </motion.div>
  );
};

// --- Assessment Quotas Sidebar Component ---
const AssessmentQuotasPanel = () => {
  const { registerAssessment, quotaStatus, quotaMessage, resetQuotaStatus, isLoading } = useLearnerStore();
  
  return (
    <div className="bg-white border border-primary/10 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2.5">
        <Award className="text-secondary" />
        <h3 className="font-heading font-bold text-lg text-text">Assessment Quotas</h3>
      </div>
      <p className="text-xs text-text/60 leading-relaxed">
        Linguacare regulates exam schedules to lower cognitive load. Limit: 10 Practice and 2 Strict Exams per month.
      </p>

      <div className="flex flex-col gap-2">
        <button 
          onClick={() => registerAssessment('practice')}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors text-text text-left flex justify-between"
        >
          <span>Practice Session</span>
          <span className="text-xs text-text/50">Limit 10/mo</span>
        </button>
        <button 
          onClick={() => registerAssessment('strict_self')}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 transition-colors text-text text-left flex justify-between"
        >
          <span>Strict Self Exam</span>
          <span className="text-xs text-text/50">Limit 2/mo</span>
        </button>
        <button 
          onClick={() => registerAssessment('strict_tutor')}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-accent/10 hover:bg-accent/20 border border-accent/20 transition-colors text-text text-left flex justify-between"
        >
          <span>Strict Tutor Exam</span>
          <span className="text-xs text-text/50">Limit 2/mo</span>
        </button>
      </div>

      <AnimatePresence>
        {quotaStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`p-3 rounded-xl border flex gap-2 items-start text-xs ${
              quotaStatus === 'success' 
                ? 'bg-success/20 border-success/40 text-text' 
                : 'bg-accent/20 border-accent/40 text-text'
            }`}
          >
            <Info size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">{quotaStatus === 'success' ? 'Success' : 'Quota Refused'}</p>
              <p className="text-text/70 mt-0.5">{quotaMessage}</p>
              <button 
                onClick={resetQuotaStatus} 
                className="mt-2 text-xs font-bold underline cursor-pointer hover:opacity-80 block"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function LearnerDashboard() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const resetStorySession = useLearnerStore(state => state.resetStorySession);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentScreen]);

  const handleNextStory = () => {
    resetStorySession();
    setCurrentScreen(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        <AnimatePresence mode="wait">
          {currentScreen === 1 && <Screen1Landing key="s1" onNext={() => setCurrentScreen(2)} />}
          {currentScreen === 2 && <Screen2Story key="s2" onNext={() => setCurrentScreen(3)} />}
          {currentScreen === 3 && <Screen3Transform key="s3" onNext={() => setCurrentScreen(4)} />}
          {currentScreen === 4 && <Screen4Practice key="s4" onReset={handleNextStory} />}
        </AnimatePresence>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <AssessmentQuotasPanel />
      </div>
    </div>
  );
}
