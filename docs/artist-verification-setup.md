# Artist verification setup

Signup captures a public hometown and an optional private mailing address. A database trigger moves the address into `account_locations` and removes it from auth metadata. Only its owner can read or edit that row. ID images and document numbers are never stored by NewMusiq.

Artist access requires both a live Stripe Identity result and a separate human page-ownership approval. Choosing the artist role, supplying an artist name, returning from Stripe, or completing a test-mode verification never grants page-editing access.

## Activation

1. Approve Stripe Identity as the verification provider. Enable Identity in the Stripe account.
2. Set server-side Supabase Edge Function secrets: `STRIPE_SECRET_KEY` (live key), `STRIPE_WEBHOOK_SECRET`, and `APP_URL` (the HTTPS app URL). Never put these secrets in a `VITE_` variable or commit them.
3. Deploy `artist-verification`, `artist-identity-webhook`, and `review-artist-claim`, including their shared module. They use custom authentication: the first and third validate the caller with Supabase Auth; the webhook verifies Stripe's signature. The gateway JWT setting must be disabled for these handlers.
4. Configure Stripe to send `identity.verification_session.verified`, `.requires_input`, `.processing`, and `.canceled` events to the `artist-identity-webhook` function URL. It verifies the signature, retrieves the current session, checks its claim/user/session binding, and ignores test-mode events.
5. Assign `app_metadata.artist_reviewer = true` to authorized reviewers using server/admin tooling. Do not use editable user metadata. Reviewers use **Artist access → Page-ownership reviews**. They must independently confirm control of the official artist presence; an ID match alone does not prove authority over a band or an existing page.
6. Test with a dedicated account: submit a claim, complete ID verification, refresh status, approve ownership, and save a page design. Rejected or unverified accounts must remain unable to edit. Stripe test mode is intentionally unable to unlock production editing.
7. Only after the owner approves activation, set server secret `ARTIST_IDENTITY_ENABLED=true` and frontend build variable `VITE_ARTIST_IDENTITY_ENABLED=true`. Both default to inactive. The owner requested that verification remain prepared but inactive; do not turn these on without a new instruction.

## Required page content

Customization supports bio, origin, tagline, portrait/artwork URLs, accent color, three layouts, and up to twelve additional text sections. The editor cannot remove supporter rankings, track rankings, albums, the full track list, featured appearances, or existing catalog records. Supporter lists show the top five by all-time recorded streams/comments, with deterministic tie-breaking. Legacy activity is backfilled when the migration runs; new activity updates counts automatically. Catalog songs must have `song_artists` links to contribute to artist rankings.

## Validation

`supabase/tests/artist_access.sql` uses transaction-scoped fixtures and rolls back. It checks address privacy, metadata cleanup, forged-approval rejection, unverified-edit denial, verified editing, and cross-user isolation.

The Identity start handler must not be enabled before provider approval and credentials are configured. Until then the UI shows that verification is unavailable and nobody is marked verified.

Security advisor check: no new database security findings. The project has an existing warning for disabled leaked-password protection; see [Supabase password protection settings](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
