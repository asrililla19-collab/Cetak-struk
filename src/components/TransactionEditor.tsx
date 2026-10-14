import React, { useState } from 'react';
import { TransactionData, TransactionItem } from '../types';
import { formatRupiah } from '../utils/escpos';
import {
  Plus,
  Trash2,
  Receipt,
  User,
  CreditCard,
  RotateCcw,
  Clock,
  Sparkles,
  Search,
  History,
  Check,
} from 'lucide-react';

interface TransactionEditorProps {
  transaction: TransactionData;
  onChange: (updated: TransactionData) => void;
  onSaveToHistory: () => void;
  historyList: TransactionData[];
  onLoadFromHistory: (trx: TransactionData) => void;
}

const CATALOG_SUGGESTIONS = [
  { name: 'Kopi Susu Gula Aren', price: 18000, category: 'F&B' },
  { name: 'Americano Double Shot', price: 22000, category: 'F&B' },
  { name: 'Roti Bakar Coklat Keju', price: 16000, category: 'F&B' },
  { name: 'Minyak Goreng 2L Pouch', price: 36500, category: 'Retail' },
  { name: 'Beras Premium 5Kg', price: 74000, category: 'Retail' },
  { name: 'Gula Pasir 1Kg', price: 17500, category: 'Retail' },
  { name: 'Jasa Cuci Komplit (Kg)', price: 8000, category: 'Jasa' },
  { name: 'Jasa Ganti Baterai HP', price: 150000, category: 'Jasa' },
];

export const TransactionEditor: React.FC<TransactionEditorProps> = ({
  transaction,
  onChange,
  onSaveToHistory,
  historyList,
  onLoadFromHistory,
}) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  // Update transaction field
  const updateField = <K extends keyof TransactionData>(key: K, value: TransactionData[K]) => {
    onChange({
      ...transaction,
      [key]: value,
    });
  };

  // Add new item
  const addItem = (customItem?: Partial<TransactionItem>) => {
    const newItem: TransactionItem = {
      id: 'it-' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: customItem?.name || 'Produk Baru',
      price: customItem?.price || 10000,
      qty: customItem?.qty || 1,
      discount: customItem?.discount || 0,
      sku: customItem?.sku || '',
      note: customItem?.note || '',
    };
    onChange({
      ...transaction,
      items: [...transaction.items, newItem],
    });
  };

  // Update item
  const updateItem = (id: string, updates: Partial<TransactionItem>) => {
    onChange({
      ...transaction,
      items: transaction.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    });
  };

  // Remove item
  const removeItem = (id: string) => {
    onChange({
      ...transaction,
      items: transaction.items.filter((item) => item.id !== id),
    });
  };

  // Reset to new transaction
  const resetNewTransaction = () => {
    const d = new Date();
    const dateStr = d.toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    onChange({
      id: 'trx-' + Date.now(),
      receiptNo: `${dateStr}-${rand}`,
      timestamp: new Date().toISOString(),
      cashierName: transaction.cashierName || 'Kasir 01',
      customerName: 'Pelanggan Umum',
      tableNo: '',
      items: [
        {
          id: 'item-1',
          name: 'Item Transaksi Baru',
          qty: 1,
          price: 25000,
          discount: 0,
        },
      ],
      paymentMethod: 'TUNAI',
      cashTendered: 50000,
      manualDiscountNominal: 0,
      notes: '',
    });
  };

  // Calculate totals
  const rawSubtotal = transaction.items.reduce((acc, it) => acc + it.qty * it.price, 0);
  const totalItemDiscounts = transaction.items.reduce((acc, it) => acc + (it.discount || 0), 0);
  const totalDue = Math.max(0, rawSubtotal - totalItemDiscounts - (transaction.manualDiscountNominal || 0));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full text-xs">
      {/* POS Top Bar */}
      <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-neutral-100">Input Data Kasir & Transaksi</h2>
        </div>
        <div className="flex items-center gap-2">
          {historyList.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors text-[11px]"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Riwayat ({historyList.length})</span>
            </button>
          )}
          <button
            type="button"
            onClick={resetNewTransaction}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors text-[11px]"
            title="Buat Transaksi Baru Kosong"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            <span>Nota Baru</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Row 1: Receipt No, Cashier, Customer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
          <div>
            <label className="block text-neutral-400 mb-1">Nomor Nota / Struk</label>
            <input
              type="text"
              value={transaction.receiptNo}
              onChange={(e) => updateField('receiptNo', e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white font-mono font-medium"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Nama Kasir / Petugas</label>
            <input
              type="text"
              value={transaction.cashierName}
              onChange={(e) => updateField('cashierName', e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white"
              placeholder="Ahmad"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Nama Pelanggan / No Meja</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={transaction.customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
                className="w-2/3 bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white"
                placeholder="Pelanggan"
              />
              <input
                type="text"
                value={transaction.tableNo || ''}
                onChange={(e) => updateField('tableNo', e.target.value)}
                className="w-1/3 bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-white text-center font-bold"
                placeholder="Meja"
              />
            </div>
          </div>
        </div>

        {/* Quick Add Catalog Buttons */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-neutral-400 block font-medium">
            Katalog Cepat (Klik untuk tambah item instan):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CATALOG_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  addItem({
                    name: sug.name,
                    price: sug.price,
                    qty: 1,
                  })
                }
                className="text-[11px] bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white px-2 py-1 rounded-md transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>{sug.name}</span>
                <span className="font-mono text-neutral-400">({formatRupiah(sug.price).replace('Rp ', '')})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-200">
              Daftar Barang Belanja ({transaction.items.length} item)
            </span>
            <button
              type="button"
              onClick={() => addItem()}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700/80 hover:bg-emerald-600 text-white font-medium text-[11px] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>

          <div className="space-y-2">
            {transaction.items.map((item, index) => {
              const itemTotal = item.qty * item.price - (item.discount || 0);
              return (
                <div
                  key={item.id}
                  className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-500 text-[10px] w-4">{index + 1}.</span>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white text-xs font-medium"
                      placeholder="Nama produk/jasa"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                      title="Hapus Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 items-center text-[11px]">
                    <div>
                      <label className="block text-neutral-400 text-[10px]">Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, { qty: Math.max(1, Number(e.target.value)) })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white font-mono text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 text-[10px]">Harga (Rp)</label>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={item.price}
                        onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 text-[10px]">Diskon Item (Rp)</label>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={item.discount || 0}
                        onChange={(e) => updateItem(item.id, { discount: Number(e.target.value) })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono"
                      />
                    </div>

                    <div className="text-right">
                      <label className="block text-neutral-400 text-[10px]">Total Item</label>
                      <span className="font-mono font-bold text-emerald-400 text-xs block py-1">
                        {formatRupiah(itemTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Optional SKU or Note */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.sku || ''}
                      onChange={(e) => updateItem(item.id, { sku: e.target.value })}
                      className="w-1/3 bg-neutral-900 border border-neutral-800 rounded px-2 py-0.5 text-neutral-400 text-[10px]"
                      placeholder="SKU / Barcode"
                    />
                    <input
                      type="text"
                      value={item.note || ''}
                      onChange={(e) => updateItem(item.id, { note: e.target.value })}
                      className="w-2/3 bg-neutral-900 border border-neutral-800 rounded px-2 py-0.5 text-neutral-400 text-[10px]"
                      placeholder="Catatan item (pedas, warna, varian)"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Calculator Section */}
        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="font-semibold text-neutral-200">Metode & Rincian Pembayaran</span>
            <div className="font-mono text-emerald-400 font-bold text-sm">
              Tagihan: {formatRupiah(totalDue)}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {(['TUNAI', 'QRIS', 'DEBIT', 'TRANSFER', 'KREDIT'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => updateField('paymentMethod', method)}
                className={`py-1.5 px-2 rounded text-[11px] font-medium border transition-all ${
                  transaction.paymentMethod === method
                    ? 'bg-neutral-800 border-emerald-500 text-white font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {transaction.paymentMethod === 'TUNAI' && (
            <div className="space-y-2 pt-2 border-t border-neutral-850">
              <div className="grid grid-cols-2 gap-2 items-center">
                <div>
                  <label className="block text-neutral-400 mb-1">Uang Tunai Diterima (Rp)</label>
                  <input
                    type="number"
                    step={1000}
                    value={transaction.cashTendered}
                    onChange={(e) => updateField('cashTendered', Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white font-mono font-bold text-sm"
                  />
                </div>

                <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800 text-right">
                  <span className="block text-neutral-400 text-[10px]">Uang Kembalian:</span>
                  <span className="font-mono font-bold text-base text-amber-400">
                    {formatRupiah(Math.max(0, (transaction.cashTendered || 0) - totalDue))}
                  </span>
                </div>
              </div>

              {/* Quick Cash Suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-500 self-center">Pintas Kasir:</span>
                <button
                  type="button"
                  onClick={() => updateField('cashTendered', totalDue)}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono border border-neutral-700"
                >
                  Uang Pas
                </button>
                {[20000, 50000, 100000, 200000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => updateField('cashTendered', amt)}
                    className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono border border-neutral-700"
                  >
                    {amt / 1000}k
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full max-h-[80vh] flex flex-col p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-neutral-100 text-sm">Riwayat Nota Tersimpan</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-neutral-400 hover:text-white px-2 py-1 rounded"
              >
                Tutup
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {historyList.map((hist) => {
                const sub = hist.items.reduce((a, b) => a + b.qty * b.price - (b.discount || 0), 0);
                return (
                  <div
                    key={hist.id}
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between hover:border-neutral-700"
                  >
                    <div>
                      <div className="font-mono font-bold text-neutral-200">
                        Nota #{hist.receiptNo}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {hist.customerName} · {hist.items.length} item · {formatRupiah(sub)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onLoadFromHistory(hist);
                        setShowHistoryModal(false);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                    >
                      Pilih & Cetak
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
