import { useContext, useState } from "react";
import axios from "axios";
import { FaWallet } from "react-icons/fa";
import { AuthContext } from "../../../context/AuthContext";
import { initiatePayment } from "../../../utils/razorpay";

export default function WalletModal({ onClose }) {
  const { profile, setProfile } = useContext(AuthContext);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAddMoney = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (amt > 50000) {
      setError("Maximum top-up amount is ₹50,000.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8090/api/booking/wallet/add",
        { amount: amt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const options = {
        key: "rzp_test_SdKfg1SHSyvaok",
        amount: amt * 100,
        currency: "INR",
        name: "SkyWays Airline",
        description: "Wallet Top-up",
        order_id: res.data.data,
        handler: async (response) => {
          try {
            await axios.post(
              "http://localhost:8090/api/booking/wallet/verify",
              {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setProfile((prev) => ({
              ...prev,
              wallet: (prev.wallet || 0) + amt,
            }));
            setSuccessMsg(`₹${amt} added to wallet successfully!`);
            setAmount("");
          } catch {
            setError("Payment verification failed.");
          }
        },
        prefill: {
          name: `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim(),
          email: profile?.email,
          contact: profile?.phoneNumber,
        },
        theme: {
          color: "#1a73e8",
        },
      };

      await initiatePayment(options);
    } catch {
      setError("Failed to initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pf-overlay" onClick={onClose}>
      <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pf-header">
          <h2 className="pf-title">My Wallet</h2>
          <button className="pf-close" onClick={onClose}>✕</button>
        </div>

        <div className="wallet-balance-section">
          <div className="wallet-balance">
            <FaWallet className="wallet-icon-large" />
            <div>
              <p className="balance-label">Current Balance</p>
              <p className="balance-amount">₹{(profile?.wallet || 0).toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>

        <div className="pf-divider" />

        <div className="add-money-section">
          <h3>Add Money to Wallet</h3>
          {error && <div className="pf-error-banner">{error}</div>}
          {successMsg && <div className="pf-success-banner">✓ {successMsg}</div>}

          <div className="add-money-form">
            <label>Amount (₹)</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="50000"
            />
            <p className="amount-note">Minimum: ₹1 | Maximum: ₹50,000</p>
          </div>

          <button className="add-money-btn" onClick={handleAddMoney} disabled={loading || !amount}>
            {loading ? "Processing..." : "Add Money"}
          </button>
        </div>
      </div>
    </div>
  );
}
