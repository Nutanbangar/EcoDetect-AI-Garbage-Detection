
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [worker, setWorker] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
  });
  const [contacts, setContacts] = useState([]);


  const fetchContacts = async () => {
    const adminId = localStorage.getItem("userId");

    if (!adminId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/complaints/admin/${adminId}/contacts`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data = await response.json();

      console.log("ADMIN CONTACTS:", data);

      setContacts(data);
    } catch (error) {
      console.error("Admin contacts fetch error:", error);
      setContacts([]);
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/complaints/all`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error("Admin complaints error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/workers`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch workers");
      }

      const data = await response.json();
      setWorkers(data);
    } catch (error) {
      console.error("Workers fetch error:", error);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchWorkers();
    fetchContacts();
  }, [])

  const verifyComplaint = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/api/complaints/${id}/verify`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to verify complaint");
      }

      await fetchComplaints();
    } catch (error) {
      console.error("Verify error:", error);
      alert("Failed to verify complaint");
    }
  };

  const handleWorkerChange = (e) => {
    setWorker({
      ...worker,
      [e.target.name]: e.target.value,
    });
  };

  const createWorker = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/api/auth/admin/create-worker`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(worker),
        }
      );

      const result = await response.text();

      if (!response.ok) {
        alert(result);
        return;
      }

      alert("Worker account created successfully!");

      setWorker({
        fullName: "",
        email: "",
        mobileNumber: "",
        password: "",
      });

      await fetchWorkers();
    } catch (error) {
      console.error("Create worker error:", error);
      alert("Failed to create worker");
    }
  };

  // DELETE WORKER
  const deleteWorker = async (workerId, workerName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete worker "${workerName}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/admin/delete-worker/${workerId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.text();

      if (!response.ok) {
        alert(result);
        return;
      }

      alert("Worker deleted successfully!");

      await fetchWorkers();
    } catch (error) {
      console.error("Delete worker error:", error);
      alert("Failed to delete worker");
    }
  };

  return (
    <div className="admin-dashboard">

      <h1>Admin Dashboard</h1>

      {/* ADD WORKER */}

      <div className="add-worker-section">

        <h2>Add Worker</h2>

        <form
          onSubmit={createWorker}
          className="worker-form"
        >

          <input
            type="text"
            name="fullName"
            placeholder="Worker Full Name"
            value={worker.fullName}
            onChange={handleWorkerChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Worker Email"
            value={worker.email}
            onChange={handleWorkerChange}
            required
          />

          <input
            type="tel"
            name="mobileNumber"
            placeholder="Worker Mobile Number"
            value={worker.mobileNumber}
            onChange={handleWorkerChange}
            maxLength="10"
            inputMode="numeric"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Worker Password"
            value={worker.password}
            onChange={handleWorkerChange}
            required
          />

          <button type="submit">
            ADD WORKER
          </button>

        </form>

      </div>

      {/* WORKERS LIST */}

      <div className="workers-section">

        <h2>Workers</h2>

        {workers.length === 0 ? (
          <p>No workers found.</p>
        ) : (
          <div className="workers-list">

            {workers.map((worker) => (

              <div
                className="worker-card"
                key={worker.id}
              >

                <div className="worker-info">

                  <h3>{worker.fullName}</h3>

                  <p>
                    <strong>Email:</strong>{" "}
                    {worker.email}
                  </p>

                  <p>
                    <strong>Mobile:</strong>{" "}
                    {worker.mobileNumber || "Not available"}
                  </p>

                  <p>
                    <strong>Role:</strong>{" "}
                    {worker.role}
                  </p>

                </div>

                <button
                  type="button"
                  className="delete-worker-btn"
                  onClick={() =>
                    deleteWorker(
                      worker.id,
                      worker.fullName
                    )
                  }
                >
                  DELETE
                </button>

              </div>

            ))}

          </div>
        )}

      </div>

      {/* COMPLAINTS */}

      <p>All Garbage Complaints</p>

      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p>No complaints found.</p>
      ) : (
        <div className="admin-complaints-list">

          {complaints.map((complaint) => (

            <div
              className="admin-complaint-card"
              key={complaint.id}
            >

              <h3>
                Complaint #{complaint.id}
              </h3>

              <p>
                <strong>User:</strong>{" "}
                {complaint.userName}
              </p>

              {(() => {
                const complaintContacts = contacts.find(
                  (contact) => contact.complaintId === complaint.id
                );

                return complaintContacts ? (
                  <>
                    {complaintContacts.userMobile && (
                      <p>
                        <strong>User Mobile:</strong>{" "}
                        <a href={`tel:${complaintContacts.userMobile}`}>
                          {complaintContacts.userMobile}
                        </a>
                      </p>
                    )}

                    {complaintContacts.workerMobile && (
                      <p>
                        <strong>Worker Mobile:</strong>{" "}
                        <a href={`tel:${complaintContacts.workerMobile}`}>
                          {complaintContacts.workerMobile}
                        </a>
                      </p>
                    )}
                  </>
                ) : null;
              })()}

              <p>
                <strong>Garbage Type:</strong>{" "}
                {complaint.garbageType}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {complaint.location}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {complaint.status}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {new Date(
                  complaint.createdAt
                ).toLocaleString()}
              </p>

              {complaint.imageName && (
                <img
                  src={`${API_URL}/api/detections/image/${complaint.imageName}`}
                  alt="Garbage"
                  width="150"
                />
              )}

              {complaint.cleaningProofImage && (
                <div className="admin-cleaning-proof">

                  <p>
                    <strong>Cleaning Proof:</strong>
                  </p>

                  <img
                    src={`${API_URL}/api/detections/image/${complaint.cleaningProofImage}`}
                    alt="Cleaning Proof"
                    className="admin-cleaning-proof-image"
                  />

                </div>
              )}

              {/* ASSIGN WORKER */}

              {complaint.status === "Verified" && (
                <div className="assign-worker-section">

                  <select
                    value={complaint.workerId || ""}
                    onChange={(e) => {

                      const selectedWorker =
                        workers.find(
                          (worker) =>
                            worker.id ===
                            Number(e.target.value)
                        );

                      setComplaints(
                        (prevComplaints) =>
                          prevComplaints.map(
                            (item) =>
                              item.id === complaint.id
                                ? {
                                  ...item,
                                  workerId:
                                    selectedWorker?.id ||
                                    null,
                                  workerName:
                                    selectedWorker?.fullName ||
                                    "",
                                }
                                : item
                          )
                      );
                    }}
                  >

                    <option value="">
                      Select Worker
                    </option>

                    {workers.map((worker) => (
                      <option
                        key={worker.id}
                        value={worker.id}
                      >
                        {worker.fullName}
                      </option>
                    ))}

                  </select>

                  <button
                    onClick={async () => {

                      if (!complaint.workerId) {
                        alert("Please select a worker");
                        return;
                      }

                      try {

                        const response =
                          await fetch(
                            `${API_URL}/api/complaints/${complaint.id}/assign`,
                            {
                              method: "PUT",
                              headers: {
                                "Content-Type":
                                  "application/json",
                              },
                              body: JSON.stringify({
                                workerId:
                                  complaint.workerId,
                                workerName:
                                  complaint.workerName,
                              }),
                            }
                          );

                        if (!response.ok) {
                          throw new Error(
                            "Failed to assign worker"
                          );
                        }

                        alert(
                          "Worker assigned successfully!"
                        );

                        await fetchComplaints();

                      } catch (error) {

                        console.error(
                          "Assign worker error:",
                          error
                        );

                        alert(
                          "Failed to assign worker"
                        );
                      }
                    }}
                  >
                    ASSIGN
                  </button>

                </div>
              )}

              {/* VERIFY */}

              {complaint.status === "Pending" && (
                <button
                  onClick={() =>
                    verifyComplaint(complaint.id)
                  }
                >
                  VERIFY
                </button>
              )}

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default AdminDashboard;

