export interface PaymentCreateParams {
  reservationId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  callbackUrl: string;
}

export interface PaymentCreateResult {
  success: boolean;
  checkoutFormContent?: string;
  token?: string;
  errorMessage?: string;
}

export interface PaymentVerifyParams {
  token: string;
  provider: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  providerPaymentId?: string;
  paidAmount?: number;
  errorMessage?: string;
}

export interface PaymentRefundParams {
  providerPaymentId: string;
  amount: number;
  currency: string;
}

export interface PaymentRefundResult {
  success: boolean;
  errorMessage?: string;
}

export interface PaymentProvider {
  name: string;
  createPayment(params: PaymentCreateParams): Promise<PaymentCreateResult>;
  verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResult>;
  refundPayment(params: PaymentRefundParams): Promise<PaymentRefundResult>;
  verifyWebhook(payload: unknown, signature: string): boolean;
}
