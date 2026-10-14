import React, { useState } from 'react';
import { ReceiptLayoutConfig, TransactionData } from '../types';
import {
  generateEscPosData,
  generateDiagnosticTest,
  printViaWebSerial,
  downloadRawPrnFile,
  formatRupiah,
} from '../utils/escpos';
import {
  Printer,
  Scissors,
  Download,
  Terminal,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface HardwarePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ReceiptLayoutConfig;
  transaction: TransactionData;
  onSimulateCut: () => void;
  onOpenWindowsGuide: () => void;
}

export const HardwarePrintModal: React.FC<HardwarePrintModalProps> = ({
  isOpen,
  onClose,
  config,
  transaction,
  onSimulateCut,
  onOpenWindowsGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'serial' | 'prn' | 'hex'>('standard');
  const [serialStatus, setSerialStatus] = useState<{ loading: boolean; msg?: string; isError?: boolean }>({
    loading: false,
  });

  if (!isOpen) return null;

  // Execute standard Windows Print
  const handleWindowsPrint = () => {
    onSimulateCut();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Direct Web Serial Print
  const handleSerialPrint = async (isTestDiagnostic: boolean = false) => {
    setSerialStatus({ loading: true });
    try {
      const data = isTestDiagnostic
        ? generateDiagnosticTest(config.characterWidth || 32)
        : generateEscPosData(config, transaction);

      const res = await printViaWebSerial(data);
      if (res.success) {
        onSimulateCut();
        setSerialStatus({ loading: false, msg: res.message, isError: false });
      } else {
        setSerialStatus({ loading: false, msg: res.message, isError: true });
      }
    } catch (e: any) {
      setSerialStatus({ loading: false, msg: e.message || 'Gagal koneksi serial', isError: true });
    }
  };

  // Download .PRN file
  const handleDownloadPrn = () => {
    const data = generateEscPosData(config, transaction);
    const filename = `nota-${transaction.receiptNo || '58mm'}.prn`;
    downloadRawPrnFile(data, filename);
  };

  // Generate Hex for inspect
  const escPosData = generateEscPosData(config, transaction);
  const hexPreview = Array.from(escPosData)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-100 text-sm">
                Cetak Nota Thermal 58mm
              </h3>
              <p className="text-[11px] text-neutral-400">
                Dukungan Windows Driver, Auto-Cut Hardware, & ESC/POS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('standard')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'standard'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Windows Print (Standar)
          </button>
          <button
            onClick={() => setActiveTab('serial')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'serial'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Direct USB / Serial (Hardware Auto-Cut)
          </button>
          <button
            onClick={() => setActiveTab('prn')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'prn'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            File Mentah (.PRN)
          </button>
          <button
            onClick={() => setActiveTab('hex')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'hex'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Kode ESC/POS Hex
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4 text-xs">
          {/* TAB 1: STANDARD WINDOWS PRINT */}
          {activeTab === 'standard' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-2">
                <div className="font-semibold text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Siap Mencetak ke Printer Thermal 58mm
                </div>
                <p className="text-neutral-300 text-[11.5px] leading-relaxed">
                  Aplikasi telah dikonfigurasi dengan layout presisi 58mm, teks kontras tinggi, dan tanpa margin tepi yang mengganggu.
                </p>
              </div>

              {/* Windows Print Settings Checklist */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2 text-[11px]">
                <div className="font-semibold text-neutral-200 flex items-center justify-between">
                  <span>Panduan Pengaturan Kotak Dialog Windows Print:</span>
                  <button
                    type="button"
                    onClick={onOpenWindowsGuide}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-normal"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Panduan Lengkap Windows
                  </button>
                </div>
                <ul className="space-y-1.5 text-neutral-400 pl-4 list-disc">
                  <li>
                    <strong className="text-neutral-200">Tujuan (Destination):</strong> Pilih printer thermal Anda (contoh: <em>POS-58</em>, <em>Xprinter</em>, atau <em>EPSON TM</em>).
                  </li>
                  <li>
                    <strong className="text-neutral-200">Ukuran Kertas (Paper Size):</strong> Pilih <em>58mm x 210mm</em> atau <em>Roll Paper / Continuous</em>.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Margin:</strong> Ubah ke <span className="text-amber-300">None / Tidak ada</span>.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Header & Footer:</strong> <span className="text-amber-300">Hapus centang</span> agar tanggal browser dan URL tidak tercetak.
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-neutral-400 text-[11px]">
                  Status Auto-Cut: <strong className="text-neutral-200">{config.autoCut ? 'Aktif (Hardware)' : 'Mati'}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleWindowsPrint}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center gap-2 text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Buka Dialog Cetak Windows
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: WEB SERIAL HARDWARE */}
          {activeTab === 'serial' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
                <div className="font-semibold text-neutral-200 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-emerald-400" />
                  Kirim Perintah Auto-Cut Hardware via COM Port / USB
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Printer thermal USB di Windows umumnya terdeteksi sebagai port COM virtual (misal COM3/COM4). Mode ini mengirim sinyal ESC/POS mentah secara instan langsung ke mikrokontroler printer sehingga pisau <strong>Auto-Cut</strong> (`GS V 66 04`) dan laci uang otomatis terpicu secara fisik!
                </p>
              </div>

              {serialStatus.msg && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    serialStatus.isError
                      ? 'bg-red-950/40 border-red-800 text-red-300'
                      : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  }`}
                >
                  {serialStatus.isError ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{serialStatus.msg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={serialStatus.loading}
                  onClick={() => handleSerialPrint(false)}
                  className="p-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-left transition-colors flex flex-col justify-between"
                >
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <Printer className="w-4 h-4" />
                    Cetak Nota Sekarang
                  </div>
                  <div className="text-[10px] text-emerald-200 mt-1">
                    Cetak nota lengkap + pelatuk Auto-Cut kertas
                  </div>
                </button>

                <button
                  type="button"
                  disabled={serialStatus.loading}
                  onClick={() => handleSerialPrint(true)}
                  className="p-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 rounded-lg text-left transition-colors flex flex-col justify-between border border-neutral-700"
                >
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <Scissors className="w-4 h-4 text-amber-400" />
                    Uji Coba Auto-Cut (Diagnostik)
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    Cetak mistar 32 karakter & potong kertas untuk tes pisau
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOWNLOAD .PRN */}
          {activeTab === 'prn' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
                <div className="font-semibold text-neutral-200 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  File Cetak Biner Windows (.PRN / .BIN)
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Anda dapat mengunduh file biner ESC/POS yang siap dikirim langsung ke port printer thermal Windows melalui Command Prompt (CMD) tanpa melalui driver grafis.
                </p>
              </div>

              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-300 space-y-1">
                <div className="text-neutral-500">// Perintah CMD Windows untuk mencetak file PRN:</div>
                <div className="text-emerald-400">copy /b nota-transaksi-58mm.prn \\localhost\POS58</div>
              </div>

              <button
                type="button"
                onClick={handleDownloadPrn}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" />
                Unduh File nota-{transaction.receiptNo || '58mm'}.prn
              </button>
            </div>
          )}

          {/* TAB 4: ESC/POS HEX INSPECTOR */}
          {activeTab === 'hex' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-neutral-400 text-[11px]">
                <span>Biner ESC/POS Generator ({escPosData.length} bytes):</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(hexPreview);
                    alert('Hex ESC/POS berhasil disalin ke clipboard!');
                  }}
                  className="text-emerald-400 hover:underline"
                >
                  Salin Hex
                </button>
              </div>
              <div className="bg-black/90 p-3 rounded-lg border border-neutral-800 font-mono text-[10px] text-emerald-400 h-44 overflow-y-auto leading-relaxed break-all select-all">
                {hexPreview}
              </div>
              <div className="text-[10px] text-neutral-400">
                Keterangan opcode: <code>1B 40</code> (Inisialisasi), <code>1D 56 42 04</code> (Feed 4 baris & Auto-Cut).
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Ukuran Roll: 58 mm (Lebar Cetak ~48 mm)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
