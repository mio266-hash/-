import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { TissueData } from '../types';

interface TissueProps {
  data: TissueData;
  isTop: boolean;
  onPull: (id: string) => void;
  index: number;
}

export const Tissue: React.FC<TissueProps> = ({ data, isTop, onPull, index }) => {
  const [isPulled, setIsPulled] = useState(false);
  
  // Motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transformations
  const rotate = useTransform(x, [-150, 150], [-25, 25]); // More dramatic rotation
  const opacity = useTransform(y, [-200, -400], [1, 0]);
  
  // The tissue "puffs up" when dragged up
  const scale = useTransform(y, [0, -150], [1, 1.05]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Pull threshold
    const PULL_THRESHOLD = -80;
    
    if (info.offset.y < PULL_THRESHOLD) {
      setIsPulled(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      onPull(data.id);
    }
  };

  // Stack visuals
  // We place lower items slightly higher visually to simulate them being "inside" the box
  const stackY = index * 4 + 45; // Start lower down (y=45) to be inside the box
  const zIndex = 20 - index; // Ensure they are below the lid (which is z-30 in App.tsx)

  // Randomize initial shape slightly for realism
  const randomCurve = Math.abs(data.rotation) * 2; 

  return (
    <AnimatePresence>
      {!isPulled && (
        <motion.div
          style={{
            x,
            y,
            rotate: isTop ? rotate : data.rotation,
            opacity,
            scale: isTop ? scale : 1,
            zIndex: zIndex,
            cursor: isTop ? 'grab' : 'default',
            touchAction: 'none'
          }}
          drag={isTop ? true : false}
          dragConstraints={{ top: -500, left: -100, right: 100, bottom: 20 }}
          dragElastic={0.4}
          dragSnapToOrigin={true}
          onDragEnd={handleDragEnd}
          initial={{ y: 80, opacity: 0 }} // Start deeper inside
          animate={{ y: isTop ? 20 : stackY, opacity: 1, rotate: data.rotation }} // Pop up slightly if top
          exit={{ y: -600, opacity: 0, rotate: Math.random() * 90 - 45, transition: { duration: 0.4 } }}
          className="absolute left-0 right-0 mx-auto w-52 h-52 md:w-60 md:h-60 flex justify-center"
        >
          {/* Tissue Visual */}
          <div 
            className={`
              relative w-full h-full 
              bg-gradient-to-b from-white via-white to-slate-50
              shadow-sm
              flex items-center justify-center p-6 text-center
              transform transition-all
            `}
            style={{
              // Organic shape: Top is rounded, bottom is squarish (tucked in)
              borderRadius: `${20 + randomCurve}px ${25 - randomCurve}px 4px 4px`,
              // Subtle crumple shadow
              boxShadow: isTop 
                ? '0 -5px 15px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.05)' 
                : 'none'
            }}
          >
            {/* Texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] pointer-events-none rounded-[inherit]"></div>
            
            {/* Center Fold Line (Visual Detail) */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent opacity-30"></div>

            {/* Text Content */}
            {data.text && index < 2 && (
              <p className={`
                font-handwriting text-slate-600 font-bold tracking-widest text-lg select-none pointer-events-none vertical-rl writing-mode-vertical
                ${index === 0 ? 'opacity-90' : 'opacity-0'} transition-opacity duration-300
                mt-[-20px] // Pull text up slightly
              `}
              style={{
                 textShadow: '0 1px 2px rgba(255,255,255,1)'
              }}
              >
                {data.text}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};