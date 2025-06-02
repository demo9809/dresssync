import { Order } from './orderService';

export interface PDFOrderData {
  order: Order;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export const pdfService = {
  generateOrderPDF: async (order: Order): Promise<string> => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order ${order.id}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 0;
            font-size: 11px;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 4px;
          }
          .order-title {
            font-size: 14px;
            color: #1f2937;
            margin-bottom: 2px;
          }
          .order-id {
            font-size: 12px;
            color: #6b7280;
          }
          .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            flex: 1;
          }
          .left-column, .right-column {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .section {
            padding: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            background-color: #f9fafb;
          }
          .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 6px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 2px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            padding: 1px 0;
          }
          .detail-label {
            font-weight: bold;
            color: #4b5563;
            min-width: 70px;
            font-size: 10px;
          }
          .detail-value {
            color: #1f2937;
            flex: 1;
            text-align: left;
            font-size: 10px;
            margin-left: 8px;
          }
          .size-breakdown {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
            gap: 4px;
            margin-top: 6px;
          }
          .size-item {
            text-align: center;
            padding: 3px;
            background-color: white;
            border: 1px solid #d1d5db;
            border-radius: 2px;
          }
          .size-label {
            font-weight: bold;
            color: #374151;
            font-size: 9px;
          }
          .size-qty {
            color: #2563eb;
            font-size: 10px;
            font-weight: bold;
          }
          .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-pending { background-color: #fef3c7; color: #92400e; }
          .status-in-production { background-color: #dbeafe; color: #1d4ed8; }
          .status-shipped { background-color: #d1fae5; color: #065f46; }
          .status-delivered { background-color: #dcfce7; color: #166534; }
          .total-summary {
            background-color: #2563eb;
            color: white;
            padding: 6px;
            border-radius: 4px;
            text-align: center;
            font-size: 11px;
            font-weight: bold;
          }
          .quantity-section {
            grid-column: 1 / -1;
          }
          .footer {
            margin-top: 12px;
            text-align: center;
            color: #6b7280;
            font-size: 8px;
            border-top: 1px solid #e5e7eb;
            padding-top: 6px;
          }
          @media print {
            body { 
              margin: 0; 
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .section { 
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">DressSync</div>
          <div class="order-title">Order Details</div>
          <div class="order-id">Order ID: ${order.id}</div>
        </div>

        <div class="content-grid">
          <div class="left-column">
            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${order.customer.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${order.customer.phone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">WhatsApp:</span>
                <span class="detail-value">${order.customer.whatsapp}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">
                  ${order.customer.address.street}, ${order.customer.address.city}, 
                  ${order.customer.address.state} ${order.customer.address.zipCode}
                </span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Product Information</div>
              <div class="detail-row">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${order.product.type}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Color:</span>
                <span class="detail-value">${order.product.color}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Neck:</span>
                <span class="detail-value">${order.product.neckType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order Type:</span>
                <span class="detail-value">${order.orderType}</span>
              </div>
              ${order.product.specialInstructions ? `
              <div class="detail-row">
                <span class="detail-label">Instructions:</span>
                <span class="detail-value">${order.product.specialInstructions}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="right-column">
            <div class="section">
              <div class="section-title">Delivery Information</div>
              <div class="detail-row">
                <span class="detail-label">Event Date:</span>
                <span class="detail-value">${new Date(order.delivery.eventDate).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Delivery:</span>
                <span class="detail-value">${new Date(order.delivery.deliveryDate).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                  <span class="status-badge status-${order.delivery.status.toLowerCase().replace(' ', '-')}">
                    ${order.delivery.status}
                  </span>
                </span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Payment Information</div>
              <div class="detail-row">
                <span class="detail-label">Total:</span>
                <span class="detail-value">$${order.payment.amount.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Paid:</span>
                <span class="detail-value">$${order.payment.paid.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Pending:</span>
                <span class="detail-value">$${order.payment.pending.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                  <span class="status-badge status-${order.payment.status.toLowerCase()}">
                    ${order.payment.status}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div class="section quantity-section">
            <div class="section-title">Quantity & Size Breakdown</div>
            <div class="total-summary">
              Total Quantity: ${order.quantity.total} pieces
            </div>
            <div class="size-breakdown">
              ${Object.entries(order.quantity.sizeBreakdown).map(([size, qty]) => `
                <div class="size-item">
                  <div class="size-label">${size}</div>
                  <div class="size-qty">${qty}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | DressSync - Professional Apparel Solutions</p>
        </div>
      </body>
      </html>
    `;

    // Convert HTML to blob URL for download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    return url;
  },

  downloadOrderPDF: async (order: Order): Promise<void> => {
    const pdfUrl = await pdfService.generateOrderPDF(order);

    // Create download link
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Order_${order.id}_${order.customer.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
  },

  printOrderPDF: async (order: Order): Promise<void> => {
    const pdfUrl = await pdfService.generateOrderPDF(order);

    // Open in new window for printing
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }
};