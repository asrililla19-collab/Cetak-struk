import React from 'react';
import { X, Check, Laptop, HelpCircle, Scissors, Settings, ExternalLink } from 'lucide-react';

interface WindowsSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsSetupGuideModal: React.FC<WindowsSetupGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-neutral-100 text-sm">
                Panduan Setting Printer Thermal 58mm & Auto-Cut di Windows
              </h3>
              <p className="text-[11px] text-neutral-400">
                Langkah-langkah konfigurasi Windows 10/11 agar cetak 58mm pas dan pisau auto-cut berfungsi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs leading-relaxed text-neutral-300">
          {/* Step 1 */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
            <div className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">
                1
              </span>
              Setting Ukuran Kertas di Driver Windows (Control Panel)
            </div>
            <p className="text-neutral-400">
              Secara bawaan, Windows sering mengatur kertas printer thermal ke Letter/A4. Agar struk tidak membuang kertas panjang:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-neutral-300">
              <li>
                Buka <strong>Control Panel</strong> &gt; <strong>Devices and Printers</strong> (atau <em>Printers & scanners</em> di Windows Settings).
              </li>
              <li>
                Klik kanan printer thermal Anda (misal: <em>POS-58</em> / <em>XP-58</em>), pilih <strong>Printing Preferences</strong>.
              </li>
              <li>
                Pada tab <strong>Layout / Paper/Quality</strong> &gt; klik <strong>Advanced</strong>.
              </li>
              <li>
                Pilih ukuran kertas: <span className="text-amber-300 font-medium">58mm x 210mm</span> atau <span className="text-amber-300 font-medium">58mm x Receipt</span> / Roll.
              </li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
            <div className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">
                2
              </span>
              Mengaktifkan Auto-Cut di Driver Windows
            </div>
            <p className="text-neutral-400">
              Jika menggunakan driver bawaan vendor (Xprinter, Epson, POS-58 Driver):
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-neutral-300">
              <li>
                Buka <strong>Printer Properties</strong> (Properties Printer).
              </li>
              <li>
                Buka tab <strong>Device Settings</strong> (Pengaturan Perangkat).
              </li>
              <li>
                Cari opsi <strong>Cut Paper</strong> / <strong>Cutter Mode</strong>.
              </li>
              <li>
                Ubah dari <em>No Cut</em> menjadi <span className="text-emerald-400 font-bold">Document Cut</span> atau <span className="text-emerald-400 font-bold">Page Cut</span>.
              </li>
              <li>
                Jika printer mendukung laci uang (cash drawer), pilih juga opsi <strong>Open Cash Drawer</strong>: <em>Before Print</em> atau <em>After Print</em>.
              </li>
            </ol>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
            <div className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">
                3
              </span>
              Pengaturan Dialog Cetak Browser (Chrome / Edge di Windows)
            </div>
            <p className="text-neutral-400">
              Saat menekan tombol <strong>Cetak Nota (F9)</strong>, perhatikan opsi berikut:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-300">
              <li>
                <strong>Margins (Batas):</strong> Wajib pilih <span className="text-amber-300 font-bold">None</span> agar teks struk tidak tergeser ke kanan.
              </li>
              <li>
                <strong>Headers and footers:</strong> <span className="text-red-400 font-bold">Hilangkan centang</span> agar tanggal dan URL situs tidak muncul di atas/bawah nota.
              </li>
              <li>
                <strong>Scale (Skala):</strong> Pilih <em>Default</em> atau <em>100%</em>.
              </li>
            </ul>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
            <div className="font-bold text-neutral-200">Tombol Pintas Kasir Windows (Keyboard Shortcuts)</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-neutral-900 p-2 rounded border border-neutral-800 flex justify-between">
                <span className="text-emerald-400 font-bold">F9</span>
                <span className="text-neutral-300">Cetak Nota Langsung</span>
              </div>
              <div className="bg-neutral-900 p-2 rounded border border-neutral-800 flex justify-between">
                <span className="text-emerald-400 font-bold">Ctrl + P</span>
                <span className="text-neutral-300">Buka Menu Cetak</span>
              </div>
              <div className="bg-neutral-900 p-2 rounded border border-neutral-800 flex justify-between">
                <span className="text-emerald-400 font-bold">F2</span>
                <span className="text-neutral-300">Buat Nota Baru Kosong</span>
              </div>
              <div className="bg-neutral-900 p-2 rounded border border-neutral-800 flex justify-between">
                <span className="text-emerald-400 font-bold">Esc</span>
                <span className="text-neutral-300">Tutup Pop-up / Batal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
