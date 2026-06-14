import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MascotListening } from './MascotListening';
import { MascotWelcome } from './MascotWelcome';
import { MascotCheering } from './MascotCheering';
import { MascotPolishing } from './MascotPolishing';
import { MascotThinking } from './MascotThinking';
import { MascotConfused } from './MascotConfused';
import { MascotHoldingHeart } from './MascotHoldingHeart';
export type MascotState = 'idle' | 'welcome' | 'listening' | 'cheering' | 'polishing' | 'thinking' | 'confused' | 'holding_heart';
interface MascotProps {
  state: MascotState;
  className?: string;
  size?: number;
}
export const Mascot: React.FC<MascotProps> = ({ state, className = '', size = 200 }) => {
  const renderMascot = () => {
    const props = {
      width: '100%',
      height: '100%',
      viewBox: '0 0 1024 1024', // Most vtracer outputs are 1024x1024 or similar, viewBox helps scale
      preserveAspectRatio: 'xMidYMid meet'
    };
    switch (state) {
      case 'listening':
        return <MascotListening {...props} />;
      case 'cheering':
        return <MascotCheering {...props} />;
      case 'polishing':
        return <MascotPolishing {...props} />;
      case 'thinking':
        return <MascotThinking {...props} />;
      case 'confused':
        return <MascotConfused {...props} />;
      case 'holding_heart':
        return <MascotHoldingHeart {...props} />;
      case 'idle':
      default:
        return <MascotWelcome {...props} />;
    }
  };
  const getAnimation = (currentState: MascotState) => {
    switch (currentState) {
      case 'listening':
        return {
          scale: [1, 1.02, 1],
          transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
        };
      case 'cheering':
        return {
          y: [0, -10, 0],
          transition: { repeat: Infinity, duration: 0.6, ease: 'easeOut' }
        };
      case 'thinking':
        return {
          rotate: [0, 2, -2, 0],
          transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
        };
      default:
        return {
          y: [0, -3, 0],
          transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' } // gentle idle float
        };
    }
  };
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center w-full h-full"
        >
          <motion.div
            animate={getAnimation(state)}
            className="w-full h-full drop-shadow-lg"
          >
            {renderMascot()}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
