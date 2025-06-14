import html2pdf from 'html2pdf.js';

// Updated interface to match database structure
export interface DatabaseOrder {
  id: number;
  order_number: string;
  agent_id: number;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  customer_address: string;
  product_type: string;
  product_color: string;
  neck_type: string;
  total_quantity: number;
  size_breakdown: string;
  special_instructions: string;
  event_date: string;
  delivery_date: string;
  order_status: string;
  total_amount: number;
  paid_amount: number;
  payment_status: string;
  order_type: string;
}

export interface OrderItem {
  productType: string;
  productColor: string;
  sizeBreakdown: { [size: string]: number };
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderPDFContent {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderItems?: OrderItem[];
  totalAmount: number;
  eventDate: string;
  deliveryDate: string;
  specialInstructions?: string;
}

export const pdfService = {
  generateOrderHTML: (order: DatabaseOrder | OrderPDFContent): string => {
    // Determine if this is a multi-product order
    const isMultiProduct = 'orderItems' in order && order.orderItems && order.orderItems.length > 0;
    
    // Format currency
    const formatCurrency = (amount: number | string) => {
      const num = parseFloat(amount?.toString() || '0');
      return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Format date
    const formatDate = (dateString: string) => {
      if (!dateString) return 'Not specified';
      try {
        return new Date(dateString).toLocaleDateString('en-IN');
      } catch {
        return dateString;
      }
    };

    // Generate size breakdown table
    const generateSizeBreakdown = (sizeBreakdown: string | { [size: string]: number }) => {
      try {
        const breakdown = typeof sizeBreakdown === 'string' ? JSON.parse(sizeBreakdown || '{}') : sizeBreakdown;
        const sizes = Object.keys(breakdown);
        const quantities = Object.values(breakdown);
        
        if (sizes.length === 0) {
          return '<div class="text-center text-gray-500">No size breakdown available</div>';
        }

        const headerRow = sizes.map(size => `<div class="size-header">${size}</div>`).join('');
        const quantityRow = quantities.map(qty => `<div class="size-cell">${qty}</div>`).join('');
        
        return `
          <div class="size-breakdown">
            <div class="size-row">${headerRow}</div>
            <div class="size-row">${quantityRow}</div>
          </div>
        `;
      } catch {
        return '<div class="text-center text-gray-500">Invalid size breakdown data</div>';
      }
    };

    // Create clean, professional HTML content for A4 portrait PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order ${isMultiProduct ? (order as OrderPDFContent).orderNumber : (order as DatabaseOrder).order_number}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.4;
            color: #2c3e50;
            font-size: 12px;
            background: white;
          }
          
          .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
          }
          
          /* Header Section */
          .header {
            text-align: center;
            border-bottom: 3px solid #34495e;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .company-tagline {
            font-size: 11px;
            color: #7f8c8d;
            margin-bottom: 10px;
          }
          
          .order-title {
            font-size: 18px;
            font-weight: bold;
            color: #34495e;
            margin-bottom: 5px;
          }
          
          .order-details-header {
            font-size: 12px;
            color: #7f8c8d;
          }
          
          /* Main Content Grid */
          .content-wrapper {
            margin-top: 20px;
          }
          
          .section {
            margin-bottom: 20px;
            border: 1px solid #bdc3c7;
            border-radius: 5px;
            overflow: hidden;
          }
          
          .section-header {
            background-color: #ecf0f1;
            padding: 10px 15px;
            border-bottom: 1px solid #bdc3c7;
            font-weight: bold;
            font-size: 13px;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .section-content {
            padding: 15px;
            background-color: #fff;
          }
          
          /* Two Column Layout */
          .two-column {
            display: table;
            width: 100%;
            table-layout: fixed;
          }
          
          .column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 10px;
          }
          
          .column:last-child {
            padding-right: 0;
            padding-left: 10px;
          }
          
          /* Detail Rows */
          .detail-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
            border-bottom: 1px dotted #ecf0f1;
            padding-bottom: 5px;
          }
          
          .detail-label {
            display: table-cell;
            font-weight: bold;
            color: #34495e;
            width: 35%;
            font-size: 11px;
            vertical-align: top;
            padding-right: 10px;
          }
          
          .detail-value {
            display: table-cell;
            color: #2c3e50;
            font-size: 11px;
            vertical-align: top;
            word-wrap: break-word;
          }
          
          /* Size Breakdown */
          .size-breakdown-container {
            margin-top: 15px;
          }
          
          .size-breakdown {
            display: table;
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .size-row {
            display: table-row;
          }
          
          .size-header {
            display: table-cell;
            background-color: #34495e;
            color: white;
            text-align: center;
            padding: 8px 5px;
            font-weight: bold;
            font-size: 10px;
            border: 1px solid #2c3e50;
          }
          
          .size-cell {
            display: table-cell;
            text-align: center;
            padding: 8px 5px;
            border: 1px solid #bdc3c7;
            font-size: 11px;
            font-weight: bold;
            background-color: #f8f9fa;
          }
          
          /* Product Items Table */
          .product-items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .product-items-table th,
          .product-items-table td {
            border: 1px solid #bdc3c7;
            padding: 8px;
            text-align: left;
            font-size: 10px;
          }
          
          .product-items-table th {
            background-color: #34495e;
            color: white;
            font-weight: bold;
            text-align: center;
          }
          
          .product-items-table td {
            background-color: #f8f9fa;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          /* Status Badges */
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-pending { 
            background-color: #f39c12; 
            color: white; 
          }
          
          .status-in-production { 
            background-color: #3498db; 
            color: white; 
          }
          
          .status-shipped { 
            background-color: #2ecc71; 
            color: white; 
          }
          
          .status-delivered { 
            background-color: #27ae60; 
            color: white; 
          }
          
          .status-cancelled { 
            background-color: #e74c3c; 
            color: white; 
          }
          
          .status-complete { 
            background-color: #27ae60; 
            color: white; 
          }
          
          .status-partial { 
            background-color: #f39c12; 
            color: white; 
          }
          
          /* Summary Section */
          .summary-section {
            background-color: #2c3e50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
          }
          
          .summary-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
          }
          
          .summary-item {
            display: table;
            width: 100%;
            margin-bottom: 5px;
          }
          
          .summary-label {
            display: table-cell;
            width: 60%;
            font-size: 12px;
          }
          
          .summary-value {
            display: table-cell;
            text-align: right;
            font-weight: bold;
            font-size: 12px;
          }
          
          /* Footer */
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 10px;
          }
          
          .footer-company {
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          /* Print Specific */
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="company-name">DressSync</div>
            <div class="company-tagline">Professional Apparel Solutions</div>
            <div class="order-title">ORDER CONFIRMATION</div>
            <div class="order-details-header">
              Order #${isMultiProduct ? (order as OrderPDFContent).orderNumber : (order as DatabaseOrder).order_number} | Generated: ${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString()}
            </div>
          </div>

          <!-- Main Content -->
          <div class="content-wrapper">
            <!-- Customer & Product Info -->
            <div class="two-column">
              <div class="column">
                <div class="section">
                  <div class="section-header">Customer Information</div>
                  <div class="section-content">
                    <div class="detail-row">
                      <div class="detail-label">Name:</div>
                      <div class="detail-value">${isMultiProduct ? (order as OrderPDFContent).customerName : (order as DatabaseOrder).customer_name}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Phone:</div>
                      <div class="detail-value">${isMultiProduct ? (order as OrderPDFContent).customerPhone : (order as DatabaseOrder).customer_phone}</div>
                    </div>
                    ${!isMultiProduct && (order as DatabaseOrder).customer_whatsapp ? `
                    <div class="detail-row">
                      <div class="detail-label">WhatsApp:</div>
                      <div class="detail-value">${(order as DatabaseOrder).customer_whatsapp}</div>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                      <div class="detail-label">Address:</div>
                      <div class="detail-value">${isMultiProduct ? (order as OrderPDFContent).customerAddress : (order as DatabaseOrder).customer_address}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="column">
                <div class="section">
                  <div class="section-header">${isMultiProduct ? 'Order Information' : 'Product Information'}</div>
                  <div class="section-content">
                    ${!isMultiProduct ? `
                    <div class="detail-row">
                      <div class="detail-label">Product Type:</div>
                      <div class="detail-value">${(order as DatabaseOrder).product_type}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Color:</div>
                      <div class="detail-value">${(order as DatabaseOrder).product_color}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Neck Type:</div>
                      <div class="detail-value">${(order as DatabaseOrder).neck_type || 'Round Neck'}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Order Type:</div>
                      <div class="detail-value">${(order as DatabaseOrder).order_type}</div>
                    </div>
                    ` : `
                    <div class="detail-row">
                      <div class="detail-label">Order Type:</div>
                      <div class="detail-value">Multi-Product Order</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Total Products:</div>
                      <div class="detail-value">${(order as OrderPDFContent).orderItems?.length || 0}</div>
                    </div>
                    `}
                    ${((isMultiProduct ? (order as OrderPDFContent).specialInstructions : (order as DatabaseOrder).special_instructions)) ? `
                    <div class="detail-row">
                      <div class="detail-label">Special Instructions:</div>
                      <div class="detail-value">${isMultiProduct ? (order as OrderPDFContent).specialInstructions : (order as DatabaseOrder).special_instructions}</div>
                    </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>

            <!-- Delivery & Payment Info -->
            <div class="two-column">
              <div class="column">
                <div class="section">
                  <div class="section-header">Delivery Information</div>
                  <div class="section-content">
                    <div class="detail-row">
                      <div class="detail-label">Event Date:</div>
                      <div class="detail-value">${formatDate(isMultiProduct ? (order as OrderPDFContent).eventDate : (order as DatabaseOrder).event_date)}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Delivery Date:</div>
                      <div class="detail-value">${formatDate(isMultiProduct ? (order as OrderPDFContent).deliveryDate : (order as DatabaseOrder).delivery_date)}</div>
                    </div>
                    ${!isMultiProduct ? `
                    <div class="detail-row">
                      <div class="detail-label">Status:</div>
                      <div class="detail-value">
                        <span class="status-badge status-${(order as DatabaseOrder).order_status.toLowerCase().replace(' ', '-')}">
                          ${(order as DatabaseOrder).order_status}
                        </span>
                      </div>
                    </div>
                    ` : ''}
                  </div>
                </div>
              </div>
              
              <div class="column">
                <div class="section">
                  <div class="section-header">Payment Information</div>
                  <div class="section-content">
                    <div class="detail-row">
                      <div class="detail-label">Total Amount:</div>
                      <div class="detail-value">${formatCurrency(isMultiProduct ? (order as OrderPDFContent).totalAmount : (order as DatabaseOrder).total_amount)}</div>
                    </div>
                    ${!isMultiProduct ? `
                    <div class="detail-row">
                      <div class="detail-label">Amount Paid:</div>
                      <div class="detail-value">${formatCurrency((order as DatabaseOrder).paid_amount || 0)}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Pending Amount:</div>
                      <div class="detail-value">${formatCurrency(((order as DatabaseOrder).total_amount || 0) - ((order as DatabaseOrder).paid_amount || 0))}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Payment Status:</div>
                      <div class="detail-value">
                        <span class="status-badge status-${(order as DatabaseOrder).payment_status.toLowerCase()}">
                          ${(order as DatabaseOrder).payment_status}
                        </span>
                      </div>
                    </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>

            ${isMultiProduct ? `
            <!-- Product Items -->
            <div class="section">
              <div class="section-header">Product Items</div>
              <div class="section-content">
                <table class="product-items-table">
                  <thead>
                    <tr>
                      <th>Product Type</th>
                      <th>Color</th>
                      <th>Quantity</th>
                      <th>Size Breakdown</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(order as OrderPDFContent).orderItems?.map((item, index) => `
                    <tr>
                      <td>${item.productType}</td>
                      <td>${item.productColor}</td>
                      <td class="text-center">${item.quantity}</td>
                      <td class="text-center">
                        ${Object.entries(item.sizeBreakdown).map(([size, qty]) => `${size}:${qty}`).join(', ')}
                      </td>
                      <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                      <td class="text-right">${formatCurrency(item.total)}</td>
                    </tr>
                    `).join('') || ''}
                  </tbody>
                </table>
              </div>
            </div>
            ` : `
            <!-- Quantity Breakdown -->
            <div class="section">
              <div class="section-header">Quantity & Size Breakdown</div>
              <div class="section-content">
                <div class="size-breakdown-container">
                  <div class="summary-item">
                    <div class="summary-label">Total Quantity:</div>
                    <div class="summary-value">${(order as DatabaseOrder).total_quantity} pieces</div>
                  </div>
                  
                  ${generateSizeBreakdown((order as DatabaseOrder).size_breakdown)}
                </div>
              </div>
            </div>
            `}

            <!-- Order Summary -->
            <div class="summary-section">
              <div class="summary-title">ORDER SUMMARY</div>
              <div class="summary-item">
                <div class="summary-label">Order Number:</div>
                <div class="summary-value">${isMultiProduct ? (order as OrderPDFContent).orderNumber : (order as DatabaseOrder).order_number}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Customer:</div>
                <div class="summary-value">${isMultiProduct ? (order as OrderPDFContent).customerName : (order as DatabaseOrder).customer_name}</div>
              </div>
              ${!isMultiProduct ? `
              <div class="summary-item">
                <div class="summary-label">Product:</div>
                <div class="summary-value">${(order as DatabaseOrder).product_type} - ${(order as DatabaseOrder).product_color}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Pieces:</div>
                <div class="summary-value">${(order as DatabaseOrder).total_quantity}</div>
              </div>
              ` : `
              <div class="summary-item">
                <div class="summary-label">Product Items:</div>
                <div class="summary-value">${(order as OrderPDFContent).orderItems?.length || 0} different products</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Pieces:</div>
                <div class="summary-value">${(order as OrderPDFContent).orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}</div>
              </div>
              `}
              <div class="summary-item">
                <div class="summary-label">Total Amount:</div>
                <div class="summary-value">${formatCurrency(isMultiProduct ? (order as OrderPDFContent).totalAmount : (order as DatabaseOrder).total_amount)}</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-company">DressSync - Professional Apparel Solutions</div>
            <div>Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString()}</div>
            <div>Contact us: support@dresssync.com | 1-800-DRESSSYNC</div>
          </div>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  },

  generateOrderPDF: async (order: DatabaseOrder | OrderPDFContent): Promise<void> => {
    try {
      const htmlContent = pdfService.generateOrderHTML(order);

      // Create a temporary div to hold the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      // Configure html2pdf options for A4 portrait
      const orderNumber = 'orderNumber' in order ? order.orderNumber : order.order_number;
      const customerName = 'customerName' in order ? order.customerName : order.customer_name;
      
      const opt = {
        margin: [15, 15, 15, 15], // top, right, bottom, left in mm
        filename: `Order_${orderNumber}_${customerName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Generate and download PDF
      await html2pdf().set(opt).from(tempDiv).save();

      // Clean up
      document.body.removeChild(tempDiv);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  },

  viewOrderHTML: (order: DatabaseOrder | OrderPDFContent): void => {
    try {
      const htmlContent = pdfService.generateOrderHTML(order);

      // Open in new window for viewing
      const viewWindow = window.open('', '_blank');
      if (viewWindow) {
        viewWindow.document.write(htmlContent);
        viewWindow.document.close();
        viewWindow.focus();
      } else {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
    } catch (error) {
      console.error('Error viewing order:', error);
      throw new Error('Failed to open order view. Please try again.');
    }
  },

  printOrderPDF: async (order: DatabaseOrder | OrderPDFContent): Promise<void> => {
    try {
      const htmlContent = pdfService.generateOrderHTML(order);

      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      } else {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
    } catch (error) {
      console.error('Error printing order:', error);
      throw new Error('Failed to print order. Please try again.');
    }
  }
};