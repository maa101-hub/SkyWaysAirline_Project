import { useEffect, useRef } from "react";
 import "./AboutPage.css";

const team = [
  {
    initials: "SR",
    name: "Sourabh Ramteke",
    role: "Backend & API Developer",
    bio: "Built the core flight, user, and booking APIs that power SkyWays. Focused on secure authentication, reliable data flow, and smooth backend integration.",
    gradient: "linear-gradient(135deg,#0ea5e9,#0369a1)",
  },
  {
    initials: "RK",
    name: "Rohit Kaithwas",
    role: "Frontend Developer",
    bio: "Designed and developed the customer-facing pages, flight search experience, and responsive UI so passengers can browse, book, and manage trips easily.",
    gradient: "linear-gradient(135deg,#f0a500,#c07a00)",
  },
  {
    initials: "PS",
    name: "Prashant Kumar Singh",
    role: "Booking & Payment Integration",
    bio: "Worked on booking flow, wallet handling, boarding pass generation, and final feature testing to make the travel process complete from search to confirmation.",
    gradient: "linear-gradient(135deg,#22c55e,#15803d)",
  },
];

const testimonials = [
  {
    initials: "AM",
    name: "Aditya Mehta",
    route: "Mumbai -> Delhi",
    rating: "★★★★★",
    text: "Booked in literally two minutes. The boarding pass on my phone worked perfectly and the crew were incredibly warm. SkyWays is my go-to airline now.",
    gradient: "linear-gradient(135deg,#0ea5e9,#0369a1)",
  },
  {
    initials: "SK",
    name: "Sneha Krishnan",
    route: "Hyderabad -> Chennai",
    rating: "★★★★★",
    text: "The cancellation was so smooth, I got my refund within 3 days. Most airlines make you fight for it. SkyWays actually cares about customers.",
    gradient: "linear-gradient(135deg,#f0a500,#c07a00)",
  },
  {
    initials: "RD",
    name: "Rachna Devi",
    route: "Bangalore -> Goa",
    rating: "★★★★★",
    text: "Flew with my toddler and the staff was absolutely wonderful. They helped us board first, kept my baby entertained, and the flight was bang on time.",
    gradient: "linear-gradient(135deg,#22c55e,#15803d)",
  },
  {
    initials: "VT",
    name: "Vikram Tiwari",
    route: "Pune -> Kolkata",
    rating: "★★★★☆",
    text: "The app is polished and the fare was the lowest I found across all platforms. My booking history is right there and managing my trips feels effortless.",
    gradient: "linear-gradient(135deg,#a855f7,#7e22ce)",
  },
  {
    initials: "PG",
    name: "Pooja Gupta",
    route: "Delhi -> Jaipur",
    rating: "★★★★★",
    text: "I travel for work every week. SkyWays consistently delivers: on-time, comfortable, friendly. The wallet feature saves me so much time at checkout.",
    gradient: "linear-gradient(135deg,#ef4444,#b91c1c)",
  },
];

export default function AboutPage() {
  const pageRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const reveals = root.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((element) => io.observe(element));

    const sections = root.querySelectorAll("section[id]");
    const navLinks = root.querySelectorAll(".about-nav-link");

    const onScroll = () => {
      let current = "";
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 120) current = section.id;
      });

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
      });

      if (navRef.current) {
        navRef.current.style.boxShadow =
          window.scrollY > 30 ? "0 4px 32px rgba(14,165,233,.12)" : "none";
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="about-page" ref={pageRef}>
      <nav className="about-nav" ref={navRef}>
        <a href="#top" className="about-nav-logo">
          Sky<span>Ways</span>
          <em>Airline</em>
        </a>
        <div className="about-nav-links">
          <a href="#about" className="about-nav-link">About</a>
          <a href="#mission" className="about-nav-link">Mission</a>
          <a href="#how" className="about-nav-link">How It Works</a>
          <a href="#features" className="about-nav-link">Why Us</a>
          <a href="#team" className="about-nav-link">Team</a>
        </div>
        <a className="about-nav-cta" href="/login">
          Book a Flight
        </a>
      </nav>

      <section className="about-hero" id="top">
        <div className="about-hero-bg" />
        <div className="about-hero-sun" />
        <div className="clouds">
          <div className="cloud c1" />
          <div className="cloud c2" />
          <div className="cloud c3" />
          <div className="cloud c4" />
          <div className="cloud c5" />
        </div>
        <div className="about-hero-plane">✈</div>
        <div className="mini-plane mp1">✦</div>
        <div className="mini-plane mp2">✦</div>
        <div className="mini-plane mp3">✦</div>

        <div className="about-hero-content">
          <div className="about-hero-tag">
            <span className="about-hero-tag-dot" />
            India's Favourite Airline
          </div>
          <h1 className="about-hero-title">
            Where Every Journey
            <em>Begins with a Dream</em>
          </h1>
          <p className="about-hero-sub">
            SkyWays Airline connects hearts across India and beyond with seamless booking,
            unbeatable fares, and a promise to get you there in comfort and style.
          </p>
          <div className="about-hero-btns">
            <a href="/login" className="about-btn-primary">Explore Flights</a>
            <a href="#about" className="about-btn-ghost">Our Story</a>
          </div>
        </div>

        <div className="about-hero-stats">
          <div className="stat-block"><span className="stat-num">50+</span><span className="stat-label">Destinations</span></div>
          <div className="stat-block"><span className="stat-num">2M+</span><span className="stat-label">Happy Flyers</span></div>
          <div className="stat-block"><span className="stat-num">98%</span><span className="stat-label">On-Time Rate</span></div>
          <div className="stat-block"><span className="stat-num">24/7</span><span className="stat-label">Support</span></div>
        </div>

        <div className="scroll-hint">
          <div className="scroll-arrow" />
          Scroll to explore
        </div>
      </section>

      <section className="about-strip" id="about">
        <div className="about-grid">
          <div className="about-visual reveal">
            <div className="about-illustration">
              <div className="plane-window">
                <div className="window-oval">
                  <div className="window-skyline">☀</div>
                  <div className="window-text">30,000 ft above</div>
                </div>
              </div>
            </div>
            <div className="about-badge">
              <div className="badge-icon">★</div>
              <div className="badge-text">
                Best Airline 2024
                <span>Travel Awards India</span>
              </div>
            </div>
          </div>
          <div className="reveal delay-15">
            <div className="section-label">✦ Our Story</div>
            <h2 className="section-title">Flying India's Skies <em>Since Day One</em></h2>
            <p className="section-sub spaced">
              SkyWays Airline was born from a simple belief: flying should be accessible,
              joyful, and stress-free for everyone. We started with a small fleet and an
              even bigger dream.
            </p>
            <p className="section-sub spaced-lg">
              Today we operate hundreds of flights daily across more than 50 cities,
              serving millions of passengers who trust us to bring them home safely, on
              time, every time.
            </p>
            <div className="about-metrics">
              <div><div className="metric-num">2015</div><div className="metric-label">Founded</div></div>
              <div><div className="metric-num">120+</div><div className="metric-label">Daily Flights</div></div>
              <div><div className="metric-num">4.8★</div><div className="metric-label">Avg Rating</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mission-section" id="mission">
        <div className="mission-center">
          <div className="mission-head reveal">
            <div className="section-label">✦ What We Stand For</div>
            <h2 className="section-title">Our Mission & <em>Values</em></h2>
            <p className="section-sub">Everything we do is guided by three core principles that keep us flying in the right direction.</p>
          </div>
          <div className="mission-grid">
            <div className="mission-card reveal delay-05"><div className="mc-icon">✓</div><h3 className="mc-title">Safety First, Always</h3><p className="mc-text">Your safety is our highest priority. Every flight, every crew member, every aircraft is held to the strictest global standards.</p></div>
            <div className="mission-card reveal delay-12"><div className="mc-icon">♥</div><h3 className="mc-title">Warmth at Every Altitude</h3><p className="mc-text">We believe great hospitality happens at 30,000 feet too. Our crew makes every passenger feel at home from boarding to landing.</p></div>
            <div className="mission-card reveal delay-19"><div className="mc-icon">♻</div><h3 className="mc-title">Sustainable Skies</h3><p className="mc-text">From fuel-efficient aircraft to paperless boarding, we are building a greener future for aviation.</p></div>
          </div>
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="how-center">
          <div className="how-head reveal">
            <div className="section-label">✦ Simple & Fast</div>
            <h2 className="section-title">Book Your Flight in <em>4 Easy Steps</em></h2>
            <p className="section-sub centered">From search to boarding pass, we have made it effortlessly smooth.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card reveal delay-05"><div className="step-num">1<span className="step-icon-overlay">⌕</span></div><h4 className="step-title">Search Flights</h4><p className="step-text">Enter your origin, destination, and travel dates. We will instantly show the best options.</p></div>
            <div className="step-card reveal delay-12"><div className="step-num">2<span className="step-icon-overlay">⌂</span></div><h4 className="step-title">Choose & Customise</h4><p className="step-text">Pick your preferred flight, seat class, and seat number. Filter by price or time.</p></div>
            <div className="step-card reveal delay-19"><div className="step-num">3<span className="step-icon-overlay">₹</span></div><h4 className="step-title">Secure Payment</h4><p className="step-text">Pay via wallet, UPI, card, or net banking. Transactions are encrypted and secure.</p></div>
            <div className="step-card reveal delay-26"><div className="step-num">4<span className="step-icon-overlay">✈</span></div><h4 className="step-title">Fly & Enjoy</h4><p className="step-text">Download your boarding pass, head to the airport, and leave the rest to us.</p></div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="feat-dots"><div className="fdot" /><div className="fdot" /><div className="fdot" /></div>
        <div className="features-center">
          <div className="features-head reveal">
            <div className="section-label">✦ Why SkyWays</div>
            <h2 className="section-title">Everything You Need, <em>Nothing You Don't</em></h2>
            <p className="section-sub">We have obsessed over every detail so your journey is exactly what it should be.</p>
          </div>
          <div className="feat-grid">
            <div className="feat-card reveal delay-04"><span className="feat-icon">⚡</span><h4 className="feat-title">Instant Booking Confirmation</h4><p className="feat-text">Book in under 60 seconds and get your e-ticket delivered instantly.</p></div>
            <div className="feat-card reveal delay-09"><span className="feat-icon">₹</span><h4 className="feat-title">Best Fare Guarantee</h4><p className="feat-text">Our intelligent pricing helps you find the best available deal.</p></div>
            <div className="feat-card reveal delay-14"><span className="feat-icon">↺</span><h4 className="feat-title">Flexible Cancellations</h4><p className="feat-text">Cancel or modify your booking easily from your account.</p></div>
            <div className="feat-card reveal delay-19"><span className="feat-icon">◎</span><h4 className="feat-title">50+ Destinations</h4><p className="feat-text">From Leh to Andaman, we fly to every corner of incredible India.</p></div>
            <div className="feat-card reveal delay-24"><span className="feat-icon">▣</span><h4 className="feat-title">Generous Baggage Policy</h4><p className="feat-text">Carry more without the stress with inclusive baggage allowance.</p></div>
            <div className="feat-card reveal delay-29"><span className="feat-icon">☎</span><h4 className="feat-title">24/7 Live Support</h4><p className="feat-text">Real humans, real help, any time of day.</p></div>
          </div>
        </div>
      </section>

      <section className="team-section" id="team">
        <div className="team-center">
          <div className="team-head reveal">
            <div className="section-label">✦ The People Behind The Wings</div>
            <h2 className="section-title">Meet Our <em>Leadership Team</em></h2>
            <p className="section-sub">Experienced aviation professionals dedicated to redefining how India flies.</p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div className={`team-card reveal delay-${String((index + 1) * 5).padStart(2, "0")}`} key={member.name}>
                <div className="team-avatar" style={{ background: member.gradient }}>{member.initials}</div>
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
                <div className="team-bio">{member.bio}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testi-section">
        <div className="testi-center">
          <div className="testi-head reveal">
            <div className="section-label">✦ Passenger Stories</div>
            <h2 className="section-title">Loved by <em>Millions of Flyers</em></h2>
          </div>
        </div>
        <div className="testi-track-wrap">
          <div className="testi-track">
            {[...testimonials, ...testimonials].map((item, index) => (
              <div className="testi-card" key={`${item.name}-${index}`}>
                <div className="testi-stars">{item.rating}</div>
                <p className="testi-text">"{item.text}"</p>
                <div className="testi-author">
                  <div className="testi-av" style={{ background: item.gradient }}>{item.initials}</div>
                  <div><div className="testi-name">{item.name}</div><div className="testi-loc">{item.route}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section" id="cta">
        <div className="cta-plane-bg">✈</div>
        <div className="cta-content reveal">
          <h2 className="cta-title">Your Next Adventure<br />is Waiting in the <em>Skies</em></h2>
          <p className="cta-sub">Join over 2 million happy flyers. Search, book, and fly with SkyWays, where every seat is a window seat to something wonderful.</p>
          <div className="cta-btns">
            <a href="/login" className="btn-white">Book Your Flight</a>
            <a href="#about" className="btn-outline-white">Learn More</a>
          </div>
        </div>
      </section>

      <footer className="about-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">Sky<span>Ways</span> Airline</div>
            <p className="footer-desc">Connecting India's hearts, one flight at a time. Safe, affordable, and always on time.</p>
          </div>
          <div className="footer-col"><h4>Company</h4><a href="#about">About Us</a><a href="#team">Our Team</a><a href="#top">Careers</a><a href="#top">Press</a></div>
          <div className="footer-col"><h4>Services</h4><a href="/login">Book Flights</a><a href="#top">My Bookings</a><a href="#top">Check-In</a><a href="#top">Flight Status</a></div>
          <div className="footer-col"><h4>Support</h4><a href="#top">Help Centre</a><a href="#top">Contact Us</a><a href="#top">Refund Policy</a><a href="#top">Terms & Privacy</a></div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 <span>SkyWays Airline</span>. All rights reserved. Made with love for India's travellers.</p>
        </div>
      </footer>
    </div>
  );
}
