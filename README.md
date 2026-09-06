# DealFlow360

DealFlow360 is an advanced, AI-powered sales pipeline and quotation management system built to streamline the quote-to-cash process. It empowers sales teams, deal desks, and finance operations with actionable intelligence, automated workflows, and a modern, frictionless user experience.

## 🚀 Key Features

*   **AI-Powered Deal Intelligence:** Real-time analysis of active deals with predictive risk scoring, anomaly detection, and AI-recommended next best actions.
*   **Configure, Price, Quote (CPQ):** Robust quotation builder with line-item discounts, pricing rules, and approval routing.
*   **Multi-Role Dashboards:** Specialized views and workflows for Sales Representatives, Sales Managers, Finance, and System Administrators.
*   **Customer Portal:** A dedicated, secure portal for customers to review, negotiate, and digitally sign proposals.
*   **Fulfillment & Logistics:** Track order delivery, split shipments, and warehouse routing with intelligent warehouse recommendations.
*   **Automated Invoicing:** Seamlessly convert confirmed quotations into invoices, manage subscriptions, and track payment statuses.

## 🛠️ Technology Stack

*   **Frontend:** React, Tailwind CSS, React Router DOM
*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL
*   **Architecture:** RESTful API with Role-Based Access Control (RBAC)

## 📂 Project Structure

The project is structured as a monorepo containing both the frontend and backend applications:

*   `/frontend`: React application containing all UI components, pages, and client-side routing.
*   `/backend`: Node.js Express server containing API routes, controllers, services, and database models.

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v16 or higher recommended)
*   PostgreSQL database

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Anjalisirohi1/odoo_final_round.git
    cd odoo_final_round
    ```

2.  **Setup the Backend:**
    ```bash
    cd backend
    npm install
    ```
    *   Create a `.env` file in the `backend` directory with your PostgreSQL connection string and environment variables.
    *   Run any database seeders to populate initial dummy data (e.g., `node seed_dummy_deals.js`).
    *   Start the development server: `npm run dev` (runs on `http://localhost:5000`)

3.  **Setup the Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```
    *   Start the development server: `npm run dev`

### Default User Roles
You can test the application by signing up with dummy credentials using the following roles in the Auth portal:
*   `ADMIN` (System Administrator)
*   `SALES_MANAGER` (Deal Desk)
*   `SALES_REP` (Enterprise / Channel)
*   `FINANCE` (Operations)
*   `CUSTOMER` (Procurement)

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.
