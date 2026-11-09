// Monnify checkout — Luxe Layers' interim payment path until she's onboarded
// to Selmo's own Paystack flow. Mock mode (see env.ts's monnifyMockMode) is
// on until the three MONNIFY_* env vars are filled in with her real
// credentials; nothing here needs code changes to go live, just env vars.
//
// Shape follows Monnify's published Merchant API (auth -> bearer token,
// POST init-transaction, webhook signed with the secret key) — re-verify
// field names against her Monnify dashboard's own API docs once she has
// an account, since Monnify doesn't publish a versioned OpenAPI spec.
import { createHmac } from "node:crypto";
import { env, monnifyMockMode } from "./env";

interface InitTransactionResult {
  checkoutUrl: string;
  transactionReference: string;
}

async function getAccessToken(): Promise<string> {
  const e = env();
  const basic = Buffer.from(`${e.MONNIFY_API_KEY}:${e.MONNIFY_SECRET_KEY}`).toString("base64");
  const res = await fetch(`${e.MONNIFY_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) throw new Error(`Monnify auth failed: ${res.status}`);
  const body = (await res.json()) as { responseBody: { accessToken: string } };
  return body.responseBody.accessToken;
}

/** Starts a Monnify checkout for one order. In mock mode, returns a fake
 * checkout URL that the pay page recognizes and treats as an instant
 * success — lets the whole storefront/checkout/order flow be built and
 * tested before she has real Monnify credentials. */
export async function initMonnifyTransaction(args: {
  reference: string;
  amountKobo: number;
  customerName: string;
  customerEmail: string;
}): Promise<InitTransactionResult> {
  if (monnifyMockMode()) {
    return { checkoutUrl: `/pay/mock?reference=${encodeURIComponent(args.reference)}`, transactionReference: args.reference };
  }
  const e = env();
  const accessToken = await getAccessToken();
  const res = await fetch(`${e.MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: args.amountKobo / 100,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      paymentReference: args.reference,
      paymentDescription: "Luxe Layers order",
      currencyCode: "NGN",
      contractCode: e.MONNIFY_CONTRACT_CODE,
      redirectUrl: `${e.APP_URL}/pay/callback?reference=${encodeURIComponent(args.reference)}`,
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
    }),
  });
  if (!res.ok) throw new Error(`Monnify init-transaction failed: ${res.status}`);
  const body = (await res.json()) as { responseBody: { checkoutUrl: string; transactionReference: string } };
  return { checkoutUrl: body.responseBody.checkoutUrl, transactionReference: body.responseBody.transactionReference };
}

/** Verifies a webhook actually came from Monnify — the raw request body,
 * signed with the secret key, must match the monnify-signature header.
 * Never trust a webhook payload before this passes. */
export function verifyMonnifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const e = env();
  if (!e.MONNIFY_SECRET_KEY) return false;
  const expected = createHmac("sha512", e.MONNIFY_SECRET_KEY).update(rawBody).digest("hex");
  return expected === signatureHeader;
}
