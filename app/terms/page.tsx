// app/terms/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Terms of Service — novaa",
  description: "Terms and conditions governing the use of the novaa website and services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F1F1F1] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6 md:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-black/40 mb-10">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>›</span>
          <span className="text-black/70">Terms of Service</span>
        </nav>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-black/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-px bg-black/30" />
            <span className="text-xs tracking-[0.3em] uppercase text-black/50">Legal</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-black font-light leading-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-black/40 text-sm tracking-wider">Last Updated: May 2026</p>
        </div>

        {/* Intro */}
        <p className="text-[#444] text-base leading-relaxed mb-12">
          By accessing or using the <strong className="text-black font-medium">novaa</strong> website at{" "}
          <strong className="text-black">novaa.co.za</strong>, you agree to be bound by these Terms of Service. Please read them carefully before placing an order or creating an account.
        </p>

        <div className="space-y-12">

          <Section number="01" title="About novaa">
            <p>novaa is an online retailer of premium human hair wigs, bundles, closures, and frontals, based in Johannesburg, South Africa. These terms govern all transactions and interactions on our website.</p>
          </Section>

          <Section number="02" title="Account Registration">
            <>
              <p className="mb-4">To place an order, you may need to create an account. You agree to:</p>
              <ul className="space-y-2">
                {[
                  "Provide accurate, complete, and current information",
                  "Maintain the security of your password",
                  "Notify us immediately of any unauthorised use of your account",
                  "Accept responsibility for all activity under your account",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-black/50 text-sm">We reserve the right to suspend or terminate accounts that violate these terms.</p>
            </>
          </Section>

          <Section number="03" title="Products & Pricing">
            <>
              <p className="mb-4">All prices are displayed in South African Rand (ZAR) and include VAT where applicable.</p>
              <ul className="space-y-2">
                {[
                  "Product descriptions and images are as accurate as possible, but minor variations may occur",
                  "Prices are subject to change without notice",
                  "We reserve the right to refuse or cancel orders in cases of pricing errors",
                  "Stock availability is not guaranteed until your order is confirmed",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          </Section>

          <Section number="04" title="Orders & Payment">
            <>
              <p className="mb-4">By placing an order, you confirm that:</p>
              <ul className="space-y-2 mb-5">
                {[
                  "You are at least 18 years old or have parental consent",
                  "You are authorised to use the payment method provided",
                  "All information provided is accurate and complete",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>Payments are processed securely through <strong className="text-black">Paystack</strong>. novaa does not store your card details. An order confirmation email will be sent once payment is received.</p>
            </>
          </Section>

          <Section number="05" title="Shipping & Delivery">
            <>
              <p className="mb-3">Shipping terms are governed by our{" "}
                <Link href="/shipping" className="text-black underline underline-offset-4 hover:opacity-70 transition-opacity">
                  Shipping Policy
                </Link>.
              </p>
              <p>novaa is not liable for delays caused by courier services, incorrect addresses, or circumstances beyond our control.</p>
            </>
          </Section>

          <Section number="06" title="Returns & Refunds">
            <p>Returns and refunds are governed by our{" "}
              <Link href="/returns" className="text-black underline underline-offset-4 hover:opacity-70 transition-opacity">
                Refund & Returns Policy
              </Link>. Due to the hygienic nature of hair products, all sales are final on worn or custom items.
            </p>
          </Section>

          <Section number="07" title="Intellectual Property">
            <>
              <p className="mb-3">All content on the novaa website including images, logos, text, and design is the property of novaa and protected by applicable intellectual property laws.</p>
              <p>You may not reproduce, distribute, or use our content without prior written permission.</p>
            </>
          </Section>

          <Section number="08" title="Prohibited Conduct">
            <>
              <p className="mb-4">You agree not to:</p>
              <ul className="space-y-2">
                {[
                  "Use the website for any unlawful purpose",
                  "Attempt to gain unauthorised access to any part of the website or its systems",
                  "Submit false or misleading information",
                  "Engage in fraudulent transactions",
                  "Interfere with the security or operation of the website",
                  "Scrape, crawl, or copy website content without permission",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          </Section>

          <Section number="09" title="Limitation of Liability">
            <>
              <p className="mb-3">To the fullest extent permitted by law, novaa shall not be liable for:</p>
              <ul className="space-y-2">
                {[
                  "Indirect, incidental, or consequential damages",
                  "Loss of profits or revenue",
                  "Damages resulting from courier delays or lost parcels",
                  "Damage caused by improper use of products",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-black/50 text-sm">Our total liability shall not exceed the amount paid for the product giving rise to the claim.</p>
            </>
          </Section>

          <Section number="10" title="Governing Law">
            <p>These Terms of Service are governed by the laws of the <strong className="text-black">Republic of South Africa</strong>. Any disputes shall be subject to the jurisdiction of South African courts.</p>
          </Section>

          <Section number="11" title="Changes to These Terms">
            <p>We reserve the right to update these terms at any time. Changes will be posted on this page with an updated date. Continued use of the website after changes constitutes acceptance of the revised terms.</p>
          </Section>

          {/* Contact */}
          <div className="border-t border-black/10 pt-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-6 h-px bg-black/30" />
              <span className="text-xs tracking-[0.3em] uppercase text-black/50">Contact</span>
            </div>
            <h2 className="font-serif text-2xl text-black font-light mb-2">Questions About These Terms</h2>
            <p className="text-[#444] text-sm mb-6">If you have any questions about these Terms of Service, please contact us:</p>
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
          <Link href="/privacy" className="text-xs tracking-widest uppercase text-black/50 hover:text-black transition-colors">
            ← Privacy Policy
          </Link>
          <Link href="/shipping" className="text-xs tracking-widest uppercase text-black/50 hover:text-black transition-colors">
            Shipping Policy →
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