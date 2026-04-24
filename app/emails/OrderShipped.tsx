// emails/OrderShipped.tsx
// React Email template for shipping notification.

import * as React from "react";
import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Row, Column,
} from "@react-email/components";

interface OrderShippedProps {
  customerName:    string;
  orderId:         string;
  trackingNumber?: string;
  trackingUrl?:    string;
  courier?:        string;
  estimatedDays?:  string;
  items:           { name: string; variant: string; quantity: number }[];
  orderUrl:        string;
}

export default function OrderShipped({
  customerName = "Valued Customer",
  orderId = "ABC12345",
  trackingNumber,
  trackingUrl,
  courier = "The Courier Guy",
  estimatedDays = "2–3",
  items = [],
  orderUrl = "#",
}: OrderShippedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your novaa order #{orderId.slice(0, 8).toUpperCase()} is on its way 🚚</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>novaa</Heading>
            <Text style={tagline}>elevated beauty, with purpose.</Text>
          </Section>

          {/* Hero */}
          <Section style={hero}>
            <Text style={truckIcon}>🚚</Text>
            <Heading style={heroHeading}>Your Order Is On Its Way</Heading>
            <Text style={heroSub}>
              Great news, {customerName.split(" ")[0]}! Your novaa order has been shipped
              and is heading your way.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Tracking */}
          {trackingNumber && (
            <>
              <Section style={trackingSection}>
                <Heading style={sectionHeading}>Track Your Package</Heading>
                <Row>
                  <Column>
                    <Text style={label}>Courier</Text>
                    <Text style={value}>{courier}</Text>
                  </Column>
                  <Column>
                    <Text style={label}>Tracking Number</Text>
                    <Text style={{ ...value, fontFamily: "monospace", letterSpacing: "1px" }}>
                      {trackingNumber}
                    </Text>
                  </Column>
                  <Column>
                    <Text style={label}>Est. Delivery</Text>
                    <Text style={value}>{estimatedDays} business days</Text>
                  </Column>
                </Row>
                {trackingUrl && (
                  <Section style={{ textAlign: "center" as const, paddingTop: "20px" }}>
                    <Button href={trackingUrl} style={trackingButton}>
                      Track Package
                    </Button>
                  </Section>
                )}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* Items in shipment */}
          <Section style={section}>
            <Heading style={sectionHeading}>What's Inside</Heading>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemVariant}>{item.variant} · Qty: {item.quantity}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={{ ...section, textAlign: "center" as const }}>
            <Button href={orderUrl} style={button}>
              View Order Details
            </Button>
            <Text style={helpText}>
              Issues with your delivery? Contact us at{" "}
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

const main: React.CSSProperties = { backgroundColor: "#F5F5F5", fontFamily: "Georgia, 'Times New Roman', serif" };
const container: React.CSSProperties = { margin: "0 auto", padding: "20px 0", maxWidth: "580px" };
const header: React.CSSProperties = { backgroundColor: "#1A1A1A", padding: "32px 40px", textAlign: "center" };
const logo: React.CSSProperties = { color: "#FFFFFF", fontSize: "32px", fontWeight: "300", letterSpacing: "8px", margin: "0 0 4px" };
const tagline: React.CSSProperties = { color: "#B8965A", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", margin: "0" };
const hero: React.CSSProperties = { backgroundColor: "#FFFFFF", padding: "40px 40px 32px", textAlign: "center" };
const truckIcon: React.CSSProperties = { fontSize: "32px", margin: "0 0 8px" };
const heroHeading: React.CSSProperties = { color: "#1A1A1A", fontSize: "28px", fontWeight: "300", letterSpacing: "2px", margin: "0 0 12px" };
const heroSub: React.CSSProperties = { color: "#666666", fontSize: "15px", lineHeight: "1.6", margin: "0" };
const section: React.CSSProperties = { backgroundColor: "#FFFFFF", padding: "24px 40px" };
const trackingSection: React.CSSProperties = { backgroundColor: "#FFFBF5", padding: "24px 40px" };
const sectionHeading: React.CSSProperties = { color: "#1A1A1A", fontSize: "13px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px" };
const label: React.CSSProperties = { color: "#999999", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" };
const value: React.CSSProperties = { color: "#1A1A1A", fontSize: "15px", fontWeight: "500", margin: "0" };
const itemRow: React.CSSProperties = { borderBottom: "1px solid #F0F0F0", paddingBottom: "12px", marginBottom: "12px" };
const itemName: React.CSSProperties = { color: "#1A1A1A", fontSize: "14px", fontWeight: "500", margin: "0 0 2px" };
const itemVariant: React.CSSProperties = { color: "#888888", fontSize: "12px", margin: "0" };
const trackingButton: React.CSSProperties = { backgroundColor: "#B8965A", color: "#1A1A1A", fontSize: "11px", fontFamily: "Arial, sans-serif", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", padding: "14px 32px", display: "inline-block" };
const button: React.CSSProperties = { backgroundColor: "#1A1A1A", color: "#FFFFFF", fontSize: "11px", fontFamily: "Arial, sans-serif", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", padding: "14px 32px", display: "inline-block" };
const helpText: React.CSSProperties = { color: "#888888", fontSize: "13px", marginTop: "20px" };
const link: React.CSSProperties = { color: "#B8965A", textDecoration: "none" };
const divider: React.CSSProperties = { borderColor: "#E8E8E8", margin: "0" };
const footer: React.CSSProperties = { backgroundColor: "#F5F5F5", padding: "24px 40px", textAlign: "center" };
const footerText: React.CSSProperties = { color: "#AAAAAA", fontSize: "12px", margin: "0 0 4px" };