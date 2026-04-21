import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import { getShortUserId } from "./homeUtils";

function formatDOB(dob) {
  if (!dob) return "—";
  const [year, month, day] = dob.split("-");
  return `${day}/${month}/${year}`;
}

export default function ProfileModal({ onClose }) {
  const [editForm, setEditForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { profile, setProfile } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:8082/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProfile(res.data);
        setEditForm({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          dob: res.data.dob || "",
          gender: res.data.gender || "",
          address: res.data.address || "",
        });
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [setProfile]);

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");

      await axios.put("http://localhost:8082/api/users/profile", editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile((prev) => ({
        ...prev,
        ...editForm,
      }));

      setSuccessMsg("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data);
      } else {
        setError("Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User"
    : "User";
  const avatarInitials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const shortUserId = getShortUserId(profile);

  return (
    <div className="pf-overlay" onClick={onClose}>
      <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pf-header">
          <h2 className="pf-title">My Profile</h2>
          <button className="pf-close" onClick={onClose}>✕</button>
        </div>

        {loading && (
          <div className="pf-loading">
            <div className="pf-spinner" />
            <p>Loading profile...</p>
          </div>
        )}

        {error && !loading && typeof error === "string" && (
          <div className="pf-error-banner">{error}</div>
        )}

        {successMsg && <div className="pf-success-banner">✓ {successMsg}</div>}

        {profile && !loading && (
          <>
            <div className="pf-avatar-section">
              <div className="pf-avatar-ring">
                <div className="pf-avatar-circle">{avatarInitials}</div>
              </div>
              <div className="pf-avatar-info">
                <p className="pf-display-name">{displayName}</p>
                <p className="pf-user-id">ID: {shortUserId}</p>
              </div>
            </div>

            <div className="pf-readonly-row">
              <div className="pf-readonly-field">
                <span className="pf-readonly-icon">✉</span>
                <div>
                  <p className="pf-readonly-label">Email</p>
                  <p className="pf-readonly-val">{profile.email || "—"}</p>
                </div>
              </div>
              <div className="pf-readonly-field">
                <span className="pf-readonly-icon">📱</span>
                <div>
                  <p className="pf-readonly-label">Phone</p>
                  <p className="pf-readonly-val">{profile.phoneNumber || "—"}</p>
                </div>
              </div>
            </div>

            <div className="pf-divider" />

            {!isEditing ? (
              <div className="pf-view-grid">
                {[
                  { label: "First Name", val: profile.firstName },
                  { label: "Last Name", val: profile.lastName },
                  { label: "Date of Birth", val: formatDOB(profile.dob) },
                  { label: "Gender", val: profile.gender },
                  { label: "Address", val: profile.address, full: true },
                ].map((item) => (
                  <div key={item.label} className={`pf-view-field ${item.full ? "full" : ""}`}>
                    <p className="pf-field-label">{item.label}</p>
                    <p className="pf-field-val">{item.val || "—"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pf-edit-grid">
                <div className="pf-edit-field">
                  <label>First Name</label>
                  <input
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                    placeholder="First name"
                  />
                  {error.firstName && <p className="pf-error">{error.firstName}</p>}
                </div>
                <div className="pf-edit-field">
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                    placeholder="Last name"
                  />
                  {error.lastName && <p className="pf-error">{error.lastName}</p>}
                </div>
                <div className="pf-edit-field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={editForm.dob}
                    onChange={handleEditChange}
                  />
                  {error.dob && <p className="pf-error">{error.dob}</p>}
                </div>
                <div className="pf-edit-field">
                  <label>Gender</label>
                  <select name="gender" value={editForm.gender} onChange={handleEditChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="pf-edit-field pf-full">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    placeholder="Your address"
                  />
                  {error.address && <p className="pf-error">{error.address}</p>}
                </div>
              </div>
            )}

            <div className="pf-footer">
              {!isEditing ? (
                <button className="pf-edit-btn" onClick={() => setIsEditing(true)}>
                  ✏ Edit Profile
                </button>
              ) : (
                <>
                  <button
                    className="pf-cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                  <button className="pf-save-btn" onClick={handleUpdate} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
