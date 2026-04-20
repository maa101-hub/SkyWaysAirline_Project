import { useMemo, useState } from "react";

export default function AdminUsersTab({
  users,
  deletedUsers = [],
  deleteRequests,
  expandedUserBookings,
  setExpandedUserBookings,
  getDisplayUserId,
  getUserBookingDetails,
  confirmDeleteUser,
  onNotificationClick,
}) {
  const [searchText, setSearchText] = useState("");
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [deletedSearchText, setDeletedSearchText] = useState("");
  const customerUsers = users.filter((u) => u.userType !== "A");
  const activeUsers = customerUsers.filter(
    (u) => String(u.status || "").toLowerCase() === "active"
  );
  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!normalizedSearch) return customerUsers;

    return customerUsers.filter((u) => {
      const displayUserId = String(getDisplayUserId(u) || "").toLowerCase();
      const fullName = [u.firstName, u.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const rawName = String(u.name || "").toLowerCase();
      const email = String(u.email || "").toLowerCase();
      const phone = String(u.phoneNumber || "").toLowerCase();
      const userId = String(u.userId || "").toLowerCase();

      return (
        displayUserId.includes(normalizedSearch) ||
        fullName.includes(normalizedSearch) ||
        rawName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        phone.includes(normalizedSearch) ||
        userId.includes(normalizedSearch)
      );
    });
  }, [customerUsers, getDisplayUserId, normalizedSearch]);

  const normalizedDeletedSearch = deletedSearchText.trim().toLowerCase();

  const filteredDeletedUsers = useMemo(() => {
    if (!normalizedDeletedSearch) return deletedUsers;

    return deletedUsers.filter((deletedUser) => {
      const displayUserId = String(
        deletedUser.displayUserId || deletedUser.userId || ""
      ).toLowerCase();
      const name = String(deletedUser.name || "").toLowerCase();
      const email = String(deletedUser.email || "").toLowerCase();
      const phone = String(deletedUser.phoneNumber || "").toLowerCase();
      const deletedBy = String(deletedUser.deletedBy || "").toLowerCase();

      return (
        displayUserId.includes(normalizedDeletedSearch) ||
        name.includes(normalizedDeletedSearch) ||
        email.includes(normalizedDeletedSearch) ||
        phone.includes(normalizedDeletedSearch) ||
        deletedBy.includes(normalizedDeletedSearch)
      );
    });
  }, [deletedUsers, normalizedDeletedSearch]);

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div>
          <h1 className="tab-title">Users</h1>
          <p className="tab-sub">Manage registered accounts</p>
        </div>
        {deleteRequests.length > 0 && (
          <div
            className="del-req-badge"
            onClick={onNotificationClick}
          >
            🔔 {deleteRequests.length} Delete Request
            {deleteRequests.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-num">{customerUsers.length}</p>
          <p className="stat-label">Total Users</p>
        </div>
        <div className="stat-card">
          <p className="stat-num active-num">{activeUsers.length}</p>
          <p className="stat-label">Active</p>
        </div>
        <div className="stat-card">
          <p className="stat-num warn-num">{deleteRequests.length}</p>
          <p className="stat-label">Delete Requests</p>
        </div>
      </div>

      <div className="users-toolbar">
        <label className="users-search">
          <span className="users-search-icon">🔎</span>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by user ID, name, email, or phone"
            aria-label="Search users"
          />
        </label>
        <p className="users-result-meta">
          Showing {filteredUsers.length} of {customerUsers.length} users
        </p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Booked Flights</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customerUsers.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">
                  No users found.
                </td>
              </tr>
            )}
            {customerUsers.length > 0 && filteredUsers.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">
                  No users match your search.
                </td>
              </tr>
            )}
            {filteredUsers.map((u) => {
                const hasRequest = deleteRequests.some(
                  (r) => r.userId === u.userId
                );
                const displayUserId = getDisplayUserId(u);
                const bookingDetails = getUserBookingDetails(u.userId);
                const fullName = [u.firstName, u.lastName]
                  .filter(Boolean)
                  .join(" ")
                  .trim();
                const avatarInitial = (
                  u.firstName?.charAt(0) ||
                  u.lastName?.charAt(0) ||
                  u.name?.charAt(0) ||
                  "U"
                ).toUpperCase();
                return (
                  <tr
                    key={u.userId}
                    className={hasRequest ? "row-warning" : ""}
                  >
                    <td>
                      <span className="id-badge">{displayUserId}</span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-mini-avatar">
                          {avatarInitial}
                        </div>
                        <span>
                          {fullName || u.name || "Unknown User"}
                        </span>
                        {hasRequest && (
                          <span className="pending-tag">
                            Pending Delete
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phoneNumber}</td>
                    <td>
                      {bookingDetails.flights.length ? (
                        <div className="user-booking-tray-wrap">
                          <button
                            type="button"
                            className={`user-booking-tray ${
                              expandedUserBookings === u.userId
                                ? "open"
                                : ""
                            }`}
                            onClick={() =>
                              setExpandedUserBookings(
                                expandedUserBookings === u.userId
                                  ? null
                                  : u.userId
                              )
                            }
                            aria-label="View booked flights"
                            title="View booked flights"
                          >
                            <span className="user-booking-tray-icon">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M3 7.5h18" />
                                <path d="M6 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
                                <path d="M8 11h8" />
                                <path d="M8 15h5" />
                              </svg>
                            </span>
                            <span className="user-booking-tray-count">
                              {bookingDetails.flights.length}
                            </span>
                            <span className="user-booking-tray-arrow">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M7 10l5 5 5-5z" />
                              </svg>
                            </span>
                          </button>
                          {expandedUserBookings === u.userId && (
                            <div className="user-booking-dropdown">
                              {bookingDetails.flights.map((flight) => (
                                <div
                                  key={`${u.userId}-${flight.label}`}
                                  className="user-booking-row"
                                >
                                  <span className="user-booking-flight">
                                    {flight.label}
                                  </span>
                                  <span className="user-booking-orders">
                                    × {flight.orders}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="user-booking-empty">
                          No bookings yet
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() =>
                          confirmDeleteUser(
                            u.userId,
                            fullName || u.name || "Unknown User",
                            false
                          )
                        }
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="deleted-users-section">
        <div className="deleted-users-head">
          <p className="tab-sub">Deleted Users</p>
          <button
            type="button"
            className="btn-edit"
            onClick={() => setShowDeletedUsers((prev) => !prev)}
          >
            {showDeletedUsers ? "Hide" : "View"} Deleted Users ({deletedUsers.length})
          </button>
        </div>

        {showDeletedUsers && (
          <>
            <div className="users-toolbar">
              <label className="users-search">
                <span className="users-search-icon">🔎</span>
                <input
                  type="text"
                  value={deletedSearchText}
                  onChange={(e) => setDeletedSearchText(e.target.value)}
                  placeholder="Search deleted users"
                  aria-label="Search deleted users"
                />
              </label>
              <p className="users-result-meta">
                Showing {filteredDeletedUsers.length} of {deletedUsers.length} deleted users
              </p>
            </div>

            <p className="deleted-users-meta">
              Deleted accounts history (saved in this browser).
            </p>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Bookings</th>
                    <th>Deleted At</th>
                    <th>Deleted By</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="empty-row">
                        No deleted users yet.
                      </td>
                    </tr>
                  )}

                  {deletedUsers.length > 0 && filteredDeletedUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="empty-row">
                        No deleted users match your search.
                      </td>
                    </tr>
                  )}

                  {filteredDeletedUsers.map((deletedUser) => {
                    const deletedInitial = String(deletedUser.name || "U")
                      .trim()
                      .charAt(0)
                      .toUpperCase();

                    return (
                      <tr
                        key={`${deletedUser.userId}-${deletedUser.deletedAt}`}
                        className="deleted-user-row"
                      >
                        <td>
                          <span className="id-badge">
                            {deletedUser.displayUserId || deletedUser.userId || "—"}
                          </span>
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="user-mini-avatar deleted-avatar">
                              {deletedInitial}
                            </div>
                            <span>{deletedUser.name || "Unknown User"}</span>
                          </div>
                        </td>
                        <td>{deletedUser.email || "—"}</td>
                        <td>{deletedUser.phoneNumber || "—"}</td>
                        <td>{deletedUser.totalOrders || 0}</td>
                        <td>
                          {deletedUser.deletedAt
                            ? new Date(deletedUser.deletedAt).toLocaleString()
                            : "—"}
                        </td>
                        <td>
                          <span className="deleted-by-pill">
                            {deletedUser.deletedBy || "Admin"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
