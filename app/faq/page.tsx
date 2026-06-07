"use client";
// app/faq/page.tsx
import { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    category: "Orders & Payment",
    questions: [
      {
        q: "How do I place an order?",
        a: "Browse our shop, select your preferred wig, choose your colour and length, add it to your cart, and proceed to checkout. Payment is processed securely via Paystack.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard) as well as EFT through Paystack. All transactions are secured and encrypted.",
      },
      {
        q: "Can I cancel my order?",
        a: "Orders can only be cancelled within 12 hours of purchase, provided processing has not yet begun. To request a cancellation, contact us immediately at info@novaa.co.za.",
      },
      {
        q: "Will I receive a confirmation email?",
        a: "Yes — an order confirmation email is sent automatically once your payment is received. Check your spam folder if you don't see it within a few minutes.",
      },
      {
        q: "Can I use a promo code?",
        a: "Yes! Enter your promo code in the Promo Code field at checkout before completing your payment. The discount will be applied to your order total.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "Do you ship nationwide?",
        a: "Yes — we ship to all provinces across South Africa. Nationwide shipping is included in all novaa pricing.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard nationwide delivery takes 2–5 business days after dispatch. Ready-to-ship items are processed within 1–3 business days. Custom or coloured units may take longer.",
      },
      {
        q: "How will I know when my order has shipped?",
        a: "You'll receive a shipping notification email with tracking information once your order is dispatched. You can also view your order status in your account under My Orders.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes — orders over R1,000 qualify for free shipping. Orders below R1,000 have a flat shipping fee added at checkout.",
      },
      {
        q: "Do you ship internationally?",
        a: "International shipping is not available at this time. We currently ship within South Africa only.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        q: "Can I return my wig?",
        a: "Due to the hygienic nature of our products, we do not accept returns on worn, installed, or altered items. Returns are only considered if the incorrect item was received, the product arrived damaged, or it significantly differs from what was ordered.",
      },
      {
        q: "How do I request a return or exchange?",
        a: "Contact us within 48 hours of delivery at info@novaa.co.za with your full name, order number, and clear photos of the issue. Our team will review your request.",
      },
      {
        q: "Are refunds possible?",
        a: "If a return is approved, the refund will be processed to your original payment method. Processing times vary depending on your bank. Shipping costs are non-refundable.",
      },
      {
        q: "What if my item arrives damaged?",
        a: "Please contact us immediately at info@novaa.co.za with photos of the damage. We will work to resolve the issue as quickly as possible.",
      },
    ],
  },
  {
    category: "Product & Hair Care",
    questions: [
      {
        q: "Are your wigs made from real human hair?",
        a: "Yes — all novaa wigs are crafted from 100% virgin human hair. No synthetic blends. The hair can be dyed, bleached, heat-styled, and washed just like your natural hair.",
      },
      {
        q: "Can I dye or bleach my wig?",
        a: "Yes — our virgin human hair wigs can be coloured, bleached, and dyed. We recommend having this done by a professional stylist to preserve the hair quality.",
      },
      {
        q: "How do I care for my wig?",
        a: "Wash with sulphate-free shampoo and conditioner. Air-dry where possible. Use a heat protectant when styling with heat tools. Store on a wig stand when not in use. Avoid sleeping in your wig to extend its lifespan.",
      },
      {
        q: "What lace types do you offer?",
        a: "We offer Lace Front (13×4, 13×6), HD Lace, Full Lace, 4×4 Closure, and Glueless wigs. HD Lace is our most popular — it melts seamlessly into any skin tone for an undetectable look.",
      },
      {
        q: "How do I choose the right length?",
        a: "Wig length is measured from root to tip when the hair is straightened. A 16\" wig typically falls at the shoulder, 20\" falls mid-chest, and 24\"+ falls at the waist. Our product pages include length guides.",
      },
    ],
  },
  {
    category: "Account & Orders",
    questions: [
      {
        q: "Do I need an account to order?",
        a: "Yes — creating an account allows you to track your orders, save shipping addresses, and view your order history.",
      },
      {
        q: "How do I track my order?",
        a: "Log in to your account and go to My Orders. You'll see the current status of each order. Once shipped, your tracking number will be displayed there and emailed to you.",
      },
      {
        q: "I forgot my password — how do I reset it?",
        a: "Click 'Forgot password?' on the login page and enter your email address. You'll receive a password reset link within a few minutes. Check your spam folder if it doesn't arrive.",
      },
      {
        q: "How do I update my shipping address?",
        a: "Log in to your account, go to Profile, and you'll find your saved addresses. You can add, edit, or delete addresses there.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-black/8 transition-colors ${open ? "pb-4" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-start gap-4 py-4 text-left group"
      >
        <span className={`text-sm leading-relaxed transition-colors ${open ? "text-black font-medium" : "text-[#333] group-hover:text-black"}`}>
          {q}
        </span>
        <span className={`flex-shrink-0 w-5 h-5 border border-black/20 rounded-full flex items-center justify-center text-xs transition-all ${open ? "bg-black text-white border-black" : "text-black/40 group-hover:border-black"}`}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <p className="text-[#555] text-sm leading-relaxed pb-2 pr-9">
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(FAQS[0].category);

  return (
    <div className="min-h-screen bg-[#F1F1F1] pt-24 pb-20 font-cormorant">
      <div className="max-w-4xl mx-auto px-6 md:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-black/40 mb-10">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>›</span>
          <span className="text-black/70">FAQ</span>
        </nav>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-black/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-px bg-black/30" />
            <span className="text-xs tracking-[0.3em] uppercase text-black/50">Help Centre</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-black font-light leading-tight mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-[#666] text-base">
            Can't find your answer?{" "}
            <a href="mailto:info@novaa.co.za" className="text-black underline underline-offset-4 hover:opacity-70 transition-opacity">
              Email us at info@novaa.co.za
            </a>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Category sidebar */}
          <div className="md:col-span-1">
            <p className="text-xs tracking-[0.2em] uppercase text-black/40 mb-4">Categories</p>
            <nav className="space-y-1">
              {FAQS.map(({ category }) => (
                <button key={category} onClick={() => setActiveCategory(category)}
                  className={`w-full text-left text-sm py-2 px-3 transition-colors rounded-sm ${
                    activeCategory === category
                      ? "bg-black text-white"
                      : "text-[#555] hover:text-black hover:bg-black/5"
                  }`}>
                  {category}
                </button>
              ))}
            </nav>

            {/* Contact CTA */}
            <div className="mt-8 p-4 bg-white border border-black/8">
              <p className="text-xs tracking-widest uppercase text-black/50 mb-2">Still need help?</p>
              <p className="text-sm text-[#555] mb-3 leading-relaxed">Our team is happy to assist you.</p>
              <a href="mailto:info@novaa.co.za"
                className="block text-center bg-black text-white text-xs tracking-widest uppercase py-2.5 hover:opacity-80 transition-opacity">
                Contact Us
              </a>
            </div>
          </div>

          {/* Questions */}
          <div className="md:col-span-3">
            {FAQS.filter(f => f.category === activeCategory).map(({ category, questions }) => (
              <div key={category}>
                <h2 className="font-serif text-2xl text-black font-light mb-6">{category}</h2>
                <div className="bg-white border border-black/8 px-6">
                  {questions.map(({ q, a }) => (
                    <FAQItem key={q} q={q} a={a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom links */}
        <div className="mt-16 pt-8 border-t border-black/10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Shipping Policy", "/shipping"],
            ["Returns Policy",  "/returns"],
            ["Privacy Policy",  "/privacy"],
            ["Terms of Service","/terms"],
          ].map(([label, href]) => (
            <Link key={label} href={href}
              className="text-xs tracking-widest uppercase text-black/50 hover:text-black transition-colors text-center py-3 border border-black/8 hover:border-black">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}