// app/returns/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Refund & Returns Policy — novaa",
  description: "Refund and returns policy for novaa hair products. Please read carefully before placing an order.",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#F1F1F1] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6 md:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-black/40 mb-10">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>›</span>
          <span className="text-black/70">Returns Policy</span>
        </nav>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-black/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-px bg-black/30" />
            <span className="text-xs tracking-[0.3em] uppercase text-black/50">Legal</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-black font-light leading-tight mb-3">
            Refund & Returns Policy
          </h1>
          <p className="text-black/40 text-sm tracking-wider">Last Updated: May 2026</p>
        </div>

        {/* Intro */}
        <p className="text-[#444] text-base leading-relaxed mb-12">
          At <strong className="text-black font-medium">novaa</strong>, we are committed to providing high-quality wigs, bundles, closures, and frontals. Due to the hygienic and custom nature of our products, please read this policy carefully before placing an order.
        </p>

        {/* Important notice */}
        <div className="bg-black text-white px-6 py-5 mb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-white/60 mb-1">Important Notice</p>
          <p className="text-sm leading-relaxed text-white/90">
            All sales are final on worn, installed, or custom items. Please review our eligibility criteria before requesting a return.
          </p>
        </div>

        <div className="space-y-12">

          <Section number="01" title="No Refunds on Custom or Worn Items">
            <>
              <p className="mb-4">For hygiene and quality assurance reasons, novaa does not offer refunds, returns, or exchanges on:</p>
              <ul className="space-y-2">
                {[
                  "Worn wigs or hair products",
                  "Installed or altered units",
                  "Custom-coloured wigs",
                  "Customised or made-to-order units",
                  "Products that have been brushed, combed, cut, washed, or chemically treated",
                  "Sale or promotional items",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          </Section>

          <Section number="02" title="Eligibility for Returns or Exchanges">
            <>
              <p className="mb-4">Returns or exchanges may only be considered if:</p>
              <ul className="space-y-2 mb-6">
                {[
                  "The incorrect item was received",
                  "The product arrives damaged",
                  "The item received significantly differs from the order placed",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-white border border-black/8 p-5">
                <p className="text-xs tracking-widest uppercase text-black/50 mb-3">To Qualify</p>
                <ul className="space-y-2">
                  {[
                    "Item must remain unused and in original condition",
                    "Lace must not be cut",
                    "Tags and packaging must remain intact",
                    "Request must be made within 48 hours of delivery",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <span className="text-black font-medium mt-0.5 flex-shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          </Section>

          <Section number="03" title="Return Request Process">
            <>
              <p className="mb-4">To request a return or exchange, contact novaa with the following:</p>
              <ul className="space-y-2 mb-5">
                {[
                  "Full name",
                  "Order number",
                  "Clear photos or videos of the item",
                  "Description of the issue",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 pt-4 border-t border-black/8">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-black/40 text-xs tracking-widest uppercase w-16 flex-shrink-0">Email</span>
                  <a href="mailto:info@novaa.co.za" className="text-black hover:underline underline-offset-4">info@novaa.co.za</a>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-black/40 text-xs tracking-widest uppercase w-16 flex-shrink-0">Phone</span>
                  <a href="tel:+27614990918" className="text-black hover:underline underline-offset-4">061 499 0918</a>
                </div>
              </div>
              <p className="mt-4 text-black/50 text-sm">novaa reserves the right to deny returns that do not meet the conditions outlined in this policy.</p>
            </>
          </Section>

          <Section number="04" title="Refund Process">
            <>
              <p className="mb-4">If a refund is approved:</p>
              <ul className="space-y-2">
                {[
                  "Refunds will be processed to the original payment method",
                  "Processing times may vary depending on the payment provider or bank",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-black/50 text-sm">Shipping costs are non-refundable.</p>
            </>
          </Section>

          <Section number="05" title="Order Cancellations">
            <>
              <p className="mb-3">Orders may only be cancelled within <strong className="text-black">12 hours of purchase</strong>, provided processing has not yet begun.</p>
              <p className="text-black/50 text-sm">Once processing or customization has started, cancellations will no longer be permitted.</p>
            </>
          </Section>

          <Section number="06" title="Shipping Issues">
            <>
              <p className="mb-4">novaa is not responsible for:</p>
              <ul className="space-y-2 mb-4">
                {[
                  "Delays caused by couriers",
                  "Incorrect addresses provided by customers",
                  "Parcels marked as delivered by the courier",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-black/50 text-sm">We will assist customers in resolving courier-related concerns where possible.</p>
            </>
          </Section>

          <Section number="07" title="Product Care">
            <>
              <p className="mb-4">Proper maintenance is essential to preserve the quality and longevity of your hair products. novaa is not responsible for damage resulting from:</p>
              <ul className="space-y-2 mb-4">
                {[
                  "Improper maintenance",
                  "Excessive heat",
                  "Harsh chemicals",
                  "Incorrect product use",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-black/50 text-sm">Hair care instructions may be provided with your order.</p>
            </>
          </Section>

          {/* Contact */}
          <div className="border-t border-black/10 pt-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-6 h-px bg-black/30" />
              <span className="text-xs tracking-[0.3em] uppercase text-black/50">Contact</span>
            </div>
            <h2 className="font-serif text-2xl text-black font-light mb-6">Returns Enquiries</h2>
            <div className="space-y-3">
              {[
                ["Email",    "info@novaa.co.za",           "mailto:info@novaa.co.za"],
                ["Phone",    "061 499 0918",               "tel:+27614990918"],
                ["Location", "Johannesburg, South Africa", null],
              ].map(([label, value, href]) => (
                <div key={label as string} className="flex items-center gap-4 text-sm">
                  <span className="text-black/40 text-xs tracking-widest uppercase w-20 flex-shrink-0">{label}</span>
                  {href ? (
                    <a href={href as string} className="text-black hover:underline underline-offset-4 transition-colors">{value}</a>
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
          <Link href="/shipping" className="text-xs tracking-widest uppercase text-black/50 hover:text-black transition-colors">
            ← Shipping Policy
          </Link>
          <Link href="/shop" className="text-xs tracking-widest uppercase text-black/50 hover:text-black transition-colors">
            Shop →
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