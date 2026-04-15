import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import './BoardingPass.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildQRCells(cells, seed) {
  const rng = seededRandom(seed);
  const total = cells * cells;
  const filled = Array.from({ length: total }, () => rng() > 0.42);

  // Force corner markers
  const corner = (r, c) => {
    for (let dr = 0; dr < 3; dr++)
      for (let dc = 0; dc < 3; dc++) {
        const idx = (r + dr) * cells + (c + dc);
        if (idx < total) filled[idx] = true;
      }
  };
  if (cells === 8) { corner(0, 0); corner(0, 5); corner(5, 0); }
  if (cells === 9) { corner(0, 0); corner(0, 6); corner(6, 0); }

  return filled;
}

function buildBarcodeBars(seed) {
  const widths  = [1,2,3,1,2,1,3,1,2,2,1,3,1,2,1,1,3,2,1,1,2,3,1,2,3,1,2,1,1,3,2,1,2,1,3,2,1,2,3,1,1,2,1,3,2];
  const heights = [36,38,40,36,34,38,42,36,40,38,36,42,34,38,36,34,42,40,36,38,36,42,38,36,40,38,34,36,38,42,36,38,40,36,38,42,36,40,38,36,34,38,42,36,40];
  return widths.map((w, i) => ({
    width:  `${w * 1.5}px`,
    height: `${heights[i] || 36}px`,
    background: i % 3 === 1 ? 'rgba(13,47,94,.5)' : undefined,
  }));
}

// ── Sub-components ────────────────────────────────────────────────────────────

const GlobeIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" fill="none" />
    <path d="M3 12 Q7 8 12 12 Q17 16 21 12" stroke="white" strokeWidth="1.5" fill="none" />
    <path d="M12 3 Q8 7 12 12 Q16 17 12 21" stroke="white" strokeWidth="1.5" fill="none" />
    <path d="M7 5.5 Q9 9 12 12 Q15 15 17 18.5" stroke="white" strokeWidth="1.2" fill="none" opacity=".5" />
  </svg>
);

const PlaneIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

const QRBox = ({ cells, seed, className, cellClass }) => {
  const filled = buildQRCells(cells, seed);
  return (
    <div className={className}>
      {filled.map((isBlack, i) => (
        <div key={i} className={`${cellClass}${isBlack ? ' b' : ''}`} />
      ))}
    </div>
  );
};

const Barcode = () => {
  const bars = buildBarcodeBars(99);
  return (
    <div className="barcode">
      {bars.map((style, i) => (
        <div key={i} className="barcode-bar" style={style} />
      ))}
    </div>
  );
};

// ── Ticket 1 ──────────────────────────────────────────────────────────────────
const Ticket1 = ({ boarding }) => (
  <div className="ticket-1">
    <div className="perf-top" />
    <div className="perf-bot" />

    {/* LEFT: White main panel */}
    <div className="t1-left">

      {/* Header */}
      <div className="t1-header">
        <div className="airline-logo">
          <div className="logo-icon"><GlobeIcon size={22} /></div>
          <div className="airline-name">SkyWays<br />Airlines</div>
        </div>
        <div className="badges">
          <div className="badge">{boarding.classType}</div>
          <div className="badge outline">Group {boarding.group}</div>
        </div>
      </div>

      {/* Route */}
      <div className="t1-route">
        <div className="route-city">
          <span className="route-label">From</span>
          <span className="route-iata">{boarding.fromCode}</span>
          <span className="route-cityname">{boarding.fromCity}</span>
        </div>
        <div className="route-arrow">
          <div className="route-dots" />
          <div className="route-plane-icon"><PlaneIcon size={28} /></div>
          <div className="route-dots" />
        </div>
        <div className="route-city" style={{ textAlign: 'right' }}>
          <span className="route-label">To</span>
          <span className="route-iata">{boarding.toCode}</span>
          <span className="route-cityname">{boarding.toCity}</span>
        </div>
      </div>

      {/* Details grid */}
      <div className="t1-details">
        <div className="detail-cell">
          <span className="detail-label">Passenger</span>
          <span className="detail-value">{boarding.passengerName}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Date</span>
          <span className="detail-value">{boarding.journeyDate}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Gate</span>
          <span className="detail-value">{boarding.gate}</span>
        </div>
        {/* QR spans 2 rows */}
        <div className="detail-cell" style={{ gridRow: 'span 2', alignSelf: 'center' }}>
          <QRBox cells={8} seed={boarding.qrSeed || 42} className="qr-box" cellClass="qr-cell" />
        </div>
        <div className="detail-cell">
          <span className="detail-label">Flight</span>
          <span className="detail-value">{boarding.flightNumber}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Boarding Time</span>
          <span className="detail-value">{boarding.boardingTime}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Seat</span>
          <span className="detail-value">{boarding.seatNos || '—'}</span>
        </div>
      </div>
    </div>

    {/* RIGHT: Blue stub */}
    <div className="t1-right">
      <div className="bp-title">Boarding Pass</div>

      {/* Mini route */}
      <div className="bp-mini-route">
        <div>
          <span className="bp-mini-label">From</span>
          <span className="bp-mini-iata">{boarding.fromCode}</span>
          <span className="bp-mini-city">{boarding.fromCity}</span>
        </div>
        <div className="bp-mini-arrow">
          <div className="bp-mini-dots" />
          <div className="bp-mini-plane"><PlaneIcon size={16} /></div>
          <div className="bp-mini-dots" />
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="bp-mini-label">To</span>
          <span className="bp-mini-iata">{boarding.toCode}</span>
          <span className="bp-mini-city">{boarding.toCity}</span>
        </div>
      </div>

      {/* Info grid */}
      <div className="bp-info-grid">
        <div className="bp-info-cell wide">
          <span className="bp-info-label">Passenger Name</span>
          <span className="bp-info-val">{boarding.passengerName}</span>
        </div>
        <div className="bp-info-cell">
          <span className="bp-info-label">Flight</span>
          <span className="bp-info-val">{boarding.flightNumber}</span>
        </div>
        <div className="bp-info-cell">
          <span className="bp-info-label">Date</span>
          <span className="bp-info-val">{boarding.journeyDate}</span>
        </div>
        <div className="bp-info-cell">
          <span className="bp-info-label">Gate</span>
          <span className="bp-info-val">{boarding.gate}</span>
        </div>
        <div className="bp-info-cell">
          <span className="bp-info-label">Boarding Time</span>
          <span className="bp-info-val">{boarding.boardingTime}</span>
        </div>
      </div>

      {/* Departs / Arrives */}
      <div className="bp-times">
        <div className="bp-time-block">
          <span className="bp-time-label">Departed</span>
          <span className="bp-time-val">{boarding.departureTime}</span>
        </div>
        <div className="bp-time-block" style={{ textAlign: 'right' }}>
          <span className="bp-time-label">Arrives</span>
          <span className="bp-time-val">{boarding.arrivalTime}</span>
        </div>
      </div>

      {/* Group + Seat */}
      <div className="bp-boxes">
        <div className="bp-big-box">
          <span className="bp-big-label">Group</span>
          <span className="bp-big-val">{boarding.group}</span>
        </div>
        <div className="bp-big-box">
          <span className="bp-big-label">Seat</span>
          <span className="bp-big-val">{boarding.seatNos || '—'}</span>
        </div>
      </div>
    </div>
  </div>
);

// ── Ticket 2 ──────────────────────────────────────────────────────────────────
const Ticket2 = ({ boarding }) => (
  <div className="ticket-2">
    <div className="t2-top">

      {/* Blue left brand section */}
      <div className="t2-left">
        <div className="t2-logo-wrap">
          <div className="t2-logo-icon">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M3 12 Q7 8 12 12 Q17 16 21 12" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M12 3 Q8 7 12 12 Q16 17 12 21" stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <div className="t2-airline-name">SkyWays<br />Airlines</div>
        </div>
      </div>

      {/* Dashed divider */}
      <div className="perf-v" style={{ position: 'relative' }}>
        <div className="perf-top-c" />
        <div className="perf-bot-c" />
      </div>

      {/* White right info section */}
      <div className="t2-right">
        <div>
          <div className="t2-pax-name">Passenger Name</div>
          <div className="t2-pax-val">{boarding.passengerName}</div>
        </div>
        <div className="t2-badges">
          <div className="t2-badge">{boarding.classType}</div>
          <div className="t2-badge">Group {boarding.group}</div>
        </div>
        <div className="t2-bp-title">Boarding<br />Pass</div>
      </div>
    </div>

    {/* Bottom barcode row */}
    <div className="t2-bottom">
      <div className="barcode-wrap">
        <Barcode />
        <div className="ticket-no">Ticket No : {boarding.reservationId || '90221002299KUIL'}</div>
      </div>
      <QRBox cells={9} seed={boarding.qrSeed || 77} className="qr-box-lg" cellClass="qr-cell-lg" />
    </div>
  </div>
);

// ── Main Export ───────────────────────────────────────────────────────────────
export default function BoardingPass() {
  const location = useLocation();
  const printRef = useRef(null);
  const state = location.state || {};

  const boarding = {
    flightNumber: state.flightNumber || 'SW-411',
    passengerName: state.passengerName || 'Guest',
    fromCode: state.fromCode || 'DXB',
    toCode: state.toCode || 'CDG',
    fromCity: state.fromCity || 'Dubai',
    toCity: state.toCity || 'Paris',
    departureTime: state.departureTime || '22:45',
    arrivalTime: state.arrivalTime || '06:30',
    journeyDate: state.journeyDate || '--',
    gate: state.gate || 'C12',
    terminal: state.terminal || 'T3',
    seatNos: state.seatNos || '19A',
    boardingTime: state.boardingTime || state.departureTime || '08:00',
    group: state.group || 'E',
    classType: state.classType || 'Economy',
    reservationId: state.reservationId || '90221002299KUIL',
    amountPaid: state.amountPaid || 0,
    qrSeed: state.qrSeed || 42,
  };

  const handleDownloadPdf = () => {
    const element = printRef.current;
    if (!element) return;

    const options = {
      margin: 0.5,
      filename: `SkyWays_BoardingPass_${boarding.reservationId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  const handleShare = async () => {
    const shareText = `SkyWays Boarding Pass for ${boarding.passengerName} on ${boarding.journeyDate}. Flight ${boarding.flightNumber} from ${boarding.fromCity} to ${boarding.toCity}. Seats: ${boarding.seatNos}.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SkyWays Boarding Pass',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share cancelled or failed', error);
      }
      return;
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        alert('Boarding pass details copied to clipboard.');
      } catch (error) {
        console.error('Copy failed', error);
        alert('Copy to clipboard failed. Please share manually.');
      }
      return;
    }

    window.prompt('Copy this boarding pass info:', `${shareText}\n${window.location.href}`);
  };

  return (
    <div className="boarding-pass-page">
      <p className="page-label">✦ SkyWays Boarding Pass</p>
      <div className="bp-actions">
        <button className="btn-download" onClick={handleDownloadPdf}>Download PDF</button>
        <button className="btn-share" onClick={handleShare}>Share Boarding Pass</button>
      </div>
      <div className="boarding-pass-content" ref={printRef}>
        <Ticket1 boarding={boarding} />
        <Ticket2 boarding={boarding} />
      </div>
    </div>
  );
}