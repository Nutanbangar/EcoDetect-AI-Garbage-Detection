# EcoDetect – AI Smart Garbage Detection & Complaint System

EcoDetect is an AI-based garbage detection and complaint management system. Users can capture or upload a garbage image, detect the garbage type using an AI model, view detection history, and report garbage for cleaning.

The system includes three roles:

* **User** – Detect garbage, view history, submit complaints, and contact Admin/Worker.
* **Worker** – View assigned complaints, update cleaning status, upload cleaning proof, and contact User/Admin.
* **Admin** – Manage workers, view complaints, assign workers, and contact User/Worker.

## Technologies Used

### Frontend

* React.js
* Vite
* HTML
* CSS
* JavaScript

### Backend

* Java
* Spring Boot
* REST APIs
* Maven
* MySQL

### AI

* Python
* Flask
* TensorFlow
* Keras

### Deployment

* Docker
* Docker Compose
* Nginx

## Project Structure

```text
EcoDetect/
│
├── ai-model/
│   ├── app.py
│   ├── garbage_model.keras
│   ├── verification_model.keras
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── nginx.conf
│
├── garbage-detection/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── docker-compose.yml
├── docker.env.example
├── .gitignore
└── README.md
```

## Requirements

Before running EcoDetect, install:

* Docker Desktop
* Git (optional, if cloning with Git)

Docker Desktop must be running before starting the application.

## Run Using GitHub ZIP

1. Open the EcoDetect GitHub repository.
2. Click **Code → Download ZIP**.
3. Extract the ZIP file.
4. Open the extracted `EcoDetect` folder.

## Configure Environment

The repository does not contain the actual `docker.env` file because it contains private credentials.

Copy:

```text
docker.env.example
```

and rename the copy to:

```text
docker.env
```

Open `docker.env` and replace the placeholder values with your own values:

```text
DB_PASSWORD=your-db-password
ADMIN_EMAIL=admin@ecodetect.com
ADMIN_PASSWORD=your-admin-password
ADMIN_MOBILE=your-admin-mobile
```

Do not upload `docker.env` to GitHub.

## Run the Application

Open Command Prompt or PowerShell inside the project folder and run:

```bash
docker compose --env-file docker.env up --build -d
```

Docker will build and start:

* MySQL
* AI service
* Spring Boot backend
* React frontend with Nginx

## Open EcoDetect

After the containers start successfully, open:

```text
http://localhost:3000
```

The EcoDetect login page should appear.

## Login

### Admin

Use the Admin email and password configured in:

```text
docker.env
```

### User

Create a new user account using the **Sign Up** option.

### Worker

Workers can be created by the Admin from the Admin Dashboard.

## Main Features

### User

* Sign Up / Login
* Upload garbage image
* Capture garbage image using camera
* Location detection
* AI garbage detection
* Detection history
* Submit complaint
* Track complaint status
* View assigned worker contact
* View Admin contact

### Worker

* Worker login
* View assigned complaints
* View user contact
* View Admin contact
* Update cleaning status
* Upload cleaning proof
* AI verification of cleaning
* Re-cleaning when required

### Admin

* Admin login
* View complaints
* Add workers
* View workers
* Delete workers
* Assign workers to complaints
* View user contact
* View worker contact
* Monitor complaint status

## Complaint Workflow

```text
Pending
   ↓
Verified
   ↓
Assigned
   ↓
Cleaning in Progress
   ↓
AI Verification
   ↓
Resolved
```

If the cleaning is not successfully verified, the complaint can move to re-cleaning or verification failure.

## Docker Services

| Service  | Purpose              | Port |
| -------- | -------------------- | ---: |
| Frontend | React + Nginx        | 3000 |
| Backend  | Spring Boot REST API | 8080 |
| AI       | Flask + TensorFlow   | 5000 |
| MySQL    | Database             | 3307 |

Inside Docker, services communicate using their service names.

## Stop the Application

To stop the containers:

```bash
docker compose --env-file docker.env down
```

## Start Again

If the images have already been built:

```bash
docker compose --env-file docker.env up -d
```

## Rebuild After Code Changes

If source code is changed:

```bash
docker compose --env-file docker.env up --build -d
```

## Check Running Containers

```bash
docker compose ps
```

All four services should be running:

```text
ecodetect-mysql
ecodetect-ai
ecodetect-backend
ecodetect-frontend
```

## Important Notes

* Docker Desktop must be running.
* Do not upload `docker.env` to GitHub.
* Do not upload training datasets to GitHub.
* The trained AI models are included in the repository.
* Uploaded images and generated database data are not included in the repository.
* The application is configured for local Docker deployment.
* For mobile testing on the same local network, use the computer's local IP address instead of `localhost`.

## License

This project is developed for educational and project demonstration purposes.
