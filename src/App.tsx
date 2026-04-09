import React, { useState, useEffect } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  BarChart3, 
  Lightbulb, 
  AlertCircle, 
  FileText, 
  Loader2, 
  ChevronRight,
  Database,
  BrainCircuit,
  TrendingUp
} from "lucide-react";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Paper {
  id: number;
  title: string;
  abstract: string;
  methodology: string;
  keywords: string[];
}

interface AnalysisResult {
  summary: string;
  trends: string[];
  gaps: string[];
  suggestions: string[];
}

export default function App() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [domain, setDomain] = useState("AI");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await fetch("/api/papers");
      const data = await response.json();
      setPapers(data);
    } catch (err) {
      console.error("Failed to fetch papers:", err);
      setError("Failed to load research database.");
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Filter papers based on topic/keywords if provided, otherwise use all
      const relevantPapers = papers.filter(p => {
        const searchStr = `${p.title} ${p.abstract} ${p.keywords.join(" ")}`.toLowerCase();
        const query = `${topic} ${keywords}`.toLowerCase().trim();
        return query === "" || query.split(" ").some(word => searchStr.includes(word));
      });

      const papersContext = relevantPapers.length > 0 ? relevantPapers : papers;
      
      const prompt = `
        Analyze the following research papers in the context of the user's interest:
        Topic: ${topic || "General Research"}
        Keywords: ${keywords || "N/A"}
        Domain: ${domain}

        1. Summarize key findings across these papers.
        2. Identify major research trends.
        3. Detect knowledge gaps (what's missing or under-researched).
        4. Suggest future research directions and specific ideas.

        Papers Data:
        ${JSON.stringify(papersContext, null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              trends: { type: Type.ARRAY, items: { type: Type.STRING } },
              gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["summary", "trends", "gaps", "suggestions"],
          },
        },
      });

      const analysisData = JSON.parse(response.text || "{}");
      setResult(analysisData);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("An error occurred during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tighter uppercase">Research Intelligence</h1>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-mono uppercase opacity-60">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>{papers.length} Papers Indexed</span>
          </div>
          <span>v1.0.42</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_#141414]">
            <h2 className="font-serif italic text-xl mb-6 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Analysis Parameters
            </h2>
            
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block text-[10px] font-mono uppercase opacity-50 mb-1">Research Topic</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Generative AI Ethics"
                  className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none focus:border-opacity-100 placeholder:opacity-30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase opacity-50 mb-1">Keywords</label>
                <input 
                  type="text" 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. bias, hallucination, clinical"
                  className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none focus:border-opacity-100 placeholder:opacity-30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase opacity-50 mb-1">Domain</label>
                <select 
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="AI">Artificial Intelligence</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Sustainability">Sustainability</option>
                  <option value="Quantum">Quantum Computing</option>
                  <option value="Robotics">Robotics</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#141414] text-[#E4E3E0] py-4 font-mono uppercase text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Research
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Paper List Preview */}
          <section className="bg-white/50 border border-[#141414] border-dashed p-6">
            <h3 className="text-[10px] font-mono uppercase opacity-50 mb-4">Latest Indexed Publications</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {papers.slice(0, 5).map(paper => (
                <div key={paper.id} className="group cursor-default">
                  <h4 className="text-xs font-bold group-hover:underline leading-tight mb-1">{paper.title}</h4>
                  <div className="flex flex-wrap gap-1">
                    {paper.keywords.slice(0, 2).map(k => (
                      <span key={k} className="text-[9px] font-mono bg-[#141414]/10 px-1">{k}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!result && !loading && !error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-[#141414]/20 rounded-xl"
              >
                <BrainCircuit className="w-16 h-16 mb-6 opacity-20" />
                <h2 className="text-2xl font-serif italic mb-2">Ready for Analysis</h2>
                <p className="text-sm opacity-60 max-w-md">
                  Enter a research topic or keywords to begin processing the indexed scientific publications.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-12"
              >
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#141414] rounded-full animate-ping" />
                  </div>
                </div>
                <p className="font-mono text-xs uppercase tracking-widest animate-pulse">
                  Synthesizing Knowledge Base...
                </p>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 p-6 flex gap-4 items-start"
              >
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800">Analysis Error</h3>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Summary Section */}
                <section className="bg-white border border-[#141414] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <FileText className="w-24 h-24" />
                  </div>
                  <h2 className="text-[10px] font-mono uppercase opacity-50 mb-4 flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    Executive Summary
                  </h2>
                  <p className="text-lg leading-relaxed font-serif">
                    {result.summary}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Trends Section */}
                  <section className="bg-white border border-[#141414] p-6">
                    <h2 className="text-[10px] font-mono uppercase opacity-50 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      Emerging Trends
                    </h2>
                    <ul className="space-y-4">
                      {result.trends.map((trend, i) => (
                        <li key={i} className="flex gap-3 items-start group">
                          <span className="text-[10px] font-mono opacity-30 mt-1">0{i+1}</span>
                          <span className="text-sm font-bold group-hover:translate-x-1 transition-transform">{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Knowledge Gaps Section */}
                  <section className="bg-white border border-[#141414] p-6">
                    <h2 className="text-[10px] font-mono uppercase opacity-50 mb-6 flex items-center gap-2">
                      <BarChart3 className="w-3 h-3" />
                      Knowledge Gaps
                    </h2>
                    <ul className="space-y-4">
                      {result.gaps.map((gap, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <div className="w-1 h-1 bg-[#141414] rounded-full mt-2 shrink-0" />
                          <span className="text-sm opacity-80">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* Suggestions Section */}
                <section className="bg-[#141414] text-[#E4E3E0] p-8">
                  <h2 className="text-[10px] font-mono uppercase opacity-40 mb-6 flex items-center gap-2">
                    <Lightbulb className="w-3 h-3" />
                    Strategic Research Directions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.suggestions.map((suggestion, i) => (
                      <div key={i} className="border border-[#E4E3E0]/20 p-4 hover:border-[#E4E3E0]/50 transition-colors">
                        <p className="text-sm italic font-serif">"{suggestion}"</p>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-12 border-t border-[#141414] p-8 text-center">
        <p className="text-[10px] font-mono uppercase opacity-40">
          © 2026 Research Intelligence Platform • Powered by Gemini 3 Flash
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #141414;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
