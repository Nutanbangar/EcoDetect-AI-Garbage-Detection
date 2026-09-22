
import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

function WorkerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraComplaintId, setCameraComplaintId] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const workerId = localStorage.getItem("userId");
  const workerName = localStorage.getItem("userName");

  const fetchAssignedComplaints = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/complaints/worker/${workerId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch assigned complaints");
      }

      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error("Worker complaints error:", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchContacts = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/complaints/worker/${workerId}/contacts`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error("Contacts error:", error);
      setContacts([]);
    }
  };

  const getComplaintContacts = (complaintId) => {
    return contacts.find(
      (contact) => contact.complaintId === complaintId
    );
  };

  useEffect(() => {
    fetchAssignedComplaints();
    fetchContacts();
  }, []);

  // START / RESTART CLEANING
  const startCleaning = async (complaintId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/complaints/${complaintId}/start-cleaning`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start cleaning");
      }

      alert("Cleaning started successfully!");

      await fetchAssignedComplaints();
    } catch (error) {
      console.error("Start cleaning error:", error);

      alert("Failed to start cleaning");
    }
  };

  // UPLOAD CLEANING PROOF
  const uploadCleaningProof = async (file, complaintId) => {
    if (!file) return;

    try {
      setUploadingProof(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${API_URL}/api/complaints/${complaintId}/cleaning-proof`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload cleaning proof");
      }

      const result = await response.json();

      setProofPreview(
        `${API_URL}/api/detections/image/${result.cleaningProofImage}`
      );

      alert("Cleaning proof uploaded successfully!");

      await fetchAssignedComplaints();
    } catch (error) {
      console.error("Cleaning proof upload error:", error);

      alert("Failed to upload cleaning proof.");
    } finally {
      setUploadingProof(false);
    }
  };

  // OPEN CAMERA
  const openCamera = async (complaintId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      streamRef.current = stream;

      setCameraComplaintId(complaintId);
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera error:", error);

      alert(
        "Camera access denied. Please allow camera permission in your browser."
      );
    }
  };

  // CLOSE CAMERA
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOpen(false);
    setCameraComplaintId(null);
  };

  // CAPTURE PHOTO
  const capturePhoto = () => {
    if (!videoRef.current || !cameraComplaintId) {
      return;
    }

    const video = videoRef.current;

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          alert("Failed to capture photo.");
          return;
        }

        const complaintId = cameraComplaintId;

        const file = new File(
          [blob],
          `cleaning-proof-${complaintId}-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        const previewUrl = URL.createObjectURL(file);

        setProofPreview(previewUrl);

        closeCamera();

        await uploadCleaningProof(file, complaintId);
      },
      "image/jpeg"
    );
  };

  return (
    <div className="worker-dashboard">

      <h1>Worker Dashboard</h1>

      <p>
        Welcome, <strong>{workerName}</strong>
      </p>

      <h2>My Assigned Complaints</h2>


      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p>No complaints assigned to you.</p>
      ) : (
        <div className="worker-complaints-list">

          {complaints.map((complaint) => {
            const complaintContacts = getComplaintContacts(complaint.id);

            return (
              <div
                className="worker-complaint-card"
                key={complaint.id}
              >

                <h3>
                  Complaint #{complaint.id}
                </h3>

                <p>
                  <strong>User:</strong>{" "}
                  {complaint.userName}
                </p>

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
                  <strong>Assigned To:</strong>{" "}
                  {complaint.workerName}
                </p>
                {complaintContacts && (
                  <>
                    {complaintContacts.userMobile && (
                      <p>
                        <strong>User Mobile:</strong>{" "}
                        <a href={`tel:${complaintContacts.userMobile}`}>
                          {complaintContacts.userMobile}
                        </a>
                      </p>
                    )}

                    {complaintContacts.adminMobile && (
                      <p>
                        <strong>Admin Mobile:</strong>{" "}
                        <a href={`tel:${complaintContacts.adminMobile}`}>
                          {complaintContacts.adminMobile}
                        </a>
                      </p>
                    )}
                  </>
                )}

                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(
                    complaint.createdAt
                  ).toLocaleString()}
                </p>

                {complaint.imageName && (
                  <div className="worker-photo-section">

                    <h4>Garbage Photo</h4>

                    <img
                      src={`${API_URL}/api/detections/image/${complaint.imageName}`}
                      alt="Garbage"
                      className="worker-complaint-image"
                    />

                  </div>
                )}

                {complaint.cleaningProofImage && (
                  <div className="worker-photo-section">

                    <h4>Latest Cleaning Proof</h4>

                    <img
                      src={`${API_URL}/api/detections/image/${complaint.cleaningProofImage}`}
                      alt="Cleaning Proof"
                      className="worker-complaint-image"
                    />

                  </div>
                )}

                {complaint.status === "Assigned" && (
                  <button
                    onClick={() =>
                      startCleaning(complaint.id)
                    }
                  >
                    START CLEANING
                  </button>
                )}

                {complaint.status === "Re-cleaning Required" && (
                  <button
                    onClick={() =>
                      startCleaning(complaint.id)
                    }
                  >
                    START RE-CLEANING
                  </button>
                )}

                {complaint.status === "Cleaning in Progress" && (
                  <div className="proof-photo-section">

                    <h4>Cleaning Proof</h4>

                    <div className="proof-photo-buttons">

                      <button
                        type="button"
                        className="proof-camera-btn"
                        onClick={() =>
                          openCamera(complaint.id)
                        }
                        disabled={uploadingProof}
                      >
                        📷 Take Photo
                      </button>

                      <label className="proof-gallery-btn">
                        🖼️ Upload from Gallery

                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          disabled={uploadingProof}
                          onChange={(event) => {
                            const file =
                              event.target.files[0];

                            if (file) {
                              const previewUrl =
                                URL.createObjectURL(file);

                              setProofPreview(
                                previewUrl
                              );

                              uploadCleaningProof(
                                file,
                                complaint.id
                              );
                            }

                            event.target.value = "";
                          }}
                        />
                      </label>

                    </div>

                    {uploadingProof && (
                      <p>
                        Uploading cleaning proof...
                      </p>
                    )}

                    {proofPreview && (
                      <div className="proof-preview">

                        <h4>Proof Photo Preview</h4>

                        <img
                          src={proofPreview}
                          alt="Cleaning Proof"
                        />

                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}

        </div>
      )}

      {/* CAMERA MODAL */}

      {cameraOpen && (
        <div className="camera-modal">

          <div className="camera-box">

            <h3>Take Cleaning Proof Photo</h3>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
            />

            <div className="camera-buttons">

              <button
                type="button"
                onClick={capturePhoto}
              >
                📸 Capture Photo
              </button>

              <button
                type="button"
                onClick={closeCamera}
              >
                ✖ Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default WorkerDashboard;

