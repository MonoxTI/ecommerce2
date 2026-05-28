// app/privacy/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — novaa",
  description: "How novaa collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F1F1F1] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6 md:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-black/40 mb-10">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>›</span>
          <span className="text-black/70">Privacy Policy</span>
        </nav>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-black/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-px bg-black/30" />
            <span className="text-xs tracking-[0.3em] uppercase text-black/50">Legal</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-black font-light leading-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-black/40 text-sm tracking-wider">Last Updated: May 2026</p>
        </div>

        {/* Intro */}
        <p className="text-[#444] text-base leading-relaxed mb-12">
          At <strong className="text-black font-medium">novaa</strong>, we respect your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data when you shop with us.
        </p>

        <div className="space-y-12">

          <Section number="01" title="Information We Collect">
            <>
              <p className="mb-4">When you use novaa, we may collect the following information:</p>
              <div className="space-y-4">
                <InfoBlock title="Personal Information">
                  Name, email address, phone number, and delivery address provided when you register or place an order.
                </InfoBlock>
                <InfoBlock title="Payment Information">
                  We do not store your card details. All payments are processed securely through <strong className="text-black">Paystack</strong>. We only receive a transaction reference and status.
                </InfoBlock>
                <InfoBlock title="Order Information">
                  Details of products purchased, order history, and delivery status.
                </InfoBlock>
                <InfoBlock title="Technical Information">
                  IP address, browser type, device information, and pages visited — collected automatically when you browse our website.
                </InfoBlock>
              </div>
            </>
          </Section>

          <Section number="02" title="How We Use Your Information">
            <>
              <p className="mb-4">We use your information to:</p>
              <ul className="space-y-2">
                {[
                  "Process and fulfil your orders",
                  "Send order confirmations and shipping notifications via email",
                  "Respond to your enquiries and provide customer support",
                  "Improve our website and product offerings",
                  "Send promotional emails (only if you have opted in)",
                  "Comply with legal obligations",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          </Section>

          <Section number="03" title="Sharing Your Information">
            <>
              <p className="mb-4">We do not sell or rent your personal information. We may share your data with:</p>
              <div className="space-y-3">
                <InfoBlock title="Courier Services">
                  Your name and delivery address are shared with our courier partners to fulfil your order.
                </InfoBlock>
                <InfoBlock title="Payment Processors">
                  Paystack receives your email address and order amount to process payment. Their privacy policy applies to data they collect.
                </InfoBlock>
                <InfoBlock title="Email Service Providers">
                  We use Resend to send transactional emails such as order confirmations and password resets.
                </InfoBlock>
                <InfoBlock title="Legal Requirements">
                  We may disclose your information if required by law or to protect the rights and safety of novaa or others.
                </InfoBlock>
              </div>
            </>
          </Section>

          <Section number="04" title="Data Storage & Security">
            <>
              <p className="mb-4">Your data is stored securely on servers hosted by Neon (PostgreSQL) and deployed via Vercel. We implement appropriate technical measures including:</p>
              <ul className="space-y-2">
                {[
                  "Encrypted HTTPS connections on all pages",
                  "Password hashing using bcrypt",
                  "JWT-based authentication with short-lived access tokens",
                  "Secure HttpOnly cookies for session management",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-black/50 text-sm">While we take security seriously, no system is 100% secure. We encourage you to use a strong, unique password for your account.</p>
            </>
          </Section>

          <Section number="05" title="Cookies">
            <p>We use essential cookies to keep you logged in and maintain your session. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, but this may affect your ability to sign in or use the checkout.</p>
          </Section>

          <Section number="06" title="Your Rights">
            <>
              <p className="mb-4">Under the Protection of Personal Information Act (POPIA) and applicable South African law, you have the right to:</p>
              <ul className="space-y-2">
                {[
                  "Access the personal information we hold about you",
                  "Request correction of inaccurate information",
                  "Request deletion of your account and data",
                  "Opt out of marketing communications at any time",
                  "Lodge a complaint with the Information Regulator of South Africa",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-black/50 text-sm">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:info@novaa.co.za" className="text-black underline underline-offset-4">info@novaa.co.za</a>.
              </p>
            </>
          </Section>

          <Section number="07" title="Data Retention">
            <p>We retain your personal information for as long as your account is active or as needed to provide services. Order records are kept for a minimum of 5 years for accounting and legal purposes. You may request account deletion at any time.</p>
          </Section>

          <Section number="08" title="Third-Party Links">
            <p>Our website may contain links to third-party sites. We are not responsible for the privacy practices of those sites and encourage you to read their privacy policies before providing any personal information.</p>
          </Section>

          <Section number="09" title="Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of our website after changes constitutes acceptance of the revised policy.</p>
          </Section>

          {/* Contact */}
          <div className="border-t border-black/10 pt-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-6 h-px bg-black/30" />
              <span className="text-xs tracking-[0.3em] uppercase text-black/50">Contact</span>
            </div>
            <h2 className="font-serif text-2xl text-black font-light mb-2">Privacy Enquiries</h2>
            <p className="text-[#444] text-sm mb-6">For any questions about this policy or how we handle your data:</p>
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
          <Link href="/terms" className="text-xs tracking-widest uppercase text-black/50 hover:text-black transition-colors">
            Terms of Service →
          </Link>
          <Link href="/returns" className="text-xs tracking-widest uppercase text-black/50 hover:text-black transition-colors">
            Returns Policy →
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

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-black/10 pl-4">
      <p className="text-black text-xs tracking-widest uppercase font-medium mb-1">{title}</p>
      <p className="text-[#555] text-sm leading-relaxed">{children}</p>
    </div>
  );
}