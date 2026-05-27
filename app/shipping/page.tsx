// app/shipping/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Shipping Policy — novaa",
  description: "Shipping and delivery information for novaa hair products across South Africa.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F1F1F1] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6 md:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-black/40 mb-10">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>›</span>
          <span className="text-black/70">Shipping Policy</span>
        </nav>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-black/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-px bg-black/30" />
            <span className="text-xs tracking-[0.3em] uppercase text-black/50">Legal</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-black font-light leading-tight mb-3">
            Shipping Policy
          </h1>
          <p className="text-black/40 text-sm tracking-wider">Last Updated: May 2026</p>
        </div>

        {/* Intro */}
        <p className="text-[#444] text-base leading-relaxed mb-12">
          Thank you for shopping with <strong className="text-black font-medium">novaa</strong>. We are committed to providing a smooth and reliable delivery experience across South Africa.
        </p>

        {/* Sections */}
        <div className="space-y-12">

          <Section number="01" title="Order Processing">
            <>
              <p>All wigs, bundles, closures, and frontals are processed after payment confirmation.</p>
              <p className="mt-3 mb-3 text-black/50 text-xs tracking-widest uppercase">Estimated processing times</p>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {[
                    ["Ready-to-ship items", "1–3 business days"],
                    ["Custom or made-to-order wigs", "5–14 business days"],
                    ["Coloured / customised units", "Additional time may apply"],
                  ].map(([item, time]) => (
                    <tr key={item} className="border-b border-black/8">
                      <td className="py-3 text-[#333] pr-8">{item}</td>
                      <td className="py-3 text-black font-medium text-right">{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-black/50 text-sm">Business days exclude weekends and public holidays. Customers will receive confirmation once their order has been dispatched.</p>
            </>
          </Section>

          <Section number="02" title="Shipping & Delivery">
            <>
              <div className="bg-black text-white px-5 py-4 mb-5 inline-block">
                <p className="text-sm tracking-wider">✨ Nationwide shipping is included in all novaa pricing</p>
              </div>
              <p className="mb-4 text-black/50 text-xs tracking-widest uppercase">Estimated delivery after dispatch</p>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-black/20">
                    <th className="text-left py-2 text-xs tracking-widest uppercase text-black/50 font-normal">Method</th>
                    <th className="text-right py-2 text-xs tracking-widest uppercase text-black/50 font-normal">Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 text-[#333]">Standard Nationwide Delivery</td>
                    <td className="py-3 text-black font-medium text-right">2–5 Business Days</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-4 text-black/50 text-sm">Delivery timelines may vary depending on your location and courier delays outside of our control.</p>
            </>
          </Section>

          <Section number="03" title="Order Tracking">
            <p>Once your order has been shipped, tracking information will be sent via email, SMS, or WhatsApp where applicable. Customers are responsible for monitoring tracking updates and ensuring availability to receive the parcel.</p>
          </Section>

          <Section number="04" title="Incorrect Shipping Information">
            <>
              <p className="mb-4">Please ensure all shipping details are accurate before placing your order. novaa is not responsible for:</p>
              <ul className="space-y-2">
                {[
                  "Delays caused by incorrect addresses",
                  "Failed deliveries due to unavailable recipients",
                  "Additional courier fees resulting from incorrect information",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-black/50 text-sm">If a parcel is returned due to incorrect details, the customer may be required to cover the re-delivery fee.</p>
            </>
          </Section>

          <Section number="05" title="Lost, Stolen, or Delayed Parcels">
            <>
              <p className="mb-4">Once orders are handed over to the courier, delivery timelines fall under the courier provider. novaa will assist customers in resolving courier-related issues where possible.</p>
              <p className="mb-3">novaa is not liable for:</p>
              <ul className="space-y-2">
                {[
                  "Parcels marked as delivered",
                  "Delays caused by weather, strikes, or courier operational issues beyond our control",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          </Section>

          <Section number="06" title="International Shipping">
            <p>International shipping is currently <strong className="text-black">unavailable</strong> at this time.</p>
          </Section>

          <Section number="07" title="Pre-Orders & High-Demand Items">
            <p>Certain products may occasionally be available on a pre-order basis. Estimated processing timelines for pre-orders will be communicated on the product page or during checkout.</p>
          </Section>

          {/* Contact */}
          <div className="border-t border-black/10 pt-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-6 h-px bg-black/30" />
              <span className="text-xs tracking-[0.3em] uppercase text-black/50">Contact</span>
            </div>
            <h2 className="font-serif text-2xl text-black font-light mb-6">Shipping Enquiries</h2>
            <div className="space-y-3">
              {[
                ["Email",    "info@novaa.co.za",            "mailto:info@novaa.co.za"],
                ["Phone",    "061 499 0918",                "tel:+27614990918"],
                ["Location", "Johannesburg, South Africa",  null],
              ].map(([label, value, href]) => (
                <div key={label as string} className="flex items-center gap-4 text-sm">
                  <span className="text-black/40 text-xs tracking-widest uppercase w-20 flex-shrink-0">{label}</span>
                  {href ? (
                    <a href={href as string} className="text-black hover:underline underline-offset-4 transition-colors">
                      {value}
                    </a>
                  ) : (
                    <span className="text-[#333]">{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-black/10 flex justify-between items-center">
          <Link href="/shop"
            className="text-xs tracking-widest uppercase text-black/50 hover:text-black transition-colors">
            ← Back to Shop
          </Link>
          <Link href="/"
            className="text-xs tracking-widest uppercase text-black/50 hover:text-black transition-colors">
            Home →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[48px_1fr] gap-6">
      <div className="pt-1">
        <span className="font-serif text-3xl text-black/10 font-light leading-none">{number}</span>
      </div>
      <div>
        <h2 className="font-serif text-xl text-black font-light mb-4 pb-3 border-b border-black/8">
          {title}
        </h2>
        <div className="text-[#444] text-sm leading-relaxed space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
}