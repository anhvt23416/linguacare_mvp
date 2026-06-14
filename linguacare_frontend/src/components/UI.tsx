import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Leaf } from 'lucide-react';
import { Mascot as AnimatedMascot, MascotState } from './mascot/Mascot';

export const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled = false }: any) => {
  const baseStyle = "relative overflow-hidden font-heading font-bold rounded-2xl px-6 py-4 transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_4px_0_0_rgba(0,0,0,0.1)]";
  
  const variants = {
    primary: "bg-primary text-text",
    secondary: "bg-secondary text-white",
    success: "bg-success text-text",
    accent: "bg-accent text-white",
    outline: "bg-transparent border-2 border-primary text-text shadow-none hover:shadow-none hover:translate-y-0 hover:bg-primary/10"
  };

  return (
    <motion.button 
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 hover:shadow-[0_2px_0_0_rgba(0,0,0,0.1)] hover:translate-y-[2px]'}`}
    >
      {children}
      {Icon && <Icon size={20} className={variant === 'secondary' || variant === 'accent' ? 'text-white' : 'text-text'} />}
    </motion.button>
  );
};

export const Chip = ({ children, variant = 'secondary', icon: Icon, className = '' }: any) => {
  const variants = {
    secondary: "bg-secondary/15 text-secondary border border-secondary/30",
    success: "bg-success/20 text-text border border-success/40",
    primary: "bg-primary/20 text-text border border-primary/40",
    accent: "bg-accent/15 text-accent border border-accent/30",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${variants[variant as keyof typeof variants]} ${className}`}>
      {Icon && <Icon size={14} />}
      {children}
    </div>
  );
};

export const Mascot = ({ state, speech }: { state: MascotState, speech?: string }) => {
  return (
    <div className="relative flex flex-col items-center justify-end h-64 w-full">
      <AnimatePresence mode="wait">
        {speech && (
          <motion.div
            key={speech}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-lg border-2 border-primary/20 z-10 w-max max-w-[280px]"
          >
            <p className="font-heading text-text text-sm md:text-base text-center">{speech}</p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-primary/20 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-0 flex justify-center items-end">
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-10 bg-black/5 rounded-[100%] blur-md"></div>
        <AnimatedMascot state={state} size={180} />
      </div>
    </div>
  );
};

export const ProgressTree = ({ leaves }: { leaves: number }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary/10 flex flex-col items-center gap-4">
      <h3 className="font-heading text-lg text-text">Your Garden</h3>
      <div className="relative w-24 h-32 flex items-end justify-center">
        <div className="w-4 h-20 bg-[#8B5A2B] rounded-t-lg relative z-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: i < leaves ? 1 : 0, 
                opacity: i < leaves ? 1 : 0 
              }}
              transition={{ delay: i * 0.2, type: 'spring' }}
              className="absolute"
              style={{
                bottom: 20 + (i * 15),
                left: i % 2 === 0 ? -16 : 8,
                rotate: i % 2 === 0 ? -30 : 30
              }}
            >
              <Leaf className="text-success fill-success" size={24} />
            </motion.div>
          ))}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: leaves >= 5 ? 1.5 : 0, opacity: leaves >= 5 ? 1 : 0 }}
            className="absolute -top-6 -left-2"
          >
            <Star className="text-primary fill-primary" size={20} />
          </motion.div>
        </div>
      </div>
      <p className="text-sm font-medium text-text/60">{leaves}/5 Stories this week</p>
    </div>
  );
};
