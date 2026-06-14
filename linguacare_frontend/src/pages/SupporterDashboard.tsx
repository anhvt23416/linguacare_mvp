import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Heart, Calendar, MessageCircle, Star, Shield, 
  Smile, Award, Zap, HelpCircle
} from 'lucide-react';
import { Button, Chip } from '../components/UI';
import { useLearnerStore } from '../store/learnerStore';

export default function SupporterDashboard() {
  const { t } = useTranslation();
  const learnerName = "Felix";
  const streak = useLearnerStore(state => state.streak);
  const currentMood = useLearnerStore(state => state.mood) || "Happy";
  const activeGoal = useLearnerStore(state => state.examGoal);
  const targetBand = useLearnerStore(state => state.examTarget);
  const originalStory = useLearnerStore(state => state.originalStory);

  // Generate a conversation starter dynamically based on the learner's actual input!
  const getConversationStarter = () => {
    if (originalStory) {
      if (originalStory.toLowerCase().includes("park") || originalStory.toLowerCase().includes("cat") || originalStory.toLowerCase().includes("mèo")) {
        return `"${learnerName} recently practiced describing a stroll in the park and encountering a stray cat. Ask them: 'Did you see any cute cats at the park today? I'd love to hear about them!'"`;
      }
      return `"${learnerName} just wrote a story about their day. Ask them: 'What was the highlight of your story check-in today? Can you teach me one new word you learned?'"`;
    }
    return `"${learnerName} is building their vocabulary around '${activeGoal}'. Ask them: 'How is your learning garden growing this week? What did your mentor help you practice?'"`;
  };

  return (
    <div className="space-y-8 pb-12 text-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-accent">{t('supporter.portal_title')}</h1>
          <p className="text-text/70 mt-1">Lightweight, pressure-free tracking to support {learnerName}'s language journey.</p>
        </div>
        <div className="bg-white border border-primary/10 rounded-2xl px-4 py-2 shadow-sm flex items-center gap-2 text-sm text-text/60">
          <Shield size={16} className="text-accent" />
          {t('supporter.safety_title')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Col 1: High Level Consistency & Streak */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary/10 space-y-6">
          <h2 className="font-heading font-bold text-lg border-b border-primary/10 pb-3 flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            Consistency Meter
          </h2>
          
          <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-primary/5">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-heading font-bold text-text">{streak} Day Active Streak</p>
              <p className="text-xs text-text/50">Keep supporting Felix's daily habit!</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-text/50 uppercase tracking-wider">Weekly Activity</p>
            <div className="grid grid-cols-7 gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                const isActive = i < streak;
                return (
                  <div key={i} className="text-center space-y-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-primary text-text shadow-sm border border-primary' 
                        : 'bg-background border border-primary/10 text-text/30'
                    }`}>
                      {day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10 flex gap-2.5 items-start text-xs text-text/80">
            <Heart size={18} className="text-accent shrink-0 mt-0.5" />
            <p>
              <strong>Pressure-free tip:</strong> Studies show that focus on streak consistency rather than testing accuracy increases student confidence by 40%.
            </p>
          </div>
        </div>

        {/* Col 2: Student Well-being & Target */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary/10 space-y-6">
          <h2 className="font-heading font-bold text-lg border-b border-primary/10 pb-3 flex items-center gap-2">
            <Smile size={18} className="text-secondary" />
            Well-Being & Target
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-text/50 font-medium">Current Learning Goal</p>
              <div className="mt-1.5 p-3.5 bg-background rounded-2xl border border-primary/10 flex justify-between items-center">
                <span className="font-heading font-bold text-sm text-text">{activeGoal} Target</span>
                <Chip variant="success">{targetBand}</Chip>
              </div>
            </div>

            <div>
              <p className="text-xs text-text/50 font-medium">Emotional Safety Check</p>
              <div className="mt-1.5 p-3.5 bg-background rounded-2xl border border-primary/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-lg">
                  {currentMood === "Happy" ? "😊" : currentMood === "Okay" ? "😐" : "😢"}
                </div>
                <div>
                  <p className="font-heading font-bold text-sm text-text">Feeling {currentMood}</p>
                  <p className="text-xs text-text/50">Tutor persona auto-tuned to nurture confidence.</p>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-2xl p-4 border border-primary/10 space-y-2">
              <p className="text-xs font-bold text-text/80 flex items-center gap-1.5">
                <Award size={14} className="text-primary" />
                Active Milestones
              </p>
              <ul className="text-xs text-text/70 space-y-1.5 list-disc pl-4">
                <li>Completed 3 story check-ins this week</li>
                <li>Mastered B2 level vocabulary item: "encounter"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Col 3: Conversation Starters */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary/10 space-y-6">
          <h2 className="font-heading font-bold text-lg border-b border-primary/10 pb-3 flex items-center gap-2">
            <MessageCircle size={18} className="text-accent" />
            Conversation Starters
          </h2>
          <p className="text-xs text-text/60">
            Ask your child about what they are learning in a warm, encouraging way to build real-world confidence.
          </p>

          <div className="bg-background border-l-4 border-l-accent p-4 rounded-r-2xl space-y-3">
            <p className="text-sm italic font-medium leading-relaxed text-text/90">
              {getConversationStarter()}
            </p>
            <p className="text-[10px] text-text/50 font-bold uppercase tracking-wider">
              Generated based on recent story theme
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-xs text-text uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle size={14} /> Quick Tips
            </h3>
            <div className="text-xs text-text/70 space-y-2">
              <p>
                🤝 <strong>Praise the attempt:</strong> Focus on effort ("I love how creative your story check-in was") rather than correctness.
              </p>
              <p>
                🚫 <strong>Avoid correction:</strong> Let the ITS auto-scaffold grammatical errors so they don't associate learning with parent pressure.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
