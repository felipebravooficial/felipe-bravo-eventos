/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { 
  Trophy, 
  AlertTriangle, 
  History, 
  Zap, 
  ShieldAlert, 
  Dices, 
  CheckCircle2,
  Info,
  ChevronRight,
  LayoutDashboard,
  Settings,
  User,
  RefreshCw,
  Edit3,
  X,
  Plus,
  Trash2,
  Search,
  Edit,
  Save,
  Filter,
  MoreVertical,
  ArrowLeft,
  Download,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import eventosData from './eventos.json';

interface Evento {
  id: number;
  evento: string;
  descricao: string;
  consequencia: string;
  categoria: string;
  raridade: 'Comum' | 'Incomum' | 'Raro' | 'Crise extrema';
}

export default function App() {
  const [events, setEvents] = useState<Evento[]>(() => {
    const saved = localStorage.getItem('fm_events_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : eventosData as Evento[];
      } catch (e) {
        console.error("Failed to parse saved events", e);
        return eventosData as Evento[];
      }
    }
    return eventosData as Evento[];
  });

  const [currentEvent, setCurrentEvent] = useState<Evento | null>(null);
  const [showConsequence, setShowConsequence] = useState(false);
  
  const [history, setHistory] = useState<Evento[]>(() => {
    const saved = localStorage.getItem('fm_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [shufflingName, setShufflingName] = useState("");
  
  const [season, setSeason] = useState(() => {
    const saved = localStorage.getItem('fm_season');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [usedEventIds, setUsedEventIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('fm_used_event_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [editUsedCount, setEditUsedCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [manageSearchQuery, setManageSearchQuery] = useState("");
  const [filterRarity, setFilterRarity] = useState<string>("Todas");
  const [filterCategory, setFilterCategory] = useState<string>("Todas");

  // Custom states added for editable fields and persistence
  const [clubName, setClubName] = useState<string>(() => {
    return localStorage.getItem('fm_club_name') || 'Meu Clube';
  });
  const [clubImage, setClubImage] = useState<string>(() => {
    return localStorage.getItem('fm_club_image') || '';
  });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // States for inline header editing
  const [isEditingClubNameInline, setIsEditingClubNameInline] = useState(false);
  const [inlineClubName, setInlineClubName] = useState(clubName);

  // Temporary states for Season edit modal
  const [tempSeasonNumber, setTempSeasonNumber] = useState(season);
  const [tempClubName, setTempClubName] = useState(clubName);
  const [tempClubImage, setTempClubImage] = useState(clubImage);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fm_events_db', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('fm_club_name', clubName);
    setInlineClubName(clubName);
  }, [clubName]);

  useEffect(() => {
    localStorage.setItem('fm_club_image', clubImage);
  }, [clubImage]);

  useEffect(() => {
    localStorage.setItem('fm_used_event_ids', JSON.stringify(usedEventIds));
  }, [usedEventIds]);

  useEffect(() => {
    localStorage.setItem('fm_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('fm_season', season.toString());
  }, [season]);

  const totalEventsCount = events.length;
  const usedEventsCount = usedEventIds.length;
  const remainingEventsCount = totalEventsCount - usedEventsCount;

  const toggleEventId = (id: number) => {
    setUsedEventIds(prev => {
      const next = prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id];
      setEditUsedCount(next.length);
      return next;
    });
  };

  const handleSaveSeasonEdit = (newUsedCount: number) => {
    const count = Math.min(Math.max(0, newUsedCount), totalEventsCount);
    
    if (count > usedEventIds.length) {
      // Add more random IDs to mark as used
      const allIds = events.map(e => e.id);
      const availableIds = allIds.filter(id => !usedEventIds.includes(id));
      const needed = count - usedEventIds.length;
      const toAdd = availableIds.sort(() => Math.random() - 0.5).slice(0, needed);
      setUsedEventIds(prev => [...prev, ...toAdd]);
    } else if (count < usedEventIds.length) {
      // Remove some IDs from used list
      setUsedEventIds(prev => prev.slice(0, count));
    }

    // Commit extra season options
    setSeason(tempSeasonNumber);
    setClubName(tempClubName);
    setClubImage(tempClubImage);

    setIsEditModalOpen(false);
  };

  const handleResetSeason = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmResetSeason = () => {
    setHistory([]);
    setUsedEventIds([]);
    setCurrentEvent(null);
    setShowConsequence(false);
    setIsResetConfirmOpen(false);
  };

  const handleClubNameBlur = () => {
    setIsEditingClubNameInline(false);
    if (inlineClubName.trim() !== '') {
      setClubName(inlineClubName.trim());
    } else {
      setInlineClubName(clubName);
    }
  };

  const handleClubNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleClubNameBlur();
    } else if (e.key === 'Escape') {
      setInlineClubName(clubName);
      setIsEditingClubNameInline(false);
    }
  };

  const handleAddEvent = (newEvent: Omit<Evento, 'id'>) => {
    const id = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    const eventWithId = { ...newEvent, id };
    setEvents(prev => [...prev, eventWithId]);
    setIsEventFormOpen(false);
  };

  const handleUpdateEvent = (updatedEvent: Evento) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setEditingEvent(null);
    setIsEventFormOpen(false);
  };

  const handleDeleteEvent = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.")) {
      setEvents(prev => prev.filter(e => e.id !== id));
      setUsedEventIds(prev => prev.filter(usedId => usedId !== id));
      setHistory(prev => prev.filter(e => e.id !== id));
      if (currentEvent?.id === id) setCurrentEvent(null);
    }
  };

  const startNewSeason = () => {
    setSeason(prev => prev + 1);
    setUsedEventIds([]);
    setHistory([]);
    setCurrentEvent(null);
    setShowConsequence(false);
  };

  const handleExportDatabase = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fm_events_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportDatabase = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          // Basic validation: check if first item has expected properties
          if (json.length > 0 && (!json[0].evento || !json[0].raridade)) {
            throw new Error("Formato de arquivo inválido");
          }
          
          if (window.confirm(`Deseja importar ${json.length} eventos? Isso substituirá seu banco de dados atual.`)) {
            setEvents(json);
            alert("Banco de dados importado com sucesso!");
          }
        } else {
          throw new Error("O arquivo deve conter uma lista de eventos.");
        }
      } catch (err) {
        alert("Erro ao importar arquivo: " + (err instanceof Error ? err.message : "Formato inválido"));
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Sound synthesis using Web Audio API - Refined for Premium Sports App feel
  const playSound = (type: 'suspense' | 'confirm') => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const gain = ctx.createGain();
      const osc = ctx.createOscillator();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'suspense') {
        // Subtle low-frequency hum for tension
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 3.5);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.5);
        
        osc.start();
        osc.stop(ctx.currentTime + 3.5);
      } else {
        // Clean, high-end confirmation "ping"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2); // Drop to A4
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      console.warn("Audio context failed to start", e);
    }
  };

  const drawEvent = () => {
    if (isDrawing) return;
    
    setIsDrawing(true);
    setShowConsequence(false);
    playSound('suspense');
    
    const totalDuration = 3500;
    const startTime = Date.now();

    const runShuffle = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / totalDuration;
      
      if (progress < 1) {
        const randomIdx = Math.floor(Math.random() * events.length);
        setShufflingName(events[randomIdx].evento);
        
        // Deceleration: starts fast (50ms), ends slow (400ms)
        const nextInterval = 50 + (Math.pow(progress, 2) * 450);
        setTimeout(runShuffle, nextInterval);
      } else {
        const rand = Math.random();
        let selectedRarity: Evento['raridade'];

        if (rand < 0.60) {
          selectedRarity = 'Comum';
        } else if (rand < 0.85) {
          selectedRarity = 'Incomum';
        } else if (rand < 0.95) {
          selectedRarity = 'Raro';
        } else {
          selectedRarity = 'Crise extrema';
        }

        // Filter out used events
        const unusedEvents = events.filter(e => !usedEventIds.includes(e.id));
        
        // Try to find an event of the selected rarity among unused events
        let possibleEvents = unusedEvents.filter(e => e.raridade === selectedRarity);
        
        // Fallback: if no events of selected rarity remain, pick any unused event
        if (possibleEvents.length === 0 && unusedEvents.length > 0) {
          possibleEvents = unusedEvents;
        }

        if (possibleEvents.length > 0) {
          const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
          setCurrentEvent(randomEvent);
          setUsedEventIds(prev => [...prev, randomEvent.id]);
          setIsDrawing(false);
          playSound('confirm');
        } else {
          setIsDrawing(false);
        }
      }
    };

    runShuffle();
  };

  const applyConsequence = () => {
    if (currentEvent) {
      setShowConsequence(true);
      setHistory(prev => {
        const newHistory = [currentEvent, ...prev.filter(e => e.id !== currentEvent.id)];
        return newHistory.slice(0, 5);
      });
    }
  };

  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case 'Comum': return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'shadow-emerald-500/20'
      };
      case 'Incomum': return {
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        glow: 'shadow-blue-500/20'
      };
      case 'Raro': return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'shadow-amber-500/20'
      };
      case 'Crise extrema': return {
        text: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        glow: 'shadow-red-500/20'
      };
      default: return {
        text: 'text-zinc-400',
        bg: 'bg-zinc-500/10',
        border: 'border-zinc-500/20',
        glow: 'shadow-zinc-500/20'
      };
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Comum': return <CheckCircle2 className="w-4 h-4" />;
      case 'Incomum': return <Zap className="w-4 h-4" />;
      case 'Raro': return <Trophy className="w-4 h-4" />;
      case 'Crise extrema': return <ShieldAlert className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-[1400px] mx-auto flex flex-col lg:flex-row min-h-screen">
        
        {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
        <aside className="lg:w-24 lg:min-h-screen border-r border-white/5 flex flex-row lg:flex-col items-center justify-between p-4 lg:py-8 sticky top-0 lg:h-screen z-50 bg-[#050505]/80 backdrop-blur-md">
          <div className="flex flex-row lg:flex-col items-center gap-8">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/40">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <nav className="flex flex-row lg:flex-col items-center gap-6">
              <button className="p-3 text-emerald-500 bg-emerald-500/10 rounded-xl" title="Dashboard"><LayoutDashboard className="w-6 h-6" /></button>
              <button 
                onClick={() => setIsManageModalOpen(true)}
                className="p-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Gerenciar Eventos"
              >
                <Settings className="w-6 h-6" />
              </button>
            </nav>
          </div>
          {/* Invisible placeholder to balance the flex layout on desktop */}
          <div className="hidden lg:block w-12 h-12" />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          
          {/* Top Header */}
          <header className="px-6 py-8 md:px-12 flex items-center justify-between">
            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-500 mb-1">Painel do Manager</h1>
              <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter">Eventos Extracampo</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Clube Atual</p>
                {isEditingClubNameInline ? (
                  <input
                    type="text"
                    value={inlineClubName}
                    onChange={(e) => setInlineClubName(e.target.value)}
                    onBlur={handleClubNameBlur}
                    onKeyDown={handleClubNameKeyDown}
                    autoFocus
                    className="bg-white/10 border border-emerald-500/50 rounded-lg px-2 py-0.5 text-sm font-bold text-white uppercase outline-none focus:ring-1 focus:ring-emerald-500 w-40 text-right"
                  />
                ) : (
                  <p 
                    onClick={() => {
                      setInlineClubName(clubName);
                      setIsEditingClubNameInline(true);
                    }}
                    className="text-sm font-bold text-white uppercase tracking-tight cursor-pointer hover:text-emerald-400 transition-colors flex items-center justify-end gap-1.5 group select-none"
                    title="Clique para editar o nome do clube"
                  >
                    {clubName}
                    <Edit className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                  </p>
                )}
              </div>
              
              <div className="relative group">
                <label className="cursor-pointer block">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden shadow-lg hover:border-emerald-500/50 transition-all relative">
                    {clubImage ? (
                      <img 
                        src={clubImage} 
                        alt={clubName} 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500/90 fill-current p-0.5">
                        <path d="M50,8 L88,24 C88,62 50,92 50,92 C50,92 12,62 12,24 Z" fill="none" stroke="currentColor" strokeWidth="6" />
                        <path d="M50,15 L79,28 C79,56 50,80 50,80 C50,80 21,56 21,28 Z" className="opacity-30" />
                        <circle cx="50" cy="48" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path d="M50,34 L50,42 M50,54 L50,62 M36,48 L44,48 M56,48 L64,48" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    )}
                    
                    {/* Hover upload overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Edit className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) setClubImage(ev.target.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 md:px-12 pb-12 grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* Left Side: Drawing & Event */}
            <div className="xl:col-span-8 space-y-8">
              
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={drawEvent}
                  disabled={isDrawing || remainingEventsCount === 0}
                  className={`
                    flex-1 group relative flex items-center justify-center gap-4 px-10 py-6 rounded-[2rem] font-black text-xl uppercase tracking-tighter italic transition-all duration-500
                    ${isDrawing || remainingEventsCount === 0
                      ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:scale-95'}
                  `}
                >
                  <Dices className={`w-8 h-8 ${isDrawing ? 'animate-spin' : 'group-hover:rotate-12 transition-transform duration-500'}`} />
                  {isDrawing ? 'Sorteando...' : remainingEventsCount === 0 ? 'Fim da Temporada' : 'Sortear Novo Evento'}
                </button>

                <button
                  onClick={applyConsequence}
                  disabled={!currentEvent || showConsequence || isDrawing}
                  className={`
                    flex-1 flex items-center justify-center gap-4 px-10 py-6 rounded-[2rem] font-black text-xl uppercase tracking-tighter italic transition-all duration-500
                    ${(!currentEvent || showConsequence || isDrawing) 
                      ? 'bg-zinc-900 text-zinc-700 border border-white/5 cursor-not-allowed' 
                      : 'bg-white hover:bg-zinc-100 text-black shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] hover:-translate-y-1 active:scale-95'}
                  `}
                >
                  <Zap className="w-8 h-8" />
                  Aplicar Consequência
                </button>
              </div>

              {/* Season Overview Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Season Status Card */}
                <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                    <Trophy className="w-20 h-20" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Status da Temporada</span>
                    </div>
                    <div>
                      <h4 className="text-4xl font-display font-black italic uppercase tracking-tighter text-white">
                        Temporada {season}
                      </h4>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{clubName} em Atividade</p>
                    </div>
                  </div>
                </div>

                {/* Event Progress Card */}
                <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Progresso de Eventos</span>
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                      {usedEventsCount} / {totalEventsCount}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(usedEventsCount / totalEventsCount) * 100}%` }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-emerald-500">{usedEventsCount} Usados</span>
                      <span className="text-zinc-500">{remainingEventsCount} Restantes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Event Card */}
              <div className="relative min-h-[500px]">
                <AnimatePresence mode="wait">
                  {isDrawing ? (
                    <motion.div
                      key="drawing-state"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        backgroundColor: ["rgba(16,185,129,0.02)", "rgba(16,185,129,0.08)", "rgba(16,185,129,0.02)"]
                      }}
                      transition={{ 
                        backgroundColor: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
                      }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="w-full h-full min-h-[500px] glass rounded-[3rem] flex flex-col items-center justify-center gap-12 overflow-hidden relative p-8"
                    >
                      {/* Pulsing Background Glow */}
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full"
                      />

                      <motion.div 
                        animate={{ 
                          rotateY: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-40 h-40 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.3)] relative z-10"
                      >
                        <Dices className="w-20 h-20 text-emerald-400" />
                      </motion.div>
                      
                      <div className="text-center space-y-6 relative z-10 w-full max-w-lg">
                        <div className="h-24 flex items-center justify-center overflow-hidden">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={shufflingName}
                              initial={{ y: 40, opacity: 0, scale: 0.8 }}
                              animate={{ y: 0, opacity: 1, scale: 1 }}
                              exit={{ y: -40, opacity: 0, scale: 1.2 }}
                              transition={{ duration: 0.05 }}
                              className="text-3xl md:text-5xl font-display font-black italic uppercase tracking-tighter text-white/60 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            >
                              {shufflingName}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                        
                        <div className="space-y-3">
                          <motion.p 
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="font-black uppercase tracking-[0.6em] text-sm italic text-emerald-400"
                          >
                            Sorteando Destino...
                          </motion.p>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 3.5, ease: "linear" }}
                              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Decorative scanning line */}
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent z-20"
                      />
                    </motion.div>
                  ) : currentEvent ? (
                    <motion.div
                      key={currentEvent.id}
                      initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
                      transition={{ 
                        type: "spring", 
                        damping: 15, 
                        stiffness: 150,
                        filter: { duration: 0.3 }
                      }}
                      className="relative w-full h-full"
                    >
                      {/* Flash Effect on Reveal */}
                      <motion.div 
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 bg-white rounded-[3rem] z-50 pointer-events-none"
                      />

                      {/* Card Background with Rarity Glow */}
                      <div className={`absolute inset-0 rounded-[3rem] blur-[120px] opacity-30 transition-all duration-1000 ${getRarityStyles(currentEvent.raridade).glow} ${getRarityStyles(currentEvent.raridade).bg}`} />
                      
                      <div className={`relative h-full glass rounded-[3rem] p-8 md:p-12 flex flex-col justify-between overflow-hidden group border-2 ${getRarityStyles(currentEvent.raridade).border} shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)]`}>
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-1000">
                          <Trophy className="w-64 h-64 rotate-12" />
                        </div>

                        <div className="space-y-10 relative z-10">
                          <motion.div 
                            initial={{ x: -40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="flex items-center gap-4"
                          >
                            <div className={`flex items-center gap-2 px-6 py-2 rounded-full border-2 text-xs font-black uppercase tracking-[0.2em] shadow-lg ${getRarityStyles(currentEvent.raridade).text} ${getRarityStyles(currentEvent.raridade).border} ${getRarityStyles(currentEvent.raridade).bg}`}>
                              {getRarityIcon(currentEvent.raridade)}
                              {currentEvent.raridade}
                            </div>
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">
                              {currentEvent.categoria}
                            </span>
                          </motion.div>

                          <div className="space-y-8">
                            <motion.h3 
                              initial={{ y: 40, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.4, type: "spring" }}
                              className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter leading-[0.95] text-white drop-shadow-2xl py-1.5"
                            >
                              {currentEvent.evento}
                            </motion.h3>
                            <motion.p 
                              initial={{ y: 40, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.5 }}
                              className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-3xl"
                            >
                              {currentEvent.descricao}
                            </motion.p>
                          </div>
                        </div>

                        <div className="mt-12 relative z-10">
                          <AnimatePresence>
                            {showConsequence ? (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl"
                              >
                                <div className="flex items-start gap-6">
                                  <motion.div 
                                    animate={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="p-4 bg-emerald-500/20 rounded-2xl"
                                  >
                                    <AlertTriangle className="w-8 h-8 text-emerald-400" />
                                  </motion.div>
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Consequência Direta</h4>
                                    <p className="text-xl md:text-2xl font-bold text-white leading-tight">
                                      {currentEvent.consequencia}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 text-zinc-600 font-black uppercase tracking-widest text-xs animate-pulse"
                              >
                                <Info className="w-4 h-4" />
                                Clique em aplicar consequência para ver o impacto
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ) : remainingEventsCount === 0 ? (
                    <motion.div 
                      key="end-season-state"
                      initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      className="w-full h-full min-h-[500px] glass rounded-[3rem] flex flex-col items-center justify-center text-center p-12 gap-10 border-2 border-amber-500/20 relative overflow-hidden"
                    >
                      {/* Background Glow */}
                      <div className="absolute inset-0 bg-amber-500/5 blur-[100px]" />
                      
                      <motion.div 
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-40 h-40 bg-amber-500/10 rounded-full flex items-center justify-center border-2 border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.2)] relative z-10"
                      >
                        <Trophy className="w-20 h-20 text-amber-500" />
                      </motion.div>
                      
                      <div className="space-y-6 relative z-10">
                        <div className="space-y-2">
                          <span className="text-xs font-black text-amber-500 uppercase tracking-[0.5em]">Temporada {season} Finalizada</span>
                          <h3 className="text-5xl md:text-7xl font-display font-black italic uppercase tracking-tighter text-white leading-none">
                            Ciclo Completo
                          </h3>
                        </div>
                        <p className="text-xl md:text-2xl text-zinc-400 max-w-xl mx-auto font-medium leading-relaxed">
                          Todos os <span className="text-white font-bold">{totalEventsCount} eventos</span> foram sorteados. O destino do Salford United nesta temporada está selado.
                        </p>
                      </div>

                      <button
                        onClick={startNewSeason}
                        className="relative z-10 bg-amber-500 hover:bg-amber-400 text-black px-12 py-6 rounded-2xl font-black uppercase tracking-tighter italic text-xl transition-all hover:-translate-y-1 shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)] active:scale-95"
                      >
                        Iniciar Nova Temporada
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="idle-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full min-h-[500px] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-zinc-700 gap-6"
                    >
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                        <Dices className="w-10 h-10 opacity-20" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-black uppercase tracking-[0.4em] text-sm">Aguardando Sorteio</p>
                        <p className="text-xs font-bold text-zinc-800">Clique no botão verde para começar</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Side: History & Stats */}
            <div className="xl:col-span-4 space-y-10">

              {/* Season Management Card */}
              <section className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Trophy className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Gerenciamento</h4>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                    Inicie um novo ciclo para resetar o histórico e reativar todos os eventos do banco de dados.
                  </p>
                  <button 
                    onClick={startNewSeason}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:border-emerald-500/50 flex items-center justify-center gap-3 group animate-pulse-subtle"
                  >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                    Nova Temporada
                  </button>
                  <button 
                    onClick={() => {
                      setEditUsedCount(usedEventsCount);
                      setTempSeasonNumber(season);
                      setTempClubName(clubName);
                      setTempClubImage(clubImage);
                      setIsEditModalOpen(true);
                    }}
                    className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:border-emerald-500/50 flex items-center justify-center gap-3 group"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar Temporada
                  </button>
                  <button 
                    onClick={handleResetSeason}
                    className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:border-red-500/50 flex items-center justify-center gap-3 group"
                  >
                    <RefreshCw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-700" />
                    Resetar Temporada
                  </button>
                </div>
              </section>
              
              {/* History Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-zinc-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Histórico</h3>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-700 uppercase">Últimos 5</span>
                </div>

                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {history.length > 0 ? (
                      history.map((event, idx) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={`${event.id}-${idx}`}
                          className="group glass p-5 rounded-2xl hover:bg-white/[0.06] transition-all cursor-default"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getRarityStyles(event.raridade).text} ${getRarityStyles(event.raridade).border} ${getRarityStyles(event.raridade).bg}`}>
                                {event.raridade}
                              </span>
                              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{event.categoria}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                          </div>
                          <h4 className="font-bold text-zinc-200 group-hover:text-white transition-colors text-lg tracking-tight">
                            {event.evento}
                          </h4>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-12 text-center border border-white/5 rounded-[2rem] border-dashed">
                        <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em]">Vazio</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Probabilities Section */}
              <section className="glass p-8 rounded-[2rem] space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Probabilidades de Sorteio</h4>
                <div className="space-y-5">
                  {[
                    { label: 'Comum', prob: '60%', color: 'bg-emerald-500' },
                    { label: 'Incomum', prob: '25%', color: 'bg-blue-500' },
                    { label: 'Raro', prob: '10%', color: 'bg-amber-500' },
                    { label: 'Crise Extrema', prob: '5%', color: 'bg-red-500' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-zinc-400">{item.label}</span>
                        <span className="text-zinc-100">{item.prob}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: item.prob }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </main>

          {/* Manage Events Modal */}
      <AnimatePresence>
        {isManageModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManageModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-5xl glass rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl h-[85vh] max-h-[800px] flex flex-col overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 z-20" />
              
              <div className="p-6 md:p-10 flex flex-col min-h-0 flex-1 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em]">Central de Dados</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-display font-black italic uppercase tracking-tighter text-white">Gerenciar Eventos</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-4">
                      <button 
                        onClick={handleExportDatabase}
                        className="p-4 hover:bg-white/5 rounded-2xl transition-colors text-zinc-500 hover:text-white border border-white/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        title="Exportar Banco"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden md:inline">Exportar</span>
                      </button>
                      <label className="p-4 hover:bg-white/5 rounded-2xl transition-colors text-zinc-500 hover:text-white border border-white/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer" title="Importar Banco">
                        <Upload className="w-4 h-4" />
                        <span className="hidden md:inline">Importar</span>
                        <input 
                          type="file" 
                          accept=".json" 
                          onChange={handleImportDatabase} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingEvent(null);
                        setIsEventFormOpen(true);
                      }}
                      className="group relative bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)]"
                    >
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      Novo Evento
                    </button>
                    <button 
                      onClick={() => setIsManageModalOpen(false)}
                      className="p-4 hover:bg-white/5 rounded-2xl transition-colors text-zinc-500 hover:text-white border border-white/5"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total', value: events.length, color: 'text-white' },
                    { label: 'Comum', value: events.filter(e => e.raridade === 'Comum').length, color: 'text-emerald-500' },
                    { label: 'Raro', value: events.filter(e => e.raridade === 'Raro').length, color: 'text-amber-500' },
                    { label: 'Crise', value: events.filter(e => e.raridade === 'Crise extrema').length, color: 'text-red-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-0.5">
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</span>
                      <span className={`text-lg font-display font-black italic ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="text"
                      placeholder="BUSCAR POR NOME OU DESCRIÇÃO..."
                      value={manageSearchQuery}
                      onChange={(e) => setManageSearchQuery(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-xs font-bold text-white placeholder:text-zinc-700 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="relative group">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <select 
                        value={filterRarity}
                        onChange={(e) => setFilterRarity(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-10 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 outline-none cursor-pointer hover:border-white/20 transition-all appearance-none"
                      >
                        <option value="Todas">Raridade: Todas</option>
                        <option value="Comum">Comum</option>
                        <option value="Incomum">Incomum</option>
                        <option value="Raro">Raro</option>
                        <option value="Crise extrema">Crise</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 rotate-90 pointer-events-none" />
                    </div>
                    <div className="relative group">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-10 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 outline-none cursor-pointer hover:border-white/20 transition-all appearance-none"
                      >
                        <option value="Todas">Categoria: Todas</option>
                        {Array.from(new Set(events.map(e => e.categoria))).sort().map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Events Table/List */}
                <div className="relative flex-1 min-h-0 overflow-hidden rounded-[2rem] bg-black/20 border border-white/5">
                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
                  
                  <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth">
                    <div className="p-6 md:p-8 pb-48 space-y-6">
                    {events
                      .filter(e => 
                        (e.evento.toLowerCase().includes(manageSearchQuery.toLowerCase()) || 
                         e.descricao.toLowerCase().includes(manageSearchQuery.toLowerCase())) &&
                        (filterRarity === "Todas" || e.raridade === filterRarity) &&
                        (filterCategory === "Todas" || e.categoria === filterCategory)
                      ).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                            <Search className="w-10 h-10 text-zinc-700" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-sm">Nenhum registro encontrado</p>
                            <p className="text-zinc-600 text-xs font-medium max-w-[200px] mx-auto">Tente refinar sua busca ou ajustar os filtros de categoria e raridade.</p>
                          </div>
                        </div>
                      ) : (
                        events
                          .filter(e => 
                            (e.evento.toLowerCase().includes(manageSearchQuery.toLowerCase()) || 
                             e.descricao.toLowerCase().includes(manageSearchQuery.toLowerCase())) &&
                            (filterRarity === "Todas" || e.raridade === filterRarity) &&
                            (filterCategory === "Todas" || e.categoria === filterCategory)
                          )
                          .map(event => (
                            <div key={event.id} className="group relative bg-white/[0.02] hover:bg-white/[0.04] p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-emerald-500/5">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-5 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[10px] font-black text-zinc-600 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">ID: {event.id}</span>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border shadow-sm ${
                                  event.raridade === 'Comum' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' :
                                  event.raridade === 'Incomum' ? 'bg-blue-500/5 text-blue-500 border-blue-500/20' :
                                  event.raridade === 'Raro' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' :
                                  'bg-red-500/5 text-red-500 border-red-500/20'
                                }`}>
                                  {event.raridade}
                                </span>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">{event.categoria}</span>
                              </div>
                              
                              <div className="space-y-3">
                                <h4 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white group-hover:text-emerald-400 transition-colors leading-none">{event.evento}</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed font-medium max-w-2xl">{event.descricao}</p>
                              </div>

                              <div className="flex items-center gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                  <Zap className="w-4 h-4 text-emerald-500" />
                                </div>
                                <p className="text-xs font-bold text-emerald-500/90 italic tracking-tight">{event.consequencia}</p>
                              </div>
                            </div>

                            <div className="flex md:flex-col gap-3 shrink-0">
                              <button 
                                onClick={() => {
                                  setEditingEvent(event);
                                  setIsEventFormOpen(true);
                                }}
                                className="flex-1 md:w-40 bg-white/5 hover:bg-white/10 text-white px-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all border border-white/5 hover:border-white/20 active:scale-95"
                              >
                                <Edit className="w-4 h-4" />
                                Editar
                              </button>
                              <button 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="flex-1 md:w-40 bg-red-500/5 hover:bg-red-500/10 text-red-500/70 hover:text-red-500 px-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all border border-red-500/10 hover:border-red-500/20 active:scale-95"
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                      
                      {/* Final Spacer for Scroll Buffer */}
                      <div className="h-48 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Form Modal */}
      <AnimatePresence>
        {isEventFormOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEventFormOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl glass rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 z-20" />
              
              <div className="p-8 md:p-12 space-y-10 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <Plus className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em]">Editor de Registro</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display font-black italic uppercase tracking-tighter text-white">
                      {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsEventFormOpen(false)}
                    className="p-4 hover:bg-white/5 rounded-2xl transition-colors text-zinc-500 hover:text-white border border-white/5"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = {
                      evento: formData.get('evento') as string,
                      descricao: formData.get('descricao') as string,
                      consequencia: formData.get('consequencia') as string,
                      categoria: formData.get('categoria') as string,
                      raridade: formData.get('raridade') as Evento['raridade'],
                    };
                    if (editingEvent) {
                      handleUpdateEvent({ ...data, id: editingEvent.id });
                    } else {
                      handleAddEvent(data);
                    }
                  }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block px-1">Título do Evento</label>
                      <input 
                        name="evento"
                        required
                        defaultValue={editingEvent?.evento}
                        placeholder="EX: ESCÂNDALO NO VESTIÁRIO"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white placeholder:text-zinc-700 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block px-1">Categoria</label>
                      <input 
                        name="categoria"
                        required
                        defaultValue={editingEvent?.categoria}
                        placeholder="EX: VESTIÁRIO"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white placeholder:text-zinc-700 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block px-1">Raridade</label>
                      <div className="relative">
                        <select 
                          name="raridade"
                          required
                          defaultValue={editingEvent?.raridade || 'Comum'}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="Comum">Comum</option>
                          <option value="Incomum">Incomum</option>
                          <option value="Raro">Raro</option>
                          <option value="Crise extrema">Crise extrema</option>
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block px-1">Descrição Narrativa</label>
                    <textarea 
                      name="descricao"
                      required
                      defaultValue={editingEvent?.descricao}
                      placeholder="DESCREVA O QUE ACONTECEU COM O CLUBE..."
                      rows={4}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white placeholder:text-zinc-700 focus:border-emerald-500 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block px-1">Impacto / Consequência</label>
                    <div className="relative">
                      <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                      <input 
                        name="consequencia"
                        required
                        defaultValue={editingEvent?.consequencia}
                        placeholder="EX: -10 DE MORAL PARA O ELENCO"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-emerald-500 placeholder:text-zinc-700 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button 
                      type="button"
                      onClick={() => setIsEventFormOpen(false)}
                      className="flex-1 px-8 py-5 rounded-2xl border border-white/10 text-zinc-400 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all active:scale-95"
                    >
                      Descartar
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-5 rounded-2xl font-black uppercase tracking-tighter italic text-xl transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Save className="w-6 h-6" />
                      {editingEvent ? 'Atualizar Registro' : 'Confirmar Criação'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Season Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="relative w-full max-w-lg glass rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] max-h-[90vh] flex flex-col"
            >
              {/* Technical Header Decoration */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent z-20" />
              
              <div className="p-8 md:p-12 space-y-10 overflow-y-auto custom-scrollbar">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <Settings className="w-4 h-4 animate-spin-slow" />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em]">Painel Administrativo</span>
                    </div>
                    <h3 className="text-4xl font-display font-black italic uppercase tracking-tighter text-white leading-none">
                      Ajustar Temporada
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 group"
                  >
                    <X className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Nome do Clube e Temporada */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Nome do Clube</label>
                      <input 
                        type="text"
                        value={tempClubName}
                        onChange={(e) => setTempClubName(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-4 py-4 text-xs font-bold text-white focus:border-red-500 outline-none transition-all uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Temporada</label>
                      <input 
                        type="number"
                        min="1"
                        value={tempSeasonNumber}
                        onChange={(e) => setTempSeasonNumber(parseInt(e.target.value) || 1)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-4 py-4 text-xs font-bold text-white text-center focus:border-red-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Alterar Escudo do Clube */}
                  <div className="space-y-3 p-6 bg-white/[0.01] rounded-3xl border border-white/5 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0 relative">
                      {tempClubImage ? (
                        <img 
                          src={tempClubImage} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-700 fill-current p-1 col-span-1">
                          <path d="M50,8 L88,24 C88,62 50,92 50,92 C50,92 12,62 12,24 Z" fill="none" stroke="currentColor" strokeWidth="6" />
                          <circle cx="50" cy="48" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
                          <path d="M50,34 L50,42 M50,54 L50,62 M36,48 L44,48 M56,48 L64,48" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Escudo do Clube</label>
                      <div className="flex gap-2">
                        <label className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black text-white text-center uppercase tracking-wider cursor-pointer transition-all active:scale-95 block">
                          Fazer Upload
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) setTempClubImage(ev.target.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                            className="hidden" 
                          />
                        </label>
                        {tempClubImage && (
                          <button
                            type="button"
                            onClick={() => setTempClubImage('')}
                            className="px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-500 text-xs transition-all active:scale-95 flex items-center justify-center"
                            title="Remover imagem (usar padrão)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Used Events Control */}
                  <div className="space-y-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Eventos Concluídos</label>
                      </div>
                      <span className="text-2xl font-display font-black italic text-emerald-500">{editUsedCount}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <input 
                        type="range" 
                        min="0" 
                        max={totalEventsCount} 
                        value={editUsedCount}
                        onChange={(e) => setEditUsedCount(parseInt(e.target.value))}
                        className="flex-1 accent-emerald-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                      />
                      <input 
                        type="number" 
                        min="0" 
                        max={totalEventsCount} 
                        value={editUsedCount}
                        onChange={(e) => setEditUsedCount(parseInt(e.target.value) || 0)}
                        className="w-20 bg-zinc-900 border border-white/10 rounded-xl px-3 py-3 text-white font-black text-center focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Remaining Events Control */}
                  <div className="space-y-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-500/10 flex items-center justify-center border border-white/10">
                          <Dices className="w-4 h-4 text-zinc-500" />
                        </div>
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Eventos Pendentes</label>
                      </div>
                      <span className="text-2xl font-display font-black italic text-zinc-300">{totalEventsCount - editUsedCount}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <input 
                        type="range" 
                        min="0" 
                        max={totalEventsCount} 
                        value={totalEventsCount - editUsedCount}
                        onChange={(e) => setEditUsedCount(totalEventsCount - parseInt(e.target.value))}
                        className="flex-1 accent-zinc-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                      />
                      <input 
                        type="number" 
                        min="0" 
                        max={totalEventsCount} 
                        value={totalEventsCount - editUsedCount}
                        onChange={(e) => setEditUsedCount(totalEventsCount - (parseInt(e.target.value) || 0))}
                        className="w-20 bg-zinc-900 border border-white/10 rounded-xl px-3 py-3 text-zinc-400 font-black text-center focus:border-white/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                    <span>Capacidade Total do Banco</span>
                    <span className="text-zinc-400">{totalEventsCount} Eventos</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-8 py-5 rounded-2xl border border-white/10 text-zinc-400 font-black uppercase tracking-widest text-xs hover:bg-white/5 hover:text-white transition-all active:scale-95"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={() => handleSaveSeasonEdit(editUsedCount)}
                    className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-5 rounded-2xl font-black uppercase tracking-tighter italic text-lg transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:scale-95"
                  >
                    Salvar Configurações
                  </button>
                </div>

                {/* Detailed Event List Section */}
                <div className="pt-8 border-t border-white/5 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">Lista Detalhada de Eventos</h4>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Gerencie eventos específicos da temporada</p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="text"
                      placeholder="BUSCAR EVENTO POR NOME..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-white placeholder:text-zinc-700 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  {/* Events List */}
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {events
                      .filter(e => e.evento.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(event => {
                        const isUsed = usedEventIds.includes(event.id);
                        return (
                          <div 
                            key={event.id}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                              isUsed 
                                ? 'bg-emerald-500/5 border-emerald-500/20' 
                                : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="space-y-1">
                              <p className={`text-xs font-bold ${isUsed ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                {event.evento}
                              </p>
                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                {event.raridade} • {event.categoria}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleEventId(event.id)}
                              className={`p-2 rounded-xl transition-all ${
                                isUsed 
                                  ? 'bg-emerald-500 text-black hover:bg-red-500 hover:text-white' 
                                  : 'bg-white/5 text-zinc-500 hover:bg-emerald-500 hover:text-black'
                              }`}
                            >
                              {isUsed ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </button>
                          </div>
                        );
                      })}
                    <div className="h-12 w-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetConfirmOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="relative w-full max-w-md glass rounded-[2.5rem] overflow-hidden border border-red-500/10 shadow-[0_0_100px_rgba(239,68,68,0.15)] p-8 md:p-10 space-y-8 text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter text-white">
                  Resetar Temporada?
                </h3>
                <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                  Tem certeza que deseja resetar esta temporada? Isso apagará o histórico de eventos sorteados e reativará todos os eventos.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:bg-white/5 hover:text-white transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmResetSeason}
                  className="flex-1 bg-red-500 hover:bg-red-400 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-[0_10px_20px_-5px_rgba(239,68,68,0.3)] active:scale-95"
                >
                  Confirmar Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
          <footer className="px-12 py-8 border-t border-white/5 flex items-center justify-center">
            <p className="text-zinc-600 text-[11px] font-black uppercase tracking-[0.4em] text-center">
              Modo Carreira – Gerador de Eventos Extracampo
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
