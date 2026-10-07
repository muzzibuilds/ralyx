// Stripe Payment Types

export interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentMetadata {
  registrationId?: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  duprProfileUrl?: string;
}

export interface StripeCheckoutProps {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  registrationId?: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
  status?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  paymentMethod: string;
  paymentDate?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
