import React, { useState } from 'react';
import {
  ReceiptLayoutConfig,
  ItemLayoutMode,
  SeparatorStyle,
  TotalHighlightStyle,
  FontStyle,
  AutoCutType,
  LogoAlignment,
} from '../types';
import {
  Store,
  FileText,
  ShoppingBag,
  Calculator,
  MessageSquare,
  QrCode,
  Printer,
  Scissors,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Upload,
  Trash2,
  Sliders,
} from 'lucide-react';

interface LayoutEditorProps {
  config: ReceiptLayoutConfig;
  onChange: (updated: ReceiptLayoutConfig) => void;
}

type TabCategory =
  | 'header'
  | 'meta'
  | 'items'
  | 'calc'
  | 'notes'
  | 'barcode'
  | 'hardware';

export const LayoutEditor: React.FC<LayoutEditorProps> = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = useState<TabCategory>('hardware');

  const update = <K extends keyof ReceiptLayoutConfig>(key: K, value: ReceiptLayoutConfig[K]) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  // Handle Logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({
            ...config,
            showLogo: true,
            logoUrl: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Editor Header Navigation / Pills */}
      <div className="p-3 bg-neutral-950 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-neutral-100 tracking-tight">
              Kustomisasi Desain Tata Letak
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            58mm Thermal POS
          </span>
        </div>

        {/* Tab Strip */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-[11px] font-medium">
          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'hardware'
                ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Auto-Cut</span>
          </button>

          <button
            onClick={() => setActiveTab('header')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'header'
                ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Toko</span>
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'items'
                ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Barang</span>
          </button>

          <button
            onClick={() => setActiveTab('calc')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'calc'
                ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Total</span>
          </button>

          <button
            onClick={() => setActiveTab('meta')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'meta'
                ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Info</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'notes'
                ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Footer</span>
          </button>

          <button
            onClick={() => setActiveTab('barcode')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'barcode'
                ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">QR/Barcode</span>
          </button>
        </div>
      </div>

      {/* Tab Content Panes */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* TAB 1: HARDWARE & AUTO-CUT */}
        {activeTab === 'hardware' && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-neutral-200 text-sm">
                    Fitur Auto-Cut Kertas (Pisau Pemotong)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoCut}
                    onChange={(e) => update('autoCut', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {config.autoCut && (
                <div className="space-y-3 pt-2 border-t border-neutral-800/80">
                  <div>
                    <label className="block text-neutral-300 mb-1.5 font-medium">
                      Mode Perintah Auto-Cut
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => update('autoCutType', 'feed_and_cut')}
                        className={`p-2 rounded-lg text-left border transition-all ${
                          config.autoCutType === 'feed_and_cut'
                            ? 'bg-neutral-800 border-emerald-500 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs">Feed & Partial Cut</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          Tarik kertas dulu lalu potong sebagian (Rekomendasi)
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => update('autoCutType', 'partial')}
                        className={`p-2 rounded-lg text-left border transition-all ${
                          config.autoCutType === 'partial'
                            ? 'bg-neutral-800 border-emerald-500 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs">Partial Cut</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          Potong kertas menyisakan kait kecil (GS V 1)
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => update('autoCutType', 'full')}
                        className={`p-2 rounded-lg text-left border transition-all ${
                          config.autoCutType === 'full'
                            ? 'bg-neutral-800 border-emerald-500 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs">Full Cut</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          Potong total putus langsung (GS V 0 / ESC i)
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-neutral-300 font-medium">
                        Feed Baris Kosong Sebelum Potong
                      </label>
                      <span className="font-mono text-emerald-400 font-bold">
                        {config.feedLinesBeforeCut} baris
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      step={1}
                      value={config.feedLinesBeforeCut}
                      onChange={(e) => update('feedLinesBeforeCut', Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-neutral-800"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Penting agar isi nota terdorong keluar melewati pisau fisik printer sebelum dipotong.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-neutral-300">Tampilkan Garis Panduan Cut di Pratinjau</span>
                    <input
                      type="checkbox"
                      checked={config.visualCutterGuide}
                      onChange={(e) => update('visualCutterGuide', e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cash Drawer Settings */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-200">Buka Laci Uang (Cash Drawer Kick)</span>
                <input
                  type="checkbox"
                  checked={config.openCashDrawer}
                  onChange={(e) => update('openCashDrawer', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </div>
              {config.openCashDrawer && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800 text-[11px]">
                  <div>
                    <label className="block text-neutral-400 mb-1">Pin Port RJ11</label>
                    <select
                      value={config.drawerPin}
                      onChange={(e) => update('drawerPin', e.target.value as any)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
                    >
                      <option value="pin2">Pin 2 (Standar Epson/POS-58)</option>
                      <option value="pin5">Pin 5 (Alternatif Drawer)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Waktu Pelatuk</label>
                    <select
                      value={config.drawerTiming}
                      onChange={(e) => update('drawerTiming', e.target.value as any)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
                    >
                      <option value="before">Sebelum Nota Dicetak</option>
                      <option value="after">Setelah Nota & Auto-Cut</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Typography & Separator */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
              <span className="font-semibold text-neutral-200 block">
                Format Kertas & Font Thermal
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Ukuran Kertas Roll</label>
                  <select
                    value={config.paperWidth}
                    onChange={(e) => {
                      const w = Number(e.target.value) as 58 | 80;
                      onChange({
                        ...config,
                        paperWidth: w,
                        characterWidth: w === 58 ? 32 : 48,
                      });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-neutral-200"
                  >
                    <option value={58}>58 mm (32 Kolom Karakter)</option>
                    <option value={80}>80 mm (48 Kolom Karakter)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Gaya Font Nota</label>
                  <select
                    value={config.fontStyle}
                    onChange={(e) => update('fontStyle', e.target.value as FontStyle)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-neutral-200"
                  >
                    <option value="monospace">Thermal Monospace (Standar)</option>
                    <option value="dot_matrix">Retro Dot Matrix</option>
                    <option value="receipt_sans">Modern Sans Crisp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Model Garis Pemisah (Divider)</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center">
                  {(['dashed', 'dotted', 'double', 'solid', 'stars'] as SeparatorStyle[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => update('separatorStyle', style)}
                      className={`p-1.5 rounded border text-[11px] font-mono transition-all ${
                        config.separatorStyle === style
                          ? 'bg-neutral-800 border-emerald-500 text-emerald-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {style === 'dashed' && '- - -'}
                      {style === 'dotted' && '. . .'}
                      {style === 'double' && '====='}
                      {style === 'solid' && '─────'}
                      {style === 'stars' && '*****'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HEADER & LOGO */}
        {activeTab === 'header' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="font-semibold text-neutral-200">Tampilkan Bagian Header Toko</span>
              <input
                type="checkbox"
                checked={config.showHeader}
                onChange={(e) => update('showHeader', e.target.checked)}
                className="accent-emerald-500 w-4 h-4 rounded"
              />
            </div>

            {config.showHeader && (
              <>
                <div>
                  <label className="block text-neutral-400 mb-1">Nama Toko / Usaha</label>
                  <input
                    type="text"
                    value={config.storeName}
                    onChange={(e) => update('storeName', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-100 font-medium"
                    placeholder="Contoh: TOKO BERKAH JAYA"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Slogan / Tagline Usaha</label>
                  <input
                    type="text"
                    value={config.tagline}
                    onChange={(e) => update('tagline', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-100"
                    placeholder="Contoh: Belanja Hemat & Lengkap"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    value={config.address}
                    onChange={(e) => update('address', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-100 text-xs"
                    placeholder="Alamat toko atau cabang"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={config.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-100"
                    placeholder="Contoh: WA: 0812-3456-7890"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Posisi Teks Header</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => update('headerAlignment', 'center')}
                      className={`py-1.5 rounded border text-xs ${
                        config.headerAlignment === 'center'
                          ? 'bg-neutral-800 border-emerald-500 text-white font-medium'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      Rata Tengah (Center)
                    </button>
                    <button
                      type="button"
                      onClick={() => update('headerAlignment', 'left')}
                      className={`py-1.5 rounded border text-xs ${
                        config.headerAlignment === 'left'
                          ? 'bg-neutral-800 border-emerald-500 text-white font-medium'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      Rata Kiri (Left)
                    </button>
                  </div>
                </div>

                {/* LOGO SECTION */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2.5 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-400" /> Logo Toko
                    </span>
                    <input
                      type="checkbox"
                      checked={config.showLogo}
                      onChange={(e) => update('showLogo', e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                  </div>

                  {config.showLogo && (
                    <div className="space-y-2 pt-1 border-t border-neutral-800">
                      {config.logoUrl ? (
                        <div className="flex items-center gap-3 bg-neutral-900 p-2 rounded border border-neutral-800">
                          <img
                            src={config.logoUrl}
                            alt="Logo Preview"
                            className="w-12 h-12 object-contain bg-white rounded p-1"
                          />
                          <div className="flex-1">
                            <span className="text-[11px] text-neutral-300 block">Logo terpasang</span>
                            <button
                              type="button"
                              onClick={() => update('logoUrl', '')}
                              className="text-red-400 hover:text-red-300 text-[11px] flex items-center gap-1 mt-1"
                            >
                              <Trash2 className="w-3 h-3" /> Hapus Logo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-emerald-500 bg-neutral-900/60">
                          <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                          <span className="text-neutral-300 text-xs">Unggah Logo (PNG/JPG)</span>
                          <span className="text-neutral-500 text-[10px]">Ukuran maks disarankan &lt; 500KB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      )}

                      {config.logoUrl && (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-neutral-400">Lebar Logo (px)</span>
                            <span className="font-mono text-neutral-200">{config.logoWidth}px</span>
                          </div>
                          <input
                            type="range"
                            min={80}
                            max={220}
                            value={config.logoWidth}
                            onChange={(e) => update('logoWidth', Number(e.target.value))}
                            className="w-full accent-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: ITEMS & COLUMNS */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div>
              <label className="block text-neutral-300 font-semibold mb-2">
                Tata Letak Daftar Item (Sangat penting untuk 58mm)
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => update('itemLayoutMode', 'compact_2row')}
                  className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                    config.itemLayoutMode === 'compact_2row'
                      ? 'bg-neutral-800 border-emerald-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs">Mode Ringkas 2 Baris</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      Direkomendasikan 58mm
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 font-mono bg-neutral-900/80 p-1.5 rounded">
                    Baris 1: Minyak Goreng 2L Bimoli<br />
                    Baris 2: &nbsp;&nbsp;2 x 36.500 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rp 73.000
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Nama barang panjang tidak terpotong, rincian kuantitas & total sejajar rapi.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => update('itemLayoutMode', 'single_row')}
                  className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                    config.itemLayoutMode === 'single_row'
                      ? 'bg-neutral-800 border-emerald-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold text-xs">Mode 1 Baris Tabular</span>
                  <div className="text-[11px] text-neutral-400 mt-1 font-mono bg-neutral-900/80 p-1.5 rounded">
                    2x Minyak Goreng 2L &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rp 73.000
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Format pendek hemat kertas, nama item akan terpotong jika melebihi lebar roll.
                  </p>
                </button>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2.5">
              <span className="font-semibold text-neutral-200 block mb-1">
                Detail Tambahan per Item
              </span>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300">Tampilkan Kode SKU Barang</span>
                <input
                  type="checkbox"
                  checked={config.showSku}
                  onChange={(e) => update('showSku', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300">Tampilkan Baris Hemat / Diskon Item</span>
                <input
                  type="checkbox"
                  checked={config.showItemDiscount}
                  onChange={(e) => update('showItemDiscount', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300">Tampilkan Catatan Varian (Catatan Item)</span>
                <input
                  type="checkbox"
                  checked={config.showItemNote}
                  onChange={(e) => update('showItemNote', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 4: CALCULATIONS & SUMMARY */}
        {activeTab === 'calc' && (
          <div className="space-y-3">
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2.5">
              <span className="font-semibold text-neutral-200 block">Komponen Rincian Biaya</span>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300">Subtotal</span>
                <input
                  type="checkbox"
                  checked={config.showSubtotal}
                  onChange={(e) => update('showSubtotal', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300">Total Potongan / Diskon</span>
                <input
                  type="checkbox"
                  checked={config.showDiscount}
                  onChange={(e) => update('showDiscount', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </label>

              {/* Pajak / PPN */}
              <div className="pt-2 border-t border-neutral-850">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-300 font-medium">Pajak (PPN / PB1)</span>
                  <input
                    type="checkbox"
                    checked={config.showTax}
                    onChange={(e) => update('showTax', e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                </div>
                {config.showTax && (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="block text-neutral-400 mb-0.5">Label Pajak</label>
                      <input
                        type="text"
                        value={config.taxLabel}
                        onChange={(e) => update('taxLabel', e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
                        placeholder="PPN 11%"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-0.5">Tarif Pajak (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={config.taxRate}
                        onChange={(e) => update('taxRate', Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Service Charge */}
              <div className="pt-2 border-t border-neutral-850">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-300 font-medium">Biaya Layanan (Service)</span>
                  <input
                    type="checkbox"
                    checked={config.showService}
                    onChange={(e) => update('showService', e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                </div>
                {config.showService && (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="block text-neutral-400 mb-0.5">Label Layanan</label>
                      <input
                        type="text"
                        value={config.serviceLabel}
                        onChange={(e) => update('serviceLabel', e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
                        placeholder="Service 5%"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-0.5">Tarif Layanan (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={config.serviceRate}
                        onChange={(e) => update('serviceRate', Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Highlight Style */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
              <label className="block text-neutral-300 font-semibold mb-1">
                Gaya Penekanan Nilai GRAND TOTAL
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => update('totalHighlight', 'invert')}
                  className={`p-2 rounded border text-center transition-all ${
                    config.totalHighlight === 'invert'
                      ? 'bg-neutral-800 border-emerald-500 text-white font-medium'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="font-bold text-xs">Blok Hitam</div>
                  <div className="text-[10px] text-neutral-400">Invert Thermal</div>
                </button>
                <button
                  type="button"
                  onClick={() => update('totalHighlight', 'double_box')}
                  className={`p-2 rounded border text-center transition-all ${
                    config.totalHighlight === 'double_box'
                      ? 'bg-neutral-800 border-emerald-500 text-white font-medium'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="font-bold text-xs">Kotak Bingkai</div>
                  <div className="text-[10px] text-neutral-400">Border 2px</div>
                </button>
                <button
                  type="button"
                  onClick={() => update('totalHighlight', 'bold')}
                  className={`p-2 rounded border text-center transition-all ${
                    config.totalHighlight === 'bold'
                      ? 'bg-neutral-800 border-emerald-500 text-white font-medium'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="font-bold text-xs">Garis Bold</div>
                  <div className="text-[10px] text-neutral-400">Standar</div>
                </button>
              </div>
            </div>

            {/* Payment & Cash Tendered */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
              <span className="font-semibold text-neutral-200 block mb-1">
                Status Pembayaran & Kas
              </span>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300">Tampilkan Metode Bayar (Tunai/QRIS/dll)</span>
                <input
                  type="checkbox"
                  checked={config.showPaymentMethod}
                  onChange={(e) => update('showPaymentMethod', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300">Tampilkan Uang Diterima (Cash)</span>
                <input
                  type="checkbox"
                  checked={config.showCashTendered}
                  onChange={(e) => update('showCashTendered', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300">Tampilkan Uang Kembalian (Change)</span>
                <input
                  type="checkbox"
                  checked={config.showChange}
                  onChange={(e) => update('showChange', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: TRANSACTION METADATA */}
        {activeTab === 'meta' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="font-semibold text-neutral-200">Tampilkan Metadata Transaksi</span>
              <input
                type="checkbox"
                checked={config.showMeta}
                onChange={(e) => update('showMeta', e.target.checked)}
                className="accent-emerald-500 w-4 h-4 rounded"
              />
            </div>

            {config.showMeta && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-neutral-950 p-2 rounded border border-neutral-800">
                    <span className="text-neutral-300">No. Nota</span>
                    <input
                      type="checkbox"
                      checked={config.showReceiptNo}
                      onChange={(e) => update('showReceiptNo', e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={config.receiptPrefix}
                      onChange={(e) => update('receiptPrefix', e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-100"
                      placeholder="Prefix (misal STR)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-neutral-950 p-2 rounded border border-neutral-800">
                    <span className="text-neutral-300">Tanggal & Waktu</span>
                    <input
                      type="checkbox"
                      checked={config.showDate}
                      onChange={(e) => update('showDate', e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                  </div>
                  <div>
                    <select
                      value={config.dateFormat}
                      onChange={(e) => update('dateFormat', e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-neutral-200"
                    >
                      <option value="ID_SHORT">Format Singkat (DD/MM/YYYY HH:MM)</option>
                      <option value="ID_LONG">Format Panjang (DD Bln YYYY HH:MM)</option>
                      <option value="TIME_ONLY">Hanya Jam (HH:MM:SS)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-neutral-950 p-2 rounded border border-neutral-800">
                    <span className="text-neutral-300">Nama Kasir</span>
                    <input
                      type="checkbox"
                      checked={config.showCashier}
                      onChange={(e) => update('showCashier', e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={config.cashierLabel}
                      onChange={(e) => update('cashierLabel', e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-100"
                      placeholder="Label (Kasir / Waiter)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-neutral-950 p-2 rounded border border-neutral-800">
                    <span className="text-neutral-300">Pelanggan</span>
                    <input
                      type="checkbox"
                      checked={config.showCustomer}
                      onChange={(e) => update('showCustomer', e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={config.customerLabel}
                      onChange={(e) => update('customerLabel', e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-100"
                      placeholder="Label (Pelanggan / Member)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-neutral-950 p-2 rounded border border-neutral-800">
                    <span className="text-neutral-300">No. Meja / Rak / Unit</span>
                    <input
                      type="checkbox"
                      checked={config.showTable}
                      onChange={(e) => update('showTable', e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={config.tableLabel}
                      onChange={(e) => update('tableLabel', e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-100"
                      placeholder="Label (Meja / Plat / Rak)"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PROMO, S&K, FOOTER */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Promo Box */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-200">Kotak Promo / Pengumuman / WiFi</span>
                <input
                  type="checkbox"
                  checked={config.showPromoBox}
                  onChange={(e) => update('showPromoBox', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </div>

              {config.showPromoBox && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <input
                    type="text"
                    value={config.promoTitle}
                    onChange={(e) => update('promoTitle', e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200 text-xs"
                    placeholder="Judul Box (misal: INFO & PROMO / FREE WIFI)"
                  />
                  <textarea
                    rows={2}
                    value={config.promoText}
                    onChange={(e) => update('promoText', e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200 text-xs"
                    placeholder="Isi pesan promo / WiFi password / akun media sosial"
                  />
                </div>
              )}
            </div>

            {/* S&K Policy */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-200">Syarat & Ketentuan / Garansi Toko</span>
                <input
                  type="checkbox"
                  checked={config.showPolicy}
                  onChange={(e) => update('showPolicy', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </div>

              {config.showPolicy && (
                <textarea
                  rows={2}
                  value={config.policyText}
                  onChange={(e) => update('policyText', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200 text-xs"
                  placeholder="Barang yang sudah dibeli tidak dapat ditukar/dikembalikan..."
                />
              )}
            </div>

            {/* Footer Greetings */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-200">Ucapan Terima Kasih (Footer)</span>
                <input
                  type="checkbox"
                  checked={config.showFooter}
                  onChange={(e) => update('showFooter', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </div>

              {config.showFooter && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <input
                    type="text"
                    value={config.thankYouMessage}
                    onChange={(e) => update('thankYouMessage', e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200 text-xs font-semibold"
                    placeholder="TERIMA KASIH ATAS KUNJUNGAN ANDA"
                  />
                  <input
                    type="text"
                    value={config.footerSubtitle}
                    onChange={(e) => update('footerSubtitle', e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200 text-xs"
                    placeholder="Sub-pesan / CS / Kontak Keluhan"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: BARCODE & QR CODE */}
        {activeTab === 'barcode' && (
          <div className="space-y-4">
            {/* Barcode */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-200 block">Cetak Barcode 1D (Code128)</span>
                  <span className="text-[10px] text-neutral-400">
                    Otomatis mengambil data dari nomor nota transaksi
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showBarcode}
                  onChange={(e) => update('showBarcode', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </div>
            </div>

            {/* QR Code */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-200 block">Cetak QR Code 2D (QRIS / URL)</span>
                  <span className="text-[10px] text-neutral-400">
                    Mendukung link invoice online, QRIS statis, atau nomor CS
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showQrCode}
                  onChange={(e) => update('showQrCode', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
              </div>

              {config.showQrCode && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div>
                    <label className="block text-neutral-400 mb-0.5">Isi Teks / URL / Payload QR</label>
                    <textarea
                      rows={2}
                      value={config.qrCodeValue}
                      onChange={(e) => update('qrCodeValue', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200 text-xs font-mono"
                      placeholder="https://tokoanda.com/nota/INV-01 atau string QRIS"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-0.5">Keterangan Bawah QR</label>
                    <input
                      type="text"
                      value={config.qrCodeLabel}
                      onChange={(e) => update('qrCodeLabel', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200 text-xs"
                      placeholder="Scan untuk bayar via QRIS"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-neutral-400">Ukuran QR Code</span>
                      <span className="font-mono text-neutral-200">{config.qrCodeSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={70}
                      max={140}
                      value={config.qrCodeSize}
                      onChange={(e) => update('qrCodeSize', Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
