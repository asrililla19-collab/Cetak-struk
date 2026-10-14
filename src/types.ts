export type PaperWidth = 58 | 80;

export type AutoCutType = 'full' | 'partial' | 'feed_and_cut';

export type FontStyle = 'monospace' | 'receipt_sans' | 'dot_matrix';

export type ItemLayoutMode = 'compact_2row' | 'single_row' | 'classic_columns';

export type SeparatorStyle = 'dashed' | 'dotted' | 'double' | 'solid' | 'stars';

export type TotalHighlightStyle = 'none' | 'bold' | 'invert' | 'double_box';

export type LogoAlignment = 'left' | 'center' | 'right';

export interface ReceiptLayoutConfig {
  // Store Header
  showHeader: boolean;
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  headerCustomNote: string;
  headerAlignment: 'center' | 'left';

  // Logo
  showLogo: boolean;
  logoUrl: string;
  logoWidth: number; // in px on 58mm preview (e.g. 100 - 200px)
  logoAlignment: LogoAlignment;
  logoMonochrome: boolean;

  // Metadata / Info
  showMeta: boolean;
  showReceiptNo: boolean;
  receiptPrefix: string;
  showDate: boolean;
  dateFormat: 'ID_SHORT' | 'ID_LONG' | 'TIME_ONLY';
  showCashier: boolean;
  cashierLabel: string;
  cashierName: string;
  showCustomer: boolean;
  customerLabel: string;
  showTable: boolean;
  tableLabel: string;

  // Items Layout
  itemLayoutMode: ItemLayoutMode;
  showSku: boolean;
  showItemDiscount: boolean;
  showItemNote: boolean;
  fontSizeItems: 'compact' | 'normal' | 'large';

  // Financial / Summary
  showSubtotal: boolean;
  showDiscount: boolean;
  showTax: boolean;
  taxLabel: string;
  taxRate: number; // e.g. 11 for 11%
  showService: boolean;
  serviceLabel: string;
  serviceRate: number; // e.g. 5 for 5%
  showRounding: boolean;
  showPaymentMethod: boolean;
  showCashTendered: boolean;
  showChange: boolean;
  totalHighlight: TotalHighlightStyle;

  // Notes & Policy
  showPromoBox: boolean;
  promoTitle: string;
  promoText: string;
  showPolicy: boolean;
  policyText: string;

  // Footer & Greetings
  showFooter: boolean;
  thankYouMessage: string;
  footerSubtitle: string;
  footerAlignment: 'center' | 'left';

  // Barcode & QR Code
  showBarcode: boolean;
  barcodeType: 'CODE128' | 'CODE39';
  showQrCode: boolean;
  qrCodeValue: string;
  qrCodeLabel: string;
  qrCodeSize: number; // in px

  // Thermal Hardware & Auto-Cut Settings
  paperWidth: PaperWidth; // 58 or 80 mm
  characterWidth: number; // standard 32 chars for 58mm
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  separatorStyle: SeparatorStyle;
  fontStyle: FontStyle;
  
  // Hardware Auto-Cut
  autoCut: boolean;
  autoCutType: AutoCutType;
  feedLinesBeforeCut: number; // 2 to 8 blank lines
  visualCutterGuide: boolean; // Show cut line guide on preview

  // Cash Drawer Kick
  openCashDrawer: boolean;
  drawerPin: 'pin2' | 'pin5';
  drawerTiming: 'before' | 'after';
}

export interface TransactionItem {
  id: string;
  name: string;
  sku?: string;
  qty: number;
  price: number;
  discount?: number; // nominal discount
  note?: string;
}

export interface TransactionData {
  id: string;
  receiptNo: string;
  timestamp: string; // ISO string
  cashierName: string;
  customerName: string;
  tableNo?: string;
  items: TransactionItem[];
  paymentMethod: 'TUNAI' | 'QRIS' | 'DEBIT' | 'TRANSFER' | 'KREDIT';
  cashTendered: number;
  manualDiscountNominal: number;
  notes?: string;
}

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  category: 'retail' | 'food' | 'service' | 'pharmacy' | 'parking';
  badge: string;
  config: ReceiptLayoutConfig;
  sampleTransaction: TransactionData;
}
