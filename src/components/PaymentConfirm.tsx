import type { InvoiceData } from '../types/stripe';
import { formatCurrency } from '../services/stripeService';
import './PaymentConfirm.css';

interface PaymentConfirmProps {
  status: 'processing' | 'success' | 'error';
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  paymentIntentId?: string;
  invoiceData?: InvoiceData;
  error?: string;
  onContinue: () => void;
  onRetry?: () => void;
  isLoading?: boolean;
}

/**
 * Payment Confirmation Screen
 * Shows payment status and receipt information
 */
export function PaymentConfirm({
  status,
  amount,
  email,
  firstName,
  lastName,
  paymentIntentId,
  invoiceData,
  error,
  onContinue,
  onRetry,
  isLoading = false
}: PaymentConfirmProps) {
  
  const isSuccess = status === 'success';
  const isProcessing = status === 'processing';
  const isError = status === 'error';

  const handleDownloadReceipt = () => {
    if (!invoiceData) return;
    
    // Generate simple text receipt
    const receiptText = `
RALYX SEASON REGISTRATION RECEIPT
================================

Invoice Number: ${invoiceData.invoiceNumber}
Date: ${invoiceData.date}

CUSTOMER INFORMATION
-------------------
Name: ${invoiceData.customerName}
Email: ${invoiceData.customerEmail}

PAYMENT DETAILS
---------------
Amount: ${formatCurrency(invoiceData.amount)}
Currency: ${invoiceData.currency.toUpperCase()}
Payment Method: ${invoiceData.paymentMethod}
Payment Date: ${invoiceData.paymentDate || 'Pending'}

ITEMS
-----
${invoiceData.items.map(item => `${item.description}
  Qty: ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.total)}`).join('\n\n')}

TOTAL: ${formatCurrency(invoiceData.amount)}

================================
Thank you for registering with RALYX!
For support, contact: support@ralyx.app
    `.trim();

    // Create blob and download
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RALYX-Receipt-${invoiceData.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="payment-confirm">
      {/* Processing State */}
      {isProcessing && (
        <div className="payment-confirm__container">
          <div className="payment-confirm__status payment-confirm__status--processing">
            <div className="payment-confirm__spinner"></div>
          </div>
          <h2 className="payment-confirm__title">Processing Payment...</h2>
          <p className="payment-confirm__message">
            Please wait while we process your payment. This usually takes just a few seconds.
          </p>
          <div className="payment-confirm__amount-box">
            <div className="payment-confirm__amount-label">Amount</div>
            <div className="payment-confirm__amount-value">{formatCurrency(amount)}</div>
          </div>
        </div>
      )}

      {/* Success State */}
      {isSuccess && (
        <div className="payment-confirm__container">
          <div className="payment-confirm__status payment-confirm__status--success">
            <span className="payment-confirm__check">✓</span>
          </div>
          <h2 className="payment-confirm__title">Payment Successful!</h2>
          <p className="payment-confirm__message">
            Your registration has been confirmed and payment processed.
          </p>

          <div className="payment-confirm__receipt">
            <div className="payment-confirm__receipt-header">
              <h3 className="payment-confirm__receipt-title">Order Receipt</h3>
              {invoiceData?.invoiceNumber && (
                <span className="payment-confirm__invoice-number">Invoice: {invoiceData.invoiceNumber}</span>
              )}
            </div>

            <div className="payment-confirm__receipt-details">
              <div className="payment-confirm__receipt-row">
                <span>Name</span>
                <span>{firstName} {lastName}</span>
              </div>
              <div className="payment-confirm__receipt-row">
                <span>Email</span>
                <span>{email}</span>
              </div>
              {invoiceData?.paymentDate && (
                <div className="payment-confirm__receipt-row">
                  <span>Payment Date</span>
                  <span>{invoiceData.paymentDate}</span>
                </div>
              )}
              {paymentIntentId && (
                <div className="payment-confirm__receipt-row">
                  <span>Transaction ID</span>
                  <span className="payment-confirm__transaction-id">{paymentIntentId}</span>
                </div>
              )}
            </div>

            <div className="payment-confirm__amount-box payment-confirm__amount-box--success">
              <div className="payment-confirm__amount-label">Total Paid</div>
              <div className="payment-confirm__amount-value">{formatCurrency(amount)}</div>
            </div>

            {invoiceData?.items && invoiceData.items.length > 0 && (
              <div className="payment-confirm__items">
                <h4>Items</h4>
                {invoiceData.items.map((item, idx) => (
                  <div key={idx} className="payment-confirm__item">
                    <span>{item.description}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="payment-confirm__actions">
            <button
              className="payment-confirm__btn payment-confirm__btn--receipt"
              onClick={handleDownloadReceipt}
              disabled={!invoiceData}
            >
              📥 Download Receipt
            </button>
            <button
              className="payment-confirm__btn payment-confirm__btn--primary"
              onClick={onContinue}
              disabled={isLoading}
            >
              {isLoading ? 'Completing...' : 'Continue to Dashboard'}
            </button>
          </div>

          <p className="payment-confirm__confirmation">
            A confirmation email has been sent to <strong>{email}</strong>
          </p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="payment-confirm__container">
          <div className="payment-confirm__status payment-confirm__status--error">
            <span className="payment-confirm__error-icon">!</span>
          </div>
          <h2 className="payment-confirm__title">Payment Failed</h2>
          <p className="payment-confirm__message">
            {error || 'Your payment could not be processed. Please try again or contact support.'}
          </p>

          <div className="payment-confirm__error-details">
            <div className="payment-confirm__error-box">
              <p>Error details have been logged for our support team.</p>
              <p>If this issue persists, please contact us at <strong>support@ralyx.app</strong></p>
            </div>
          </div>

          <div className="payment-confirm__actions">
            {onRetry && (
              <button
                className="payment-confirm__btn payment-confirm__btn--retry"
                onClick={onRetry}
                disabled={isLoading}
              >
                {isLoading ? 'Retrying...' : 'Try Again'}
              </button>
            )}
            <button
              className="payment-confirm__btn payment-confirm__btn--secondary"
              onClick={onContinue}
            >
              Back to Registration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentConfirm;
