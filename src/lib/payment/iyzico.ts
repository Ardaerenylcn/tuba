import type {
  PaymentCreateParams,
  PaymentCreateResult,
  PaymentVerifyParams,
  PaymentVerifyResult,
  PaymentRefundParams,
  PaymentRefundResult,
  PaymentProvider,
} from "./types";

export class IyzicoProvider implements PaymentProvider {
  readonly name = "iyzico";

  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, secretKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  async createPayment(params: PaymentCreateParams): Promise<PaymentCreateResult> {
    // TODO: Implement İyzico Checkout Form initialization
    // https://dev.iyzipay.com/tr/checkout-form/initialize
    throw new Error("İyzico createPayment not yet implemented");
  }

  async verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    // TODO: Implement İyzico Checkout Form retrieval
    // https://dev.iyzipay.com/tr/checkout-form/retrieve
    throw new Error("İyzico verifyPayment not yet implemented");
  }

  async refundPayment(params: PaymentRefundParams): Promise<PaymentRefundResult> {
    // TODO: Implement İyzico refund
    throw new Error("İyzico refundPayment not yet implemented");
  }

  verifyWebhook(payload: unknown, signature: string): boolean {
    // TODO: Implement İyzico webhook HMAC verification
    throw new Error("İyzico verifyWebhook not yet implemented");
  }
}
