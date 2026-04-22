import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import { getShortUserId } from "./homeUtils";
import { submitDeleteRequestEvent } from "../../../api";

function formatDOB(dob) {
  if (!dob) return "—";
  const [year, month, day] = dob.split("-");
  return `${day}/${month}/${year}`;
}

export default function ProfileModal({ onClose }) {
  const [editForm, setEditForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requestingDelete, setRequestingDelete] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonError, setDeleteReasonError] = useState("");
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

  const openDeleteDialog = () => {
    setDeleteReason("");
    setDeleteReasonError("");
    setShowDeleteDialog(true);
    setError("");
    setSuccessMsg("");
  };

  const handleDeleteRequest = async () => {
    if (!profile?.userId) {
      setError("Unable to submit request. Please try again.");
      return;
    }

    const reason = deleteReason.trim();
    if (!reason) {
      setDeleteReasonError("Please write a reason before sending request.");
      return;
    }

    setRequestingDelete(true);
    setDeleteReasonError("");
    setError("");
    setSuccessMsg("");

    try {
      const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

      await submitDeleteRequestEvent({
        userId: profile.userId,
        name: fullName || "User",
        email: profile.email || "",
        reason,
      });

      setSuccessMsg("Delete request sent to admin successfully.");
      setShowDeleteDialog(false);
      setDeleteReason("");
    } catch (err) {
      setError("Failed to submit delete request.");
    } finally {
      setRequestingDelete(false);
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
                <>
                  <button
                    className="pf-cancel-btn"
                    onClick={openDeleteDialog}
                    disabled={requestingDelete}
                  >
                    ⚠ Request Delete Account
                  </button>
                  <button className="pf-edit-btn" onClick={() => setIsEditing(true)}>
                    ✏ Edit Profile
                  </button>
                </>
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

      {showDeleteDialog && (
        <div
          className="pf-delete-overlay"
          onClick={(e) => {
            e.stopPropagation();
            if (!requestingDelete) setShowDeleteDialog(false);
          }}
        >
          <div className="pf-delete-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="pf-delete-title">Request Account Deletion</p>
            <p className="pf-delete-msg">Kya hua bhai, delete kyon karna chahte ho?</p>

            <textarea
              className="pf-delete-textarea"
              placeholder="Please write your reason..."
              value={deleteReason}
              onChange={(e) => {
                setDeleteReason(e.target.value);
                if (deleteReasonError) setDeleteReasonError("");
              }}
              rows={4}
              maxLength={280}
            />

            <div className="pf-delete-meta">{deleteReason.trim().length}/280</div>
            {deleteReasonError && <p className="pf-delete-error">{deleteReasonError}</p>}

            <div className="pf-delete-actions">
              <button
                className="pf-cancel-btn"
                onClick={() => setShowDeleteDialog(false)}
                disabled={requestingDelete}
              >
                Cancel
              </button>
              <button
                className="pf-delete-send-btn"
                onClick={handleDeleteRequest}
                disabled={requestingDelete}
              >
                {requestingDelete ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
