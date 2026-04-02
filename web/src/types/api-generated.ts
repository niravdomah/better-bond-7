/**
 * Auto-generated TypeScript types from OpenAPI spec: BetterBond Commission Payments v1.0.0
 * Source: generated-docs/specs/api-spec.yaml
 *
 * DO NOT EDIT MANUALLY — regenerate from the API spec.
 */

// ─── Response Schemas ────────────────────────────────────────────────

/** Standard API response for mutations and errors */
export interface DefaultResponse {
  Id: number;
  MessageType: string;
  Messages: string[];
}

/** Single payment record */
export interface PaymentRead {
  Id: number;
  Reference: string;
  AgencyName: string;
  ClaimDate: string;
  AgentName: string;
  AgentSurname: string;
  LastChangedUser: string;
  LastChangedDate: string;
  BondAmount: number;
  CommissionType: string;
  GrantDate: string;
  RegistrationDate: string;
  Bank: string;
  CommissionAmount: number;
  VAT: number;
  Status: string;
  BatchId: number;
}

/** List wrapper for payments */
export interface PaymentReadList {
  PaymentList: PaymentRead[];
}

/** Single payment batch record */
export interface PaymentBatchRead {
  Id: number;
  CreatedDate: string;
  Status: string;
  Reference: string;
  LastChangedUser: string;
  AgencyName: string;
  PaymentCount: number;
  TotalCommissionAmount: number;
  TotalVat: number;
}

/** List wrapper for payment batches */
export interface PaymentBatchReadList {
  PaymentBatchList: PaymentBatchRead[];
}

/** Dashboard: status breakdown by commission type and agency */
export interface PaymentStatusReportItem {
  Status: string;
  PaymentCount: number;
  TotalPaymentAmount: number;
  CommissionType: string;
  AgencyName: string;
}

/** Dashboard: parked payment aging bucket */
export interface ParkedPaymentsAgingReportItem {
  Range: string;
  AgencyName: string;
  PaymentCount: number;
}

/** Dashboard: per-agency summary row */
export interface PaymentsByAgencyReportItem {
  AgencyName: string;
  PaymentCount: number;
  TotalCommissionCount: number;
  Vat: number;
}

/** Full dashboard response */
export interface PaymentsDashboardRead {
  PaymentStatusReport: PaymentStatusReportItem[];
  ParkedPaymentsAgingReport: ParkedPaymentsAgingReportItem[];
  TotalPaymentCountInLast14Days: number;
  PaymentsByAgency: PaymentsByAgencyReportItem[];
}

// ─── Request Bodies ──────────────────────────────────────────────────

/** Request body for park/unpark/batch operations */
export interface PaymentIdsRequest {
  PaymentIds: number[];
}

// ─── Query Parameter Types ───────────────────────────────────────────

/** Query parameters for GET /v1/payments */
export interface PaymentListParams {
  ClaimDate?: string;
  AgencyName?: string;
  Status?: string;
}

/** Query parameters for GET /v1/payment-batches */
export interface PaymentBatchListParams {
  Reference?: string;
  AgencyName?: string;
}
