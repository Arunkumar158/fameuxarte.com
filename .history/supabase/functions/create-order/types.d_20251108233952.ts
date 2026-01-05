declare module "npm:razorpay@2.9.2" {
  interface RazorpayConfig {
    key_id: string;
    key_secret: string;
  }

  interface CreateOrderParams {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }

  interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    created_at: number;
  }

  class Razorpay {
    constructor(config: RazorpayConfig);
    orders: {
      create(params: CreateOrderParams): Promise<RazorpayOrder>;
    };
  }

  export default Razorpay;
}

