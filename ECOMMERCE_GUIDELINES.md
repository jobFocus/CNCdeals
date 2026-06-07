# E-Commerce Guidelines — CNC Deals

## 1. Platform & Hosting

| Area | Guideline |
|------|-----------|
| **Current** | Static HTML/CSS/JS on GitHub Pages. Good for MVP, limited for scaling. |
| **Next step** | Move to Shopify or WooCommerce when product count exceeds 50+ SKUs. |
| **Custom domain** | Point `cncdeals.com` → GitHub Pages (CNAME) or Shopify. |
| **SSL** | Required for payment pages. GitHub Pages provides this automatically. |

## 2. Product Listings

- **Title**: Include brand, model, key spec (e.g., "Genmitsu 3018-PRO CNC Router Kit — 3-Axis, 300W Spindle")
- **Images**: 5+ high-res photos per product, 1200×1200px min, white or workshop background
- **Video**: Embed real machining footage (already in hero section)
- **Description**: Bullet specs first, then use case paragraph, then technical details
- **Pricing**: Clear MSRP + sale price. Show % savings.
- **SKU**: Assign every product a unique SKU (e.g., `CNC-3018-PRO`)
- **Categories**: Router & Machines / Bits & Tooling / Accessories / Spindles & Parts

## 3. SEO

- **Title tags**: `<title>Product Name — CNC Deals</title>` (max 60 chars)
- **Meta descriptions**: 155 chars, include keywords + CTA
- **Alt text**: Every product image needs descriptive alt text
- **URLs**: Use `/products/cnc-3018-pro` not `/products?id=5`
- **Structured data**: Add Product schema (`@type: Product`) with price, availability, image
- **Sitemap**: Maintain `sitemap.xml` and submit to Google Search Console
- **Blog**: CNC guides ("Best Bits for Aluminum", "How to Choose a Spindle") drive organic traffic

## 4. Payment Processing

| Method | Status | Notes |
|--------|--------|-------|
| PayPal | ✅ Integrated | Sandbox mode — swap `client-id` to production before launch |
| Google Pay | ✅ Integrated | Uses test environment — configure Google Pay Merchant ID for production |
| Credit Card | ❌ Missing | Add Stripe or PayPal Payments Pro for direct card entry |
| Apple Pay | ❌ Missing | Available via Stripe |

### Production checklist
- [ ] Replace PayPal `client-id=sb` with live client ID
- [ ] Register Google Pay merchant and update `merchantId`
- [ ] Add Stripe.js for credit card fallback
- [ ] Set up PCI-compliant payment flow (use Stripe Elements or PayPal hosted fields)
- [ ] Test full purchase flow in sandbox before going live

## 5. Shipping

- **Domestic (US)**: Flat rate $9.99 under $99, free over $99
- **International**: Calculated at checkout (use Shippo or ShipStation API)
- **Dispatch**: 48hr handling time. Expedited (1–2 day) option at checkout.
- **Tracking**: Email tracking number on fulfillment. Use AfterShip for branded tracking page.
- **Insurance**: Insure orders over $200.
- **Returns**: 30-day return window. Customer pays return shipping unless defective.

## 6. Customer Support

- **Channels**: Email (hello@cncdeals.com) + live chat (Tidio or Crisp)
- **Response SLA**: < 4 hours on business days
- **FAQ page**: Common questions about CNC compatibility, power requirements, warranty
- **Post-purchase**: Order confirmation email → shipping notification → delivery confirmation → review request (5-day delay)
- **Refunds**: Process within 3 business days of returned item receipt

## 7. Legal

- **Privacy Policy**: Required by law. Cover data collection, cookies, third-party services (PayPal, Google).
- **Terms of Service**: Cover returns, warranty limits, liability disclaimers for CNC equipment.
- **Cookie banner**: Add a consent banner if using analytics/tracking.
- **Tax**: Collect sales tax in states where you have nexus (use TaxJar or automatic Shopify tax).
- **Age gate**: Not required for CNC tools, but note "adult signature required on delivery" for heavy items.

## 8. Marketing

- **Email**: Build list via discount popup (10% off first order). Mailchimp or Klaviyo.
- **Social**: Instagram (machining videos), YouTube (tutorials), TikTok (short CNC reels)
- **Content**: Blog posts → "CNC Router vs Laser Cutter" type comparisons and "Best End Mills for Carbon Fiber"
- **Retargeting**: Facebook Pixel + Google Ads retargeting for cart abandoners
- **Incentives**: Abandoned cart email at 1hr / 24hr with 5% discount

## 9. Analytics & Optimization

- **Google Analytics 4**: Track page views, conversions, add-to-cart events
- **Google Search Console**: Monitor organic rankings, fix errors
- **A/B testing**: Test product page layouts, CTA colors, pricing display
- **Conversion funnel**: Home → Product → Add to Cart → Checkout → Payment → Thank You
- **Heatmaps**: Hotjar or Microsoft Clarity to see where users click/scroll

## 10. Security

- **HTTPS**: Required. GitHub Pages provides it.
- **Payment data**: Never store credit card numbers. Use PayPal / Stripe / Google Pay hosted forms.
- **Customer data**: Encrypt emails, addresses, phone numbers at rest.
- **Backups**: Keep product data export (CSV) in cloud storage.
- **Rate limiting**: Add CAPTCHA on checkout to prevent bot attacks.

---

## Implementation Priority

| Priority | Action | Time |
|----------|--------|------|
| P0 | Replace sandbox PayPal/GPay with production keys | Before launch |
| P0 | Add Privacy Policy + Terms pages | Before launch |
| P1 | Set up GA4 + Search Console | Week 1 |
| P1 | Add Stripe card payment | Week 1 |
| P1 | Shipping calculator + tracking emails | Week 2 |
| P2 | Blog + content marketing | Week 4 |
| P2 | Email list + abandon cart flows | Week 4 |
| P3 | Migrate to Shopify/WooCommerce | 100+ SKUs |
