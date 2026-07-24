# Commerce completeness checklist

A memory aid so a whole concern is never *forgotten* at `intent`/`plan`. It is **not a gate** — it is
the list you walk before you finish intent. The skill already *gates* quality (`qa` ≥ 7/10) and
*teaches* craft ([`starter-kit/`](starter-kit/README.md)); this is the third thing: **coverage**.

> **How to use it.** Before you finish `intent`, walk every domain A–U below and decide what you are
> doing with it: **build / non-claim / owner-gate / engineer / non-goal.** *Write the decision down.*
> A recorded "non-goal" is a fine answer. **Silence is the failure** — OneReel's `intent.md` promised
> "cancellation and refund" and shipped no reachable refund UI, through a *verified* qa (LOG Entry 001).
> Then in `plan`: each `[NONCLAIM]` → a `non_claims` entry, each `[OWNER]`/`[ENG]` → a recorded stop.

**Tags** — how each concern maps to this skill's proven **local Next.js + synthetic-cohort** envelope:

| Tag | Meaning |
|---|---|
| **[BUILD]** | In-envelope — buildable locally/synthetically now, and should be |
| **[NONCLAIM]** | A stub/synthetic version is fine, but the record must declare what it does *not* prove |
| **[OWNER]** | Owner-gate — real access, decision, spend, or legal exposure (deployment, real payments, tax registration) |
| **[ENG]** | Engineer-required — real integration or code the lifecycle cannot produce from evidence alone |

Tags are evidence-based: every `[BUILD]` item is something the three sealed apps did, or plausibly
could, locally. Every `[OWNER]`/`[ENG]` item routes to an existing stop condition in `SKILL.md`
§Stop conditions — it is not skipped, it is *recorded*.

---

## A. Product & catalog
- [BUILD] Data model: SKU/id, **variants** (size · finish · …), options, digital vs physical, bundles
- [BUILD] Price display: base/sale, currency, **tax-inclusive vs exclusive** shown correctly
- [BUILD] **Inventory states**: in-stock / low-stock / out-of-stock / backorder / preorder — each rendered
- [BUILD] Product detail: gallery/media, description, specs, provenance/credit
- [NONCLAIM] Reviews / ratings / Q&A (synthetic ok; not real UGC)
- [BUILD] Cross-sell / related / "you may also like" (even if static)

## B. Search, browse & merchandising
- [BUILD] Category/collection browse; sort; **filter/facet** (or an explicit non-goal)
- [BUILD] **No-results / empty-search** state
- [BUILD] Merchandising slots: featured / new / bestseller
- [NONCLAIM] Personalized recommendations (synthetic/rule-based; not real ML)

## C. Cart
- [BUILD] Add / remove / update qty; line totals; **empty-cart** state
- [BUILD] **Persistence** (survives reload; guest + logged-in) and cart **merge on login**
- [BUILD] Stale-cart handling: **price changed / item out of stock since add**
- [BUILD] Promo / discount / gift-card entry + **invalid-code** state
- [BUILD] Mini-cart / drawer with correct **aria-live** count (singular/plural)

## D. Checkout — highest-leverage (≈70% of shoppers abandon here; up to 35% recoverable)
- [BUILD] **Guest checkout as the prominent path** (half of sites bury it — a top abandonment cause)
- [BUILD] Minimal steps; **clear primary CTA** on every step (30%+ of sites fail this)
- [BUILD] Address: shipping + billing, "same as", **international address formats**, validation
- [BUILD] Shipping method + rate + **delivery estimate**; free-shipping threshold
- [NONCLAIM] **Tax calculation** (synthetic/flat ok locally; real nexus/VAT is `[OWNER]`)
- [BUILD] Order review + **terms/policy acceptance** before pay
- [BUILD] Field-level validation, **inline errors, error recovery**, `autocomplete` attrs
- [BUILD] **Failure states**: declined card, network error mid-pay, expired session (use a synthetic card that declines — e.g. Marginalia's `…0002`)
- [OWNER] Express wallets (Apple/Google Pay, PayPal), BNPL — real provider

## E. Payments & money
- [OWNER] Real gateway/processor selection & credentials — **never enter card data yourself**
- [ENG] **Idempotency keys** on charge/refund/payout (prevent double-charge on retry)
- [ENG] **Authorization vs capture** (delayed capture), settlement
- [ENG] **Webhooks**: signature verification (HMAC) + **dedup on event id** for async payment events
- [ENG] Refunds full/partial; chargeback/dispute handling
- [OWNER] Multi-currency / FX / rounding
- [ENG] **Fraud**: AVS/CVV, velocity, device fingerprinting, risk scoring
- [NONCLAIM] The synthetic `PaymentForm` proves the *UI + failure path*, **not** real settlement, PCI scope, or fraud posture — declare it
- [OWNER] Subscriptions / recurring billing / dunning (if applicable)

## F. Orders & fulfilment
- [BUILD] Order lifecycle **state machine** (placed → confirmed → packed → shipped → delivered) with locked copy
- [BUILD] Order confirmation **page + receipt**; order-status/tracking page
- [BUILD] **Cancellation window rules** (e.g. block cancel after shipped — Marginalia does this)
- [NONCLAIM] Inventory decrement (local/synthetic; real **deduct-on-order + reservation buffer** to avoid overselling is `[ENG]`)
- [BUILD] Partial/split fulfilment representation (or explicit non-goal)

## G. Returns, refunds & cancellations
- [BUILD] Return / RMA request flow + reason capture; **cancelled/refunded** order state
- [BUILD] Refund vs **exchange vs store-credit** paths (or explicit non-goal)
- [OWNER] Real refund money movement
- [BUILD] **Reachability**: the refund/return UI the intent promises must actually be reachable (LOG Entry 001 failure mode)

## H. Accounts & identity
- [BUILD] Register / login / logout; **guest → account** conversion; order history; reorder; saved addresses
- [NONCLAIM] Wishlists / favorites (localStorage ok)
- [ENG] Password reset, email verification, social/passwordless (real email/OAuth)
- [ENG] Auth security: rate-limit, lockout, session management
- [OWNER] Staff/admin auth for any curator/back-office surface (Marginalia's `/curator` had none in the demo)

## I. Trust, legal & compliance  *(mostly [OWNER]/[NONCLAIM] — but must be named, not skipped)*
- [OWNER] **PCI DSS 4.0** — never store raw card data; use tokenization/hosted fields (real processing)
- [OWNER] **GDPR / CCPA** — consent, cookie banner, data-subject rights, retention, **72h breach notice**; privacy policy
- [OWNER] **PSD2 / SCA** — 2-factor authentication on EU-EEA card payments
- [BUILD] Published **policies**: terms, refund/return, shipping, privacy — pages present & linked
- [OWNER] **EU 14-day right of withdrawal** (distance selling); clear pricing; **no dark patterns**
- [OWNER] Sales-tax nexus / VAT registration; age/restricted-product gating; email (CAN-SPAM) unsubscribe
- [NONCLAIM] Content/asset **rights & licensing** (synthetic assets ok; a real catalog is `[OWNER]`)
- [BUILD] **Prohibition contracts** for any hard-forbidden surface (already first-class in SKILL.md §Prohibition contracts — e.g. chainless)

## J. Security & fraud
- [OWNER] HTTPS/HSTS, secure headers, CSP (a deployment concern — owner-gated to ship)
- [BUILD] Input validation / output encoding (**XSS**), **CSRF**, no secrets in client
- [BUILD] **Public-safe / secret-leakage scan** (already a gate — mind the Windows portability wall, ENVELOPE gap 1)
- [ENG] Rate-limiting, bot/CAPTCHA on auth & checkout; **webhook signature** verification
- [ENG] PII encryption at rest/in transit; audit logging; promo-abuse / account-takeover defense
- *Method:* [`craft/security-baseline`](craft/README.md) — TLS, headers, CSP, secrets, OWASP baseline.

## K. Accessibility & inclusive UX  *(a legal line now, not a nicety)*
- [BUILD] **WCAG 2.1/2.2 AA** across storefront, cart, checkout, receipts, support. The **European Accessibility Act is in force (28 Jun 2025)** — WCAG 2.1 AA is legally required for anyone selling to EU consumers.
- [BUILD] Contrast ≥ AA — **run [`tools/check-contrast.mjs`](tools/check-contrast.mjs)** (now shipped); do not eyeball
- [BUILD] Accessibility-tree pass: no heading skips, one live region, `aria-invalid` on errors, named icon-only controls, correct cart-count label (the five Assessment B caught in Marginalia)
- [BUILD] Keyboard operable; visible focus; golden path reachable
- [BUILD] Empty / error / loading states for **every** route

## L. Performance & reliability
- [BUILD] Core Web Vitals discipline (LCP / INP / CLS); image optimization; lazy-load
- [ENG] Caching / CDN strategy; handle traffic spikes (launch/sale)
- [ENG] **Overselling race** under concurrency; **idempotent order creation**
- [ENG] Third-party resilience (payment/shipping) — retries, timeouts, graceful degradation
- *Method:* [`craft/performance-optimization`](craft/README.md) — Core Web Vitals, bundle/asset,
  render perf; [`craft/cost-optimization`](craft/README.md) — infra/SaaS spend, rightsizing (`[OWNER]`).

## M. Analytics & measurement
- [BUILD] Event taxonomy: view → add-to-cart → checkout-step → purchase; **funnel & conversion**
- [BUILD] **Deterministic synthetic cohort** (this skill's method) — with its hard non-claim
- [NONCLAIM] The cohort **cannot rank UI changes** (ENVELOPE gap 3); real attribution/UTM/pixels/A-B are `[OWNER]`/`[ENG]`
- [BUILD] AOV / refund-rate / fulfil-rate KPIs vs frozen guardrails
- [ENG] Error/observability: logging, monitoring, alerting, APM

## N. SEO & discoverability
- [BUILD] **Product / Offer / Review JSON-LD** schema; canonical; meta; clean URLs; sitemap; robots
- [BUILD] OG / social cards; semantic headings
- [NONCLAIM] Real ranking / traffic (nothing local proves it)

## O. Marketing, email & retention
- [BUILD] **Transactional emails** designed (order / shipping / refund) — content & templates
- [ENG] Real send + **deliverability** (SPF/DKIM/DMARC), unsubscribe
- [OWNER] Marketing sends, abandoned-cart, win-back, loyalty/referral (real channel = the `marketing` owner-gate)

## P. Internationalization
- [BUILD] Locale formatting (currency / date / number / address); RTL readiness
- [OWNER] Multi-currency pricing; regional tax/duty (DDP/DDU); shipping zones/restrictions; regional payment methods
- *Method:* [`craft/internationalization`](craft/README.md) — locale strategy, hreflang, translation workflow, RTL.

## Q. Admin / back-office / operations
- [BUILD] Product / order / inventory management surfaces (or explicit non-goal)
- [OWNER] Roles & permissions; customer-service tooling; refunds console; reporting

## R. Content, UX states & microcopy
- [BUILD] Every state built: empty, loading, error, success, invalid-id, out-of-stock
- [BUILD] Trust signals (policies, guarantees, provenance); honest microcopy; **no dark patterns**
- [BUILD] Mobile-first / responsive; consistent design system (starter-kit tokens)

## S. Notifications & communications
- [BUILD] In-app confirmations; status changes; stock/price alerts (synthetic)
- [ENG] Real email/SMS delivery + preferences

## T. Testing, QA & launch readiness
- [BUILD] **Golden-path E2E** verified on a running dev server (a build compiles an invisible button — build ≠ function)
- [BUILD] Edge cases: OOS-at-checkout, price-change, expired promo, declined card, mid-pay network fail
- [BUILD] Accessibility + contrast checks; cross-viewport
- [OWNER] Pre-launch: real test order + refund, tax configured, shipping configured, analytics firing, monitoring on, backups, support channel, rollback plan

## U. Observability & support
- [BUILD] Customer-facing support / contact surface
- [ENG] Backups / disaster recovery; incident runbook

---

## Research basis

Grounded in current sources (July 2026), not memory:

- Checkout UX & abandonment — [Baymard, Current State of Checkout UX](https://baymard.com/blog/current-state-of-checkout-ux)
- Compliance (PCI DSS 4.0, GDPR, PSD2/SCA) — [BigCommerce](https://www.bigcommerce.com/articles/ecommerce/compliance/) · [PCI + GDPR + PSD2 (EU)](https://www.pcicompliance.com/eu-pci-compliance/)
- Accessibility law — [EAA ecommerce requirements (Accessible.org)](https://accessible.org/eaa-ecommerce-services-requirements/) · [Level Access EAA guide](https://www.levelaccess.com/compliance-overview/european-accessibility-act-eaa/)
- Payments (auth/capture, idempotency, webhooks, fraud) — [Stripe Payment Intents](https://docs.stripe.com/payments/payment-intents) · [webhooks & idempotency](https://appricotsoft.com/blog/payment-gateway-integration-services-webhooks-idempotency/)
- Inventory & returns — [overselling prevention (Cin7)](https://www.cin7.com/blog/overselling-ecommerce/) · [returns management](https://technologyadvice.com/blog/sales/ecommerce-returns-management/)
- SEO structured data — [product schema (seoClarity)](https://www.seoclarity.net/blog/product-schema-seo)
- Launch readiness — [ecommerce launch checklist](https://ecommerce-platforms.com/articles/ecommerce-launch-checklist)
