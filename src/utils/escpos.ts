import { ReceiptLayoutConfig, TransactionData } from '../types';

/**
 * ESC/POS Command Generator for 58mm / 80mm Thermal Printers
 * Standard 58mm thermal printer specifications:
 * - Printable width: 48mm / 384 dots
 * - Font A (12x24): 32 characters per line
 * - Font B (9x17): 42 characters per line
 */

// Helper to format currency Rupiah
export function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

// Format date helper
export function formatDateTime(isoString: string, format: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    
    if (format === 'TIME_ONLY') {
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    
    if (format === 'ID_LONG') {
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // ID_SHORT
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return isoString;
  }
}

// ESC/POS Byte Buffer Builder
export class EscPosBuilder {
  private bytes: number[] = [];
  private cols: number;

  constructor(columns: number = 32) {
    this.cols = columns;
  }

  // Initialize printer
  init(): this {
    this.bytes.push(0x1B, 0x40); // ESC @
    this.bytes.push(0x1B, 0x74, 0x00); // Code page 0 (PC437 USA)
    return this;
  }

  // Text Alignment: 0=Left, 1=Center, 2=Right
  align(align: 'left' | 'center' | 'right'): this {
    const code = align === 'center' ? 0x01 : align === 'right' ? 0x02 : 0x00;
    this.bytes.push(0x1B, 0x61, code); // ESC a n
    return this;
  }

  // Bold text
  bold(enable: boolean): this {
    this.bytes.push(0x1B, 0x45, enable ? 0x01 : 0x00); // ESC E n
    return this;
  }

  // Invert colors (White on Black)
  invert(enable: boolean): this {
    this.bytes.push(0x1D, 0x42, enable ? 0x01 : 0x00); // GS B n
    return this;
  }

  // Text size: normal, double_height, double_width, double_both
  size(size: 'normal' | 'double_height' | 'double_width' | 'double_both'): this {
    let code = 0x00;
    if (size === 'double_height') code = 0x01;
    if (size === 'double_width') code = 0x10;
    if (size === 'double_both') code = 0x11;
    this.bytes.push(0x1D, 0x21, code); // GS ! n
    return this;
  }

  // Add raw text
  text(str: string): this {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      this.bytes.push(code <= 0xFF ? code : 0x3F); // fallback to '?' for unencodable
    }
    return this;
  }

  // Add line break
  newLine(count: number = 1): this {
    for (let i = 0; i < count; i++) {
      this.bytes.push(0x0A); // LF
    }
    return this;
  }

  // Print line with newline
  line(str: string = ''): this {
    this.text(str);
    this.bytes.push(0x0A);
    return this;
  }

  // Draw separator line based on style
  separator(style: string): this {
    let char = '-';
    if (style === 'dashed') char = '-';
    else if (style === 'dotted') char = '.';
    else if (style === 'double') char = '=';
    else if (style === 'solid') char = '-';
    else if (style === 'stars') char = '*';

    let sep = '';
    if (style === 'dashed') {
      sep = '- '.repeat(Math.floor(this.cols / 2));
    } else {
      sep = char.repeat(this.cols);
    }
    this.align('center');
    this.line(sep.slice(0, this.cols));
    return this;
  }

  // Pad left and right text to exact columns (32 characters for 58mm)
  twoColumnLine(leftText: string, rightText: string): this {
    this.align('left');
    const available = this.cols - rightText.length;
    let left = leftText;
    if (left.length > available - 1) {
      left = left.slice(0, Math.max(0, available - 2)) + ' ';
    }
    const spacesNeeded = Math.max(1, this.cols - left.length - rightText.length);
    const line = left + ' '.repeat(spacesNeeded) + rightText;
    this.line(line);
    return this;
  }

  // Feed lines
  feed(lines: number = 3): this {
    this.bytes.push(0x1B, 0x64, Math.min(255, Math.max(1, lines))); // ESC d n
    return this;
  }

  // Open Cash Drawer Kick (Windows POS drawer)
  kickDrawer(pin: 'pin2' | 'pin5' = 'pin2'): this {
    const pinByte = pin === 'pin5' ? 0x01 : 0x00;
    this.bytes.push(0x1B, 0x70, pinByte, 0x19, 0xFA); // ESC p m t1 t2
    return this;
  }

  // AUTO-CUT Commands (Hardware thermal cutter)
  autoCut(type: 'full' | 'partial' | 'feed_and_cut' = 'feed_and_cut', feedLines: number = 4): this {
    if (type === 'full') {
      // Full cut (GS V 0 or ESC i)
      this.bytes.push(0x1D, 0x56, 0x00);
    } else if (type === 'partial') {
      // Partial cut (GS V 1 or ESC m)
      this.bytes.push(0x1D, 0x56, 0x01);
    } else {
      // Feed n lines then partial cut (GS V 66 n) - Most widely supported by Xprinter, Epson, POS-58
      this.bytes.push(0x1D, 0x56, 0x42, Math.min(20, Math.max(1, feedLines)));
    }
    return this;
  }

  // Barcode (CODE128)
  barcode(data: string): this {
    this.align('center');
    this.bytes.push(0x1D, 0x68, 0x40); // Height = 64 dots
    this.bytes.push(0x1D, 0x77, 0x02); // Module width = 2
    this.bytes.push(0x1D, 0x48, 0x02); // HRI position: below barcode
    this.bytes.push(0x1D, 0x6B, 0x49); // CODE128 (GS k 73)
    this.bytes.push(data.length);
    for (let i = 0; i < data.length; i++) {
      this.bytes.push(data.charCodeAt(i));
    }
    this.newLine();
    return this;
  }

  // Build binary Uint8Array
  build(): Uint8Array {
    return new Uint8Array(this.bytes);
  }

  // Get Hex representation string
  toHexString(): string {
    return this.bytes
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
  }
}

/**
 * Generate Complete ESC/POS Byte Buffer for a receipt layout and transaction
 */
export function generateEscPosData(
  config: ReceiptLayoutConfig,
  trx: TransactionData
): Uint8Array {
  const cols = config.characterWidth || (config.paperWidth === 58 ? 32 : 48);
  const builder = new EscPosBuilder(cols);

  // 1. Initialize
  builder.init();

  // 2. Open Cash Drawer (if set before print)
  if (config.openCashDrawer && config.drawerTiming === 'before') {
    builder.kickDrawer(config.drawerPin);
  }

  // 3. Header Section
  if (config.showHeader) {
    builder.align(config.headerAlignment);
    builder.bold(true).size('double_both');
    builder.line(config.storeName);
    builder.size('normal').bold(false);

    if (config.tagline) {
      builder.line(config.tagline);
    }
    if (config.address) {
      builder.line(config.address);
    }
    if (config.phone) {
      builder.line(config.phone);
    }
    if (config.headerCustomNote) {
      builder.line(config.headerCustomNote);
    }
    builder.separator(config.separatorStyle);
  }

  // 4. Metadata Section
  if (config.showMeta) {
    builder.align('left');
    if (config.showReceiptNo) {
      builder.twoColumnLine('No. Nota', `${config.receiptPrefix ? config.receiptPrefix + '-' : ''}${trx.receiptNo}`);
    }
    if (config.showDate) {
      builder.twoColumnLine('Tanggal', formatDateTime(trx.timestamp, config.dateFormat));
    }
    if (config.showCashier && trx.cashierName) {
      builder.twoColumnLine(config.cashierLabel || 'Kasir', trx.cashierName);
    }
    if (config.showCustomer && trx.customerName) {
      builder.twoColumnLine(config.customerLabel || 'Pelanggan', trx.customerName);
    }
    if (config.showTable && trx.tableNo) {
      builder.twoColumnLine(config.tableLabel || 'Meja', trx.tableNo);
    }
    builder.separator(config.separatorStyle);
  }

  // 5. Items Section (58mm 2-Row Compact Layout or Single Row)
  if (trx.items && trx.items.length > 0) {
    if (config.itemLayoutMode === 'compact_2row') {
      // 2-row layout: Best for 58mm narrow paper
      // Row 1: Item Name
      // Row 2:   [Qty] x [Price]            [Total]
      for (const item of trx.items) {
        builder.align('left');
        let itemName = item.name;
        if (config.showSku && item.sku) {
          itemName = `[${item.sku}] ` + itemName;
        }
        builder.line(itemName.slice(0, cols));

        const itemTotal = item.qty * item.price - (item.discount || 0);
        const detailLeft = `  ${item.qty} x ${formatRupiah(item.price).replace('Rp ', '')}`;
        builder.twoColumnLine(detailLeft, formatRupiah(itemTotal));

        if (config.showItemDiscount && item.discount && item.discount > 0) {
          builder.twoColumnLine('    (Hemat)', `-${formatRupiah(item.discount)}`);
        }
        if (config.showItemNote && item.note) {
          builder.line(`    * ${item.note}`);
        }
      }
    } else {
      // Single row mode
      builder.twoColumnLine('Item', 'Total');
      builder.separator('dotted');
      for (const item of trx.items) {
        const itemTotal = item.qty * item.price - (item.discount || 0);
        builder.twoColumnLine(`${item.qty}x ${item.name}`, formatRupiah(itemTotal));
      }
    }
    builder.separator(config.separatorStyle);
  }

  // 6. Financial Calculations
  const rawSubtotal = trx.items.reduce((acc, it) => acc + it.qty * it.price, 0);
  const totalItemDiscounts = trx.items.reduce((acc, it) => acc + (it.discount || 0), 0);
  const manualDisc = trx.manualDiscountNominal || 0;
  const totalDiscount = totalItemDiscounts + manualDisc;
  const taxableBase = Math.max(0, rawSubtotal - totalDiscount);

  const taxAmount = config.showTax ? Math.round((taxableBase * (config.taxRate || 0)) / 100) : 0;
  const serviceAmount = config.showService ? Math.round((taxableBase * (config.serviceRate || 0)) / 100) : 0;
  const grandTotal = taxableBase + taxAmount + serviceAmount;

  if (config.showSubtotal) {
    builder.twoColumnLine('Subtotal', formatRupiah(rawSubtotal));
  }
  if (config.showDiscount && totalDiscount > 0) {
    builder.twoColumnLine('Diskon', `-${formatRupiah(totalDiscount)}`);
  }
  if (config.showService && serviceAmount > 0) {
    builder.twoColumnLine(config.serviceLabel || 'Layanan', formatRupiah(serviceAmount));
  }
  if (config.showTax && taxAmount > 0) {
    builder.twoColumnLine(config.taxLabel || 'PPN', formatRupiah(taxAmount));
  }

  // Grand Total Highlight
  builder.bold(true);
  if (config.totalHighlight === 'invert') {
    builder.invert(true);
    builder.twoColumnLine(' TOTAL ', ` ${formatRupiah(grandTotal)} `);
    builder.invert(false);
  } else if (config.totalHighlight === 'double_box') {
    builder.size('double_height');
    builder.twoColumnLine('TOTAL', formatRupiah(grandTotal));
    builder.size('normal');
  } else {
    builder.twoColumnLine('TOTAL', formatRupiah(grandTotal));
  }
  builder.bold(false);

  // Payment Breakdown
  if (config.showPaymentMethod) {
    builder.separator('dotted');
    builder.twoColumnLine('Metode Bayar', trx.paymentMethod);
    if (config.showCashTendered && trx.paymentMethod === 'TUNAI') {
      builder.twoColumnLine('Uang Diterima', formatRupiah(trx.cashTendered || grandTotal));
      const change = Math.max(0, (trx.cashTendered || grandTotal) - grandTotal);
      if (config.showChange) {
        builder.twoColumnLine('Kembalian', formatRupiah(change));
      }
    }
    builder.separator(config.separatorStyle);
  }

  // 7. Promo Box
  if (config.showPromoBox && (config.promoTitle || config.promoText)) {
    builder.align('center');
    if (config.promoTitle) {
      builder.bold(true).line(`[ ${config.promoTitle} ]`).bold(false);
    }
    if (config.promoText) {
      const lines = config.promoText.split('\n');
      for (const l of lines) {
        builder.line(l);
      }
    }
    builder.newLine();
  }

  // 8. Policy & Terms
  if (config.showPolicy && config.policyText) {
    builder.align('center');
    const lines = config.policyText.split('\n');
    for (const l of lines) {
      builder.line(l);
    }
    builder.newLine();
  }

  // 9. Footer & Thank you
  if (config.showFooter) {
    builder.align(config.footerAlignment);
    if (config.thankYouMessage) {
      builder.bold(true).line(config.thankYouMessage).bold(false);
    }
    if (config.footerSubtitle) {
      builder.line(config.footerSubtitle);
    }
    builder.newLine();
  }

  // 10. Barcode (Code128)
  if (config.showBarcode && trx.receiptNo) {
    builder.barcode(trx.receiptNo.replace(/[^A-Za-z0-9_-]/g, ''));
  }

  // 11. Open Cash Drawer (if set after print)
  if (config.openCashDrawer && config.drawerTiming === 'after') {
    builder.kickDrawer(config.drawerPin);
  }

  // 12. Feed extra blank lines to clear the cutter blade
  const feedCount = Math.max(2, config.feedLinesBeforeCut || 4);
  builder.feed(feedCount);

  // 13. AUTO-CUT HARDWARE COMMAND
  if (config.autoCut) {
    builder.autoCut(config.autoCutType, feedCount);
  }

  return builder.build();
}

/**
 * Generate Diagnostic 58mm Test Print Data
 */
export function generateDiagnosticTest(cols: number = 32): Uint8Array {
  const b = new EscPosBuilder(cols);
  b.init();
  b.align('center').bold(true).size('double_both');
  b.line('58MM TEST PRINT');
  b.size('normal').bold(false);
  b.line('Uji Koneksi & Auto-Cut Windows');
  b.separator('double');
  b.align('left');
  b.line('12345678901234567890123456789012'.slice(0, cols));
  b.line('Col Ruler: 32 Karakter Lebar Roll');
  b.separator('dashed');
  b.twoColumnLine('Printer Roll', '58 mm Thermal');
  b.twoColumnLine('Baud Rate', '9600 / 115200');
  b.twoColumnLine('Fitur Auto-Cut', 'AKTIF');
  b.twoColumnLine('Laci Uang (Drawer)', 'AKTIF');
  b.separator('dotted');
  b.align('center').bold(true);
  b.line('--- POTONGAN KERTAS DI SINI ---');
  b.feed(4);
  b.autoCut('feed_and_cut', 4);
  return b.build();
}

/**
 * Web Serial API for Windows COM Port Direct Printing
 */
export async function printViaWebSerial(data: Uint8Array): Promise<{ success: boolean; message: string }> {
  if (!('serial' in navigator)) {
    return {
      success: false,
      message: 'Web Serial API tidak didukung browser ini. Silakan gunakan Google Chrome / Microsoft Edge di Windows.',
    };
  }

  try {
    // Request a port and open a connection.
    // @ts-ignore
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 }); // standard thermal printer baudrate

    const writer = port.writable.getWriter();
    await writer.write(data);
    writer.releaseLock();
    await port.close();

    return {
      success: true,
      message: 'Perintah nota & auto-cut berhasil dikirim ke printer thermal via Serial COM port Windows!',
    };
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      return { success: false, message: 'Pemilihan printer dibatalkan.' };
    }
    return { success: false, message: `Gagal mengirim data ke Serial: ${err.message || err}` };
  }
}

/**
 * Download raw .PRN / .BIN file for Windows CMD `copy /b nota.prn \\localhost\Printer`
 */
export function downloadRawPrnFile(data: Uint8Array, filename: string = 'nota-transaksi-58mm.prn') {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
