/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  History, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Dices, 
  UserPlus, 
  Check, 
  RotateCcw,
  BookOpen,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavedList, HistoryEntry, Chit, QuickTask } from './types';

// Constants
const GRADIENTS = [
  ['#FF6B6B', '#FF9F1C'], // Coral to Orange
  ['#4D96FF', '#C77DFF'], // Blue to Purple
  ['#6BCB77', '#38B2AC'], // Green to Teal
  ['#FFD93D', '#FF6B6B'], // Yellow to Pink
  ['#C77DFF', '#EC4899'], // Purple to Fuchsia
  ['#FF9F1C', '#6BCB77'], // Orange to Green
  ['#38B2AC', '#4D96FF'], // Teal to Blue
  ['#EC4899', '#C77DFF']  // Fuchsia to Purple
];

const EMOJIS = ['😱', '😭', '💀', '😅', '🫡', '😤', '🦁', '🤣', '😬', '🥳', '🪄', '🎯', '🔥'];

const TAGLINES = [
  'Better luck next time! 😅',
  'The paper chit has spoken! 🎭',
  'Destiny has made its stance! ✨',
  'No escaping fate! 😂',
  'The table of destiny has judged! ⚖️',
  'Ready or not, it is your turn! 😬',
  'Fate is fair... sometimes! 🙏',
  'Tag, you\'re it! 🏃',
  'Zero chance to slide away! 😜'
];

const QUICK_TASKS: QuickTask[] = [
  { label: 'Bill', icon: '💸', text: 'Who pays the bill? 💸' },
  { label: 'Dishes', icon: '🍽️', text: 'Who washes the dishes? 🍽️' },
  { label: 'Cooks', icon: '🍳', text: 'Who cooks today? 🍳' },
  { label: 'Movie', icon: '🎬', text: 'Who picks the movie? 🎬' },
  { label: 'Driver', icon: '🚗', text: 'Who drives? 🚗' },
  { label: 'Clean', icon: '🧹', text: 'Who cleans up? 🧹' },
];

export default function App() {
  // --- States ---
  const [task, setTask] = useState('Who pays the bill? 💸');
  const [customTask, setCustomTask] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mode, setMode] = useState<'tap' | 'auto'>('tap');
  const [gameState, setGameState] = useState<'idle' | 'dropping' | 'ready' | 'picked' | 'revealed'>('idle');
  
  const [chits, setChits] = useState<Chit[]>([]);
  const [pickedChitId, setPickedChitId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHowTo, setShowHowTo] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);
  
  // Confetti particles state
  const [confetti, setConfetti] = useState<{ id: number; left: number; color: string; size: number; delay: number; duration: number; shape: string }[]>([]);

  // Refs
  const tableRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // --- Initialize state from LocalStorage ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cp_saved');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Dynamically filter out preloaded mock lists if they exist in the user's localStorage
          parsed = parsed.filter((list: any) => {
            if (list.id === '1' && list.name === 'Coffee Run') return false;
            if (list.id === '2' && list.name === 'Lunch Crew') return false;
            if (list.name === 'Coffee Run' && JSON.stringify(list.names) === JSON.stringify(['Alice', 'Bob', 'Charlie'])) return false;
            if (list.name === 'Lunch Crew' && JSON.stringify(list.names) === JSON.stringify(['Sam', 'Dean', 'Castiel', 'Jack'])) return false;
            return true;
          });
          setSavedLists(parsed);
          localStorage.setItem('cp_saved', JSON.stringify(parsed));
        } else {
          setSavedLists([]);
          localStorage.setItem('cp_saved', '[]');
        }
      } else {
        // Prep with empty list
        const initial: SavedList[] = [];
        setSavedLists(initial);
        localStorage.setItem('cp_saved', JSON.stringify(initial));
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const hist = localStorage.getItem('cp_hist');
      if (hist) {
        setHistory(JSON.parse(hist));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // --- Sound FX Synthesizer ---
  const playSound = (type: 'drop' | 'flip' | 'pop' | 'shuffle') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (type === 'drop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      } else if (type === 'flip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === 'pop') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(330, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.25);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(392, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.25);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.3);
        osc2.stop(ctx.currentTime + 0.3);
      } else if (type === 'shuffle') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (e) {
      // Autoplay rules may block audio
    }
  };

  // --- Names actions ---
  const handleAddName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      nameInputRef.current?.focus();
      return;
    }
    if (names.includes(trimmed)) {
      alert('This friend is already added!');
      nameInputRef.current?.select();
      return;
    }
    if (trimmed.length > 20) {
      alert('Keep names under 20 characters please.');
      return;
    }
    setNames([...names, trimmed]);
    setNameInput('');
    nameInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddName();
    }
  };

  const handleRemoveName = (index: number) => {
    const updated = [...names];
    updated.splice(index, 1);
    setNames(updated);
  };

  const handleClearNames = () => {
    setNames([]);
  };

  // --- Saved list operations ---
  const handleSaveList = () => {
    if (names.length < 2) {
      alert('Add at least 2 friends before saving the list!');
      return;
    }
    const listName = prompt('Enter a name for this list (e.g. "Office Room", "Board Game"):');
    if (!listName || !listName.trim()) return;

    const newList: SavedList = {
      id: Date.now().toString(),
      name: listName.trim(),
      names: [...names]
    };

    const updated = [...savedLists, newList];
    setSavedLists(updated);
    localStorage.setItem('cp_saved', JSON.stringify(updated));
  };

  const handleLoadList = (list: SavedList) => {
    setNames(list.names);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    playSound('drop');
  };

  const handleDeleteList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid loading the list when clicking delete
    if (!confirm('Are you sure you want to delete this list?')) return;
    const updated = savedLists.filter(l => l.id !== id);
    setSavedLists(updated);
    localStorage.setItem('cp_saved', JSON.stringify(updated));
  };

  // --- Game Flow Control ---
  const handleDropChits = () => {
    if (names.length < 2) {
      alert('Please add at least 2 friends before letting fate decide!');
      return;
    }

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }

    // Capture task description or fallback
    const finalTask = task.trim() || 'Who gets picked? 🤔';
    playSound('drop');

    setGameState('dropping');
    setPickedChitId(null);

    // Render original or empty and populate
    const width = tableRef.current?.offsetWidth || 500;
    const height = tableRef.current?.offsetHeight || 400;

    // Shuffle original array helper
    const activeNames = [...names].sort(() => Math.random() - 0.5);

    // Precalculate nice random spacing positions inside poker table felt boundaries
    const newChits: Chit[] = activeNames.map((name, i) => {
      const gradientPair = GRADIENTS[i % GRADIENTS.length];
      
      // Calculate random coords within bounds with margins
      const xMargin = 70;
      const yMargin = 60;
      const rx = Math.floor(xMargin + Math.random() * (width - xMargin * 2 - 40));
      const ry = Math.floor(yMargin + Math.random() * (height - yMargin * 2 - 40));
      const rotation = Math.floor((Math.random() - 0.5) * 45); // rotation in degrees

      return {
        id: `chit-${i}-${Date.now()}`,
        name,
        color1: gradientPair[0],
        color2: gradientPair[1],
        x: rx,
        y: ry,
        rotation,
        isFlipped: false,
        isGlowing: false
      };
    });

    setChits(newChits);

    // SFX for cascade drop
    newChits.forEach((_, idx) => {
      setTimeout(() => {
        playSound('drop');
      }, idx * 100);
    });

    // Cascade complete
    setTimeout(() => {
      setGameState('ready');
    }, newChits.length * 100 + 400);
  };

  // --- Shuffle / Toss Paper Sheets ---
  const handleShuffleChits = () => {
    if (gameState !== 'ready') return;
    playSound('shuffle');

    const width = tableRef.current?.offsetWidth || 500;
    const height = tableRef.current?.offsetHeight || 400;

    setChits(prev => 
      prev.map(chit => {
        const xMargin = 70;
        const yMargin = 60;
        return {
          ...chit,
          x: Math.floor(xMargin + Math.random() * (width - xMargin * 2 - 40)),
          y: Math.floor(yMargin + Math.random() * (height - yMargin * 2 - 40)),
          rotation: Math.floor((Math.random() - 0.5) * 60)
        };
      })
    );
  };

  // --- Tap Card Flip Mechanic ---
  const handleChitClick = (chitId: string) => {
    if (gameState !== 'ready' || mode !== 'tap') return;
    revealSelectedChit(chitId);
  };

  // --- Auto Decide Picker Mode ---
  const handleAutoPick = () => {
    if (gameState !== 'ready' || chits.length === 0) return;
    
    // Animate a brief suspenseful flicker/highlight round
    setGameState('picking');
    playSound('shuffle');

    let clickCount = 0;
    const totalClicks = 8;
    const interval = setInterval(() => {
      setChits(prev => 
        prev.map((c, idx) => ({
          ...c,
          isGlowing: idx === clickCount % prev.length
        }))
      );
      playSound('drop');
      clickCount++;

      if (clickCount >= totalClicks) {
        clearInterval(interval);
        // Do final match
        const luckyIndex = Math.floor(Math.random() * chits.length);
        const selectedChit = chits[luckyIndex];
        revealSelectedChit(selectedChit.id);
      }
    }, 180);
  };

  // --- Flip and reveal logic ---
  const revealSelectedChit = (chitId: string) => {
    playSound('flip');
    setPickedChitId(chitId);
    setGameState('picked');

    // Update chit flipped status in local array
    setChits(prev => 
      prev.map(c => 
        c.id === chitId 
          ? { ...c, isFlipped: true, isGlowing: true }
          : { ...c, isGlowing: false }
      )
    );

    // Delayed full blast overlay & score history update
    setTimeout(() => {
      playSound('pop');
      const winningChit = chits.find(c => c.id === chitId);
      if (winningChit) {
        // Trigger confetti
        triggerConfettiPop();
        
        // Add to history
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const nextHistoryItem: HistoryEntry = {
          id: Date.now().toString(),
          name: winningChit.name,
          task: task.trim() || 'Who gets picked? 🤔',
          timestamp: timeStr,
          color: winningChit.color1
        };

        const updatedHistory = [nextHistoryItem, ...history].slice(0, 30);
        setHistory(updatedHistory);
        localStorage.setItem('cp_hist', JSON.stringify(updatedHistory));
      }
      setGameState('revealed');
    }, 1100);
  };

  // --- Confetti Blast Particle Generation ---
  const triggerConfettiPop = () => {
    const list = [];
    const colors = ['#FFD93D', '#FF6B6B', '#6BCB77', '#4D96FF', '#C77DFF', '#EC4899', '#FF9F1C', '#FFFFFF'];
    const shapes = ['circle', 'square', 'triangle'];
    for (let i = 0; i < 70; i++) {
      list.push({
        id: i,
        left: Math.random() * 100, // percentage left of viewport
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.floor(4 + Math.random() * 10),
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 2,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }
    setConfetti(list);
  };

  // --- Reset Game Layout ---
  const handlePickAgain = () => {
    setGameState('idle');
    setPickedChitId(null);
    setChits([]);
    setConfetti([]);
    handleDropChits();
  };

  const handleBackToTable = () => {
    setGameState('ready');
    _clearConfettiAndSelectionHighlights();
  };

  const _clearConfettiAndSelectionHighlights = () => {
    setConfetti([]);
    // Clear highlights except winner keeps visible flipped status
    setChits(prev => prev.map(c => c.id === pickedChitId ? c : { ...c, isGlowing: false }));
  };

  const handleResetEverything = () => {
    if (confirm('Clear custom lists, history, and current board setup?')) {
      setNames([]);
      setTask('Who pays the bill? 💸');
      setGameState('idle');
      setChits([]);
      setPickedChitId(null);
      setHistory([]);
      setConfetti([]);
      localStorage.removeItem('cp_hist');
      
      const initialSaved: SavedList[] = [];
      setSavedLists(initialSaved);
      localStorage.setItem('cp_saved', JSON.stringify(initialSaved));
      playSound('shuffle');
    }
  };

  // Get active winning details
  const winningChit = chits.find(c => c.id === pickedChitId);
  const randomEmoji = EMOJIS[names.length % EMOJIS.length];
  const randomTagline = TAGLINES[names.length * 3 % TAGLINES.length];

  return (
    <div id="app" className="font-sans flex flex-row w-full w-screen h-screen bg-[#111827] text-white overflow-hidden select-none relative">
      
      {/* ── MOBILE BACKDROP OVERLAY ── */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden cursor-pointer"
        />
      )}

      {/* ── LEFT SIDEBAR (Setup Panel, embedded side-by-side on desktop, slides over as drawer on mobile/tablets) ── */}
      <div 
        id="sidebar" 
        className={`fixed lg:relative inset-y-0 left-0 z-40 flex w-[320px] max-w-[85vw] sm:w-[340px] bg-[#1e2a44] flex-col border-r border-white/10 overflow-hidden transition-transform duration-300 ease-in-out lg:z-10 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/10 bg-[#162135] flex justify-between items-center flex-shrink-0">
          <div>
            <div className="font-baloo text-3xl font-extrabold text-[#FFD93D] tracking-tight drop-shadow">
              🎉 ChitPick
            </div>
            <p className="text-xs text-white/50 tracking-wide mt-0.5">Let fate settle the questions!</p>
          </div>
          
          <div className="flex gap-1.5 items-center">
            {/* Audio configuration toggler button */}
            <button
              id="btn-sound"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-white/5 hover:bg-white/10 text-white/75 hover:text-white rounded-lg transition-colors"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              id="btn-howto"
              onClick={() => setShowHowTo(!showHowTo)}
              className="px-2.5 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors"
              title="How to play"
            >
              ❓
            </button>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 bg-white/5 hover:bg-white/10 text-white/75 hover:text-white rounded-lg transition-colors ml-1"
              title="Close panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Sidebar Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* Quick instructions banner if toggled */}
          {showHowTo && (
            <div className="bg-[#1c2e4f] border border-blue-400/30 rounded-xl p-3 text-xs text-blue-100/90 leading-relaxed shadow-inner">
              <div className="flex justify-between items-center font-bold mb-1 ml-0.5 text-[#FFD93D]">
                <span>📖 ChitPick Rules:</span>
                <button onClick={() => setShowHowTo(false)} className="text-white/50 hover:text-white">✕</button>
              </div>
              <ul className="list-decimal list-inside space-y-1 text-white/85">
                <li>Write down your custom question or choose a pre-made shortcut.</li>
                <li>Add names of your friends.</li>
                <li>Choose a picker mode: <b>TAP</b> to choose manually or <b>AUTO</b> for automated selection.</li>
                <li>Click <b>Drop Chits</b> to toss folded papers onto the table!</li>
              </ul>
            </div>
          )}

          {/* Section 1: Ask Question */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-white/40 uppercase tracking-[2px] block ml-0.5">
              1. What is the Task?
            </label>
            
            <div className="flex bg-white/5 border border-white/15 focus-within:border-yellow-400/60 rounded-xl overflow-hidden transition-all duration-200">
              <input
                id="task-input"
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="e.g. Who flies to fetch lunch?"
                maxLength={60}
                className="flex-1 bg-none border-none outline-none text-sm text-white px-3.5 py-2.5 placeholder-white/25 focus:ring-0"
              />
            </div>

            {/* Quick Tag Templates */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {QUICK_TASKS.map((q) => (
                <button
                  id={`qtag-${q.label.toLowerCase()}`}
                  key={q.label}
                  onClick={() => setTask(q.text)}
                  className={`py-1.5 px-2 bg-white/5 border text-center font-semibold rounded-lg text-[11px] transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer ${
                    task === q.text 
                      ? 'bg-yellow-400/10 border-yellow-400/40 text-[#FFD93D]' 
                      : 'border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10 hover:text-white'
                  }`}
                >
                  <span>{q.icon}</span>
                  <span>{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Friends Roster */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-white/40 uppercase tracking-[2px] ml-0.5">
              <span>2. Friends Roster</span>
              <span className="text-[#FFD93D] text-[11px]">({names.length} added)</span>
            </div>

            <div className="flex gap-2">
              <input
                ref={nameInputRef}
                id="name-input"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add friend's name..."
                maxLength={20}
                className="flex-1 bg-white/5 border border-white/15 focus:outline-none focus:border-yellow-400/60 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/25"
              />
              <button
                id="btn-add-name"
                onClick={handleAddName}
                className="w-10 h-10 bg-[#FFD93D] hover:bg-yellow-400 text-[#111827] rounded-xl flex items-center justify-center transition-transform duration-100 hover:scale-105 active:scale-95"
                title="Add to roster"
              >
                <Plus size={20} className="stroke-[3]" />
              </button>
            </div>

            {/* Chips Container */}
            <div className="min-h-12 max-h-48 overflow-y-auto bg-black/10 border border-white/5 rounded-xl p-2.5">
              {names.length === 0 ? (
                <div className="text-xs text-white/30 text-center py-3">Roster is empty. Type names above!</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {names.map((n, i) => {
                      const color = GRADIENTS[i % GRADIENTS.length][0];
                      return (
                        <motion.div
                          id={`chip-${n.toLowerCase()}`}
                          key={`name-${n}-${i}`}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.7, opacity: 0 }}
                          className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold text-white shadow-sm"
                          style={{ backgroundColor: `${color}cc` }}
                        >
                          <span>{n}</span>
                          <button
                            onClick={() => handleRemoveName(i)}
                            className="w-4 h-4 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center text-[10px] text-white/90 hover:text-white"
                          >
                            ✕
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {names.length > 0 && (
              <div className="flex justify-end">
                <button
                  id="btn-clear-roster"
                  onClick={handleClearNames}
                  className="text-[10px] font-bold text-white/40 hover:text-red-400 transition-colors uppercase tracking-[1px]"
                >
                  🗑️ Clear Roster
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Saved Group Lists */}
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-extrabold text-white/40 uppercase tracking-[2px] block ml-0.5">
              3. Saved Lists
            </label>
            
            <div className="bg-black/10 border border-white/5 rounded-xl p-2.5">
              {savedLists.length === 0 ? (
                <div className="text-xs text-white/25 text-center py-2 italic font-medium">No saved lists yet</div>
              ) : (
                <div className="space-y-1.5">
                  {savedLists.map((list) => (
                    <div
                      id={`saved-list-${list.id}`}
                      key={list.id}
                      onClick={() => handleLoadList(list)}
                      className="group flex justify-between items-center p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-left border border-white/5 transition-all text-xs font-bold cursor-pointer hover:border-yellow-400/20"
                    >
                      <div className="truncate pr-2">
                        <div className="text-white group-hover:text-[#FFD93D] truncate transition-colors">{list.name}</div>
                        <div className="text-[10px] text-white/40 mt-0.5 truncate font-medium">
                          {list.names.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="bg-white/5 text-white/60 group-hover:bg-yellow-400/10 group-hover:text-[#FFD93D] px-1.5 py-0.5 rounded text-[9px] transition-colors">
                          {list.names.length} friends
                        </span>
                        <button
                          id={`delete-list-${list.id}`}
                          onClick={(e) => handleDeleteList(list.id, e)}
                          className="p-1 text-white/40 hover:text-red-400 hover:bg-black/20 rounded transition-colors"
                          title="Delete saved list"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: About & SEO Content (FAQ & Policies) */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <button
              id="btn-toggle-info"
              onClick={() => setInfoOpen(!infoOpen)}
              className="w-full flex justify-between items-center text-[10px] font-extrabold text-white/40 hover:text-white uppercase tracking-[1.5px] py-1 text-left cursor-pointer"
            >
              <span>4. Info, FAQs & Privacy</span>
              <span className="text-[#FFD93D] font-bold">{infoOpen ? 'Hide ▲' : 'Show ▼'}</span>
            </button>

            {infoOpen && (
              <div className="space-y-3.5 text-[11px] text-white/75 leading-relaxed bg-black/15 p-3 rounded-xl border border-white/5 font-medium">
                <div>
                  <h4 className="font-extrabold text-[#FFD93D] text-[11px] uppercase tracking-[0.5px] mb-1">🎯 What is ChitPick?</h4>
                  <p>
                    ChitPick is a beautiful, interactive, and completely unbiased <strong>online random name picker</strong> and decision maker. Powered by trusted randomized algorithms, it operates just like physical paper chits dropped on a table to ensure absolute fairness when deciding everyday tasks or bets!
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-white/90 text-xs mb-1">💡 Real-World Uses</h4>
                  <p className="space-y-1">
                    • <strong>Who pays the bill?</strong> Settle the restaurant check instantly with friends.<br />
                    • <strong>Chores & Cooking:</strong> Choose who washes the dishes, cooks today, or cleans up.<br />
                    • <strong>Group Activities:</strong> Decide who drives, chooses the movie, or picks the next game.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-white/90 text-xs mb-1">🖥️ How It Works</h4>
                  <p>
                    Simply type the friends' names and add them to the roster. Once ready, hit <strong>Drop Chits</strong>. Folded interactive 3D paper chits will cascade onto the green table felt. Under <em>TAP Mode</em>, click any sheet to flip and show who destiny has picked. Under <em>Auto Mode</em>, hit the automated controller to run a suspenseful random decision sequence.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-[#FFD93D] text-[10px] uppercase tracking-[1px] mb-1">⚖️ Fair Play Guarantee</h4>
                  <p>
                    Decisions are fully calculated on your local browser engine. No third-party servers manipulate or are fed with your list items, keeping your session 100% random and secured!
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 text-[10px] text-white/40 flex flex-wrap gap-x-2 gap-y-1 justify-center">
                  <a href="#privacy" className="hover:text-yellow-400 underline transition-colors" onClick={(e) => { e.preventDefault(); alert("Privacy Policy:\n\nChitPick values your privacy. We run purely client-side; no names, groups, or decisions are ever uploaded, saved, or shared with third-party servers. Your local lists remain inside local storage for your ease of access."); }}>Privacy Policy</a>
                  <span>•</span>
                  <a href="#terms" className="hover:text-yellow-400 underline transition-colors" onClick={(e) => { e.preventDefault(); alert("Terms of Service:\n\nChitPick is free to use for personal decision-making. No warranties are made regarding its suitability for critical non-recreational purposes. By using this tool, you consent to the random outcome."); }}>Terms of Service</a>
                  <span>•</span>
                  <span className="text-white/30 text-[9px]">Cookies are limited to local memory support.</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-white/10 bg-[#162135] flex gap-2 flex-shrink-0">
          <button
            id="btn-save-list"
            onClick={handleSaveList}
            disabled={names.length < 2}
            className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Save this group list"
          >
            <Save size={14} />
            Save group
          </button>
          
          <button
            id="btn-drop-chits"
            onClick={handleDropChits}
            disabled={names.length < 2 || gameState === 'dropping'}
            className="flex-1 bg-gradient-to-r from-[#FFD93D] via-[#FF9F1C] to-[#fc8c03] hover:brightness-110 text-[#111827] rounded-xl text-sm font-extrabold font-baloo shadow-lg shadow-yellow-500/10 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wide flex items-center justify-center gap-2 transform active:scale-[0.98]"
          >
            <Zap size={15} className="fill-[#111827]" />
            Drop Table Chits!
          </button>
        </div>

      </div>

      {/* ── MAIN AREA (Interactive Destiny Felt Board - always displayed side-by-side as remaining 70%) ── */}
      <div 
        id="main-table" 
        className="flex flex-1 flex-col overflow-hidden relative"
      >
        
        {/* Main Navbar Topbar control indicators */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3.5 bg-black/30 border-b border-white/5 flex items-center justify-between gap-2.5 flex-shrink-0 z-10 select-none">
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile/Tablet Setup Drawer trigger */}
            <button
              id="btn-trigger-setup"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-1.5 bg-gradient-to-r from-[#FFD93D] to-[#FF9F1C] hover:brightness-110 text-[#111827] px-2.5 py-1.5 rounded-lg font-extrabold text-[11px] shadow-lg shadow-yellow-500/10 active:scale-95 transition-transform"
              title="Open Setup & Friends panel"
            >
              <UserPlus size={12} className="shrink-0" />
              <span>Roster ({names.length})</span>
            </button>

            {/* Desktop Brand Tag / Decorative Felt board indicator */}
            <div className="hidden lg:flex items-center gap-2 text-white/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[2px] uppercase">ChitPick Felt</span>
            </div>
          </div>

          {/* Mode selection toggle */}
          <div className="flex bg-neutral-900 border border-white/10 rounded-xl p-0.5 sm:p-1 text-[10px] sm:text-xs">
            <button
              id="mode-tap"
              onClick={() => setMode('tap')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-extrabold cursor-pointer transition-all ${
                mode === 'tap' 
                  ? 'bg-yellow-400/15 text-[#FFD93D] border border-yellow-400/25' 
                  : 'text-white/40 hover:text-white border border-transparent'
              }`}
            >
              TAP MODE
            </button>
            <button
              id="mode-auto"
              onClick={() => setMode('auto')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-extrabold cursor-pointer transition-all ${
                mode === 'auto' 
                  ? 'bg-orange-400/15 text-[#FF9F1C] border border-orange-400/25' 
                  : 'text-white/40 hover:text-white border border-transparent'
              }`}
            >
              AUTO PICK
            </button>
          </div>

          {/* History icon */}
          <button
            id="btn-toggle-history"
            onClick={() => setHistoryOpen(!historyOpen)}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 hover:bg-white/10 hover:text-white text-white/80 text-[11px] sm:text-xs font-bold rounded-lg transition-all border border-white/5 flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <History size={12} className="sm:size-[13px]" />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>

        {/* ── DESIGNER ROUND FELT TABLEBOARD ── */}
        <div id="table-wrap" className="flex-1 relative overflow-hidden" ref={tableRef}>
          
          {/* Emerald radial glow felt surface layer */}
          <div className="absolute inset-0 bg-[#16432b]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#256644] via-[#1a4a31] to-[#0e2c1c] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_rgba(0,0,0,0.5)_100%)]" />
          
          {/* Subtle noise grains representing table felt */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.012)_0px,rgba(0,0,0,0.012)_2px,rgba(255,255,255,0.005)_2px,rgba(255,255,255,0.005)_4px)] opacity-50 pointer-events-none" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.01)_0px,rgba(0,0,0,0.01)_2px,rgba(255,255,255,0.004)_2px,rgba(255,255,255,0.004)_4px)] opacity-40 pointer-events-none" />

          {/* Gorgeous dark mahogany wood frame rim shadow */}
          <div className="absolute inset-0 ring-[12px] ring-[#3b1c0e] ring-opacity-80 pointer-events-none z-20 shadow-[inset_0_0_40px_rgba(0,0,0,0.85)]" />
          <div className="absolute inset-0 ring-[2px] ring-[#5e2c15] ring-opacity-90 pointer-events-none z-20" />

          {/* Absolute floating Active Question badge */}
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-25 max-w-[90%] pointer-events-none text-center select-none shadow-md">
            <div className="bg-black/65 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 inline-flex items-center gap-2">
              <Sparkles size={11} className="text-[#FF9F1C] shrink-0 animate-pulse" />
              <span className="text-[9px] uppercase font-black text-white/50 tracking-[1px] shrink-0 hidden sm:inline">Active Question:</span>
              <span className="text-xs font-black text-[#FFD93D] truncate max-w-[130px] sm:max-w-xs md:max-w-sm drop-shadow-sm">{task.trim() || 'Who gets picked? 🤔'}</span>
            </div>
          </div>

          {/* Idle instructions display labels */}
          {gameState === 'idle' && (
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 text-center pointer-events-none z-10 space-y-3">
              <div className="text-5xl md:text-6xl animate-bounce">🎲</div>
              <div className="font-baloo text-xl md:text-2xl font-bold text-white/50 tracking-wide mt-2">
                Table is ready. Throw the paper chits!
              </div>
              <p className="text-xs text-white/35 max-w-sm mx-auto leading-relaxed">
                Add friends on the left, set the question, and select &quot;Drop Table Chits!&quot; to toss them onto the emerald green felt.
              </p>
            </div>
          )}

          {gameState === 'dropping' && (
            <div className="absolute top-15 sm:top-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-semibold tracking-wide text-white/80 shadow-lg pointer-events-none z-10 transition-opacity">
              ♻️ Falling paper pieces...
            </div>
          )}

          {gameState === 'ready' && (
            <div className="absolute top-15 sm:top-16 left-1/2 -translate-x-1/2 bg-black/45 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-[0.5px] sm:tracking-[1px] uppercase text-[#FF9F1C] border border-orange-400/20 shadow-md pointer-events-none z-10 animate-pulse text-center max-w-[90%]">
              {mode === 'tap' ? '👈 Tap any folded paper chit to reveal!' : '🎯 Press Auto Pick below to choose randomly!'}
            </div>
          )}

          {/* ── DRAGGABLE/ANIMATED ACTIVE CHITS ── */}
          <div className="absolute inset-8 z-10 overflow-hidden">
            <AnimatePresence>
              {chits.map((chit, index) => {
                return (
                  <motion.div
                    id={`chit-${chit.id}`}
                    key={chit.id}
                    initial={{ 
                      y: -250, 
                      x: chit.x, 
                      scale: 0.5, 
                      opacity: 0, 
                      rotate: chit.rotation * 1.5 
                    }}
                    animate={{ 
                      y: chit.y, 
                      x: chit.x, 
                      scale: 1, 
                      opacity: 1, 
                      rotate: chit.rotation,
                      transition: { 
                        type: 'spring', 
                        damping: 12, 
                        stiffness: 70, 
                        delay: index * 0.08 
                      }
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => handleChitClick(chit.id)}
                    className={`absolute w-24 h-18 cursor-pointer group active:scale-95 ${
                      chit.isGlowing ? 'z-30' : 'z-10'
                    }`}
                    style={{ left: 0, top: 0 }}
                  >
                    {/* Inner wrapper responsible for tactile flip 3D animation */}
                    <div 
                      className={`relative w-full h-full duration-700 preserve-3d transition-transform ${
                        chit.isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      
                      {/* Front Side: Folded envelope recycling texture */}
                      <div className={`absolute inset-0 rounded-xl bg-[#faf6ee] border-2 border-stone-800/20 shadow-lg flex flex-col justify-between p-2.5 backface-hidden overflow-hidden ${
                        chit.isGlowing ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-emerald-900 shadow-yellow-400/40' : 'group-hover:border-stone-800/35 group-hover:shadow-xl'
                      }`}>
                        
                        {/* Decorative fold effect */}
                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-stone-300/30 border-r-[14px] border-r-stone-500/20" />
                        <div className="absolute top-0 right-0 w-0 h-0 border-b-[14px] border-b-transparent border-l-[14px] border-l-[#ebd6b8] shadow-sm pointer-events-none" />
                        
                        {/* Recycled paper dashed design guidelines */}
                        <div className="absolute inset-1 border border-dashed border-stone-800/10 rounded-lg pointer-events-none" />
                        
                        {/* Content */}
                        <div className="flex justify-between items-center z-10">
                          <span className="text-[10px] text-stone-500 font-extrabold font-baloo tracking-wider">CP</span>
                          <span className="text-[10px] text-stone-300">#{(index + 1).toString().padStart(2, '0')}</span>
                        </div>
                        
                        <div className="text-center font-baloo text-xl font-extrabold text-stone-800/35 group-hover:scale-110 transition-transform duration-200">
                          ?
                        </div>
                      </div>

                      {/* Back Side: Flat gradient color block displaying winner */}
                      <div 
                        className="absolute inset-0 rounded-xl shadow-2xl flex items-center justify-center p-3 backface-hidden rotate-y-185 overflow-hidden border border-white/20"
                        style={{ background: `linear-gradient(135deg, ${chit.color1}, ${chit.color2})` }}
                      >
                        {/* Inner gold border */}
                        <div className="absolute inset-1 border border-white/10 rounded-lg pointer-events-none" />
                        
                        <div className="text-center font-baloo text-xs font-extrabold text-white leading-tight drop-shadow-md break-all px-0.5">
                          {chit.name}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── REVEAL RESULT WINDOW OVERLAY ── */}
          <div 
            id="reveal-overlay"
            className={`absolute inset-0 bg-[#0a1022]/95 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-6 transition-all duration-300 select-none ${
              gameState === 'revealed' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            
            {/* Confetti canvas animation particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" id="confetti-holder">
              {confetti.map((c) => (
                <div
                  key={`c-${c.id}`}
                  className="absolute animate-confetti-fall rounded-xs"
                  style={{
                    left: `${c.left}%`,
                    top: `-20px`,
                    width: `${c.size}px`,
                    height: `${c.size}px`,
                    backgroundColor: c.color,
                    borderRadius: c.shape === 'circle' ? '50%' : c.shape === 'triangle' ? '0' : '2px',
                    clipPath: c.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                    animationDuration: `${c.duration}s`,
                    animationDelay: `${c.delay}s`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}
            </div>

            {winningChit && (
              <div className="max-w-md w-full px-4 space-y-6 flex flex-col items-center relative z-10">
                
                {/* Visual emoji */}
                <div id="winner-emoji" className="text-6xl md:text-7xl fill-[#FFD93D] animate-bounce duration-700 select-none">
                  {randomEmoji}
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-white/40 uppercase font-extrabold tracking-[2.5px]">
                    The Decision Has Been Made!
                  </div>
                  <h3 id="picked-winner-text" className="text-xs md:text-sm font-bold text-white/70 max-w-sm line-clamp-2 px-1 text-center">
                    Task: <span className="text-[#FF9F1C]">{task}</span>
                  </h3>
                </div>

                {/* Main Large paper display */}
                <div 
                  id="final-reveal-chit" 
                  className="w-48 h-36 md:w-56 md:h-40 rounded-2xl p-5 shadow-2xl flex flex-col justify-between items-center relative border border-white/20 select-none transform rotate-1 animate-[fadeInUp_0.5s_ease-out_both]"
                  style={{ background: `linear-gradient(135deg, ${winningChit.color1}, ${winningChit.color2})` }}
                >
                  <div className="absolute inset-1.5 border border-dashed border-white/20 rounded-xl" />
                  
                  <span className="text-[11px] font-extrabold font-baloo text-white/50 tracking-wider">CHITPICK FATE</span>
                  
                  <div className="text-center font-baloo text-2xl md:text-3xl font-black text-white py-2 break-all px-1 max-w-full drop-shadow-lg">
                    {winningChit.name}
                  </div>

                  <span className="text-[10px] text-white/45">Luck Quotient: Minimal 😜</span>
                </div>

                {/* Humorous outcome quote */}
                <p id="winner-tagline" className="text-[15px] text-white/80 font-bold transition-opacity animate-[fadeInUp_0.6s_ease-out_both] italic">
                  &quot;{randomTagline}&quot;
                </p>

                {/* Operations buttons */}
                <div className="flex flex-wrap gap-2.5 justify-center w-full max-w-sm animate-[fadeInUp_0.75s_ease-out_both]">
                  <button
                    id="btn-pick-again"
                    onClick={handlePickAgain}
                    className="flex-1 min-w-[140px] px-5 py-3 bg-gradient-to-r from-[#FFD93D] to-[#FF9F1C] text-[#111827] rounded-xl text-xs font-bold font-baloo uppercase tracking-wider shadow-lg transform duration-150 hover:scale-[1.03] active:scale-95"
                  >
                    🔄 Pick Again
                  </button>
                  <button
                    id="btn-back-to-table"
                    onClick={handleBackToTable}
                    className="flex-1 min-w-[140px] px-5 py-3 bg-white/10 hover:bg-white/15 text-white/90 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur transition-all"
                  >
                    ↩ Back to Table
                  </button>
                  <button
                    id="btn-history-overlay"
                    onClick={() => { setHistoryOpen(true); }}
                    className="w-11 h-11 bg-white/10 hover:bg-white/15 text-white/90 rounded-xl flex items-center justify-center"
                    title="See history logs"
                  >
                    <History size={16} />
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* ── SLIDE OUT HISTORY LOG COMPONENT ── */}
          <div 
            id="history-drawer"
            className={`absolute right-0 top-0 bottom-0 w-72 bg-[#131b2c] border-l border-white/10 z-30 transform transition-transform duration-300 ease-out flex flex-col p-4 shadow-2xl select-none ${
              historyOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
              <span className="font-baloo text-lg font-bold text-[#FFD93D] flex items-center gap-1">
                <History size={16} /> History List
              </span>
              <button
                id="btn-close-history"
                onClick={() => setHistoryOpen(false)}
                className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white flex items-center justify-center text-xs transition px-0 py-0"
              >
                ✕
              </button>
            </div>

            {/* Scrollable list items */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="text-3xl text-white/20">📜</div>
                  <p className="text-xs text-white/30 italic">No picks completed yet.</p>
                </div>
              ) : (
                history.map((h) => (
                  <div
                    key={h.id}
                    className="flex gap-2.5 p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all"
                  >
                    <div className="w-2 my-1.5 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white truncate pr-1">{h.name}</span>
                        <span className="text-[9px] text-[#FFD93D] uppercase tracking-wide bg-yellow-400/10 px-1 py-0.2 rounded font-medium">{h.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1 line-clamp-3 leading-snug break-words">
                        {h.task}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Clear history helper button */}
            {history.length > 0 && (
              <button
                id="btn-clear-history"
                onClick={() => {
                  if (confirm('Clear decision logs?')) {
                    setHistory([]);
                    localStorage.removeItem('cp_hist');
                  }
                }}
                className="w-full py-2 border border-[#fc4e42]/20 text-[#fc4e42]/80 hover:text-[#fc4e42] hover:bg-[#fc4e42]/10 rounded-xl text-xs font-bold transition-all flex-shrink-0"
              >
                🗑️ Clear Pick History
              </button>
            )}
          </div>

        </div>

        {/* ── BOARD CONTROL FOOTER BAR ── */}
        <div className="p-4 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 z-10 select-none">
          
          <div className="flex items-center gap-2">
            {gameState === 'ready' && (
              <button
                id="btn-shuffle-chits"
                onClick={handleShuffleChits}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 border border-white/10 transition-colors uppercase cursor-pointer"
              >
                🔀 Mix Chits
              </button>
            )}
            
            <button
              id="btn-reset-app"
              onClick={handleResetEverything}
              className="px-3 py-2 text-white/35 hover:text-red-400 rounded-lg text-[10px] transition-colors tracking-wide uppercase font-extrabold"
              title="Reset configuration to defaults"
            >
              🔄 Fresh Restart
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            
            {gameState === 'idle' && (
              <p className="text-[11px] text-white/30 text-center sm:text-right hidden sm:block">
                Setup your questions and names on the left, then click load!
              </p>
            )}

            {gameState === 'ready' && mode === 'tap' && (
              <p className="text-xs text-white/40 italic text-center sm:text-right flex-1 sm:flex-initial">
                👉 Click any paper chit to choose!
              </p>
            )}

            {gameState === 'ready' && mode === 'auto' && (
              <button
                id="btn-trigger-autopick"
                onClick={handleAutoPick}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-400 to-[#FF9F1C] hover:brightness-105 text-[#111827] rounded-xl text-xs font-black uppercase tracking-wider shadow-md transform hover:scale-[1.02] flex items-center justify-center gap-1 cursor-pointer font-baloo"
              >
                🎯 Auto Pick Lucky Winner!
              </button>
            )}

            {gameState === 'picked' && (
              <p className="text-xs text-[#FFD93D] italic animate-pulse">
                🥁 Unfolding paper...
              </p>
            )}

            {gameState === 'revealed' && (
              <button
                id="btn-reopen-reveal"
                onClick={() => setGameState('revealed')}
                className="px-3 py-1.5 bg-yellow-400/10 text-[#FFD93D] rounded border border-yellow-400/20 text-xs font-semibold select-none hidden"
              >
                See win overlay
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
