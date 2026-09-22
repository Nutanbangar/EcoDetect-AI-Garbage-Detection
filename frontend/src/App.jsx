import { useRef, useState } from "react";
import "./App.css";
import {BrowserRouter,Routes,Route,Link,Navigate,useNavigate,} from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import WorkerDashboard from "./WorkerDashboard";

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn !== "true") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleProtectedRoute({ children, allowedRole }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");

  if (isLoggedIn !== "true") {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function Home() {
   const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage("✅ Image uploaded successfully!");
  };

  const handleUploadClick = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn === "true") {
    navigate("/dashboard");
  } else {
    navigate("/login");
  }
};

  const handleDetect = () => {
    setMessage(
      "🤖 Image is ready! AI Garbage Detection will be connected next."
    );
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="logo">
          ♻️ EcoDetect
        </div>

        <div className="nav-links">

          <a href="#home">Home</a>

          <a href="#how-it-works">
            How It Works
          </a>

          <a href="#about">
            About
          </a>

          <Link to="/login" className="login-btn">
            Login
          </Link>

        </div>

      </nav>


      {/* HERO */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="tag">
            🌱 AI FOR A CLEANER WORLD
          </div>

          <h1>
            Detect Waste.
            <br />
            <span>Protect Nature.</span>
          </h1>

          <p>
            Upload an image and let AI identify garbage intelligently.
            Make waste management smarter and help create a cleaner future.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={handleUploadClick}
            >
              📷 Upload Image
            </button>

            <a
              href="#how-it-works"
              className="secondary-btn"
            >
              Learn More →
            </a>

          </div>

          <div className="trust">
            <span>✓ AI Powered</span>
            <span>✓ Fast Detection</span>
            <span>✓ Easy to Use</span>
          </div>

        </div>


        <div className="hero-visual">

          <div className="floating-card">

            <div className="garbage-icon">
              🗑️
            </div>

            <h3>
              Smart Waste Detection
            </h3>

            <div className="scan-line"></div>

            <p>
              AI Detection Ready
            </p>

          </div>

        </div>

      </section>
      
      {/* STATS */}
      <section className="stats">

        <div>
          <h3>AI</h3>
          <p>Powered Detection</p>
        </div>

        <div>
          <h3>24/7</h3>
          <p>Available</p>
        </div>

        <div>
          <h3>Fast</h3>
          <p>Image Analysis</p>
        </div>

        <div>
          <h3>♻️</h3>
          <p>Eco Friendly</p>
        </div>

      </section>


      {/* HOW IT WORKS */}
      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-title">

          <div className="tag">
            ⚡ SIMPLE PROCESS
          </div>

          <h2>
            How It Works
          </h2>

          <p>
            Three simple steps to detect garbage.
          </p>

        </div>


        <div className="steps">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <div className="step-icon">
              📷
            </div>

            <h3>
              Upload Image
            </h3>

            <p>
              Upload an image of garbage from your device.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <div className="step-icon">
              🤖
            </div>

            <h3>
              AI Analysis
            </h3>

            <p>
              Our AI model analyzes the uploaded image.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <div className="step-icon">
              📊
            </div>

            <h3>
              Get Result
            </h3>

            <p>
              View the detected garbage category and result.
            </p>

          </div>

        </div>

      </section>


      {/* ABOUT */}
      <section
        className="about"
        id="about"
      >

        <div>

          <div className="tag">
            🌍 ABOUT ECODETECT
          </div>

          <h2>
            Technology for a cleaner future.
          </h2>

          <p>
            EcoDetect uses Artificial Intelligence to make
            garbage identification faster, smarter and easier.
          </p>

        </div>

        <div className="about-icon">
          🌍
        </div>

      </section>


      {/* FOOTER */}
      <footer>

        <div>
          ♻️ EcoDetect
        </div>

        <p>
          AI-powered waste detection for a cleaner planet.
        </p>

      </footer>

    </div>
  );
}


/* ROUTING */

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/"  element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route  path="/signup" element={<Signup />}  />


        <Route  path="/dashboard"  element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } />

        <Route
  path="/admin"
  element={
    <RoleProtectedRoute allowedRole="ADMIN">
      <AdminDashboard />
    </RoleProtectedRoute>
  }
/>

<Route
  path="/worker"
  element={
    <RoleProtectedRoute allowedRole="WORKER">
      <WorkerDashboard />
    </RoleProtectedRoute>
  }
/>

      </Routes>

    </BrowserRouter>

  );
}


export default App; 