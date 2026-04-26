import { useState } from "react";
import axios from "axios";
import DiffViewer from "react-diff-viewer-continued";
import "./App.css";

const LogoIcon = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="title-icon" style={{ verticalAlign: "middle", marginRight: "12px", marginBottom: "8px" }}>
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00d2ff" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>

    {/* Left: < / */}
    <path d="M 18 55 L 4 45 L 18 35" stroke="#00d2ff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 28 60 L 34 30" stroke="#00d2ff" strokeWidth="7" strokeLinecap="round" />

    {/* Right: > */}
    <path d="M 82 35 L 96 45 L 82 55" stroke="#a855f7" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

    {/* Chat Bubble / Robot Head */}
    <path d="M 28 45 C 28 20, 72 20, 72 45 C 72 65, 55 68, 48 68 L 30 76 L 33 60 C 28 55, 28 50, 28 45 Z" fill="url(#logoGrad)" />
    
    {/* Dark Screen inside */}
    <rect x="34" y="34" width="32" height="24" rx="8" fill="#0b0b14" />

    {/* Cute Eyes: happy arches */}
    <path d="M 39 44 Q 42 39 45 44" stroke="#00d2ff" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M 55 44 Q 58 39 61 44" stroke="#00d2ff" strokeWidth="3" strokeLinecap="round" fill="none" />

    {/* Antenna */}
    <line x1="50" y1="23" x2="50" y2="12" stroke="#00d2ff" strokeWidth="5" strokeLinecap="round" />
    <circle cx="50" cy="8" r="5" fill="#00d2ff" />
  </svg>
);

function App() {
  const [code, setCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("errors");
  const [isCopied, setIsCopied] = useState(false);

  const analyze = async () => {
    try {
      setSubmittedCode(code);
      const res = await axios.post("https://ai-code-assistant-4oon.onrender.com/api/analyze", {
        code,
        language: "javascript"
      });

      setResult(res.data);
      setActiveTab("errors");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || "Error connecting to backend";
      alert("Error: " + msg);
    }
  };

  const copyToClipboard = () => {
    if (result && result.fixedCode) {
      navigator.clipboard.writeText(result.fixedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const customDiffStyles = {
    variables: {
      dark: {
        diffViewerBackground: '#11111a',
        diffViewerTitleBackground: '#11111a',
        diffViewerTitleBorderColor: 'rgba(255, 255, 255, 0.1)',
        addedBackground: 'rgba(52, 211, 153, 0.1)',
        addedColor: '#34d399',
        removedBackground: 'rgba(248, 113, 113, 0.1)',
        removedColor: '#f87171',
        wordAddedBackground: 'rgba(52, 211, 153, 0.2)',
        wordRemovedBackground: 'rgba(248, 113, 113, 0.2)',
        addedGutterBackground: 'rgba(52, 211, 153, 0.2)',
        removedGutterBackground: 'rgba(248, 113, 113, 0.2)',
        gutterBackground: '#0f0c29',
        gutterBackgroundDark: '#0f0c29',
        highlightBackground: '#0f0c29',
        highlightGutterBackground: '#0f0c29',
        codeFoldGutterBackground: '#0f0c29',
        codeFoldBackground: '#0f0c29',
        emptyLineBackground: '#11111a',
        gutterColor: '#6366f1',
        addedGutterColor: '#34d399',
        removedGutterColor: '#f87171',
      }
    },
    contentText: {
      fontFamily: "'JetBrains Mono', monospace",
    },
    diffRemoved: {
      borderLeft: '4px solid #f87171',
    },
    diffAdded: {
      borderLeft: '4px solid #34d399',
    }
  };

  const splitByLines = (text) => {
    if (!text) return [];
    if (typeof text === 'string') {
      return text.split('\n').filter(line => line.trim() !== '');
    }
    if (Array.isArray(text)) {
      return text;
    }
    return [String(text)];
  };

  return (
    <div className="app-container">
      <h1 className="title">
        <LogoIcon /> AI Code Assistant
      </h1>

      {/* INPUT SECTION */}
      <div className="glass-panel input-section">
        <div className="textarea-container">
          <textarea
            className="code-input"
            placeholder="Paste your source code here for analysis..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />
        </div>
        <button className="analyze-button" onClick={analyze}>
          Analyze Code
        </button>
      </div>

      {/* OUTPUT SECTION */}
      {result && (
        <div className="glass-panel fade-slide">
          <div className="tabs-header">
            <button 
              className={`tab-button error-tab ${activeTab === 'errors' ? 'active' : ''}`}
              onClick={() => setActiveTab('errors')}
            >
              Errors
            </button>
            <button 
              className={`tab-button fixed-tab ${activeTab === 'fixed' ? 'active' : ''}`}
              onClick={() => setActiveTab('fixed')}
            >
              Fixed Code
            </button>
            <button 
              className={`tab-button tips-tab ${activeTab === 'tips' ? 'active' : ''}`}
              onClick={() => setActiveTab('tips')}
            >
              Tips
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'errors' && (
              <div className="pill-container">
                {splitByLines(result.errors).length > 0 ? (
                  splitByLines(result.errors).map((err, i) => (
                    <div key={i} className="pill pill-error">{err}</div>
                  ))
                ) : (
                  <div className="pill pill-error">No errors detected.</div>
                )}
              </div>
            )}

            {activeTab === 'fixed' && (
              <div className="fixed-code-container">
                <button className="copy-button" onClick={copyToClipboard}>
                  {isCopied ? "Copied!" : "Copy Code"}
                </button>
                <div className="fixed-code-block">
                  {result.fixedCode || "No fixed code returned."}
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="pill-container">
                {splitByLines(result.suggestions).length > 0 ? (
                  splitByLines(result.suggestions).map((tip, i) => (
                    <div key={i} className="pill pill-tip">{tip}</div>
                  ))
                ) : (
                  <div className="pill pill-tip">No suggestions provided.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIFF VIEW */}
      {result && (
        <div className="glass-panel diff-section fade-slide" style={{ animationDelay: '0.2s' }}>
          <h2 className="diff-title">Code Diff</h2>
          <div className="custom-diff-container">
            <DiffViewer
              oldValue={submittedCode}
              newValue={result.fixedCode}
              splitView={true}
              useDarkTheme={true}
              styles={customDiffStyles}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;