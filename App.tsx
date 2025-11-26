import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Background } from './components/Background';
import { Tissue } from './components/Tissue';
import { GameMode, TissueData } from './types';
import { generateTissueMessages } from './services/geminiService';
import { Clock, RotateCcw, Home, Sparkles, Trophy } from 'lucide-react';

const SPEED_RUN_TIME = 30;

export default function App() {
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);
  const [tissues, setTissues] = useState<TissueData[]>([]);
  const [pullCount, setPullCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SPEED_RUN_TIME);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  
  const tissueIdCounter = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Initialization & Mechanics ---

  const addTissues = useCallback((count: number, texts: string[] = []) => {
    setTissues(prev => {
      const newTissues: TissueData[] = [];
      for (let i = 0; i < count; i++) {
        tissueIdCounter.current += 1;
        newTissues.push({
          id: `t-${tissueIdCounter.current}`,
          rotation: Math.random() * 6 - 3, // Reduced rotation for "inside box" feel
          text: texts[i] || undefined,
          offsetX: 0,
          offsetY: 0
        });
      }
      return [...prev, ...newTissues];
    });
  }, []);

  const refillMessageQueue = useCallback(async () => {
    if (messageQueue.length < 5) {
      try {
        const newMessages = await generateTissueMessages(5);
        setMessageQueue(prev => [...prev, ...newMessages]);
      } catch (e) {
        console.error("Failed to fetch messages");
      }
    }
  }, [messageQueue.length]);

  useEffect(() => {
    if (mode === GameMode.ZEN && messageQueue.length > 0) {
      setTissues(prev => {
        let queueIndex = 0;
        const updated = prev.map(t => {
          if (!t.text && queueIndex < messageQueue.length) {
            const text = messageQueue[queueIndex];
            queueIndex++;
            return { ...t, text };
          }
          return t;
        });
        
        if (queueIndex > 0) {
           setMessageQueue(q => q.slice(queueIndex));
        }
        return updated;
      });
    }
  }, [messageQueue, mode]);

  const handlePull = (id: string) => {
    setTissues(prev => prev.filter(t => t.id !== id));
    setPullCount(c => c + 1);

    if (tissues.length <= 4) {
      addTissues(5);
      if (mode === GameMode.ZEN) {
        refillMessageQueue();
      }
    }
  };

  // --- Game Loop ---

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setPullCount(0);
    setTissues([]);
    tissueIdCounter.current = 0;
    addTissues(10);
    
    if (selectedMode === GameMode.SPEED) {
      setTimeLeft(SPEED_RUN_TIME);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (selectedMode === GameMode.ZEN) {
      refillMessageQueue();
    }
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(GameMode.GAME_OVER);
  };

  const returnToMenu = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(GameMode.MENU);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // --- Render ---

  const renderUI = () => {
    switch (mode) {
      case GameMode.MENU:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 z-50 pointer-events-auto px-4">
            <div className="text-center space-y-2">
              <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">解压抽纸</h1>
              <p className="text-slate-500 text-lg">治愈系 · 模拟 · 减压</p>
            </div>
            
            <div className="space-y-4 w-full max-w-xs">
              <button 
                onClick={() => startGame(GameMode.ZEN)}
                className="w-full group relative flex items-center justify-between bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Sparkles size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-slate-700 text-lg">禅意模式</span>
                    <span className="text-xs text-slate-400">AI 随机寄语 & 无限抽</span>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => startGame(GameMode.SPEED)}
                className="w-full group relative flex items-center justify-between bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 border border-slate-100"
              >
                <div className="flex items-center gap-4">
                   <div className="bg-rose-100 p-3 rounded-xl text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <Trophy size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-slate-700 text-lg">速抽挑战</span>
                    <span className="text-xs text-slate-400">30秒极限手速</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case GameMode.GAME_OVER:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 z-50 pointer-events-auto">
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <p className="text-slate-500 mb-2 font-medium">时间到！</p>
              <h2 className="text-7xl font-black text-slate-800 tracking-tighter">{pullCount}</h2>
              <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">本次成绩</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => startGame(GameMode.SPEED)} className="flex items-center gap-2 bg-slate-800 text-white px-8 py-4 rounded-full hover:bg-slate-700 transition-colors shadow-lg font-bold">
                <RotateCcw size={20} /> 再来一次
              </button>
              <button onClick={returnToMenu} className="flex items-center gap-2 bg-white text-slate-700 px-6 py-4 rounded-full hover:bg-slate-50 transition-colors shadow-lg font-medium">
                <Home size={20} /> 主页
              </button>
            </div>
          </div>
        );

      default: 
        return (
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
            <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-white/50 pointer-events-auto">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">已抽取</p>
              <p className="text-3xl font-black text-slate-700 leading-none">{pullCount}</p>
            </div>

            <div className="flex flex-col items-end gap-3 pointer-events-auto">
              <button 
                onClick={returnToMenu}
                className="p-3 bg-white/80 backdrop-blur-md rounded-full text-slate-400 hover:text-slate-700 shadow-sm border border-white/50 transition-colors"
              >
                <Home size={20} />
              </button>
              
              {mode === GameMode.SPEED && (
                <div className="bg-rose-50/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-rose-100">
                  <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-0.5">剩余时间</p>
                  <p className={`text-3xl font-black leading-none tabular-nums ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-rose-600'}`}>
                    {timeLeft}s
                  </p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <Background />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 z-50 pointer-events-none">
         {renderUI()}
      </div>

      {/* Game Area */}
      {(mode === GameMode.ZEN || mode === GameMode.SPEED) && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pt-24 md:pt-32">
          
          {/* 
            VISUAL CONSTRUCTION OF THE TISSUE BOX 
            Order: Body -> Tissues -> Lid (Overlay)
          */}
          <div className="relative w-72 h-48 md:w-80 md:h-52">
            
            {/* 1. Box Body (The container/shadow underneath) */}
            <div className="absolute inset-x-2 top-8 bottom-0 bg-teal-800/20 rounded-3xl blur-xl transform translate-y-4"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-teal-100 to-teal-50 rounded-[2rem] shadow-2xl border-b-8 border-teal-200"></div>

            {/* 2. Tissue Stack (Sits 'inside' the box visually) */}
            {/* We push this div up slightly so the tissues emerge from the 'middle' */}
            <div className="absolute top-0 left-0 w-full h-full flex justify-center z-10">
               {/* 
                  The logic here: 
                  Tissues are rendered absolute. 
                  The 'Lid' below has a higher z-index than the bottom part of these tissues.
               */}
              {tissues.map((tissue, index) => (
                <Tissue 
                  key={tissue.id}
                  data={tissue}
                  index={index}
                  isTop={index === 0}
                  onPull={handlePull}
                />
              ))}
            </div>

            {/* 3. Box Lid (The Overlay) */}
            {/* 
              This is the key visual trick. It sits ON TOP of the tissue stack (z-20).
              It has a transparent hole in the middle (using SVG mask or path).
              pointer-events-none is CRITICAL so we can click the tissue through the hole.
            */}
            <div className="absolute inset-[-10px] z-30 pointer-events-none filter drop-shadow-lg">
               <svg width="100%" height="100%" viewBox="0 0 340 220" preserveAspectRatio="none">
                  <defs>
                     <linearGradient id="boxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#f0fdfa', stopOpacity: 1}} /> {/* teal-50 */}
                        <stop offset="100%" style={{stopColor: '#ccfbf1', stopOpacity: 1}} /> {/* teal-100 */}
                     </linearGradient>
                  </defs>
                  
                  {/* The Lid Path: A rectangle with a rounded hole in the center */}
                  <path 
                    fill="url(#boxGradient)" 
                    fillRule="evenodd"
                    d="M 20 0 H 320 Q 340 0 340 20 V 200 Q 340 220 320 220 H 20 Q 0 220 0 200 V 20 Q 0 0 20 0 Z 
                       M 170 30 Q 110 30 100 60 Q 95 90 100 120 Q 110 150 170 150 Q 230 150 240 120 Q 245 90 240 60 Q 230 30 170 30 Z" 
                  />
                  
                  {/* Decorative rim around the hole */}
                  <path 
                     fill="none" 
                     stroke="#99f6e4" /* teal-200 */
                     strokeWidth="2"
                     d="M 170 30 Q 110 30 100 60 Q 95 90 100 120 Q 110 150 170 150 Q 230 150 240 120 Q 245 90 240 60 Q 230 30 170 30 Z"
                  />
               </svg>
            </div>
            
            {/* Box Logo/Branding on the front lip (Visual flair) */}
            <div className="absolute bottom-4 right-6 z-40 opacity-30 pointer-events-none">
              <Sparkles className="text-teal-500" size={24} />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}