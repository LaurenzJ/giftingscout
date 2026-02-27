import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ShoppingBag, ExternalLink, Gift, X, 
  RotateCcw, Search, Star, Calendar, Heart,
  ChevronRight, Mail, Package, Globe, Shield, FileText, 
  CheckCircle2, TrendingUp, Info, Zap
} from 'lucide-react';

/**
 * PRODUCTION RELEASE - giftingscout.com
 * Partner-ID: giftingscout-21 (Amazon.de)
 * Optimiert für Vercel Deployment & Amazon Compliance.
 */
const AMAZON_TAG = "giftingscout-21"; 
const MAX_INPUT_LENGTH = 280;

const FEATURED_DEALS = [
  {
    name: "Kindle Paperwhite (16 GB)",
    brand: "Amazon",
    reason: "Der Goldstandard für E-Reader. Wasserfest und mit verstellbarer Farbtemperatur für perfektes Lesen.",
    price: "ca. 169,00 €",
    search: "Kindle Paperwhite 16GB"
  },
  {
    name: "Lego Architecture: New York City",
    brand: "LEGO",
    reason: "Ein zeitloses Design-Objekt für den Schreibtisch. Ideal für Fans von Architektur und Ästhetik.",
    price: "ca. 45,00 €",
    search: "Lego Architecture New York"
  },
  {
    name: "Philips Hue Starter Set",
    brand: "Philips Hue",
    reason: "Der ideale Einstieg in ein smartes Zuhause mit perfekt steuerbarer Lichtatmosphäre.",
    price: "ca. 85,00 €",
    search: "Philips Hue Bridge Starter"
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
      const response = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, occasion, budget })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || "Serverfehler");
      }

      const data = await response.json();
      setResults(data);
      
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch (err) {
      setError("Der Scout braucht kurz Pause. Bitte versuche es in einer Minute nochmal.");
      console.error("Scout Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[100] backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] max-w-2xl w-full my-8 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase italic tracking-tighter">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X /></button>
        </div>
        <div className="p-8 md:p-12 text-zinc-400 text-sm leading-relaxed space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {children}
        </div>
        <div className="p-6 bg-zinc-950/50">
          <button onClick={onClose} className="w-full bg-zinc-800 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-all">Schließen</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Top Banner */}
      <div className="bg-zinc-900 border-b border-white/5 py-3 px-6 flex items-center justify-between text-[10px] font-black tracking-widest text-zinc-500 uppercase">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_indigo]" />
          Engine Status: Online (Amazon.de Partner)
        </div>
        <div className="flex items-center gap-4 opacity-50">
          <Globe size={12} /> Region: DE | EUR
        </div>
      </div>

      <header className="p-6 md:px-12 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setResults(null); setInput('');}}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Sparkles size={22} fill="white" />
          </div>
          <span className="text-xl font-black tracking-tighter italic uppercase">GiftingScout</span>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setActiveModal('support')} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest hidden md:block">Support</button>
           {results && <button onClick={() => {setResults(null); setInput('');}} className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-all"><RotateCcw size={18} /></button>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20 space-y-28">
        
        {/* Branding Hero */}
        <section className="text-center space-y-10 animate-in fade-in duration-1000">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-white/10 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
             <Zap size={14} fill="currentColor" /> AI-Marketplace Analysis
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">
            Schenke mit <br/><span className="text-indigo-500 italic underline decoration-white/5">Präzision.</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto font-medium">
            GiftingScout analysiert Trends auf Amazon.de, um basierend auf deinem Profil das perfekte Geschenk zu finden.
          </p>
        </section>

        {/* Scout Interface */}
        <section className="max-w-xl mx-auto relative group">
          <div className="absolute -inset-2 bg-indigo-500/10 rounded-[3.2rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="bg-[#0A0A0A] p-10 border border-white/10 rounded-[3.2rem] space-y-8 relative shadow-2xl">
            <div className="space-y-4">
              <div className="flex justify-between items-end px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Empfänger Profil</label>
                <span className={`text-[9px] font-bold tracking-widest ${input.length >= MAX_INPUT_LENGTH ? 'text-rose-500 font-black animate-pulse' : 'text-zinc-700'}`}>
                  {input.length} / {MAX_INPUT_LENGTH}
                </span>
              </div>
              <textarea 
                value={input} 
                onChange={e => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                placeholder="Beispiel: Meine Schwester, 25, liebt Architektur und mechanische Tastaturen..."
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-6 text-white focus:border-indigo-500 outline-none h-32 resize-none transition-all placeholder:text-zinc-800 shadow-inner"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-2">Anlass</label>
                 <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full bg-zinc-950 border border-white/5 rounded-xl p-4 text-xs font-bold outline-none cursor-pointer hover:bg-zinc-900 transition-colors">
                   {["Geburtstag", "Valentinstag", "Jahrestag", "Hochzeit", "Dankeschön", "Abschluss", "Einfach so"].map(o => <option key={o}>{o}</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-2">Budget</label>
                 <select value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-zinc-950 border border-white/5 rounded-xl p-4 text-xs font-bold outline-none cursor-pointer hover:bg-zinc-900 transition-colors">
                   {["bis 25 €", "bis 50 €", "bis 100 €", "Premium"].map(b => <option key={b}>{b}</option>)}
                 </select>
               </div>
            </div>

            <button 
              onClick={handleScout} disabled={loading || input.length === 0}
              className="w-full bg-indigo-600 py-6 rounded-2xl font-black text-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest"
            >
              {loading ? "SCOUTING..." : "ANALYSE STARTEN"}
            </button>
            {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-center text-xs font-bold animate-pulse">{error}</div>}
          </div>
        </section>

        {/* Results Deck */}
        <div ref={resultsRef} className="pb-40 scroll-mt-24 space-y-16">
          <div className="text-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">
              {results ? "Deine personalisierten Vorschläge" : "Aktuelle Trend-Entdeckungen auf Amazon.de"}
            </h3>
          </div>

          <div className="grid gap-12">
            {(results ? results.recommendations : FEATURED_DEALS).map((item, i) => (
              <div key={i} className="group bg-zinc-900/40 border border-white/5 rounded-[4rem] overflow-hidden flex flex-col md:flex-row hover:bg-zinc-900 transition-all duration-700 shadow-xl">
                
                {/* Visual Area */}
                <div className="w-full md:w-80 aspect-square bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/5 shrink-0 overflow-hidden">
                   <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700">
                     <Package size={48} className="text-indigo-500" />
                   </div>
                   <div className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">ID: GS-{(i+1)*21}</div>
                   <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-xl px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 italic text-indigo-400">
                      Expert Choice
                   </div>
                </div>

                {/* Info Panel */}
                <div className="flex-1 p-10 md:p-14 space-y-8 flex flex-col justify-center overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                      <Star size={12} fill="currentColor" className="text-indigo-500" /> {item.brand}
                    </div>
                    {/* Fix für Überläufe: line-clamp sorgt für sauberen Umbruch */}
                    <h4 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tighter line-clamp-2 break-words">{item.name}</h4>
                    <p className="text-lg leading-relaxed text-zinc-500 italic line-clamp-3">"{item.reason}"</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-10 pt-4">
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

      <footer className="py-40 px-10 border-t border-white/5 bg-black">
        <div className="max-w-4xl mx-auto space-y-16 text-center">
          <div className="flex items-center justify-center gap-6 opacity-30 grayscale hover:opacity-50 transition-opacity">
             <Package size={32} />
             <span className="font-black text-xl tracking-[0.4em] uppercase">GiftingScout AI</span>
          </div>
          
          <div className="max-w-xl mx-auto">
            <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-[0.2em] leading-loose">
              Als Amazon-Partner verdiene ich an qualifizierten Verkäufen. Alle Produktempfehlungen auf dieser Seite werden durch KI-Analyse generiert und regelmäßig aktualisiert.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">
            <button onClick={() => setActiveModal('impressum')} className="hover:text-white transition-colors decoration-indigo-500 underline underline-offset-8 decoration-2">Impressum</button>
            <button onClick={() => setActiveModal('datenschutz')} className="hover:text-white transition-colors decoration-indigo-500 underline underline-offset-8 decoration-2">Datenschutz</button>
            <button onClick={() => setActiveModal('support')} className="hover:text-white transition-colors decoration-indigo-500 underline underline-offset-8 decoration-2">Support</button>
          </div>
          
          <p className="text-[9px] text-zinc-800 font-bold tracking-widest uppercase">© 2026 GIFTINGSCOUT.COM • MADE BY LAURENT BRAND</p>
        </div>
      </footer>

      {/* Modals */}
      {activeModal === 'support' && (
        <Modal title="Support Center" onClose={() => setActiveModal(null)}>
          <div className="flex flex-col items-center gap-8 py-8 text-center">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center shadow-xl border border-white/5"><Mail size={40} className="text-indigo-500" /></div>
            <p className="text-xl">Du hast Fragen zu unseren Empfehlungen oder technische Probleme? Unser Team hilft dir gerne persönlich weiter.</p>
            <a href="mailto:hello@giftingscout.com" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-indigo-500 transition-all shadow-xl">hello@giftingscout.com</a>
          </div>
        </Modal>
      )}

      {activeModal === 'impressum' && (
        <Modal title="Impressum" onClose={() => setActiveModal(null)}>
          <div className="space-y-8 text-left">
            <section>
              <h3 className="font-black text-white uppercase tracking-widest text-xs mb-3">Angaben gemäß § 5 TMG</h3>
              <p className="text-lg">
                Laurent Brand<br />
                11, Viischt Huerkels<br />
                9673 Oberwampach
              </p>
            </section>
            <section>
              <h3 className="font-black text-white uppercase tracking-widest text-xs mb-3">Kontakt</h3>
              <p className="text-lg">E-Mail: hello@giftingscout.com</p>
            </section>
            <section className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h3 className="font-black text-white uppercase tracking-widest text-[10px] mb-2">Haftungsausschluss</h3>
              <p className="text-xs">Unser Angebot enthält Links zu externen Webseiten Dritter (Amazon.de), auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.</p>
            </section>
          </div>
        </Modal>
      )}

      {activeModal === 'datenschutz' && (
        <Modal title="Datenschutzerklärung" onClose={() => setActiveModal(null)}>
          <div className="space-y-8 text-left">
            <section>
              <h3 className="font-black text-white uppercase tracking-widest text-xs mb-3 italic">1. Amazon Partnerprogramm</h3>
              <p>GiftingScout.com ist Teilnehmer am Partnerprogramm von Amazon EU. Wir nutzen Affiliate-Links. Wenn du über diese Links kaufst, erhält der Betreiber eine Provision. Der Preis für dich bleibt identisch.</p>
            </section>
            <section>
              <h3 className="font-black text-white uppercase tracking-widest text-xs mb-3 italic">2. Cookies & Tracking</h3>
              <p>Amazon setzt beim Klicken auf Produktlinks Cookies ein, um die Herkunft der Bestellungen nachvollziehen zu können. Wir selbst speichern keine personenbezogenen Daten über den Analyseprozess hinaus.</p>
            </section>
            <section>
              <h3 className="font-black text-white uppercase tracking-widest text-xs mb-3 italic">3. Google Gemini API</h3>
              <p>Die von dir eingegebenen Profile werden an Google Gemini übertragen, um Geschenkideen zu generieren. Hierbei werden keine privaten Daten dauerhaft durch uns gespeichert.</p>
            </section>
          </div>
        </Modal>
      )}
    </div>
  );
}