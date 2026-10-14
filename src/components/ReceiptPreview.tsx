import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { ReceiptLayoutConfig, TransactionData } from '../types';
import { formatDateTime, formatRupiah } from '../utils/escpos';
import { Scissors, CornerDownRight, ZoomIn, ZoomOut, Check, Sparkles } from 'lucide-react';

interface ReceiptPreviewProps {
  config: ReceiptLayoutConfig;
  transaction: TransactionData;
  isSimulatingCut?: boolean;
  onCutSimulationComplete?: () => void;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  config,
  transaction,
  isSimulatingCut = false,
  onCutSimulationComplete,
}) => {
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [cutAnimationState, setCutAnimationState] = useState<'idle' | 'cutting' | 'detached'>('idle');

  // Render Barcode
  useEffect(() => {
    if (config.showBarcode && barcodeRef.current && transaction.receiptNo) {
      try {
        const cleanVal = transaction.receiptNo.replace(/[^A-Za-z0-9_-]/g, '') || 'INV-001';
        JsBarcode(barcodeRef.current, cleanVal, {
          format: 'CODE128',
          width: 1.5,
          height: 38,
          displayValue: true,
          font: 'monospace',
          fontSize: 10,
          margin: 0,
        });
      } catch (err) {
        console.error('Barcode render error:', err);
      }
    }
  }, [config.showBarcode, transaction.receiptNo]);

  // Render QR Code
  useEffect(() => {
    if (config.showQrCode && config.qrCodeValue) {
      QRCode.toDataURL(config.qrCodeValue, {
        width: config.qrCodeSize || 100,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code render error:', err));
    }
  }, [config.showQrCode, config.qrCodeValue, config.qrCodeSize]);

  // Handle cut simulation trigger
  useEffect(() => {
    if (isSimulatingCut) {
      setCutAnimationState('cutting');
      const timer1 = setTimeout(() => {
        setCutAnimationState('detached');
      }, 400);
      const timer2 = setTimeout(() => {
        setCutAnimationState('idle');
        onCutSimulationComplete?.();
      }, 2200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isSimulatingCut, onCutSimulationComplete]);

  // Calculations
  const rawSubtotal = transaction.items.reduce((acc, it) => acc + it.qty * it.price, 0);
  const totalItemDiscounts = transaction.items.reduce((acc, it) => acc + (it.discount || 0), 0);
  const manualDisc = transaction.manualDiscountNominal || 0;
  const totalDiscount = totalItemDiscounts + manualDisc;
  const taxableBase = Math.max(0, rawSubtotal - totalDiscount);

  const taxAmount = config.showTax ? Math.round((taxableBase * (config.taxRate || 0)) / 100) : 0;
  const serviceAmount = config.showService ? Math.round((taxableBase * (config.serviceRate || 0)) / 100) : 0;
  const grandTotal = taxableBase + taxAmount + serviceAmount;

  const totalPaid = transaction.paymentMethod === 'TUNAI' ? transaction.cashTendered || grandTotal : grandTotal;
  const change = Math.max(0, totalPaid - grandTotal);

  // Font family selector class
  const fontClass =
    config.fontStyle === 'monospace'
      ? 'font-thermal-mono'
      : config.fontStyle === 'dot_matrix'
      ? 'font-thermal-dot text-sm'
      : 'font-thermal-sans';

  // Separator renderer
  const renderSeparator = () => {
    if (config.separatorStyle === 'dashed') {
      return <div className="my-1.5 text-center text-xs tracking-widest select-none opacity-80">- - - - - - - - - - - - - - - -</div>;
    }
    if (config.separatorStyle === 'dotted') {
      return <div className="my-1.5 text-center text-xs tracking-widest select-none opacity-80">. . . . . . . . . . . . . . . .</div>;
    }
    if (config.separatorStyle === 'double') {
      return <div className="my-1.5 border-t border-b border-black h-1 select-none" />;
    }
    if (config.separatorStyle === 'solid') {
      return <div className="my-1.5 border-t border-black select-none" />;
    }
    if (config.separatorStyle === 'stars') {
      return <div className="my-1.5 text-center text-xs tracking-widest select-none opacity-80">* * * * * * * * * * * * * * * *</div>;
    }
    return <div className="my-1.5 border-t border-dashed border-neutral-400 select-none" />;
  };

  // Preview width styling: 58mm standard is around 320px in display screen width (approx 384 dots printable)
  const is58mm = config.paperWidth === 58;
  const previewWidthPx = is58mm ? 330 : 420;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Zoom and Scale Controls */}
      <div className="no-print flex items-center justify-between w-full max-w-sm mb-3 px-2 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-neutral-200">Pratinjau Nota</span>
          <span>·</span>
          <span>{config.paperWidth} mm Roll</span>
          <span>·</span>
          <span className="font-mono text-neutral-300">{config.characterWidth} Karakter</span>
        </div>
        <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-0.5 border border-neutral-700/60">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
            className="p-1 hover:text-white rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 font-mono text-[11px] text-neutral-300">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
            className="p-1 hover:text-white rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 32-Column Guide Bar (Simulates 58mm font capacity) */}
      <div
        className="no-print mb-1 px-3 py-0.5 bg-neutral-800/80 rounded border border-neutral-700 text-[10px] font-mono text-neutral-400 select-none flex justify-between"
        style={{ width: `${previewWidthPx}px` }}
      >
        <span>1</span>
        <span>········ 8</span>
        <span>········ 16</span>
        <span>········ 24</span>
        <span className="text-amber-400 font-bold">32</span>
      </div>

      {/* Realistic Thermal Receipt Paper Container */}
      <div
        className="relative transition-transform duration-200"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
          width: `${previewWidthPx}px`,
        }}
      >
        {/* Top Serrated Edge */}
        <div className="thermal-serration-top w-full no-print" />

        {/* The Actual Printable Receipt Root */}
        <div
          id="thermal-receipt-printable"
          className={`thermal-paper px-4 py-4 text-black text-[12px] leading-tight select-text ${fontClass} relative transition-all duration-300 ${
            cutAnimationState === 'detached' ? 'translate-y-4 opacity-90' : ''
          }`}
          style={{
            minHeight: '420px',
            backgroundColor: '#ffffff',
          }}
        >
          {/* STORE LOGO */}
          {config.showLogo && config.logoUrl && (
            <div
              className={`mb-2 flex ${
                config.logoAlignment === 'center'
                  ? 'justify-center'
                  : config.logoAlignment === 'right'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <img
                src={config.logoUrl}
                alt="Logo Toko"
                className={`max-h-16 object-contain ${config.logoMonochrome ? 'grayscale contrast-200' : ''}`}
                style={{ width: `${config.logoWidth}px` }}
              />
            </div>
          )}

          {/* STORE HEADER */}
          {config.showHeader && (
            <div
              className={`mb-2 ${
                config.headerAlignment === 'center' ? 'text-center' : 'text-left'
              }`}
            >
              <div className="font-bold text-[15px] tracking-tight leading-snug">
                {config.storeName || 'NAMA TOKO ANDA'}
              </div>
              {config.tagline && (
                <div className="text-[11px] mt-0.5 opacity-90">{config.tagline}</div>
              )}
              {config.address && (
                <div className="text-[11px] mt-0.5 opacity-80 whitespace-pre-line">
                  {config.address}
                </div>
              )}
              {config.phone && (
                <div className="text-[11px] mt-0.5 opacity-80">{config.phone}</div>
              )}
              {config.headerCustomNote && (
                <div className="text-[10px] mt-0.5 italic">{config.headerCustomNote}</div>
              )}
              {renderSeparator()}
            </div>
          )}

          {/* TRANSACTION METADATA */}
          {config.showMeta && (
            <div className="text-[11px] space-y-0.5 mb-2">
              {config.showReceiptNo && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-75">No. Nota</span>
                  <span className="font-semibold font-mono">
                    {config.receiptPrefix ? `${config.receiptPrefix}-` : ''}
                    {transaction.receiptNo}
                  </span>
                </div>
              )}
              {config.showDate && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-75">Tanggal</span>
                  <span>{formatDateTime(transaction.timestamp, config.dateFormat)}</span>
                </div>
              )}
              {config.showCashier && transaction.cashierName && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-75">{config.cashierLabel || 'Kasir'}</span>
                  <span>{transaction.cashierName}</span>
                </div>
              )}
              {config.showCustomer && transaction.customerName && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-75">{config.customerLabel || 'Pelanggan'}</span>
                  <span className="font-medium">{transaction.customerName}</span>
                </div>
              )}
              {config.showTable && transaction.tableNo && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-75">{config.tableLabel || 'Meja/Unit'}</span>
                  <span className="font-bold">{transaction.tableNo}</span>
                </div>
              )}
              {renderSeparator()}
            </div>
          )}

          {/* ITEMS LIST */}
          <div className="mb-2">
            {config.itemLayoutMode === 'compact_2row' ? (
              // 58mm Recommended: 2-Row Compact
              <div className="space-y-1.5">
                {transaction.items.map((item, idx) => {
                  const itemTotal = item.qty * item.price - (item.discount || 0);
                  return (
                    <div key={item.id || idx} className="text-[11.5px]">
                      {/* Row 1: Item Name */}
                      <div className="font-medium text-black break-words leading-tight">
                        {config.showSku && item.sku && (
                          <span className="font-mono text-[10px] opacity-75 mr-1">
                            [{item.sku}]
                          </span>
                        )}
                        {item.name}
                      </div>

                      {/* Row 2: Qty x Price ... Item Total */}
                      <div className="flex justify-between items-baseline text-[11px] pl-2 mt-0.5">
                        <span className="font-mono opacity-80">
                          {item.qty} x {formatRupiah(item.price).replace('Rp ', '')}
                        </span>
                        <span className="font-semibold font-mono">
                          {formatRupiah(itemTotal)}
                        </span>
                      </div>

                      {/* Optional Discount breakdown */}
                      {config.showItemDiscount && item.discount && item.discount > 0 ? (
                        <div className="flex justify-between items-baseline text-[10px] pl-3 text-neutral-600 italic">
                          <span>Hemat:</span>
                          <span className="font-mono">-{formatRupiah(item.discount)}</span>
                        </div>
                      ) : null}

                      {/* Optional Note */}
                      {config.showItemNote && item.note && (
                        <div className="text-[10px] pl-2 text-neutral-600 italic">
                          * {item.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Single row mode
              <div>
                <div className="flex justify-between text-[11px] font-bold border-b border-black pb-0.5 mb-1">
                  <span>Item</span>
                  <span>Total</span>
                </div>
                <div className="space-y-1">
                  {transaction.items.map((item, idx) => {
                    const itemTotal = item.qty * item.price - (item.discount || 0);
                    return (
                      <div key={item.id || idx} className="flex justify-between items-baseline text-[11px]">
                        <span className="truncate pr-2">
                          {item.qty}x {item.name}
                        </span>
                        <span className="font-mono font-medium shrink-0">
                          {formatRupiah(itemTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {renderSeparator()}
          </div>

          {/* FINANCIAL SUMMARY / CALCULATIONS */}
          <div className="space-y-1 text-[11.5px] mb-2 font-mono">
            {config.showSubtotal && (
              <div className="flex justify-between items-baseline">
                <span className="font-sans opacity-80">Subtotal</span>
                <span>{formatRupiah(rawSubtotal)}</span>
              </div>
            )}

            {config.showDiscount && totalDiscount > 0 && (
              <div className="flex justify-between items-baseline text-neutral-800">
                <span className="font-sans">Total Diskon</span>
                <span>-{formatRupiah(totalDiscount)}</span>
              </div>
            )}

            {config.showService && serviceAmount > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="font-sans opacity-80">{config.serviceLabel || 'Biaya Layanan'}</span>
                <span>{formatRupiah(serviceAmount)}</span>
              </div>
            )}

            {config.showTax && taxAmount > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="font-sans opacity-80">{config.taxLabel || 'PPN'}</span>
                <span>{formatRupiah(taxAmount)}</span>
              </div>
            )}

            {/* GRAND TOTAL ROW */}
            <div className="pt-1">
              {config.totalHighlight === 'invert' ? (
                <div className="bg-black text-white px-2 py-1 flex justify-between items-baseline font-bold text-[13px] my-1">
                  <span className="font-sans">TOTAL</span>
                  <span className="font-mono">{formatRupiah(grandTotal)}</span>
                </div>
              ) : config.totalHighlight === 'double_box' ? (
                <div className="border-2 border-black p-1 flex justify-between items-baseline font-bold text-[13px] my-1">
                  <span className="font-sans">TOTAL</span>
                  <span className="font-mono">{formatRupiah(grandTotal)}</span>
                </div>
              ) : (
                <div className="flex justify-between items-baseline font-bold text-[13px] border-t border-b border-black py-1 my-1">
                  <span className="font-sans">TOTAL</span>
                  <span className="font-mono">{formatRupiah(grandTotal)}</span>
                </div>
              )}
            </div>

            {/* PAYMENT BREAKDOWN */}
            {config.showPaymentMethod && (
              <div className="pt-1 space-y-0.5 text-[11px]">
                <div className="flex justify-between items-baseline">
                  <span className="font-sans opacity-80">Pembayaran</span>
                  <span className="font-bold">{transaction.paymentMethod}</span>
                </div>

                {config.showCashTendered && transaction.paymentMethod === 'TUNAI' && (
                  <div className="flex justify-between items-baseline">
                    <span className="font-sans opacity-80">Uang Diterima</span>
                    <span>{formatRupiah(totalPaid)}</span>
                  </div>
                )}

                {config.showChange && transaction.paymentMethod === 'TUNAI' && (
                  <div className="flex justify-between items-baseline font-semibold">
                    <span className="font-sans">Kembalian</span>
                    <span>{formatRupiah(change)}</span>
                  </div>
                )}
              </div>
            )}
            {renderSeparator()}
          </div>

          {/* PROMO / INFO BOX */}
          {config.showPromoBox && (config.promoTitle || config.promoText) && (
            <div className="my-2 p-1.5 border border-dashed border-neutral-600 rounded-xs text-center text-[10.5px]">
              {config.promoTitle && (
                <div className="font-bold uppercase tracking-wide mb-0.5">
                  [ {config.promoTitle} ]
                </div>
              )}
              {config.promoText && (
                <div className="whitespace-pre-line opacity-90 leading-tight">
                  {config.promoText}
                </div>
              )}
            </div>
          )}

          {/* POLICY / TERMS */}
          {config.showPolicy && config.policyText && (
            <div className="my-2 text-center text-[10px] opacity-80 leading-snug whitespace-pre-line px-1">
              {config.policyText}
            </div>
          )}

          {/* FOOTER GREETINGS */}
          {config.showFooter && (
            <div
              className={`mt-3 mb-2 ${
                config.footerAlignment === 'center' ? 'text-center' : 'text-left'
              }`}
            >
              {config.thankYouMessage && (
                <div className="font-bold text-[11.5px] uppercase tracking-wide">
                  {config.thankYouMessage}
                </div>
              )}
              {config.footerSubtitle && (
                <div className="text-[10px] mt-0.5 opacity-80">
                  {config.footerSubtitle}
                </div>
              )}
            </div>
          )}

          {/* BARCODE */}
          {config.showBarcode && (
            <div className="my-3 flex flex-col items-center justify-center">
              <svg ref={barcodeRef} className="max-w-full" />
            </div>
          )}

          {/* QR CODE */}
          {config.showQrCode && qrDataUrl && (
            <div className="my-3 flex flex-col items-center justify-center text-center">
              <img
                src={qrDataUrl}
                alt="QR Code Struk"
                className="w-24 h-24 object-contain mx-auto"
              />
              {config.qrCodeLabel && (
                <span className="text-[9.5px] mt-1 font-mono opacity-85">
                  {config.qrCodeLabel}
                </span>
              )}
            </div>
          )}

          {/* TRAILING BLANK FEED LINES (Clears the printer cutter blade) */}
          <div
            className="w-full select-none"
            style={{
              height: `${Math.max(1, config.feedLinesBeforeCut || 4) * 12}px`,
            }}
          />

          {/* VISUAL CUTTER / BLADE GUIDE (Screen preview only) */}
          {config.autoCut && config.visualCutterGuide && (
            <div className="no-print relative mt-1 select-none">
              <div className="border-t-2 border-dashed border-red-500 flex items-center justify-center relative">
                <span className="absolute -top-3 bg-red-100 text-red-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-red-300">
                  <Scissors className="w-2.5 h-2.5" />
                  GARIS POTONG AUTO-CUT ({config.autoCutType.toUpperCase()})
                </span>
              </div>
              <div className="text-center text-[9px] text-neutral-400 mt-2">
                Pita kertas dipotong otomatis oleh pisau pemotong printer thermal
              </div>
            </div>
          )}
        </div>

        {/* Bottom Serrated Edge */}
        <div className="thermal-serration-bottom w-full no-print" />
      </div>

      {/* Hardware Status Tag below preview */}
      <div className="no-print mt-3 text-center text-xs text-neutral-400 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
          <Check className="w-3.5 h-3.5" /> Auto-Cut Siap
        </span>
        <span>·</span>
        <span className="text-neutral-400 font-mono text-[11px]">
          Feed: {config.feedLinesBeforeCut} baris
        </span>
        <span>·</span>
        <span className="text-neutral-400 font-mono text-[11px]">
          {config.openCashDrawer ? 'Laci Kasir Aktif' : 'Laci Off'}
        </span>
      </div>
    </div>
  );
};
