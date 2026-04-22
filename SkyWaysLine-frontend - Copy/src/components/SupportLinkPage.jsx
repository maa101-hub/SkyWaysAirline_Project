import { Link, useParams } from "react-router-dom";
import "./SupportLinkPage.css";

const supportContent = {
  "help-centre": {
    title: "Help Centre",
    section: "Support",
    points: [
      "Search flights, bookings, and payment help articles.",
      "Track refund status with booking ID and email.",
      "Get baggage, check-in, and reschedule guidance.",
    ],
  },
  "contact-us": {
    title: "Contact Us",
    section: "Support",
    points: [
      "Customer Care: +91 80000 12345 (24×7)",
      "Email: support@skywaysairline.in",
      "Response SLA: 30 mins for urgent requests.",
    ],
  },
  "refund-policy": {
    title: "Refund Policy",
    section: "Support",
    points: [
      "Wallet refunds are credited instantly.",
      "UPI/Card refunds are processed in 3-5 working days.",
      "Refund amount depends on fare rules and cancellation window.",
    ],
  },
  "terms-privacy": {
    title: "Terms & Privacy",
    section: "Support",
    points: [
      "By booking, users agree to SkyWays transport terms.",
      "Personal data is encrypted and used only for service delivery.",
      "Users can request data export or deletion from support.",
    ],
  },
};

const socialContent = {
  instagram: {
    title: "Instagram",
    section: "Social",
    points: [
      "Daily travel reels and destination stories.",
      "Live updates for offers and festive campaigns.",
      "Community highlights from passenger journeys.",
    ],
  },
  x: {
    title: "X",
    section: "Social",
    points: [
      "Real-time flight and route announcements.",
      "Customer issue escalation and support updates.",
      "Weather and delay advisories for active sectors.",
    ],
  },
  facebook: {
    title: "Facebook",
    section: "Social",
    points: [
      "Travel tips, long-form updates, and campaign posts.",
      "Q&A threads and support references.",
      "Airport guides and seasonal travel advisories.",
    ],
  },
  youtube: {
    title: "YouTube",
    section: "Social",
    points: [
      "Onboard experience videos and route explainers.",
      "How-to guides for booking and boarding pass download.",
      "Safety briefings and feature walkthroughs.",
    ],
  },
  linkedin: {
    title: "LinkedIn",
    section: "Social",
    points: [
      "Company announcements and partnership updates.",
      "Hiring news and engineering culture posts.",
      "Aviation insights and operational milestones.",
    ],
  },
};

export default function SupportLinkPage() {
  const { slug, platform } = useParams();

  const content = slug ? supportContent[slug] : socialContent[platform];

  if (!content) {
    return (
      <div className="support-link-bg">
        <div className="support-link-card">
          <h1>Page not found</h1>
          <p>This link is not configured yet.</p>
          <Link to="/" className="support-link-btn">Back to About</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="support-link-bg">
      <div className="support-link-card">
        <p className="support-link-tag">{content.section}</p>
        <h1>{content.title}</h1>
        <p className="support-link-sub">This is a demo information page for the selected link.</p>
        <ul>
          {content.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <div className="support-link-actions">
          <Link to="/" className="support-link-btn">Back to About</Link>
          <Link to="/login" className="support-link-btn ghost">Go to Login</Link>
        </div>
      </div>
    </div>
  );
}
