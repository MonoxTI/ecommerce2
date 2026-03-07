"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";

const products = [
  {
    id: 1,
    name: "Silk Lace Frontal",
    length: "22 inch",
    price: 2850,
    tag: "Bestseller",
    color: "Natural Black",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
  },
  {
    id: 2,
    name: "Body Wave Closure",
    length: "18 inch",
    price: 1990,
    tag: "New",
    color: "Chestnut Brown",
    img: "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&q=80",
  },
  {
    id: 3,
    name: "Deep Curl Full Lace",
    length: "24 inch",
    price: 3400,
    tag: "Limited",
    color: "Jet Black",
    img: "https://images.unsplash.com/photo-1595475884562-073c30d45670?w=600&q=80",
  },
  {
    id: 4,
    name: "Straight HD Lace",
    length: "20 inch",
    price: 2200,
    tag: null,
    color: "Dark Brown",
    img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
  },
];

const navLinks = ["Collection", "About", "Care Guide", "Contact"];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addToCart = (name: string) => {
    setCartCount((c) => c + 1);
    setToastMsg(`${name} added to bag`);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #FAF8F5;
          --warm-white: #F5F2ED;
          --sand: #E8E0D4;
          --taupe: #C4B5A5;
          --mink: #8C7B6B;
          --espresso: #2C1F14;
          --gold: #B8965A;
          --gold-light: #D4AF6E;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'Jost', sans-serif;
          background: var(--cream);
          color: var(--espresso);
          overflow-x: hidden;
        }

        /* NAV */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 0 4rem;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.4s ease;
        }
        nav.scrolled {
          background: rgba(250, 248, 245, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--sand);
        }
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 300;
          letter-spacing: 0.15em;
          color: var(--espresso);
          text-decoration: none;
        }
        .nav-logo span { color: var(--gold); }
        .nav-links {
          display: flex;
          gap: 2.5rem;
          list-style: none;
        }
        .nav-links a {
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--espresso);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--gold); }
        .nav-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .cart-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--espresso);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.2rem;
          border: 1px solid var(--espresso);
          transition: all 0.25s;
        }
        .cart-btn:hover {
          background: var(--espresso);
          color: var(--cream);
        }
        .cart-badge {
          background: var(--gold);
          color: white;
          font-size: 0.6rem;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding-top: 72px;
        }
        .hero-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 6rem 5rem 6rem 4rem;
          position: relative;
        }
        .hero-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .hero-eyebrow::before {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: var(--gold);
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.5rem, 5.5vw, 5.5rem);
          font-weight: 300;
          line-height: 1.05;
          color: var(--espresso);
          margin-bottom: 2rem;
        }
        .hero-title em {
          font-style: italic;
          color: var(--mink);
        }
        .hero-desc {
          font-family: 'Jost', sans-serif;
          font-size: 0.95rem;
          font-weight: 300;
          line-height: 1.8;
          color: var(--mink);
          max-width: 380px;
          margin-bottom: 3rem;
        }
        .hero-cta-group {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .btn-primary {
          background: var(--espresso);
          color: var(--cream);
          border: none;
          padding: 0.9rem 2.5rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s;
          text-decoration: none;
          display: inline-block;
        }
        .btn-primary:hover { background: var(--gold); }
        .btn-ghost {
          background: none;
          color: var(--espresso);
          border: none;
          padding: 0.9rem 1.5rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          transition: color 0.25s;
        }
        .btn-ghost:hover { color: var(--gold); }
        .btn-ghost::after {
          content: '→';
          transition: transform 0.25s;
        }
        .btn-ghost:hover::after { transform: translateX(4px); }

        .hero-stats {
          position: absolute;
          bottom: 4rem;
          left: 4rem;
          display: flex;
          gap: 3rem;
        }
        .stat-item {}
        .stat-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: var(--espresso);
          line-height: 1;
        }
        .stat-label {
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--taupe);
          margin-top: 0.3rem;
        }

        .hero-right {
          position: relative;
          overflow: hidden;
          background: var(--warm-white);
        }
        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s ease;
        }
        .hero-right:hover .hero-img { transform: scale(1.03); }
        .hero-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(44,31,20,0.08) 0%, transparent 60%);
        }
        .hero-badge {
          position: absolute;
          bottom: 3rem;
          left: -1.5rem;
          background: var(--cream);
          border: 1px solid var(--sand);
          padding: 1.2rem 1.8rem;
          box-shadow: 0 8px 40px rgba(44,31,20,0.12);
        }
        .hero-badge-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-weight: 400;
          color: var(--espresso);
        }
        .hero-badge-sub {
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-top: 0.2rem;
        }

        /* MARQUEE */
        .marquee-section {
          background: var(--espresso);
          padding: 1.1rem 0;
          overflow: hidden;
        }
        .marquee-track {
          display: flex;
          gap: 4rem;
          animation: marquee 25s linear infinite;
          width: max-content;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-item {
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--taupe);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .marquee-dot {
          width: 3px; height: 3px;
          background: var(--gold);
          border-radius: 50%;
        }

        /* SECTION COMMON */
        section { padding: 7rem 4rem; }
        .section-label {
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .section-label::before {
          content: '';
          width: 30px;
          height: 1px;
          background: var(--gold);
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 300;
          color: var(--espresso);
          line-height: 1.2;
        }

        /* COLLECTION */
        .collection-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3.5rem;
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .product-card {
          cursor: pointer;
          position: relative;
        }
        .product-img-wrap {
          position: relative;
          overflow: hidden;
          background: var(--warm-white);
          aspect-ratio: 3/4;
        }
        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }
        .product-card:hover .product-img { transform: scale(1.06); }
        .product-tag {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: var(--espresso);
          color: var(--cream);
          font-family: 'Jost', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.3rem 0.7rem;
        }
        .product-tag.new { background: var(--gold); }
        .product-tag.limited {
          background: none;
          border: 1px solid var(--espresso);
          color: var(--espresso);
        }
        .product-add-btn {
          position: absolute;
          bottom: -50px;
          left: 0; right: 0;
          background: rgba(44,31,20,0.92);
          color: var(--cream);
          border: none;
          padding: 0.9rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: bottom 0.3s ease;
          backdrop-filter: blur(4px);
        }
        .product-card:hover .product-add-btn { bottom: 0; }
        .product-add-btn:hover { background: var(--gold) !important; }

        .product-info { padding: 1.2rem 0; }
        .product-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem;
          font-weight: 400;
          color: var(--espresso);
        }
        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.4rem;
        }
        .product-color {
          font-family: 'Jost', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          color: var(--taupe);
        }
        .product-price {
          font-family: 'Jost', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--espresso);
        }

        /* FEATURES */
        .features-section {
          background: var(--espresso);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          padding: 0;
        }
        .feature-item {
          padding: 5rem 3.5rem;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .feature-item:last-child { border-right: none; }
        .feature-icon {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          color: var(--gold);
        }
        .feature-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 0.8rem;
        }
        .feature-desc {
          font-family: 'Jost', sans-serif;
          font-size: 0.85rem;
          font-weight: 300;
          line-height: 1.8;
          color: var(--taupe);
        }

        /* EDITORIAL */
        .editorial {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          padding: 0;
          min-height: 600px;
        }
        .editorial-img-wrap {
          overflow: hidden;
          position: relative;
        }
        .editorial-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          min-height: 600px;
          transition: transform 0.8s ease;
        }
        .editorial-img-wrap:hover .editorial-img { transform: scale(1.03); }
        .editorial-content {
          background: var(--warm-white);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 6rem 5rem;
        }
        .editorial-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 300;
          font-style: italic;
          color: var(--espresso);
          line-height: 1.4;
          margin-bottom: 2rem;
        }
        .editorial-sub {
          font-family: 'Jost', sans-serif;
          font-size: 0.85rem;
          font-weight: 300;
          line-height: 1.9;
          color: var(--mink);
          margin-bottom: 2.5rem;
          max-width: 400px;
        }

        /* TOAST */
        .toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: var(--espresso);
          color: var(--cream);
          padding: 1rem 1.8rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          transform: translateY(80px);
          opacity: 0;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
        }
        .toast.visible {
          transform: translateY(0);
          opacity: 1;
        }
        .toast-check { color: var(--gold); font-size: 1rem; }

        /* FOOTER */
        footer {
          background: var(--espresso);
          padding: 4rem;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 3rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .footer-brand {}
        .footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 300;
          letter-spacing: 0.15em;
          color: var(--cream);
          margin-bottom: 1rem;
        }
        .footer-logo span { color: var(--gold); }
        .footer-tagline {
          font-family: 'Jost', sans-serif;
          font-size: 0.8rem;
          font-weight: 300;
          line-height: 1.8;
          color: var(--taupe);
          max-width: 240px;
        }
        .footer-col-title {
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--cream);
          margin-bottom: 1.2rem;
        }
        .footer-links { list-style: none; }
        .footer-links li { margin-bottom: 0.7rem; }
        .footer-links a {
          font-family: 'Jost', sans-serif;
          font-size: 0.8rem;
          font-weight: 300;
          color: var(--taupe);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--gold-light); }
        .footer-bottom {
          background: var(--espresso);
          padding: 1.5rem 4rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-copy {
          font-family: 'Jost', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          color: var(--taupe);
        }
        .footer-copy span { color: var(--gold); }

        @media (max-width: 900px) {
          nav { padding: 0 2rem; }
          .nav-links { display: none; }
          .hero { grid-template-columns: 1fr; }
          .hero-right { min-height: 50vh; }
          .hero-stats { bottom: 2rem; left: 2rem; gap: 2rem; }
          .product-grid { grid-template-columns: 1fr 1fr; }
          .features-section { grid-template-columns: 1fr; }
          .editorial { grid-template-columns: 1fr; }
          footer { grid-template-columns: 1fr 1fr; padding: 3rem 2rem; }
          section { padding: 4rem 2rem; }
        }
      `}</style>

      {/* NAV */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href="#" className="nav-logo">VELOUR<span>.</span></a>
        <ul className="nav-links">
          {navLinks.map((l) => (
            <li key={l}><a href="#">{l}</a></li>
          ))}
        </ul>
        <div className="nav-right">
          <button className="cart-btn" onClick={() => {}}>
            Bag
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" style={{ padding: 0 }}>
        <div className="hero-left">
          <div className="hero-eyebrow">Premium Hair Collection</div>
          <h1 className="hero-title">
            Wear Your<br />
            <em>Confidence</em><br />
            Differently.
          </h1>
          <p className="hero-desc">
            Handcrafted luxury wigs from 100% virgin human hair.
            Each piece is meticulously styled for a flawless, natural finish.
          </p>
          <div className="hero-cta-group">
            <a href="#collection" className="btn-primary">Shop Collection</a>
            <a href="#" className="btn-ghost">Our Story</a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Virgin Hair</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2K+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">48h</div>
              <div className="stat-label">Delivery</div>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=85"
            alt="Luxury wig editorial"
            className="hero-img"
          />
          <div className="hero-img-overlay" />
          <div className="hero-badge">
            <div className="hero-badge-title">New Season Arrivals</div>
            <div className="hero-badge-sub">Spring / Summer 2025</div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-section">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) =>
            ["100% Virgin Human Hair", "Free Shipping Over R1500", "HD Lace Technology", "Custom Colour Orders", "Afterpay Available", "Luxury Packaging"].map((t, j) => (
              <div className="marquee-item" key={`${i}-${j}`}>
                <span className="marquee-dot" />
                {t}
              </div>
            ))
          )}
        </div>
      </div>

      {/* COLLECTION */}
      <section id="collection">
        <div className="collection-header">
          <div>
            <div className="section-label">Curated for You</div>
            <h2 className="section-title">Featured Collection</h2>
          </div>
          <a href="#" className="btn-ghost">View All</a>
        </div>
        <div className="product-grid">
          {products.map((p) => (
            <div
              key={p.id}
              className="product-card"
              onMouseEnter={() => setHoveredProduct(p.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="product-img-wrap">
                <img src={p.img} alt={p.name} className="product-img" />
                {p.tag && (
                  <span className={`product-tag ${p.tag.toLowerCase()}`}>{p.tag}</span>
                )}
                <button
                  className="product-add-btn"
                  onClick={() => addToCart(p.name)}
                >
                  Add to Bag
                </button>
              </div>
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-meta">
                  <span className="product-color">{p.color} · {p.length}</span>
                  <span className="product-price">R{p.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <div className="features-section">
        {[
          { icon: "✦", title: "Virgin Human Hair", desc: "Every wig is crafted from 100% unprocessed virgin hair — soft, lustrous, and built to last." },
          { icon: "◈", title: "HD Lace Frontal", desc: "Our HD lace melts seamlessly into all skin tones for an undetectable, natural hairline." },
          { icon: "◎", title: "Custom Orders", desc: "Request your ideal length, colour, density, or curl pattern. Made just for you." },
        ].map((f) => (
          <div key={f.title} className="feature-item">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* EDITORIAL */}
      <div className="editorial">
        <div className="editorial-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=85"
            alt="Editorial"
            className="editorial-img"
          />
        </div>
        <div className="editorial-content">
          <div className="section-label">Our Philosophy</div>
          <blockquote className="editorial-quote">
            "Hair is the crown you never take off."
          </blockquote>
          <p className="editorial-sub">
            At Velour, we believe every woman deserves hair that makes her feel
            unstoppable. From our sourcing process to the final finishing touches,
            quality is never compromised. Each wig leaves our studio having passed
            through the hands of expert stylists who care deeply about the craft.
          </p>
          <a href="#" className="btn-primary">Discover Our Story</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-brand">
          <div className="footer-logo">VELOUR<span>.</span></div>
          <p className="footer-tagline">
            Luxury human hair wigs, handcrafted for women who refuse to blend in.
          </p>
        </div>
        <div>
          <div className="footer-col-title">Shop</div>
          <ul className="footer-links">
            {["New Arrivals", "Lace Frontals", "Full Lace Wigs", "Closure Wigs", "Custom Orders"].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Help</div>
          <ul className="footer-links">
            {["Sizing Guide", "Care Instructions", "Shipping Policy", "Returns", "Contact Us"].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Account</div>
          <ul className="footer-links">
            {["Sign In", "Create Account", "My Orders", "Wishlist", "Loyalty Rewards"].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
      </footer>
      
      <div className="footer-bottom">
        <div className="footer-copy">© 2025 <span>Velour</span>. All rights reserved.</div>
        <div className="footer-copy">Secure payments via <span>PayFast</span></div>
      </div>

      {/* TOAST */}
      <div className={`toast ${toastVisible ? "visible" : ""}`}>
        <span className="toast-check">✓</span>
        {toastMsg}
      </div>
    </>
  );
}