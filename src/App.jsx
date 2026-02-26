import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ShoppingBag, ExternalLink, Gift, X, 
  ArrowDown, RotateCcw, TrendingUp, Search, 
  ShieldCheck, Zap, Star, Calendar, DollarSign, Heart,
  Timer, ChevronRight, Info, HelpCircle, Mail, AlertTriangle,
  Package, CheckCircle, Globe, ChevronDown, Tag, MousePointer2
} from 'lucide-react';

// --- KONFIGURATION (AMAZON DEUTSCHLAND) ---
const DOMAIN = "amazon.de";
const LOCALE = "de-DE";
const CURRENCY = "EUR";
const AFFILIATE_TAG = "giftingscout0e-21"; 
const MAX_INPUT_LENGTH = 280;

// --- STATISCHE TOP-PRODUKTE FÜR DIE STARTSEITE ---
const FEATURED_PRODUCTS = [
  {
    name: "Kindle Paperwhite (16 GB)",
    brand: "Amazon",
    reason: "Der Goldstandard für alle, die gerne lesen. Wasserfest und mit verstellbarem Farblicht.",
    price: "ca. 169€",
    search: "Kindle Paperwhite"
  },
  {
    name: "Philips Hue Bridge & Starter Set",
    brand: "Philips Hue",
    reason: "Perfekt für Smart-Home-Einsteiger. Erzeugt die ideale Atmosphäre in jedem Raum.",
    price: "ca. 120€",
    search: "Philips Hue Starter Set"
  },
  {
    name: "Lego Architecture: New York City",
    brand: "LEGO",
    reason: "Ein zeitloses Design-Objekt für den Schreibtisch oder das Regal. Ideal für Ästheten.",
    price: "ca. 45€",
    search: "Lego Architecture New York"
  }
];

// --- UI TEXTE ---
const T = {
  banner: "AI-Marktanalyse: Top-Entdeckungen 2026",
  tagline: "KI-gestützte Suche für perfekte Geschenke",
  hero_title: "Schenke mit",
  hero_highlight: "Verstand.",
  hero_desc: "Unser Scout analysiert tausende Trends auf Amazon.de, um Vorschläge zu finden, die wirklich begeistern.",
  label_profile: "Wen möchtest du beschenken?",
  placeholder_input: "Z.B. Mein Bruder, 30, Software-Entwickler, liebt mechanische Tastaturen und Espresso...",
  label_occasion: "Anlass",
  label_budget: "Budget",
  btn_start: "ANALYSE STARTEN",
  btn_loading: "SCOUTE TRENDS...",
  verified_pick: "Expert Choice",
  btn_shop: "ZUM PRODUKT",
  section_featured: "Aktuelle Trend-Entdeckungen",
  error_api: "Der Scout braucht eine kurze Pause. Bitte prüfe deine API-Konfiguration.",
  footer_affiliate: "Als Amazon-Partner verdiene ich an qualifizierten Verkäufen. Alle Empfehlungen werden durch KI-Analyse generiert."
};

const ANLAESSE = ["Geburtstag", "Jahrestag", "Hochzeit", "Dankeschön", "Einweihung", "Abschluss"];

const BUDGET_OPTIONS = [
  { id: 'b1', label: 'Unter 25€', range: { min: 5, max: 25 } },
  { id: 'b2', label: '25€ - 50€', range: { min: 25, max: 50 } },
  { id: 'b3', label: '50€ - 100€', range: { min: 50, max: 100 } },
  { id: 'b4', label: '100€ - 250€', range: { min: 100, max: 250 } },
  { id: 'b5', label: 'Premium (250€+)', range: { min: 250, max: 1500 } }
];

// --- HILFSFUNKTIONEN ---
const formatMoney = (value) => {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0
  }).format(value);
};

const buildAmazonUrl = (query) => {
  return `https://www.${DOMAIN}/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
};

const normalizeGifts = (data, budgetRange) => {
  let gifts = [];
  if (Array.isArray(data)) gifts = data;
  else if (data && data.gifts && Array.isArray(data.gifts)) gifts = data.gifts;
  else if (data && data.recommendations && Array.isArray(data.recommendations)) gifts = data.recommendations;

  return gifts.map((item, index) => {
    const min = budgetRange.min;
    const max = budgetRange.max;
    const step = (max - min) / 5;
    const fallbackMin = Math.floor(min + (step * index));
    const fallbackMax = Math.floor(fallbackMin + (step * 0.8));

    return {
      name: item.name || "Produkt-Idee",
      brand: item.brand || "Premium",
      reason: item.reason || "Matched specifically to your request.",
      price_display: item.price || `${fallbackMin}€ - ${fallbackMax}€`
    };
  });
};

const STYLES = {
  text: 'text-indigo-500',
  bg: 'bg-indigo-500',
  border: 'border-indigo-500/20',
  glow: 'shadow-[0_0_20px_rgba(79,70,229,0.4)]',
  bgLight: 'bg-indigo-500/10',
  selection: 'selection:bg-indigo-500/30'
};

export default function App() {
  const [input, setInput] = useState('');
  const [occasion, setOccasion] = useState(ANLAESSE[0]);
  const [budget, setBudget] = useState(BUDGET_OPTIONS[2]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [livePulse, setLivePulse] = useState("System bereit...");

  const resultsRef = useRef(null);

  useEffect(() => {
    const feeds = [
      "Analysiere Amazon.de Bestseller...",
      "Scoute Tech-Trends...",
      "Lifestyle-Datenabgleich aktiv...",
      "Warte auf Benutzereingabe..."
    ];
    const interval = setInterval(() => {
      setLivePulse(feeds[Math.floor(Math.random() * feeds.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleScout = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading || input.length > MAX_INPUT_LENGTH) return;
    setLoading(true);
    setResults(null);
    setError(null);

    // API Key Zugriff
    let apiKey = "";
    try {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    } catch (e) {}

    const MODEL_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    if (!apiKey) {
      setError("Konfigurationsfehler: VITE_GEMINI_API_KEY fehlt.");
      setLoading(false);
      return;
    }

    const payload = {
      contents: [{ parts: [{ text: `Empfiehl 5 Geschenke für: ${input}. Anlass: ${occasion}. Budget: ${budget.label}.` }] }],
      systemInstruction: { 
        parts: [{ 
          text: `Du bist GiftingScout AI. Sprache: Deutsch. Markt: Amazon.de.
          Gib 5 Geschenke im JSON Format zurück: { "summary": "...", "gifts": [{ "name": "Marke + Modell", "brand": "Marke", "reason": "Kurzer Grund", "price": "ca. XX€" }] } 
          Nutze ECHTE Produktkategorien von Amazon.de. Nur JSON.` 
        }] 
      },
      generationConfig: { responseMimeType: "application/json" }
    };

    try {
      const response = await fetch(MODEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("API_ERROR");
      
      const data = await response.json();
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      let normalized = normalizeGifts(parsed, budget.range);
      
      setResults({ ...parsed, gifts: normalized });
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (err) {
      setError(T.error_api);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#050505] text-zinc-100 font-sans ${STYLES.selection} overflow-x-hidden`}>
      
      {/* Top Bar */}
      <div className="bg-zinc-900 border-b border-white/5 py-3 px-6 flex items-center justify-between text-[10px] font-black tracking-widest text-zinc-500 uppercase">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 ${STYLES.bg} rounded-full animate-pulse shadow-[0_0_10px_currentColor]`} />
          {livePulse}
        </div>
        <div className="flex items-center gap-2 opacity-50">
          <Globe size={12} /> DE | EUR
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-3xl border-b border-white/5 p-6 px-8 flex justify-between items-center">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => {setResults(null); setInput('');}}>
          <div className={`w-12 h-12 ${STYLES.bg} rounded-2xl flex items-center justify-center ${STYLES.glow} group-hover:scale-105 transition-all duration-700`}>
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Gifting<span className={STYLES.text}>Scout</span></h1>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => setActiveModal('support')} className="text-[11px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors">Support</button>
          {results && <button onClick={() => {setResults(null); setInput('');}} className="p-3 bg-white/5 rounded-2xl text-zinc-400 hover:text-white transition-all"><RotateCcw size={22} /></button>}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-24 space-y-32">
        
        {/* Hero */}
        <section className="text-center space-y-10 animate-in fade-in duration-1000">
          <div className={`inline-flex items-center gap-2 ${STYLES.bgLight} border ${STYLES.border} px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.25em] ${STYLES.text} shadow-xl`}>
            <Zap size={14} fill="currentColor" /> {T.banner}
          </div>
          <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] text-white">
            {T.hero_title} <br/><span className={`${STYLES.text} italic underline decoration-white/5`}>{T.hero_highlight}</span>
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-xl font-medium leading-relaxed">
            {T.hero_desc}
          </p>
        </section>

        {/* Search Engine */}
        <section className="max-w-2xl mx-auto relative group">
          <div className="bg-zinc-900 border border-white/10 rounded-[3.5rem] p-2 shadow-2xl relative overflow-hidden">
            <div className="bg-[#0A0A0A] p-10 md:p-14 rounded-[3.2rem] space-y-12">
              <form onSubmit={handleScout} className="space-y-10">
                <div className="space-y-5">
                  <div className="flex justify-between items-end px-2">
                    <label className="text-[12px] font-black text-zinc-600 uppercase tracking-[0.4em]">{T.label_profile}</label>
                    <span className={`text-[10px] font-bold tracking-widest ${input.length >= MAX_INPUT_LENGTH ? 'text-rose-500' : 'text-zinc-700'}`}>
                      {input.length} / {MAX_INPUT_LENGTH}
                    </span>
                  </div>
                  <textarea 
                    value={input} 
                    onChange={e => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))} 
                    placeholder={T.placeholder_input} 
                    className={`w-full bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 text-xl focus:border-current ${STYLES.text} outline-none transition-all placeholder:text-zinc-800 h-44 resize-none shadow-inner`} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-zinc-600 uppercase tracking-widest ml-2 flex items-center gap-2"><Calendar size={14} className={STYLES.text} /> {T.label_occasion}</label>
                    <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-5 text-sm font-black outline-none cursor-pointer hover:bg-zinc-900 transition-colors text-zinc-500">
                      {ANLAESSE.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-zinc-600 uppercase tracking-widest ml-2 flex items-center gap-2"><DollarSign size={14} className={STYLES.text} /> {T.label_budget}</label>
                    <select value={budget.id} onChange={e => setBudget(BUDGET_OPTIONS.find(b => b.id === e.target.value))} className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-5 text-sm font-black outline-none cursor-pointer hover:bg-zinc-900 transition-colors text-zinc-500">
                      {BUDGET_OPTIONS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                    </select>
                  </div>
                </div>
                {error && <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-200 text-xs text-center flex items-center gap-3 justify-center"><AlertTriangle size={16}/> {error}</div>}
                <button disabled={loading || input.length === 0} className={`w-full ${STYLES.bg} text-white font-black py-7 rounded-[2rem] text-2xl hover:brightness-110 transition-all flex items-center justify-center gap-5 active:scale-[0.98] disabled:opacity-50 shadow-2xl uppercase tracking-widest`}>
                  {loading ? T.btn_loading : T.btn_start}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Results / Featured Products */}
        <div ref={resultsRef} className="pb-40 scroll-mt-24">
          <div className="flex flex-col gap-16">
            <h3 className="text-[12px] font-black text-zinc-600 uppercase tracking-[0.6em] text-center">
              {results ? "Deine personalisierten Vorschläge" : T.section_featured}
            </h3>

            <div className="grid gap-12">
              {(results ? results.gifts : FEATURED_PRODUCTS).map((item, i) => (
                <div key={i} className="group bg-zinc-900/40 border border-white/5 rounded-[4rem] overflow-hidden flex flex-col md:flex-row hover:bg-zinc-900 transition-all duration-700 shadow-2xl">
                  
                  {/* Icon Area */}
                  <div className="w-full md:w-80 aspect-square bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/5 shrink-0">
                    <div className={`w-28 h-28 rounded-[2rem] ${STYLES.bgLight} border ${STYLES.border} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-700`}>
                      <Package size={54} className={STYLES.text} />
                    </div>
                    <div className={`absolute top-8 left-8 bg-black/80 backdrop-blur-xl px-5 py-2 rounded-full text-[10px] font-black ${STYLES.text} border border-white/10 uppercase tracking-widest`}>
                      {T.verified_pick}
                    </div>
                  </div>

                  {/* Info Panel */}
                  <div className="flex-1 p-10 md:p-16 space-y-8 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                        <Star size={12} fill="currentColor" className={STYLES.text} /> {item.brand}
                      </div>
                      <h4 className="text-4xl font-black text-white leading-tight tracking-tighter group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                      <p className="text-xl leading-relaxed text-zinc-500 max-w-2xl italic">"{item.reason}"</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-10 pt-6">
                      <div className="text-3xl font-black text-white bg-white/5 px-8 py-4 rounded-2xl border border-white/5">
                        {item.price || item.price_display}
                      </div>
                      <a 
                        href={buildAmazonUrl(item.search || item.name)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`bg-white text-black px-12 py-6 rounded-2xl font-black text-xs hover:${STYLES.bg} hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-4 uppercase tracking-widest`}
                      >
                        {T.btn_shop} <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Support Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-[3.5rem] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-12 border-b border-white/5">
              <h3 className="text-2xl font-black text-white uppercase italic">Support Center</h3>
              <button onClick={() => setActiveModal(null)} className="p-4 bg-white/5 rounded-full text-zinc-500 hover:text-white"><X size={28} /></button>
            </div>
            <div className="p-12 text-center space-y-10">
              <p className="text-xl text-zinc-400 leading-relaxed">Fragen zu deinen Empfehlungen oder Interesse an Kooperationen?</p>
              <a href="mailto:hello@giftingscout.com" className={`w-full bg-white text-black font-black py-8 rounded-[2rem] text-lg flex items-center justify-center gap-4 hover:${STYLES.bg} hover:text-white transition-all shadow-xl uppercase tracking-widest`}>
                <Mail size={24} /> TEAM KONTAKTIEREN
              </a>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-black py-40 border-t border-white/5 text-center px-6">
        <div className="max-w-4xl mx-auto space-y-16 opacity-30">
          <div className="flex items-center justify-center gap-6">
            <Package size={32} />
            <span className="font-black text-xl tracking-tighter uppercase tracking-[0.4em]">GiftingScout AI</span>
          </div>
          <p className="max-w-md mx-auto text-[10px] font-black uppercase tracking-[0.3em] leading-loose">{T.footer_affiliate}</p>
          <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest">
            <span className="cursor-pointer hover:text-white">Impressum</span>
            <span className="cursor-pointer hover:text-white">Datenschutz</span>
          </div>
        </div>
      </footer>
    </div>
  );
}