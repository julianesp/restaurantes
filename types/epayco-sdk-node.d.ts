declare module 'epayco-sdk-node' {
  interface EpaycoConfig {
    apiKey: string;
    privateKey: string;
    lang?: string;
    test?: boolean;
  }

  interface PaymentData {
    name: string;
    description: string;
    invoice: string;
    currency: string;
    amount: string;
    tax_base: string;
    tax: string;
    country: string;
    lang: string;
    external: string;
    response: string;
    confirmation: string;
    name_billing: string;
    email_billing: string;
    mobilephone_billing?: string;
    methodsDisable?: string[];
  }

  interface PaymentResponse {
    success: boolean;
    data: {
      url_payment?: string;
      ref_payco?: string;
      description?: string;
    };
  }

  interface TransactionResponse {
    success: boolean;
    data: any;
  }

  interface EpaycoClient {
    pagos: {
      create: (data: PaymentData) => Promise<PaymentResponse>;
    };
    charge: {
      get: (id: string) => Promise<TransactionResponse>;
    };
  }

  function epayco(config: EpaycoConfig): EpaycoClient;

  export = epayco;
}
