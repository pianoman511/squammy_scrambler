
import React, { useState, useRef, useEffect } from 'react';
import { processTextStream } from './services/geminiService';
import { HumanizationConfig, HumanizationTone, Intensity, HistoryItem, AppMode } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [config, setConfig] = useState<HumanizationConfig>({
    mode: AppMode.STEALTH,
    tone: HumanizationTone.NATURAL,
    intensity: Intensity.MEDIUM,
    preserveStructure: true
  });

  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('squammy_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputText]);

  const saveToHistory = (original: string, humanized: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      original,
      humanized,
      timestamp: Date.now()
    };
    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('squammy_history', JSON.stringify(updated));
  };

  const handleProcess = async () => {
    if (!inputText.trim() || isProcessing) return;
    setIsProcessing(true);
    setOutputText('');
    
    let fullOutput = '';
    try {
      await processTextStream(inputText, config, (chunk) => {
        fullOutput += chunk;
        setOutputText(prev => prev + chunk);
      });
      saveToHistory(inputText, fullOutput);
    } catch (err) {
      setOutputText('ERROR: CONNECTION TO FOREST_NODE_7 FAILED. CHECK API_KEY_PROTOCOL.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col max-w-6xl mx-auto space-y-4">
      {/* Terminal Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#33ff33] pb-2 glow-text">
        <div>
          <h1 className="text-3xl font-bold tracking-widest">SQUAMMY_SCRAMBLER v4.2</h1>
          <p className="text-sm opacity-70">LINGUISTIC_OBFUSCATION_MODULE: ONLINE</p>
        </div>
        <div className="text-right mt-2 md:mt-0 flex flex-col items-end">
          <div className="flex gap-4 mb-1">
            <p>SYS_TIME: {new Date().toLocaleTimeString()}</p>
          </div>
          <p>AUTH_LEVEL: ROOT_ACCESS</p>
        </div>
      </div>

      {/* Top Controls - Settings Row */}
      <div className="flex flex-wrap gap-6 py-4 text-sm border-b border-[#33ff33]/30">
        <div className="flex items-center gap-2">
          <span>[MODE]:</span>
          <button 
            onClick={() => setConfig({...config, mode: AppMode.STEALTH})}
            className={config.mode === AppMode.STEALTH ? 'bg-[#33ff33] text-black px-2' : 'px-2 border border-[#33ff33]'}
          >STEALTH</button>
          <button 
            onClick={() => setConfig({...config, mode: AppMode.MORPH})}
            className={config.mode === AppMode.MORPH ? 'bg-[#33ff33] text-black px-2' : 'px-2 border border-[#33ff33]'}
          >MORPH</button>
        </div>

        <div className="flex items-center gap-2">
          <span>[TONE]:</span>
          <select 
            value={config.tone}
            onChange={(e) => setConfig({...config, tone: e.target.value as HumanizationTone})}
            className="bg-transparent border border-[#33ff33] text-[#33ff33] px-2"
          >
            {Object.values(HumanizationTone).map(t => <option key={t} value={t} className="bg-black">{t.toUpperCase()}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>[DEPTH]:</span>
          {Object.values(Intensity).map(i => (
            <button 
              key={i}
              onClick={() => setConfig({...config, intensity: i})}
              className={config.intensity === i ? 'bg-[#33ff33] text-black px-2' : 'px-2 opacity-50'}
            >{i.toUpperCase()}</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span>[ARCHIVE]:</span>
          <button onClick={() => setShowHistory(!showHistory)} className="border border-[#33ff33] px-2 hover:bg-[#33ff33] hover:text-black">
            {showHistory ? 'CLOSE' : 'OPEN'}
          </button>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-[60vh]">
        {/* Input Terminal */}
        <div className="terminal-border flex flex-col p-4">
          <div className="flex justify-between border-b border-[#33ff33]/30 mb-2 pb-1 text-xs">
            <span>INPUT_BUFFER</span>
            <span>LEN: {inputText.length}</span>
          </div>
          <textarea
            autoFocus
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="> AWAITING_FOR_SQUAMMY_FOR_SCRAMBLING..."
            className="flex-1 w-full leading-relaxed"
          />
          <div className="mt-2 text-xs opacity-50">
            [ESC] CLEAR [CTRL+ENTER] RUN
          </div>
        </div>

        {/* Output Terminal */}
        <div className="terminal-border flex flex-col p-4 bg-[#33ff33]/5">
          <div className="flex justify-between border-b border-[#33ff33]/30 mb-2 pb-1 text-xs">
            <span>SCRAMBLED_STREAM_V_09</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(outputText);
                alert('TEXT_COPIED_TO_CLIPBOARD');
              }}
              className="hover:underline"
            >COPY_OUTPUT</button>
          </div>
          <div 
            ref={outputRef}
            className="flex-1 overflow-y-auto whitespace-pre-wrap leading-relaxed"
          >
            {outputText || (
              <span className="opacity-30 animate-pulse">_ WAITING_FOR_EXECUTION...</span>
            )}
            {isProcessing && <span className="bg-[#33ff33] w-2 h-5 inline-block animate-pulse ml-1"></span>}
          </div>
        </div>
      </div>

      {/* Execute Bar */}
      <div className="pt-4">
        <button
          onClick={handleProcess}
          disabled={isProcessing || !inputText.trim()}
          className="w-full py-4 text-2xl font-bold terminal-border glow-text hover:bg-[#33ff33] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isProcessing ? '>>> RUNNING_SCRAMBLE_PROTOCOL_0x42...' : `>>> EXECUTE_${config.mode.toUpperCase()}_PROTOCOL`}
        </button>
      </div>

      {/* Retro Archive Overlay */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-8 terminal-border m-4 md:m-12">
          <div className="flex justify-between items-center border-b border-[#33ff33] mb-4 pb-2 glow-text">
            <h2 className="text-2xl">Linguistic_Archives</h2>
            <button onClick={() => setShowHistory(false)} className="text-xl">[X]</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6">
            {history.length === 0 ? <p className="opacity-50">ARCHIVE_IS_EMPTY</p> : (
              history.map(item => (
                <div key={item.id} className="border border-[#33ff33]/30 p-4 hover:border-[#33ff33] cursor-pointer"
                  onClick={() => {
                    setInputText(item.original);
                    setOutputText(item.humanized);
                    setShowHistory(false);
                  }}
                >
                  <p className="text-xs mb-2 opacity-50">STAMP: {new Date(item.timestamp).toLocaleString()}</p>
                  <p className="line-clamp-2 italic opacity-40 mb-2">> {item.original}</p>
                  <p className="line-clamp-3">> {item.humanized}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Footer Log */}
      <footer className="text-[10px] opacity-40 py-4 flex justify-between">
        <div>SQUAMMY_OS_v4.2 // KERNEL: GEMINI_3_PRO // ENCRYPTION: ORGANIC_STOCHASTIC</div>
        <div>NO_TRACKING_ENABLED // LOGS_CLEAR_ON_RELOAD</div>
      </footer>
    </div>
  );
};

export default App;
