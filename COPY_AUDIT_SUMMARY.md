# Fameuxarte Copy Audit — Summary of Wording Improvements

**Objective:** Elevate brand positioning to a premium art marketplace using high-value, psychologically persuasive language. Text-only changes; no logic, API, or layout changes.

---

## Mandatory Replacements Applied

| Original | Replacement |
|----------|-------------|
| Buy Now | **Acquire Artwork** |
| Add to Cart | **Reserve Artwork** |
| Checkout | **Secure Acquisition** |
| Payment (as label/heading) | **Ownership Confirmation** |
| Pay [amount] | **Confirm Ownership — [amount]** |
| Product (in user-facing copy) | **Artwork** |
| Price (as concept/label) | **Artwork Value** / **Total Investment** / **Total Value** |
| Cost (in copy) | **Investment** |
| Standard (where = product tier) | **Custom-Curated** |
| View Product / View Details | **View Artwork Details** |

*Note: "1000" → "999" and "3 left" / "Few products" → "Limited Edition" were not present in current copy; left as future guidelines.*

---

## Key Areas Updated

### Homepage & SEO
- **Meta title:** "Discover Authentic Artworks" → **"Curated Art for Collectors & Investors"**
- **Meta description:** Reframed around "premium marketplace," "investment-grade," "custom-curated"
- **Index page SEO:** Same premium positioning
- **Section subtitles:** "Explore our curated" → **"Custom-curated"** where applicable

### Cart & Acquisition Flow
- **Cart page:** "Your Cart" → **"Your Collection"**; "Proceed to Checkout" → **"Proceed to Secure Acquisition"**; "Total" → **"Total Investment"**
- **Checkout page:** "Checkout" → **"Secure Acquisition"**; "Order Summary" → **"Acquisition Summary"**; primary CTA **"Confirm Ownership — [amount]"**
- **Empty states:** "Your cart is empty" → **"Your collection is empty"**
- **Loading:** "Loading cart..." → **"Loading your collection..."**; "Processing..." → **"Confirming..."**

### Artwork Cards & Detail
- **CTAs:** "Add to Cart" → **"Reserve Artwork"**; "Buy Now" → **"Acquire Artwork"**
- **Overlay / links:** "View Details" → **"View Artwork Details"**
- **Fallback copy:** "for sale" → **"available for acquisition"**
- **Toasts:** "add items to your cart" → **"reserve artworks"**; "Unable to add item to cart" → **"Unable to reserve artwork"**

### Post-Acquisition & Errors
- **Success:** "Payment Successful!" → **"Acquisition Confirmed"**; "Thank you for your purchase" → **"Thank you for your acquisition"**
- **Failed confirmation:** "Payment Failed" → **"Ownership Confirmation Unsuccessful"**; body copy aligned to ownership confirmation
- **Cancelled:** "Payment Cancelled" → **"Acquisition Cancelled"**
- **Order success CTAs:** "View Orders" → **"View My Acquisitions"**; "Continue Shopping" → **"Continue Exploring"**
- **PaymentFailed page:** "Return to Cart" → **"Return to Collection"**

### Account / Dashboard
- **Section:** "Order History" → **"Acquisition History"**
- **Table:** "Total" → **"Total Value"**; "Order Details" → **"Acquisition Details"**; "Order placed on" → **"Acquisition completed on"**
- **Actions:** "Reorder" → **"Acquire Again"**
- **Empty state:** "You haven't placed any orders yet" → **"You have no acquisitions yet"**
- **Toasts:** "Reorder initiated" → **"Acquire again"**; description uses "acquisition" and "collection"

### Legal & Policy (tone only; meaning preserved)
- **Terms:** "Purchases and Payments" → **"Acquisitions and Ownership Confirmation"**; "Product availability" → **"Artwork availability"**; "pricing" → **"artwork value"**
- **Privacy:** "Payment information" → **"Ownership confirmation details"**; "Process your orders and payments" → **"Process your acquisitions and ownership confirmation"**
- **FAQ:** "Add to Cart" → **"Reserve Artwork"**; checkout/payment steps → **Secure Acquisition** / **ownership confirmation**; "shipping costs" → **"shipping investment"** where appropriate
- **Cancellations:** Clarified that ownership confirmation is handled securely (no change to refund mechanics)

### Supporting Copy
- **About / Our Story:** "transactions" → **"acquisitions"**; "pricing" → **"artwork value"** in transparency bullet
- **Testimonials:** "price points" → **"artwork values"**
- **Footer:** Tagline updated to **"investment-grade artwork"**; newsletter CTA to **"collection updates and exclusive access to new acquisitions"**
- **Newsletter:** "exclusive promotions" → **"exclusive collection access"**
- **Liked Items:** "Liked Items" → **"Saved Artworks"**; "Loading liked items" → **"Loading saved artworks"**
- **Collections / Artworks:** Subtitles use **"Custom-curated"**; empty states **"at this time"**
- **FeaturedArtworks:** Button **"View Artwork Details"**

---

## Tone & Principles Kept

- **No urgency spam:** No "Hurry," "Few left," or similar; calm, confident CTAs only.
- **Perception-based value:** "Investment," "Artwork Value," "Total Investment," "acquisition" used instead of generic "price/cost/purchase."
- **Consistent terminology:** "Artwork" (not "product"), "Reserve" (not "Add to cart"), "Secure Acquisition" (not "Checkout"), "Confirm Ownership" (not "Pay").
- **Elegant, refined tone:** Confident and premium without being pushy or salesy.
- **Accessibility & clarity:** All changes remain readable and understandable; no logic, routes, or components were modified.

---

## Files Touched (Copy Only)

- `index.html` — meta title, description, OG, Twitter
- `src/pages/Index.tsx` — SEO props, section subtitle
- `src/pages/ArtworkDetails.tsx` — CTAs, fallback copy
- `src/pages/ArtworkCard.tsx` (shared) — button, toasts, aria unchanged
- `src/pages/Cart.tsx` — titles, subtitles, CTAs, labels, loading
- `src/pages/Checkout.tsx` — page title, section title, button, all toast titles/descriptions
- `src/pages/PaymentFailed.tsx` — heading, body, button
- `src/pages/OrderSuccess.tsx` — heading, body, buttons
- `src/pages/Account.tsx` — section title, table caption/headers, dialog title/description, button, empty state, toast
- `src/pages/FAQ.tsx` — ordering steps, payment FAQ, return/customs copy
- `src/pages/TermsOfService.tsx` — section 3 heading and list
- `src/pages/PrivacyPolicy.tsx` — list items
- `src/pages/CancellationsAndRefunds.tsx` — one sentence on ownership confirmation
- `src/pages/OurStory.tsx` — transparency bullet
- `src/pages/Artworks.tsx` — subtitle
- `src/pages/LikedItems.tsx` — title, subtitle, loading
- `src/pages/Collections.tsx` — subtitle, empty state
- `src/components/home/AboutSection.tsx` — mission sentence
- `src/components/home/FeaturedArtworks.tsx` — button label
- `src/components/home/Testimonials.tsx` — testimonial quote
- `src/components/home/NewsletterSignup.tsx` — newsletter copy
- `src/components/navigation/Footer.tsx` — tagline, newsletter CTA
- `src/components/ArtworkGrid.tsx` — empty state, optional loading refinement

No changes were made to: API calls, route paths, TypeScript types, variable names, `Price` component output (still displays formatted number only), or schema/structured data keys.
