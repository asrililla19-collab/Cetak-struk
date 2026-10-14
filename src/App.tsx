import React, { useState, useEffect, useCallback } from 'react';
import { ReceiptLayoutConfig, TransactionData, PresetTemplate } from './types';
import { DEFAULT_CONFIG, DEFAULT_TRANSACTION, PRESET_TEMPLATES } from './data/presets';
import { LayoutEditor } from './components/LayoutEditor';
import { TransactionEditor } from './components/TransactionEditor';
import { ReceiptPreview } from './components/ReceiptPreview';
import { HardwarePrintModal } from './components/HardwarePrintModal';
import { WindowsSetupGuideModal } from './components/WindowsSetupGuideModal';
import { generateEscPosData, downloadRawPrnFile } from './utils/escpos';
import {
  Printer,
  Scissors,
  Sliders,
  Receipt,
  RotateCcw,
  Download,
  Upload,
  Laptop,
  CheckCircle2,
  HelpCircle,
  FileDown,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function App() {
  // Application State
  const [activeView, setActiveView] = useState<'layout' | 'pos'>('layout');
  const [config, setConfig] = useState<ReceiptLayoutConfig>(() => {
    try {
      const saved = localStorage.getItem('thermal_receipt_config_58mm');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [transaction, setTransaction] = useState<TransactionData>(() => {
    try {
      const saved = localStorage.getItem('thermal_receipt_trx_58mm');
      return saved ? JSON.parse(saved) : DEFAULT_TRANSACTION;
    } catch {
      return DEFAULT_TRANSACTION;
    }
  });

  const [historyList, setHistoryList] = useState<TransactionData[]>(() => {
    try {
      const saved = localStorage.getItem('thermal_receipt_history_58mm');
      return saved ? JSON.parse(saved) : [DEFAULT_TRANSACTION];
    } catch {
      return [DEFAULT_TRANSACTION];
    }
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-retail');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isWindowsGuideOpen, setIsWindowsGuideOpen] = useState(false);
  const [isSimulatingCut, setIsSimulatingCut] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('thermal_receipt_config_58mm', JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem('thermal_receipt_trx_58mm', JSON.stringify(transaction));
    } catch (e) {
      console.error(e);
    }
  }, [transaction]);

  useEffect(() => {
    try {
      localStorage.setItem('thermal_receipt_history_58mm', JSON.stringify(historyList));
    } catch (e) {
      console.error(e);
    }
  }, [historyList]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Keyboard Shortcuts (F9 Print, F2 New Nota)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault();
        setIsPrintModalOpen(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveView('pos');
        showToast('Mode Kasir Aktif (F2)');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save current transaction to history
  const handleSaveToHistory = useCallback(() => {
    setHistoryList((prev) => {
      const filtered = prev.filter((t) => t.id !== transaction.id);
      return [transaction, ...filtered].slice(0, 30);
    });
    showToast(`Nota #${transaction.receiptNo} disimpan ke riwayat`);
  }, [transaction]);

  // Switch Preset Template
  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_TEMPLATES.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setConfig(found.config);
      setTransaction(found.sampleTransaction);
      showToast(`Template diubah ke: ${found.name}`);
    }
  };

  // Export Layout Config to JSON File
  const handleExportConfig = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `thermal-58mm-layout-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('File konfigurasi tata letak berhasil diunduh');
  };

  // Import Layout Config from JSON File
  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            setConfig({
              ...DEFAULT_CONFIG,
              ...parsed,
            });
            showToast('Konfigurasi tata letak berhasil diimpor!');
          }
        } catch {
          alert('Format file JSON tidak valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan tata letak ke pengaturan standar pabrik 58mm?')) {
      setConfig(DEFAULT_CONFIG);
      setTransaction(DEFAULT_TRANSACTION);
      showToast('Konfigurasi di-reset ke standar 58mm');
    }
  };

  // Test Auto-Cut simulation
  const triggerCutTest = () => {
    setIsSimulatingCut(true);
    showToast('Simulasi pisau Auto-Cut dijalankan!');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="no-print fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP BAR CONTRACT: Brand Wordmark - Clean Nav/Tools - Primary Action */}
      <header className="no-print border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight whitespace-nowrap">
                ThermalPrint 58mm
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                Windows Auto-Cut
              </span>
            </div>
          </div>

          {/* Zone 2: Preset Selector & Utilities */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            {/* Preset Selector */}
            <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-400 text-[11px]">Preset Usaha:</span>
              <select
                value={selectedPresetId}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="bg-transparent text-neutral-200 text-xs font-medium focus:outline-hidden cursor-pointer"
              >
                {PRESET_TEMPLATES.map((p) => (
                  <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Auto-Cut Button */}
            <button
              type="button"
              onClick={triggerCutTest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors border border-neutral-700/60"
              title="Uji Animasi Pemotong Kertas"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span className="whitespace-nowrap">Uji Auto-Cut</span>
            </button>

            {/* Windows Guide */}
            <button
              type="button"
              onClick={() => setIsWindowsGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors border border-neutral-700/60"
            >
              <Laptop className="w-3.5 h-3.5 text-emerald-400" />
              <span className="whitespace-nowrap">Panduan Windows</span>
            </button>
          </div>

          {/* Zone 3: Primary Print Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-emerald-600/30 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Nota</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-emerald-800/80 rounded font-mono text-[10px]">
                F9
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* SUB-HEADER / WORKSPACE TOOLBAR */}
      <div className="no-print bg-neutral-900 border-b border-neutral-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Mode Switcher: Layout Customizer vs POS Transaction Entry */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => setActiveView('layout')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeView === 'layout'
                  ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>1. Desain Tata Letak (Layout)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('pos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeView === 'pos'
                  ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>2. Input Kasir / Transaksi</span>
            </button>
          </div>

          {/* Quick Config Actions (Export / Import / Reset) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportConfig}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px]"
              title="Ekspor desain tata letak ke file JSON"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Ekspor JSON</span>
            </button>

            <label className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] cursor-pointer">
              <Upload className="w-3 h-3" />
              <span className="hidden sm:inline">Impor JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportConfig}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px]"
              title="Reset ke pengaturan awal 58mm"
            >
              <RotateCcw className="w-3 h-3 text-neutral-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE CANVAS */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ACTIVE EDITOR (LAYOUT or POS TRANSACTION) */}
        <div className="no-print lg:col-span-7 h-[calc(100vh-170px)] min-h-[580px]">
          {activeView === 'layout' ? (
            <LayoutEditor config={config} onChange={setConfig} />
          ) : (
            <TransactionEditor
              transaction={transaction}
              onChange={setTransaction}
              onSaveToHistory={handleSaveToHistory}
              historyList={historyList}
              onLoadFromHistory={setTransaction}
            />
          )}
        </div>

        {/* RIGHT COLUMN: REALISTIC 58MM THERMAL RECEIPT LIVE PREVIEW */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <ReceiptPreview
            config={config}
            transaction={transaction}
            isSimulatingCut={isSimulatingCut}
            onCutSimulationComplete={() => setIsSimulatingCut(false)}
          />

          {/* Quick Action Strip beneath the receipt */}
          <div className="no-print mt-4 flex items-center justify-center gap-2 w-full max-w-sm">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (F9)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const data = generateEscPosData(config, transaction);
                downloadRawPrnFile(data, `nota-${transaction.receiptNo || '58mm'}.prn`);
                showToast('File mentah .PRN diunduh');
              }}
              className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg border border-neutral-700 transition-colors"
              title="Unduh File .PRN untuk Windows"
            >
              <FileDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* HARDWARE PRINT MODAL */}
      <HardwarePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        config={config}
        transaction={transaction}
        onSimulateCut={triggerCutTest}
        onOpenWindowsGuide={() => {
          setIsPrintModalOpen(false);
          setIsWindowsGuideOpen(true);
        }}
      />

      {/* WINDOWS 10/11 CONFIGURATION GUIDE MODAL */}
      <WindowsSetupGuideModal
        isOpen={isWindowsGuideOpen}
        onClose={() => setIsWindowsGuideOpen(false)}
      />
    </div>
  );
}
