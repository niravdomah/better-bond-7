/**
 * Typed API endpoint functions for BetterBond Commission Payments
 * Auto-generated from OpenAPI spec: generated-docs/specs/api-spec.yaml
 *
 * All functions use the typed API client from @/lib/api/client.
 * DO NOT EDIT MANUALLY — regenerate from the API spec.
 */

import { get, post, put } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';
import type {
  DefaultResponse,
  PaymentRead,
  PaymentReadList,
  PaymentBatchRead,
  PaymentBatchReadList,
  PaymentsDashboardRead,
  PaymentIdsRequest,
  PaymentListParams,
  PaymentBatchListParams,
} from '@/types/api-generated';

// ─── Payments ────────────────────────────────────────────────────────

/** GET /v1/payments — Get a list of all payments */
export const getPayments = (params?: PaymentListParams) =>
  get<PaymentReadList>('/v1/payments', params ? { ...params } : undefined);

/** GET /v1/payments/{Id} — Get payment by key */
export const getPaymentById = (id: number) =>
  get<PaymentRead>(`/v1/payments/${id}`);

/** PUT /v1/payments/park — Park one or more payments */
export const parkPayments = (body: PaymentIdsRequest) =>
  put<void>('/v1/payments/park', body);

/** PUT /v1/payments/unpark — Unpark one or more payments */
export const unparkPayments = (body: PaymentIdsRequest) =>
  put<void>('/v1/payments/unpark', body);

/** GET /v1/payments/dashboard — Get dashboard data */
export const getDashboard = () =>
  get<PaymentsDashboardRead>('/v1/payments/dashboard');

// ─── Payment Batches ─────────────────────────────────────────────────

/** GET /v1/payment-batches — Get a list of all payment batches */
export const getPaymentBatches = (params?: PaymentBatchListParams) =>
  get<PaymentBatchReadList>(
    '/v1/payment-batches',
    params ? { ...params } : undefined,
  );

/** GET /v1/payment-batches/{Id} — Get payment batch by key */
export const getPaymentBatchById = (id: number) =>
  get<PaymentBatchRead>(`/v1/payment-batches/${id}`);

/** POST /v1/payment-batches — Create payment batch */
export const createPaymentBatch = (
  body: PaymentIdsRequest,
  lastChangedUser: string,
) => post<DefaultResponse>('/v1/payment-batches', body, lastChangedUser);

/** POST /v1/payment-batches/{Id}/download-invoice-pdf — Download invoice PDF */
export const downloadInvoicePdf = (id: number) =>
  apiClient<Blob>(`/v1/payment-batches/${id}/download-invoice-pdf`, {
    method: 'POST',
    isBinaryResponse: true,
  });

// ─── Demo Administration ─────────────────────────────────────────────

/** POST /demo/reset-demo — Reset demo data */
export const resetDemo = () => post<void>('/demo/reset-demo');
