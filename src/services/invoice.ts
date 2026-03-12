import PDFDocument from 'pdfkit';

export interface InvoiceData {
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  companyName?: string;
  gstNumber?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
}

const BRAND_COLOR: [number, number, number] = [22, 176, 238];
const DARK: [number, number, number] = [26, 26, 46];
const GRAY: [number, number, number] = [100, 100, 110];
const LIGHT_GRAY: [number, number, number] = [240, 242, 245];

function fmt(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const L = 50;
    const R = pageW - 50;
    const contentW = R - L;

    // ── Header bar ──────────────────────────────────────────────────────────
    doc.rect(0, 0, pageW, 80).fill(DARK);

    const siteName = process.env.SITE_NAME || 'Tobo Digital';
    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('white')
      .text(siteName, L, 25, { width: contentW / 2 });

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor([200, 220, 255])
      .text('TAX INVOICE', R - 100, 28, { width: 100, align: 'right' })
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('white')
      .text(`#${data.orderNumber}`, R - 100, 42, { width: 100, align: 'right' });

    // ── Accent strip ────────────────────────────────────────────────────────
    doc.rect(0, 80, pageW, 4).fill(BRAND_COLOR);

    // ── Order meta ──────────────────────────────────────────────────────────
    let y = 105;

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(GRAY)
      .text('Order Date', L, y)
      .font('Helvetica-Bold')
      .fillColor(DARK)
      .text(
        data.orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        L,
        y + 12
      );

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(GRAY)
      .text('Payment', L + 160, y)
      .font('Helvetica-Bold')
      .fillColor(DARK)
      .text(
        data.paymentMethod.toUpperCase() + '  ·  ' + data.paymentStatus.toUpperCase(),
        L + 160,
        y + 12
      );

    // ── Bill to / Ship to columns ────────────────────────────────────────────
    y = 155;
    const col2x = L + contentW / 2;

    // Bill to
    doc.rect(L, y, contentW / 2 - 10, 100).fill(LIGHT_GRAY).fillColor(DARK);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(BRAND_COLOR)
      .text('BILL TO', L + 12, y + 12);
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(DARK)
      .text(data.customerName, L + 12, y + 26);
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(GRAY)
      .text(data.customerEmail, L + 12, y + 40);

    const billAddr = data.billingAddress || data.shippingAddress;
    doc.text(
      [billAddr.street, billAddr.city, billAddr.state, billAddr.zipCode, billAddr.country]
        .filter(Boolean)
        .join(', '),
      L + 12,
      y + 53,
      { width: contentW / 2 - 30 }
    );

    if (data.companyName) {
      doc.font('Helvetica-Bold').fillColor(DARK).text(data.companyName, L + 12, y + 78);
    }
    if (data.gstNumber) {
      doc.font('Helvetica').fillColor(GRAY).text(`GSTIN: ${data.gstNumber}`, L + 12, y + 90);
    }

    // Ship to
    doc.rect(col2x, y, contentW / 2, 100).fill(LIGHT_GRAY).fillColor(DARK);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(BRAND_COLOR)
      .text('SHIP TO', col2x + 12, y + 12);
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(DARK)
      .text(data.customerName, col2x + 12, y + 26);
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(GRAY)
      .text(
        [
          data.shippingAddress.street,
          data.shippingAddress.city,
          data.shippingAddress.state,
          data.shippingAddress.zipCode,
          data.shippingAddress.country,
        ]
          .filter(Boolean)
          .join(', '),
        col2x + 12,
        y + 40,
        { width: contentW / 2 - 24 }
      );

    // ── Items table header ───────────────────────────────────────────────────
    y = 275;
    doc.rect(L, y, contentW, 24).fill(DARK);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('white')
      .text('#', L + 8, y + 8)
      .text('Item', L + 28, y + 8, { width: contentW * 0.55 })
      .text('Qty', L + contentW * 0.65, y + 8, { width: 40, align: 'center' })
      .text('Unit Price', L + contentW * 0.72, y + 8, { width: 70, align: 'right' })
      .text('Amount', L + contentW * 0.86, y + 8, { width: contentW * 0.14 - 8, align: 'right' });

    // ── Items rows ───────────────────────────────────────────────────────────
    y += 24;
    let subtotal = 0;
    data.items.forEach((item, idx) => {
      const rowH = 26;
      const bg: [number, number, number] = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
      doc.rect(L, y, contentW, rowH).fill(bg);

      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(GRAY)
        .text(String(idx + 1), L + 8, y + 9)
        .fillColor(DARK)
        .text(item.name, L + 28, y + 9, { width: contentW * 0.55, ellipsis: true })
        .fillColor(GRAY)
        .text(String(item.quantity), L + contentW * 0.65, y + 9, { width: 40, align: 'center' })
        .text(fmt(item.price), L + contentW * 0.72, y + 9, { width: 70, align: 'right' })
        .font('Helvetica-Bold')
        .fillColor(DARK)
        .text(fmt(lineTotal), L + contentW * 0.86, y + 9, {
          width: contentW * 0.14 - 8,
          align: 'right',
        });

      y += rowH;
    });

    // Bottom border of table
    doc.moveTo(L, y).lineTo(R, y).strokeColor(LIGHT_GRAY).lineWidth(1).stroke();

    // ── Totals ───────────────────────────────────────────────────────────────
    y += 12;
    const totalsX = L + contentW * 0.6;
    const totalsW = contentW * 0.4;

    const addTotalRow = (label: string, value: string, bold = false, accent = false) => {
      doc
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(bold ? 10 : 9)
        .fillColor(accent ? BRAND_COLOR : bold ? DARK : GRAY)
        .text(label, totalsX, y, { width: totalsW * 0.55 })
        .text(value, totalsX + totalsW * 0.55, y, { width: totalsW * 0.45, align: 'right' });
      y += bold ? 18 : 14;
    };

    addTotalRow('Subtotal', fmt(subtotal));
    addTotalRow('Shipping', 'FREE', false, true);

    // divider
    doc
      .moveTo(totalsX, y)
      .lineTo(R, y)
      .strokeColor([220, 220, 225])
      .lineWidth(0.5)
      .stroke();
    y += 8;

    addTotalRow('TOTAL', fmt(data.totalAmount), true, true);

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.rect(0, pageH - 50, pageW, 50).fill(LIGHT_GRAY);
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(GRAY)
      .text(
        `Thank you for shopping with ${siteName}  ·  This is a computer-generated invoice and does not require a signature.`,
        L,
        pageH - 32,
        { width: contentW, align: 'center' }
      );

    doc.end();
  });
}
