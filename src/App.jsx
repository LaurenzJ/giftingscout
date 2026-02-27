import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ShoppingBag, ExternalLink, Gift, X, 
  RotateCcw, Search, Star, Calendar, Heart,
  ChevronRight, Mail, Package, Globe, Shield, FileText, 
  CheckCircle2, TrendingUp, Info, Zap, MousePointer2
} from 'lucide-react';

/**
 * PRODUCTION RELEASE - giftingscout.com
 * Partner-ID: giftingscout-21 (Amazon.de)
 * SECURITY: API-Key wird über /api/scout serverseitig verarbeitet.
 */
const AMAZON_TAG = "giftingscout-21"; 
const MAX_INPUT_LENGTH = 280;

const FEATURED_PRODUCTS = [
  {
    name: "Kindle Paperwhite (16 GB)",
    brand: "Amazon",
    reason: "Der Klassiker für Vielleser. Jetzt mit verstellbarer Farbtemperatur und wasserfest.",
    price: "ca. 169€",
    search: "Kindle Paperwhite"
  },
  {
    name: "Philips Hue Smart Button Starter Set",
    brand: "Philips",
    reason: "Ideal für den Einstieg ins Smart Home. Erzeugt die perfekte Lichtstimmung per Klick.",
    price: "ca. 85€",
    search: "Philips Hue Starter Set"
  },
  {
    name: "Lego Architecture: Berlin Skyline",
    brand: "LEGO",
    reason: "Ein stilvolles Design-Objekt für das Büro oder Wohnzimmer. Perfekt für Ästheten.",
    price: "ca. 35€",
    search: "Lego Architecture Berlin"
  }
];

export default function App() {
  const [input, setInput] = useState('');
  const [occasion, setOccasion] = useState("Geburtstag");
  const [budget, setBudget] = useState("bis 50 Euro");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const resultsRef = useRef(null);

  const handleScout = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading || input.length > MAX_INPUT_LENGTH) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Proxy-Call an das eigene Backend (Sicher vor Key-Exposure)
      const response = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, occasion, budget })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || "API Limit / Server Error");
      }

      const data = await response.json();
      setResults(data);
      
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch (err) {
      setError("Der Scout braucht kurz Pause. Bitte versuche es gleich nochmal.");
    } finally {
      setLoading(false);
    }
  };

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="p-8 md:p-12 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X /></button>
          </div>
          <div className="text-zinc-400 text-sm leading-relaxed space-y-4">
            {children}
          </div>
          <div className="pt-6">
            <button onClick={onClose} className="w-full bg-white/5 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-colors">Schließen</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      <header className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setResults(null); setInput('');}}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Sparkles size={22} fill="white" />
          </div>
          <span className="text-xl font-black tracking-tighter italic uppercase">GiftingScout</span>
        </div>
        <div className="flex gap-6 items-center">
          <div className="hidden md:flex gap-4 items-center opacity-50 text-[10px] font-bold uppercase tracking-widest">
            <Globe size={12} /> Amazon.de Partner
          </div>
          {results && <button onClick={() => {setResults(null); setInput('');}} className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-all"><RotateCcw size={18} /></button>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20 space-y-24">
        
        <section className="text-center space-y-8 animate-in fade-in duration-1000">
          <div className="inline-block bg-indigo-500/10 border border-indigo-500/20 px-5 py-2 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] shadow-xl">
            AI-Marketplace Analysis 2026
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
            Schenke mit <br/><span className="text-indigo-500 italic">Verstand.</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-lg mx-auto font-medium">
            Unser Scout analysiert Echtzeit-Trends auf Amazon.de, um Geschenke zu finden, die wirklich begeistern.
          </p>
        </section>

        <section className="max-w-xl mx-auto bg-zinc-900/50 p-1 border border-white/10 rounded-[3rem] shadow-2xl relative">
          <div className="bg-[#0A0A0A] p-10 rounded-[2.9rem] space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Empfänger Profil</label>
                <span className={`text-[9px] font-bold tracking-widest ${input.length >= MAX_INPUT_LENGTH ? 'text-rose-500' : 'text-zinc-700'}`}>
                  {input.length} / {MAX_INPUT_LENGTH}
                </span>
              </div>
              <textarea 
                value={input} 
                onChange={e => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                placeholder="Beispiel: Mein Bruder, 30, Software-Entwickler, liebt mechanische Tastaturen..."
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-6 text-white focus:border-indigo-500 outline-none h-32 resize-none transition-all placeholder:text-zinc-800 shadow-inner"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-2">Anlass</label>
                 <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full bg-zinc-950 border border-white/5 rounded-xl p-4 text-xs font-bold outline-none appearance-none cursor-pointer hover:bg-zinc-900 transition-colors">
                   {["Geburtstag", "Jahrestag", "Hochzeit", "Dankeschön", "Einweihung", "Einfach so"].map(o => <option key={o}>{o}</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-2">Budget</label>
                 <select value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-zinc-950 border border-white/5 rounded-xl p-4 text-xs font-bold outline-none appearance-none cursor-pointer hover:bg-zinc-900 transition-colors">
                   {["bis 25 Euro", "bis 50 Euro", "bis 100 Euro", "Premium"].map(b => <option key={b}>{b}</option>)}
                 </select>
               </div>
            </div>

            <button 
              onClick={handleScout} disabled={loading || input.length === 0}
              className="w-full bg-indigo-600 py-6 rounded-2xl font-black text-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest"
            >
              {loading ? "SCOUTING..." : "ANALYSE STARTEN"}
            </button>
            {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-center text-xs font-bold">{error}</div>}
          </div>
        </section>

        <div ref={resultsRef} className="pb-40 scroll-mt-24 space-y-16">
          <div className="text-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 italic">
              {results ? "Deine personalisierten Funde" : "Aktuelle Trend-Entdeckungen auf Amazon.de"}
            </h3>
          </div>

          <div className="grid gap-12">
            {(results ? results.recommendations : FEATURED_PRODUCTS).map((item, i) => (
              <div key={i} className="group bg-zinc-900/40 border border-white/5 rounded-[4rem] overflow-hidden flex flex-col md:flex-row hover:bg-zinc-900 transition-all duration-700 shadow-xl">
                <div className="w-full md:w-80 aspect-square bg-zinc-800 relative overflow-hidden shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
                   <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700">
                     <Package size={48} className="text-indigo-500" />
                   </div>
                   <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 italic text-indigo-400">#ScoutPick</div>
                </div>

                <div className="flex-1 p-10 md:p-14 space-y-8 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                      <Star size={12} fill="currentColor" className="text-indigo-500" /> {item.brand}
                    </div>
                    <h4 className="text-4xl font-black text-white leading-tight tracking-tighter group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                    <p className="text-lg leading-relaxed text-zinc-500 max-w-2xl italic">"{item.reason}"</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-10 pt-6">
                    <div className="text-2xl font-black text-white bg-white/5 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
                      {item.price}
                    </div>
                    <a 
                      href={`https://www.amazon.de/s?k=${encodeURIComponent(item.search || item.name)}&tag=${AMAZON_TAG}`} 
                      target="_blank" rel="noopener noreferrer"
                      className="bg-white text-black px-10 py-5 rounded-2xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-3 uppercase tracking-widest"
                    >
                      Zum Produkt <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-32 px-6 border-t border-white/5 bg-[#030303]">
        <div className="max-w-4xl mx-auto space-y-12 text-center">
          <div className="flex items-center justify-center gap-4 opacity-20 grayscale">
             <Package size={24} />
             <span className="font-black text-sm tracking-[0.4em] uppercase">GiftingScout AI</span>
          </div>
          <div className="max-w-lg mx-auto">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-loose">
              Als Amazon-Partner verdiene ich an qualifizierten Verkäufen. Alle Empfehlungen werden durch KI-Analyse generiert.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">
            <button onClick={() => setActiveModal('impressum')} className="hover:text-white transition-colors">Impressum</button>
            <button onClick={() => setActiveModal('datenschutz')} className="hover:text-white transition-colors">Datenschutz</button>
            <button onClick={() => setActiveModal('support')} className="hover:text-white transition-colors">Support</button>
          </div>
          <p className="text-[9px] text-zinc-800 font-bold">© 2026 GIFTINGSCOUT.COM • Laurent Brand</p>
        </div>
      </footer>

      {activeModal === 'support' && (
        <Modal title="Support" onClose={() => setActiveModal(null)}>
          <div className="flex flex-col items-center gap-6 py-6 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center"><Mail size={32} /></div>
            <p className="text-lg">Fragen zu unseren Empfehlungen oder technische Probleme? Wir helfen dir gerne.</p>
            <a href="mailto:hello@giftingscout.com" className="text-indigo-400 font-black text-2xl hover:underline">hello@giftingscout.com</a>
          </div>
        </Modal>
      )}

      {activeModal === 'impressum' && (
        <Modal title="Impressum" onClose={() => setActiveModal(null)}>
          <p className="font-black text-white uppercase tracking-widest text-[11px]">Angaben gemäß § 5 TMG</p>
          <p>Laurent Brand<br />11, Viischt Huerkels<br />9673 Oberwampach</p>
          <p className="font-black text-white uppercase tracking-widest text-[11px] pt-4">Kontakt</p>
          <p>E-Mail: hello@giftingscout.com</p>
        </Modal>
      )}

      {activeModal === 'datenschutz' && (
        <Modal title="Datenschutz" onClose={() => setActiveModal(null)}>
          <p className="font-black text-white uppercase tracking-widest text-[11px]">1. Amazon Partnerprogramm</p>
          <p>Diese Webseite ist Teilnehmer am Partnerprogramm von Amazon EU. Wir nutzen Affiliate-Links.</p>
          <p className="font-black text-white uppercase tracking-widest text-[11px] pt-4">2. Cookies</p>
          <p>Amazon setzt beim Klicken auf Links Cookies ein, um die Herkunft der Bestellungen nachvollziehen zu können.</p>
          <p className="font-black text-white uppercase tracking-widest text-[11px] pt-4">3. KI-Nutzung</p>
          <p>Eingaben werden an Google Gemini übertragen. Es werden keine privaten Daten dauerhaft gespeichert.</p>
        </Modal>
      )}
    </div>
  );
}