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
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .order-title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .order-id {
            font-size: 18px;
            color: #6b7280;
          }
          .section {
            margin-bottom: 25px;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background-color: #f9fafb;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .detail-label {
            font-weight: bold;
            color: #4b5563;
            min-width: 150px;
          }
          .detail-value {
            color: #1f2937;
            flex: 1;
            text-align: left;
          }
          .size-breakdown {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 10px;
            margin-top: 10px;
          }
          .size-item {
            text-align: center;
            padding: 8px;
            background-color: white;
            border: 1px solid #d1d5db;
            border-radius: 4px;
          }
          .size-label {
            font-weight: bold;
            color: #374151;
          }
          .size-qty {
            color: #2563eb;
            font-size: 16px;
            font-weight: bold;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
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
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">DressSync</div>
          <div class="order-title">Order Details</div>
          <div class="order-id">Order ID: ${order.id}</div>
        </div>

        <div class="section">
          <div class="section-title">Customer Information</div>
          <div class="detail-row">
            <span class="detail-label">Customer Name:</span>
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
            <span class="detail-label">Product Type:</span>
            <span class="detail-value">${order.product.type}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Color:</span>
            <span class="detail-value">${order.product.color}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Neck Type:</span>
            <span class="detail-value">${order.product.neckType}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Order Type:</span>
            <span class="detail-value">${order.orderType}</span>
          </div>
          ${order.product.specialInstructions ? `
          <div class="detail-row">
            <span class="detail-label">Special Instructions:</span>
            <span class="detail-value">${order.product.specialInstructions}</span>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">Quantity & Size Breakdown</div>
          <div class="total-summary">
            Total Quantity: ${order.quantity.total} pieces
          </div>
          <div class="size-breakdown">
            ${Object.entries(order.quantity.sizeBreakdown).map(([size, qty]) => `
              <div class="size-item">
                <div class="size-label">Size ${size}</div>
                <div class="size-qty">${qty} pcs</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Delivery Information</div>
          <div class="detail-row">
            <span class="detail-label">Event Date:</span>
            <span class="detail-value">${new Date(order.delivery.eventDate).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Delivery Date:</span>
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
            <span class="detail-label">Total Amount:</span>
            <span class="detail-value">$${order.payment.amount.toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Paid:</span>
            <span class="detail-value">$${order.payment.paid.toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Pending Amount:</span>
            <span class="detail-value">$${order.payment.pending.toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Status:</span>
            <span class="detail-value">
              <span class="status-badge status-${order.payment.status.toLowerCase()}">
                ${order.payment.status}
              </span>
            </span>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>DressSync - Professional Apparel Solutions</p>
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