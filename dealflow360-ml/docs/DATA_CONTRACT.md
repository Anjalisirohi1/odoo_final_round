# Data Contract

This document outlines the data required by future AI modules. 
Note: The AI/ML Service does not own this data. It is provided by the Main Backend.

## Entities

### CUSTOMERS
- `customer_id`
- `customer_name`
- `customer_tier`
- `industry`
- `region`
- `created_at`

### PRODUCTS
- `product_id`
- `product_name`
- `category`
- `selling_price`
- `cost_price`
- `margin_percentage`
- `active`

### QUOTATIONS
- `quotation_id`
- `customer_id`
- `sales_rep_id`
- `total_amount`
- `total_discount`
- `total_margin`
- `status`
- `created_at`
- `updated_at`

### QUOTATION ITEMS
- `quote_item_id`
- `quotation_id`
- `product_id`
- `quantity`
- `original_price`
- `discount_percentage`
- `discount_amount`
- `final_price`
- `cost_price`
- `margin_amount`

### ORDERS
- `order_id`
- `customer_id`
- `quotation_id`
- `order_date`
- `total_amount`
- `status`

### ORDER ITEMS
- `order_item_id`
- `order_id`
- `product_id`
- `quantity`
- `unit_price`
- `discount_percentage`

### SALES REPRESENTATIVES
- `sales_rep_id`
- `name`
- `team_id`
- `region`

### APPROVAL HISTORY
- `approval_id`
- `quotation_id`
- `approval_level`
- `approver_id`
- `status`
- `requested_at`
- `completed_at`

### DEAL EVENTS
- `event_id`
- `quotation_id`
- `event_type`
- `actor_id`
- `actor_type`
- `created_at`
- `metadata`

**Suggested event types:**
`QUOTE_CREATED`, `PRODUCT_ADDED`, `PRODUCT_REMOVED`, `DISCOUNT_APPLIED`, `DISCOUNT_CHANGED`, `QUOTE_SENT`, `CUSTOMER_VIEWED`, `CUSTOMER_COMMENTED`, `COUNTER_OFFER`, `QUOTE_REVISED`, `APPROVAL_REQUESTED`, `APPROVED`, `REJECTED`, `ORDER_CONFIRMED`, `INVENTORY_RESERVED`, `SHIPMENT_CREATED`, `DELIVERED`

### INVENTORY
- `inventory_id`
- `warehouse_id`
- `product_id`
- `available_quantity`
- `reserved_quantity`
- `updated_at`

### WAREHOUSES
- `warehouse_id`
- `warehouse_name`
- `region`
- `city`
- `active`

### FULFILLMENTS
- `fulfillment_id`
- `order_id`
- `warehouse_id`
- `promised_delivery_date`
- `shipped_date`
- `actual_delivery_date`
- `status`
- `created_at`
