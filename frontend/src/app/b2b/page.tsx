import Head from 'next/head';

export default function B2B() {
  return (
    <>
      <Head>
        <title>B2B Art Solutions | FameuxArte</title>
        <meta name="description" content="Explore B2B art services including bulk orders, custom art, subscriptions, and more tailored for your business needs." />
      </Head>

      {/* Add spacing to avoid overlapping the header */}
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-10">
        <h1 className="text-4xl font-bold mb-6">Why Choose FameuxArte for Your Business?</h1>
        <p className="mb-8 text-lg">
          FameuxArte is your trusted partner in providing high-quality, handcrafted artworks tailored for businesses.
          Whether you’re a hotel, corporate office, interior designer, or a retail store, we offer customized art solutions
          that enhance aesthetics and create lasting impressions.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Our B2B Offerings</h2>
        <ul className="space-y-6 text-base leading-relaxed">
          <li>
            <strong>1️⃣ Bulk Art Purchases (Exclusive Discounts)</strong><br />
            Purchase multiple paintings at wholesale prices.<br />
            Ideal for: Hotels, corporate offices, restaurants, hospitals, and luxury apartments.
          </li>
          <li>
            <strong>2️⃣ Custom & Commissioned Artworks</strong><br />
            Get bespoke paintings tailored to your brand’s aesthetics.<br />
            Ideal for: Luxury hotels, real estate firms, and interior designers.
          </li>
          <li>
            <strong>3️⃣ Art Licensing for Commercial Use</strong><br />
            Acquire exclusive or non-exclusive licenses to use our artwork for branding.<br />
            Ideal for: Luxury brands, publishers, and creative agencies.
          </li>
          <li>
            <strong>4️⃣ Art Subscription Service (Rotating Artwork Rentals)</strong><br />
            Rent and rotate artworks every few months to keep spaces fresh.<br />
            Ideal for: Co-working spaces, event venues, and boutique hotels.
          </li>
          <li>
            <strong>5️⃣ Corporate Gift Solutions</strong><br />
            Offer premium, handcrafted paintings as corporate gifts.<br />
            Ideal for: Enterprises, event organizers, and premium gift shops.
          </li>
          <li>
            <strong>6️⃣ Exclusive Membership for Businesses</strong><br />
            Access VIP discounts, priority selection, and dedicated account managers.<br />
            Ideal for: Hotels, art collectors, and large corporations.
          </li>
          <li>
            <strong>7️⃣ Interior Design Partnerships</strong><br />
            Work with us to curate artwork collections for your projects.<br />
            Ideal for: Real estate developers, interior designers, and architects.
          </li>
          <li>
            <strong>8️⃣ Large-Scale Art Installations & Murals</strong><br />
            Commission custom murals and large-format paintings for commercial spaces.<br />
            Ideal for: Shopping malls, luxury retail stores, airports, and public spaces.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">How to Get Started?</h2>
        <ol className="list-decimal ml-6 text-base leading-relaxed space-y-2">
          <li><strong>Consultation:</strong> Share your requirements with our team.</li>
          <li><strong>Proposal & Pricing:</strong> We curate a tailored package for your business.</li>
          <li><strong>Delivery & Installation:</strong> We handle the logistics while you enjoy the transformation.</li>
        </ol>

        <div className="mt-8">
          <p className="text-lg">📩 <strong>Contact us today</strong> to explore our exclusive B2B offerings!</p>
        </div>
      </div>
    </>
  );
}
