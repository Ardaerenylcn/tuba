import { IyzicoProvider } from "./iyzico";
import type { PaymentProvider } from "./types";

function createPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? "iyzico";

  switch (provider) {
    case "iyzico":
      return new IyzicoProvider(
        process.env.IYZICO_API_KEY!,
        process.env.IYZICO_SECRET_KEY!,
        process.env.IYZICO_BASE_URL!
      );
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}

export const paymentProvider = createPaymentProvider();
export type { PaymentProvider } from "./types";
