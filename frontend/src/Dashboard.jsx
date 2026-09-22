import { useRef, useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL || "";
import { useNavigate } from "react-router-dom";


function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);


  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageSource, setImageSource] = useState("");
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [contacts, setContacts] = useState([]);


  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Location is not supported by this browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log("GPS Coordinates:", latitude, longitude);
        console.log("GPS Accuracy:", accuracy, "meters");

        // Reject very inaccurate location
        if (accuracy > 1000) {
          console.warn("Location accuracy is too low:", accuracy);

          setLocationLoading(false);

          alert(
            "Accurate location is not available. Please turn ON GPS/Location services and try again."
          );

          return;
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch address");
          }

          const data = await response.json();
          const address = data.address || {};

          const cleanAddress = [
            address.road,
            address.neighbourhood || address.suburb,
            address.village || address.town || address.city,
            address.state_district,
            address.state,
            address.country,
          ]
            .filter(Boolean)
            .filter(
              (value, index, array) => array.indexOf(value) === index
            )
            .join(", ");

          if (!cleanAddress) {
            throw new Error("Address not available");
          }

          setLocation({
            latitude,
            longitude,
            accuracy,
            address: cleanAddress,
          });

          console.log("FINAL ADDRESS:", cleanAddress);
        } catch (error) {
          console.error("Address fetching failed:", error);

          setLocation({
            latitude,
            longitude,
            accuracy,
            address: "Address not available",
          });

          alert(
            "Could not find the exact address. Please try again."
          );
        }

        setLocationLoading(false);
      },

      (error) => {
        console.error("Location access failed:", error);

        setLocationLoading(false);

        alert(
          "Please allow location access and turn ON GPS/Location services."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000,
      }
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setImageSource("upload");
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setResult("");

    getUserLocation();
  };

  const handleDetect = async () => {
    if (!selectedImage) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    if (location) {
      formData.append("location", location.address);
    }

    const userId = localStorage.getItem("userId");

    if (userId) {
      formData.append("userId", userId);
    }
    console.log("User ID:", userId);

    setLoading(true);
    setResult("");
    setComplaintSubmitted(false);
    try {
      const response = await fetch(
        `${API_URL}/api/ai/detect`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText = await response.text();

      console.log("Backend Response:", responseText);

      if (!response.ok) {
        throw new Error(responseText);
      }

      const data = JSON.parse(responseText);

      setResult(data.garbageType);

      const historyResponse = await fetch(
        `${API_URL}/api/detections/history/${userId}`
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData);
      }
    } catch (error) {
      console.error("Detection Error:", error);
      setResult("ERROR: " + error.message);
    }
    finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleTakePhoto = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        }
      });

      setStream(mediaStream);
      setCameraOpen(true);
    } catch (error) {
      console.error("CAMERA ERROR:", error.name, error.message);
      alert(error.name + ": " + error.message);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video) return;

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

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File(
        [blob],
        "captured-garbage.jpg",
        {
          type: "image/jpeg",
        }
      );

      setImageSource("camera");
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult("");
      getUserLocation();

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      setStream(null);
      setCameraOpen(false);
    }, "image/jpeg");
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setStream(null);
    setCameraOpen(false);
  };

  useEffect(() => {
    if (cameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraOpen, stream]);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/detections/history/${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch detection history");
        }

        const data = await response.json();


        console.log("HISTORY DATA FROM BACKEND:", data);
        console.log("HISTORY LENGTH:", data.length);

        setHistory(data);
      } catch (error) {
        console.error("History fetch error:", error);
      }
    };

    fetchHistory();
  }, []);

  const fetchComplaints = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("User ID not found");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/complaints/user/${userId}`
      );

      const responseText = await response.text();

      console.log("Complaints Status:", response.status);
      console.log("Complaints Response:", responseText);

      if (!response.ok) {
        throw new Error(
          responseText || "Failed to fetch complaints"
        );
      }

      const data = JSON.parse(responseText);

      console.log("User Complaints:", data);

      setComplaints(data);
    } catch (error) {
      console.error("Complaints fetch error:", error);
    }
  };
  useEffect(() => {
    fetchComplaints();
    fetchContacts();
  }, []);


  const fetchContacts = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/complaints/user/${userId}/contacts`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data = await response.json();

      console.log("USER CONTACTS:", data);

      setContacts(data);
    } catch (error) {
      console.error("Contacts fetch error:", error);
      setContacts([]);
    }
  };

  const getComplaintContacts = (complaintId) => {
    return contacts.find(
      (contact) => contact.complaintId === complaintId
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/login");
    localStorage.removeItem("userId");
  };

  return (
    <div className="dashboard-page">

      <nav className="dashboard-navbar">
        <div className="dashboard-logo">
          ♻️ EcoDetect
        </div>

        <div className="dashboard-user">
          <span>
            👤 {localStorage.getItem("userName")}
          </span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">

        <div className="dashboard-heading">
          <div className="tag">🌱 AI WASTE DETECTION</div>

          <h1>Welcome to EcoDetect 👋</h1>

          <p>
            Upload a garbage image and let AI identify
            the type of waste.
          </p>
        </div>

        <div className="dashboard-card">

          <h2>📷 Upload Garbage Image</h2>

          <p>
            Select an image from your computer to start
            garbage detection.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />


          {cameraOpen && (
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-preview"
              />

              <button
                className="capture-photo-btn"
                onClick={capturePhoto}
              >
                📸 Capture Photo
              </button>

              <button
                className="close-camera-btn"
                onClick={closeCamera}
              >
                ✕ Close Camera
              </button>
            </div>
          )}

          <div className="dashboard-options">

            {/* UPLOAD IMAGE */}
            <div className="dashboard-option-card">

              {!preview || imageSource !== "upload" ? (
                <>
                  <div className="option-icon">📁</div>

                  <h3>Upload Image</h3>

                  <p>
                    Select garbage image from your computer
                  </p>

                  <button
                    className="option-btn upload-option-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleUploadClick();
                    }}
                  >
                    📁 Choose Image
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={preview}
                    alt="Uploaded garbage"
                    className="option-preview"
                  />

                  <h3>Image Uploaded ✅</h3>

                  <p>{selectedImage?.name}</p>

                  <button
                    className="change-image-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleUploadClick();
                    }}
                  >
                    🔄 Change Image
                  </button>
                </>
              )}

            </div>


            {/* TAKE PHOTO */}
            <div className="dashboard-option-card">

              {!preview || imageSource !== "camera" ? (
                <>
                  <div className="option-icon">📸</div>

                  <h3>Take Photo</h3>

                  <p>
                    Capture garbage photo using your camera
                  </p>

                  <button
                    className="option-btn camera-option-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTakePhoto();
                    }}
                  >
                    📸 Open Camera
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={preview}
                    alt="Captured garbage"
                    className="option-preview"
                  />

                  <h3>Photo Captured ✅</h3>

                  <p>{selectedImage?.name}</p>

                  <button
                    className="change-image-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTakePhoto();
                    }}
                  >
                    🔄 Change Photo
                  </button>
                </>
              )}

            </div>

          </div>

          {locationLoading && (
            <div className="location-box">
              📍 Getting your location...
            </div>
          )}

          {location && (
            <div className="location-box">
              📍 Location detected
              <br />

              <span>
                {location.address}
              </span>



            </div>
          )}

          {preview && (
            <button
              className="detect-dashboard-btn"
              onClick={handleDetect}
              disabled={loading}
            >
              {loading ? "🤖 Detecting..." : "🤖 Detect Garbage"}
            </button>
          )}

          {result && (
            <div className="detection-result">
              <h2>♻️ Detection Result</h2>

              <p>
                Garbage Type: <strong>{result}</strong>
              </p>

              {!complaintSubmitted ? (
                <button
                  className="report-garbage-btn"
                  onClick={async () => {
                    const userId = localStorage.getItem("userId");
                    const userName = localStorage.getItem("userName");

                    if (!userId || !userName) {
                      alert("User information not found. Please login again.");
                      return;
                    }

                    if (!location) {
                      alert("Location is required to report garbage.");
                      return;
                    }

                    try {
                      setComplaintLoading(true);

                      const complaintData = {
                        userId: Number(userId),
                        userName: userName,
                        garbageType: result,
                        imageName: selectedImage?.name || null,
                        location: location.address,
                      };

                      const response = await fetch(
                        `${API_URL}/api/complaints`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(complaintData),
                        }
                      );

                      const responseText = await response.text();

                      console.log("Complaint Status:", response.status);
                      console.log("Complaint Response:", responseText);

                      if (!response.ok) {
                        throw new Error(
                          responseText || "Complaint submission failed"
                        );
                      }

                      setComplaintSubmitted(true);

                      alert("Garbage reported successfully!");

                    } catch (error) {
                      console.error("Complaint Error:", error);
                      alert("Complaint Error: " + error.message);
                    } finally {
                      setComplaintLoading(false);
                    }
                  }}
                  disabled={complaintLoading}
                >
                  {complaintLoading
                    ? "📤 Reporting..."
                    : "🚨 Report Garbage"}
                </button>
              ) : (
                <div className="complaint-success">
                  ✅ Garbage reported successfully
                </div>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div className="detection-history">

              <h2>📋 Detection History</h2>

              <div className="history-list">

                {history.map((item) => (
                  <div className="history-item" key={item.id}>

                    <div className="history-info">


                      <img
                        src={`${API_URL}/api/detections/image/${encodeURIComponent(
                          item.imageName
                        )}`}
                        alt="Detected garbage"
                        className="history-image"
                      />
                      <h3>
                        ♻️ {item.garbageType}
                      </h3>

                      <p>
                        📁 {item.imageName}
                      </p>

                      <p>
                        📍 {item.location}
                      </p>

                      <p>
                        🕒 {new Date(item.detectedAt).toLocaleString()}
                      </p>

                    </div>
                    <button
                      className="delete-history-btn"
                      onClick={async () => {
                        const confirmDelete = window.confirm(
                          "Are you sure you want to delete this detection?"
                        );

                        if (!confirmDelete) {
                          return;
                        }

                        try {
                          const response = await fetch(
                            `${API_URL}/api/detections/${item.id}`,
                            {
                              method: "DELETE",
                            }
                          );

                          const responseText = await response.text();

                          console.log("Delete Status:", response.status);
                          console.log("Delete Response:", responseText);

                          if (!response.ok) {
                            throw new Error(responseText || "Delete request failed");
                          }

                          setHistory((prevHistory) =>
                            prevHistory.filter(
                              (historyItem) => historyItem.id !== item.id
                            )
                          );

                          alert("Detection deleted successfully!");

                        } catch (error) {
                          console.error("Delete Error:", error);
                          alert("Delete Error: " + error.message);
                        }
                      }}
                    >
                      🗑️ Delete
                    </button>




                  </div>
                ))}

              </div>

            </div>
          )}

          {complaints.length > 0 && (
            <div className="complaints-section">

              <h2>🚨 My Complaints</h2>

              <div className="complaints-list">

                {complaints.map((complaint) => (
                  <div className="complaint-item" key={complaint.id}>

                    <div className="complaint-info">

                      {complaint.imageName && (
                        <img
                          src={`${API_URL}/api/detections/image/${encodeURIComponent(
                            complaint.imageName
                          )}`}
                          alt="Reported garbage"
                          className="complaint-image"
                        />
                      )}

                      <h3>
                        ♻️ {complaint.garbageType}
                      </h3>

                      <p>
                        📍 {complaint.location}
                      </p>

                      <p>
                        🕒 {new Date(complaint.createdAt).toLocaleString()}
                      </p>

                      <div className={`complaint-status status-${complaint.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}>
                        📌 {complaint.status}
                      </div>
                      {(() => {
                        const complaintContacts = getComplaintContacts(complaint.id);

                        return complaintContacts ? (
                          <div className="complaint-contacts">
                            {complaintContacts.workerMobile && (
                              <p>
                                <strong>👷 Worker Mobile:</strong>{" "}
                                <a href={`tel:${complaintContacts.workerMobile}`}>
                                  {complaintContacts.workerMobile}
                                </a>
                              </p>
                            )}

                            {complaintContacts.adminMobile && (
                              <p>
                                <strong>👤 Admin Mobile:</strong>{" "}
                                <a href={`tel:${complaintContacts.adminMobile}`}>
                                  {complaintContacts.adminMobile}
                                </a>
                              </p>
                            )}
                          </div>
                        ) : null;
                      })()}

                      {(complaint.status === "Resolved" ||
                        complaint.status === "Re-cleaning Required") &&
                        complaint.cleaningProofImage && (
                          <div className="user-cleaning-proof">
                            <p>
                              <strong>🧹 Cleaning Proof:</strong>
                            </p>

                            <img
                              src={`${API_URL}/api/detections/image/${encodeURIComponent(
                                complaint.cleaningProofImage
                              )}`}
                              alt="Cleaning Proof"
                              className="user-cleaning-proof-image"
                            />
                          </div>
                        )}

                    </div>

                    <button
                      className="delete-complaint-btn"
                      onClick={async () => {

                        const confirmDelete = window.confirm(
                          "Are you sure you want to delete this complaint?"
                        );

                        if (!confirmDelete) {
                          return;
                        }

                        try {

                          const response = await fetch(
                            `${API_URL}/api/complaints/${complaint.id}`,
                            {
                              method: "DELETE",
                            }
                          );

                          const responseText = await response.text();

                          if (!response.ok) {
                            throw new Error(
                              responseText || "Delete complaint failed"
                            );
                          }

                          setComplaints((prevComplaints) =>
                            prevComplaints.filter(
                              (item) => item.id !== complaint.id
                            )
                          );

                          alert("Complaint deleted successfully!");

                        } catch (error) {

                          console.error(
                            "Complaint Delete Error:",
                            error
                          );

                          alert(
                            "Complaint Delete Error: " +
                            error.message
                          );
                        }
                      }}
                    >
                      🗑️ Delete Complaint
                    </button>

                  </div>
                ))}

              </div>

            </div>
          )}
        </div>

      </main>

    </div>


  );

}


export default Dashboard;