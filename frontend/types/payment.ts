export type PaymentStatus = "pending" | "successful" | "failed" | "cancelled" | "refunded";

export interface Payment {
  id: string;
  payment_reference: string;
  gateway: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paid_at: string | null;
  application: {
    id: string;
    application_reference: string;
    service_name: string | null;
  } | null;
  receipt: {
    receipt_number: string;
    issued_at: string;
  } | null;
  created_at: string;
}
