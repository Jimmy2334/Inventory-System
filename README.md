# InvenTrack — Inventory Management System

InvenTrack is a comprehensive, web-based inventory management solution designed to streamline stock tracking, supplier management, and order processing. Built with a modern frontend and a flexible backend, it provides real-time insights into inventory levels, low-stock alerts, and detailed activity logging.

**Production URL:** [https://inventory-system-livid-three.vercel.app/login.html](https://inventory-system-livid-three.vercel.app/login.html)

---

## 👥 Team Members

This project was developed by:
* **Ahmed Gamal**
* **Ibrahim Gad**
* **Mohamed Nasr**
* **Nehal Nabil**

---

## 🚀 Key Features

*   **Interactive Dashboard:** Real-time overview of total products, low-stock alerts, pending orders, and total inventory value.
*   **Product Management:** Full CRUD operations for products, including category organization and search functionality.
*   **Supplier Tracking:** Manage supplier contact information and track products associated with each supplier.
*   **Purchase Orders:** Create and manage orders with suppliers, with status tracking from pending to received.
*   **Stock Adjustments:** Manual stock corrections with reason logging for audits.
*   **Comprehensive Reporting:** Dedicated reports for low-stock items and inventory valuation.
*   **Activity Log:** Detailed audit trail of all system actions, including stock changes and administrative updates.
*   **Authentication:** Secure login system with session management.

---

## 🛠️ Tech Stack

### Frontend
*   **Vite:** Next-generation frontend tooling.
*   **Vanilla JavaScript (ES6+):** Modular architecture for state management and routing.
*   **BootStrap:** For a responsive and modern UI design.
*   **Single Page Application (SPA):** Custom router for seamless navigation.

### Backend
*   **JSON Server:** REST API mock backend for rapid development and data persistence.
*   **Vercel:** Hosted production environment for both client and server.

---

## 💻 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   npm or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Jimmy2334/Inventory-System.git
    cd Inventory-System
    ```

2.  **Setup the Server:**
    ```bash
    cd server
    npm install
    npm start
    ```
    The server will run on `http://localhost:3000`.

3.  **Setup the Client:**
    ```bash
    cd ../client
    npm install
    npm run dev
    ```
    The application will be available at `http://localhost:8080`.

### Default Credentials
*   **Username:** `admin`
*   **Password:** `admin123`

---

## 📂 Project Structure

```text
├── client/
│   ├── html/            # Page templates
│   ├── src/
│   │   ├── js/
│   │   │   ├── auth/    # Authentication logic
│   │   │   ├── services/# API & Data services
│   │   │   ├── utils/   # Helpers & Storage managers
│   │   │   └── views/   # UI rendering logic
│   │   └── css/         # Styles
│   └── vite.config.js
└── server/
    ├── db.json          # Database file
    └── api/             # Server-side logic
```
