# 🌍 InfraScan – Full Project Setup Guide

A full-stack system designed to detect, compare, and analyze land encroachment and unauthorized construction using satellite and ground images. This repository contains both the **Backend (Flask + Image Processing)** and **Frontend (React)** setup instructions.

---

## 🎯 Overview

InfraScan allows users to upload and compare images to detect structural changes over time. It utilizes computer vision techniques to highlight differences between two images and displays the results through an interactive React interface.

---

## 🎛️ Tech Stack

| Layer                    | Technology                              | Purpose                                   |
| ------------------------ | --------------------------------------- | ----------------------------------------- |
| **Backend**              | Flask (Python)                          | API + Image Processing Logic              |
| **Frontend**             | React (Vite)                            | User Interface and Visualization          |
| **Processing Libraries** | OpenCV, NumPy, Scikit-Image, Matplotlib | Image Comparison & Feature Detection      |
| **Additional**           | Flask-CORS                              | Allows backend to be accessed by frontend |

---

## 🛰️ Environment Requirements

[![Python Version](https://img.shields.io/badge/Python-3.11%20to%203.12-blue?logo=python)](https://www.python.org/downloads/release/python-3110/)
[![Status](https://img.shields.io/badge/Project-Stable-brightgreen)](#)
[![Platform](https://img.shields.io/badge/Platform-Cross--OS-lightgrey?logo=windows&logoColor=white)](https://en.wikipedia.org/wiki/Cross-platform_software)
[![Framework](https://img.shields.io/badge/Backend-Flask-orange?logo=flask)](https://flask.palletsprojects.com/en/stable/)
[![Frontend](<https://img.shields.io/badge/Frontend-React%20(Vite)-61dafb?logo=react>)](https://vitejs.dev/guide/)

Use **Python version between 3.11 and 3.12** to avoid compatibility issues.

---

## ✅ Backend Setup (Flask)

### 1. Install Required Libraries

Run the following command to install all required dependencies:

```
pip install numpy==1.24.4 opencv-python==4.8.1.78 scikit-image==0.21.0 matplotlib flask flask-cors
```

### 2. Backend File

Your main backend file is located at:

```
/backend/app/app.py
```

The backend runs automatically when using the full project start command (see below).

---

## 🎨 Frontend Setup (React + Vite)

### 1. Move into the Frontend Folder

```
cd frontend
```

### 2. Install Dependencies _(node_modules is not included in Git due to .gitignore)_

```
npm install
```

### 3. Run Both Frontend and Backend Together

```
npm run start:dev
```

This command uses **concurrently** to start both React (Vite) and Flask servers together.

### 🔧 package.json Script Example

```json
"scripts": {
  "dev": "vite",
  "start:dev": "concurrently \"npm run dev\" \"python3 '../backend/app/app.py'\""
}
```

Your servers will run at:

- **Frontend:** http://localhost:5173/
- **Backend:** http://127.0.0.1:5001/

---

## 🧠 How Image Comparison Works

1. Both images are aligned and converted to grayscale.
2. Structural Similarity Index (SSIM) calculates differences.
3. Difference areas are highlighted and displayed visually.

---

## 📹 Output Preview

[![Watch on LinkedIn](https://img.shields.io/badge/Watch%20Demo-LinkedIn-blue?logo=linkedin)](https://www.linkedin.com/posts/rahul-sharma-94960a248_growthmindset-persistence-fullstackdevelopment-activity-7393050185997807616-cgw-?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD1QkMkBhwXCizY0WuwGuWpwdxhpxwhhA8o)

---

## 🎯 Conclusion

To successfully run the project:

| Component                 | Status |
| ------------------------- | ------ |
| Python 3.11–3.12 Used ✅  | Yes    |
| Dependencies Installed ✅ | Yes    |
| Backend Running ✅        | Yes    |
| Frontend Running ✅       | Yes    |

If errors occur, verify your Python version:

```
python --version
```

---

## 💡 Need Help?

Feel free to reach out for improvements, deployment support, or enhancements.

---

**Happy Coding! 🚀**
