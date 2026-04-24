// emails/OrderConfirmed.tsx
// React Email template for order confirmation.

import * as React from "react";
import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Img, Preview, Section, Text, Row, Column,
} from "@react-email/components";

interface OrderItem {
  name:     string;
  variant:  string;
  quantity: number;
  price:    number; // in cents
}

interface OrderConfirmedProps {
  customerName: string;
  orderId:      string;
  orderDate:    string;
  items:        OrderItem[];
  subtotal:     number; // cents
  shipping:     number; // cents
  total:        number; // cents
  address: {
    fullName:   string;
    street:     string;
    city:       string;
    province:   string;
    postalCode: string;
    country:    string;
  };
  orderUrl: string;
}

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

export default function OrderConfirmed({
  customerName = "Valued Customer",
  orderId = "ABC12345",
  orderDate = "19 April 2026",
  items = [],
  subtotal = 0,
  shipping = 0,
  total = 0,
  address = { fullName: "", street: "", city: "", province: "", postalCode: "", country: "South Africa" },
  orderUrl = "#",
}: OrderConfirmedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your novaa order #{orderId.slice(0, 8).toUpperCase()} is confirmed ✓</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>novaa</Heading>
            <Text style={tagline}>elevated beauty, with purpose.</Text>
          </Section>

          {/* Hero */}
          <Section style={hero}>
            <Text style={checkmark}>✓</Text>
            <Heading style={heroHeading}>Order Confirmed</Heading>
            <Text style={heroSub}>
              Thank you, {customerName.split(" ")[0]}. Your order has been received and is being prepared.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Order details */}
          <Section style={section}>
            <Row>
              <Column>
                <Text style={label}>Order Number</Text>
                <Text style={value}>#{orderId.slice(0, 8).toUpperCase()}</Text>
              </Column>
              <Column>
                <Text style={label}>Order Date</Text>
                <Text style={value}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Items */}
          <Section style={section}>
            <Heading style={sectionHeading}>Items Ordered</Heading>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column style={{ flex: 1 }}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemVariant}>{item.variant}</Text>
                </Column>
                <Column style={{ textAlign: "right" as const }}>
                  <Text style={itemQty}>×{item.quantity}</Text>
                  <Text style={itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Totals */}
          <Section style={section}>
            <Row style={totalRow}>
              <Column><Text style={totalLabel}>Subtotal</Text></Column>
              <Column style={{ textAlign: "right" as const }}><Text style={totalValue}>{formatPrice(subtotal)}</Text></Column>
            </Row>
            <Row style={totalRow}>
              <Column><Text style={totalLabel}>Shipping</Text></Column>
              <Column style={{ textAlign: "right" as const }}>
                <Text style={totalValue}>{shipping === 0 ? "Free" : formatPrice(shipping)}</Text>
              </Column>
            </Row>
            <Row style={{ ...totalRow, borderTop: "1px solid #E5E5E5", paddingTop: "12px" }}>
              <Column><Text style={{ ...totalLabel, fontWeight: "600", color: "#1A1A1A" }}>Total</Text></Column>
              <Column style={{ textAlign: "right" as const }}>
                <Text style={{ ...totalValue, fontWeight: "600", color: "#B8965A", fontSize: "18px" }}>
                  {formatPrice(total)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Shipping address */}
          <Section style={section}>
            <Heading style={sectionHeading}>Shipping To</Heading>
            <Text style={addressText}>
              {address.fullName}<br />
              {address.street}<br />
              {address.city}, {address.province} {address.postalCode}<br />
              {address.country}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={{ ...section, textAlign: "center" as const }}>
            <Button href={orderUrl} style={button}>
              View Your Order
            </Button>
            <Text style={helpText}>
              Questions? Reply to this email or contact us at{" "}
              <a href="mailto:hello@novaa.co.za" style={link}>hello@novaa.co.za</a>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>© 2026 novaa. All rights reserved.</Text>
            <Text style={footerText}>South Africa</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ─── STYLES ──────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#F5F5F5",
  fontFamily: "Georgia, 'Times New Roman', serif",
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "580px",
};

const header: React.CSSProperties = {
  backgroundColor: "#1A1A1A",
  padding: "32px 40px",
  textAlign: "center",
};

const logo: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: "32px",
  fontWeight: "300",
  letterSpacing: "8px",
  margin: "0 0 4px",
};

const tagline: React.CSSProperties = {
  color: "#B8965A",
  fontSize: "11px",
  letterSpacing: "3px",
  textTransform: "uppercase",
  margin: "0",
};

const hero: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  padding: "40px 40px 32px",
  textAlign: "center",
};

const checkmark: React.CSSProperties = {
  color: "#B8965A",
  fontSize: "32px",
  margin: "0 0 8px",
};

const heroHeading: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "28px",
  fontWeight: "300",
  letterSpacing: "2px",
  margin: "0 0 12px",
};

const heroSub: React.CSSProperties = {
  color: "#666666",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0",
};

const section: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  padding: "24px 40px",
};

const sectionHeading: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "13px",
  fontWeight: "600",
  letterSpacing: "2px",
  textTransform: "uppercase",
  margin: "0 0 16px",
};

const label: React.CSSProperties = {
  color: "#999999",
  fontSize: "11px",
  letterSpacing: "1px",
  textTransform: "uppercase",
  margin: "0 0 4px",
};

const value: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "15px",
  fontWeight: "500",
  margin: "0",
};

const itemRow: React.CSSProperties = {
  borderBottom: "1px solid #F0F0F0",
  paddingBottom: "12px",
  marginBottom: "12px",
};

const itemName: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 2px",
};

const itemVariant: React.CSSProperties = {
  color: "#888888",
  fontSize: "12px",
  margin: "0",
};

const itemQty: React.CSSProperties = {
  color: "#888888",
  fontSize: "12px",
  margin: "0 0 2px",
};

const itemPrice: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const totalRow: React.CSSProperties = {
  marginBottom: "8px",
};

const totalLabel: React.CSSProperties = {
  color: "#666666",
  fontSize: "14px",
  margin: "0",
};

const totalValue: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "14px",
  margin: "0",
};

const addressText: React.CSSProperties = {
  color: "#444444",
  fontSize: "14px",
  lineHeight: "1.8",
  margin: "0",
};

const button: React.CSSProperties = {
  backgroundColor: "#1A1A1A",
  color: "#FFFFFF",
  fontSize: "11px",
  fontFamily: "Arial, sans-serif",
  fontWeight: "600",
  letterSpacing: "2px",
  textTransform: "uppercase",
  textDecoration: "none",
  padding: "14px 32px",
  display: "inline-block",
};

const helpText: React.CSSProperties = {
  color: "#888888",
  fontSize: "13px",
  marginTop: "20px",
};

const link: React.CSSProperties = {
  color: "#B8965A",
  textDecoration: "none",
};

const divider: React.CSSProperties = {
  borderColor: "#E8E8E8",
  margin: "0",
};

const footer: React.CSSProperties = {
  backgroundColor: "#F5F5F5",
  padding: "24px 40px",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  color: "#AAAAAA",
  fontSize: "12px",
  margin: "0 0 4px",
};