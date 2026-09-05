# DealFlow360 AI Architecture

## 1. Overall DealFlow360 Architecture

The DealFlow360 platform follows a modular architecture where the AI/ML service acts as a specialized microservice for intelligent predictions and decision support, fully decoupled from the primary business database.

## 2. Communication Flow

```text
Frontend
    ↓
Main Backend
    ↓
AI/ML Service
    ↓
Main Backend
    ↓
Frontend
```

## 3. Responsibilities

### Main Backend
- Authentication
- Authorization
- CRUD Operations
- Business workflows
- PostgreSQL ownership
- Quotation management
- Orders
- Inventory
- Approval workflows

### AI/ML Service
- Data preprocessing
- Feature engineering
- Model training
- Model inference
- Recommendations
- Anomaly detection
- Risk scoring
- Explainability

## 4. Layered AI Architecture

### LAYER 1: Business Data
- Customers
- Products
- Quotes
- Orders
- Inventory
- Deliveries
  ↓

### LAYER 2: Specialized Intelligence
- Recommendation Engine
- Discount Anomaly Detection
- Delivery Prediction
  ↓

### LAYER 3: Decision Intelligence
- Deal Health Engine
  ↓

### LAYER 4: Advanced AI
- Win Probability
- What-If Simulation
- Negotiation Copilot

## 5. Future ML Service Request Flow

```text
POST Request
      ↓
API Router
      ↓
Pydantic Schema Validation
      ↓
Service Layer
      ↓
Feature Engineering
      ↓
Model / Intelligence Engine
      ↓
Explanation Generation
      ↓
Response Schema
```
