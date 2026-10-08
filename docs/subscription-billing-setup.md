# NewMusiq subscriptions

| Plan | Introductory trial | Monthly price |
| --- | --- | --- |
| Listener | 1 calendar month | $5 USD |
| Artist | 3 calendar months | $10 USD |

The trial begins when the checkout session is prepared and ends on the corresponding UTC calendar date, clamped to the last day of shorter months. Checkout links expire after 30 minutes. Stripe displays the exact trial end and recurring charge before the customer confirms. A card is required; no trial begins merely by creating a NewMusiq account. One introductory trial is allowed per account across both plans. Canceling and resubscribing does not restore eligibility.

## Deployment status

The `billing` and `billing-webhook` functions and billing database migration are deployed to the NewMusiq Supabase project. The deployed configuration check returns `ready: true` as of October 2, 2026. This checks credential formats and required settings only; Stripe permissions, checkout completion, and webhook delivery still require validation. No payment or real subscription has been created during implementation.

## Activate live payments

1. In [NewMusiq Edge Function secrets](https://supabase.com/dashboard/project/dcoivxvmgoggevpqurcc/functions/secrets), set `STRIPE_BILLING_SECRET_KEY` to a Stripe live secret key (`sk_live_`) or live restricted key (`rk_live_`). Restricted keys need permissions for the operations used here: Customers, Products, Prices, Checkout Sessions, and Customer Portal write access, plus Subscriptions read access. Stripe will report any missing permissions when the corresponding operation runs. The billing return URL defaults to `https://newmusiq-gamma.vercel.app`; set `BILLING_APP_URL` only to override it when the domain changes. Never put secret keys in `VITE_` variables or source control.
2. In Stripe, add a webhook destination for `https://dcoivxvmgoggevpqurcc.supabase.co/functions/v1/billing-webhook`. Subscribe to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`.
3. Save that destination's signing secret in Supabase as `STRIPE_BILLING_WEBHOOK_SECRET`.
4. Publish the updated frontend through the app's normal hosting workflow. Open Subscription and confirm that both plans can reach Stripe checkout with the advertised USD price and trial end. Do not complete a real charge for testing without explicit authorization.
5. Check webhook delivery in Stripe and use Refresh subscription status after returning from checkout. Confirm cancellation and payment-method updates through Manage billing.

The backend creates the exact recurring Stripe Prices on first checkout using stable lookup keys. Prices are validated against the advertised currency, amount, and monthly interval. The billing portal is configured to allow card updates, invoice history, and end-of-period cancellation. To change plans, cancel the current subscription and select a different plan after it ends. No automatic plan switches or prorated charges are introduced.

## Scope and protections

- Customers enter payment information directly into Stripe-hosted checkout; NewMusiq stores only billing references and subscription status.
- Client requests cannot set prices, trial eligibility, customer IDs, or paid status. Database policies allow an account to read only its own non-sensitive billing summary.
- Signed webhooks and authenticated refresh calls read current Stripe state instead of trusting checkout return URLs or old event payloads. Test-mode events are ignored by the live integration.
- A per-account lock serializes checkout and synchronization. Existing open checkout sessions are reused; another subscription cannot be created while a recognized subscription remains current.
- Subscription purchasing does **not** grant artist-page ownership. Identity verification remains inactive as requested; it must be activated separately, and ownership approval is still required.
- This change adds billing and subscription status. It does not lock existing playback or library access behind a new paywall; feature restrictions need an explicit product decision and enforcement across the data/storage services before being advertised.

## Validation

- `node supabase/tests/billing-plans.test.js`: verifies amounts, calendar months, leap years, and rejection of misconfigured Stripe prices.
- `supabase/tests/billing_access.sql`: transaction-scoped tests for cross-user isolation, write denial, protected Stripe IDs, and concurrent checkout locks; all fixtures roll back.
- The frontend production build passes. Live restricted-key acceptance is covered by the billing tests. Real payment completion, restricted-key permissions, and provider webhook delivery remain untested.

