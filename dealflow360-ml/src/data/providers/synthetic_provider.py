import random
import uuid
from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
import numpy as np
from faker import Faker

from src.schemas.domain import (
    Customer, Product, SalesRepresentative, Quotation, QuotationItem,
    Order, OrderItem, DealEvent, Inventory, Warehouse, Fulfillment, ApprovalHistory
)
from src.data.providers.base import DataProvider

class SyntheticDataProvider(DataProvider):
    def __init__(
        self,
        num_customers: int = 100,
        num_products: int = 50,
        num_quotations: int = 1000,
        seed: int = 42
    ):
        self.num_customers = num_customers
        self.num_products = num_products
        self.num_quotations = num_quotations
        self.seed = seed
        self.fake = Faker()
        
        # Ensure reproducibility
        Faker.seed(self.seed)
        random.seed(self.seed)
        np.random.seed(self.seed)
        
        # Internal storage
        self._customers: List[Customer] = []
        self._products: List[Product] = []
        self._sales_reps: List[SalesRepresentative] = []
        self._quotations: List[Quotation] = []
        self._quotation_items: List[QuotationItem] = []
        self._orders: List[Order] = []
        self._order_items: List[OrderItem] = []
        self._deal_events: List[DealEvent] = []
        self._warehouses: List[Warehouse] = []
        self._inventory: List[Inventory] = []
        self._fulfillments: List[Fulfillment] = []
        self._approval_history: List[ApprovalHistory] = []
        
        # Generate data
        self._generate_all()

    def _generate_all(self):
        self._generate_sales_reps()
        self._generate_warehouses()
        self._generate_customers()
        self._generate_products()
        self._generate_inventory()
        self._generate_quotations_and_orders()

    def _generate_sales_reps(self):
        regions = ['North America', 'EMEA', 'APAC', 'LATAM']
        for i in range(10):
            # Give reps some behavioral traits for later use
            self._sales_reps.append(SalesRepresentative(
                sales_rep_id=f"rep_{self.fake.uuid4()[:8]}",
                name=self.fake.name(),
                team_id=f"team_{random.randint(1, 3)}",
                region=random.choice(regions)
            ))
            
    def _generate_warehouses(self):
        regions = ['North America', 'EMEA', 'APAC']
        for i in range(4):
            self._warehouses.append(Warehouse(
                warehouse_id=f"wh_{self.fake.uuid4()[:8]}",
                warehouse_name=f"Warehouse {self.fake.city()}",
                region=random.choice(regions),
                city=self.fake.city(),
                active=True
            ))

    def _generate_customers(self):
        tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
        tier_probs = [0.4, 0.3, 0.2, 0.1]
        industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing']
        regions = ['North America', 'EMEA', 'APAC', 'LATAM']
        
        for _ in range(self.num_customers):
            created_at = self.fake.date_time_between(start_date='-3y', end_date='-1y')
            self._customers.append(Customer(
                customer_id=f"cust_{self.fake.uuid4()[:8]}",
                customer_name=self.fake.company(),
                customer_tier=np.random.choice(tiers, p=tier_probs),
                industry=random.choice(industries),
                region=random.choice(regions),
                created_at=created_at
            ))

    def _generate_products(self):
        categories = ['Office Furniture', 'Seating', 'Storage', 'Workstations', 'Accessories', 'Lighting']
        
        # Base templates for realistic products
        templates = {
            'Office Furniture': [('Office Desk', 200, 500), ('Conference Table', 500, 1500)],
            'Seating': [('Ergonomic Chair', 150, 400), ('Conference Chair', 100, 250)],
            'Storage': [('Storage Cabinet', 150, 400), ('Filing Cabinet', 100, 300)],
            'Workstations': [('Cubicle', 400, 1000), ('Standing Desk', 300, 800)],
            'Accessories': [('Monitor Arm', 50, 150), ('Keyboard Tray', 30, 80)],
            'Lighting': [('Desk Lamp', 40, 100), ('Floor Lamp', 80, 200)]
        }
        
        for _ in range(self.num_products):
            category = random.choice(categories)
            template = random.choice(templates[category])
            name_prefix = template[0]
            
            cost = random.uniform(template[1], template[2])
            margin = random.uniform(0.2, 0.5)
            selling = cost / (1 - margin)
            
            self._products.append(Product(
                product_id=f"prod_{self.fake.uuid4()[:8]}",
                product_name=f"{name_prefix} {self.fake.word().capitalize()}",
                category=category,
                selling_price=round(selling, 2),
                cost_price=round(cost, 2),
                margin_percentage=round(margin * 100, 2),
                active=True
            ))

    def _generate_inventory(self):
        from datetime import timezone
        now = datetime.now(timezone.utc)
        for wh in self._warehouses:
            for p in self._products:
                self._inventory.append(Inventory(
                    inventory_id=f"inv_{self.fake.uuid4()[:8]}",
                    warehouse_id=wh.warehouse_id,
                    product_id=p.product_id,
                    available_quantity=random.randint(10, 500),
                    reserved_quantity=random.randint(0, 20),
                    updated_at=now
                ))

    def _get_discount_for_quote(self, customer_tier, is_anomaly=False):
        if is_anomaly:
            # Generate anomalous discount: very high
            return random.uniform(35.0, 50.0)
            
        base = np.random.normal(10, 3) # mean 10, std 3
        
        # Tier adjustments
        if customer_tier == 'PLATINUM':
            base += 5
        elif customer_tier == 'GOLD':
            base += 3
            
        # Bound it
        base = max(0.0, min(base, 40.0))
        return base
        
    def _generate_quotations_and_orders(self):
        from datetime import timezone
        start_date = datetime.now(timezone.utc) - timedelta(days=365)
        
        for i in range(self.num_quotations):
            customer = random.choice(self._customers)
            rep = random.choice(self._sales_reps)
            
            # Time progression
            q_date = start_date + timedelta(days=random.randint(0, 350), hours=random.randint(0, 23))
            
            q_id = f"quote_{self.fake.uuid4()[:8]}"
            
            # Decide if anomalous
            is_anomaly = random.random() < 0.03
            
            # Bundle generation
            main_product = random.choice(self._products)
            bundle = [(main_product, random.randint(1, 10))]
            
            # Probabilistic associations
            if 'Desk' in main_product.product_name or 'Workstation' in main_product.product_name:
                if random.random() < 0.7:
                    bundle.append((random.choice([p for p in self._products if p.category == 'Seating']), random.randint(1, 5)))
                if random.random() < 0.45:
                    bundle.append((random.choice([p for p in self._products if 'Arm' in p.product_name] or self._products), 1))
                if random.random() < 0.3:
                    bundle.append((random.choice([p for p in self._products if p.category == 'Lighting']), 1))
            elif 'Table' in main_product.product_name:
                if random.random() < 0.8:
                    bundle.append((random.choice([p for p in self._products if p.category == 'Seating']), random.randint(4, 12)))
                    
            # Create items
            q_total = 0.0
            q_discount_amt = 0.0
            q_cost = 0.0
            
            items = []
            for p, qty in bundle:
                discount_pct = self._get_discount_for_quote(customer.customer_tier, is_anomaly)
                discount_amt = p.selling_price * qty * (discount_pct / 100)
                final_price = p.selling_price * qty - discount_amt
                margin_amt = final_price - (p.cost_price * qty)
                
                q_total += p.selling_price * qty
                q_discount_amt += discount_amt
                q_cost += p.cost_price * qty
                
                item = QuotationItem(
                    quote_item_id=f"qi_{self.fake.uuid4()[:8]}",
                    quotation_id=q_id,
                    product_id=p.product_id,
                    quantity=qty,
                    original_price=p.selling_price,
                    discount_percentage=round(discount_pct, 2),
                    discount_amount=round(discount_amt, 2),
                    final_price=round(final_price, 2),
                    cost_price=p.cost_price,
                    margin_amount=round(margin_amt, 2)
                )
                items.append(item)
                self._quotation_items.append(item)
                
            q_margin = (q_total - q_discount_amt) - q_cost
            
            # Determine conversion status
            status_opts = ['CONVERTED', 'REJECTED', 'EXPIRED']
            prob_converted = 0.6 if customer.customer_tier in ['PLATINUM', 'GOLD'] else 0.4
            
            # Anomalies might get rejected more often, or require approval delays
            if is_anomaly:
                prob_converted *= 0.8
                
            status = np.random.choice(status_opts, p=[prob_converted, (1-prob_converted)*0.6, (1-prob_converted)*0.4])
            
            q = Quotation(
                quotation_id=q_id,
                customer_id=customer.customer_id,
                sales_rep_id=rep.sales_rep_id,
                total_amount=round(q_total, 2),
                total_discount=round(q_discount_amt, 2),
                total_margin=round(q_margin, 2),
                status=status,
                created_at=q_date,
                updated_at=q_date + timedelta(days=random.randint(1, 30))
            )
            self._quotations.append(q)
            
            self._generate_events_for_quote(q, is_anomaly)
            
            if status == 'CONVERTED':
                self._generate_order_for_quote(q, items)

    def _generate_events_for_quote(self, q: Quotation, is_anomaly: bool):
        curr_time = q.created_at
        
        def add_event(evt_type):
            self._deal_events.append(DealEvent(
                event_id=f"evt_{self.fake.uuid4()[:8]}",
                quotation_id=q.quotation_id,
                event_type=evt_type,
                actor_id=q.sales_rep_id,
                actor_type="SALES_REP",
                created_at=curr_time
            ))
            
        add_event("QUOTE_CREATED")
        curr_time += timedelta(minutes=random.randint(5, 60))
        add_event("PRODUCT_ADDED")
        curr_time += timedelta(minutes=random.randint(5, 60))
        
        if q.total_discount > 0:
            add_event("DISCOUNT_APPLIED")
            
        curr_time += timedelta(hours=random.randint(1, 24))
        add_event("QUOTE_SENT")
        
        curr_time += timedelta(days=random.randint(1, 5))
        add_event("CUSTOMER_VIEWED")
        
        # Possibly some negotiations
        if random.random() < 0.3:
            curr_time += timedelta(days=random.randint(1, 3))
            add_event("COUNTER_OFFER")
            curr_time += timedelta(days=random.randint(1, 2))
            add_event("QUOTE_REVISED")
            
        # Approvals
        if is_anomaly or q.total_discount / q.total_amount > 0.2:
            curr_time += timedelta(hours=random.randint(1, 12))
            add_event("APPROVAL_REQUESTED")
            
            # Delay
            curr_time += timedelta(days=random.randint(1, 5) if is_anomaly else random.randint(0, 1))
            
            # Log approval
            self._approval_history.append(ApprovalHistory(
                approval_id=f"app_{self.fake.uuid4()[:8]}",
                quotation_id=q.quotation_id,
                approval_level=1,
                approver_id=f"mgr_{self.fake.uuid4()[:8]}",
                status="APPROVED" if q.status == "CONVERTED" else "REJECTED",
                requested_at=curr_time - timedelta(days=1),
                completed_at=curr_time
            ))
            
            add_event("APPROVED" if q.status == "CONVERTED" else "REJECTED")

        curr_time += timedelta(days=random.randint(1, 7))
        if q.status == 'CONVERTED':
            add_event("ORDER_CONFIRMED")
        elif q.status == 'REJECTED':
            add_event("REJECTED")

    def _generate_order_for_quote(self, q: Quotation, items: List[QuotationItem]):
        order_id = f"ord_{self.fake.uuid4()[:8]}"
        o = Order(
            order_id=order_id,
            customer_id=q.customer_id,
            quotation_id=q.quotation_id,
            order_date=q.updated_at,
            total_amount=q.total_amount - q.total_discount,
            status="CONFIRMED"
        )
        self._orders.append(o)
        
        for qi in items:
            self._order_items.append(OrderItem(
                order_item_id=f"oi_{uuid.uuid4().hex[:8]}",
                order_id=order_id,
                product_id=qi.product_id,
                quantity=qi.quantity,
                unit_price=qi.final_price / qi.quantity,
                discount_percentage=qi.discount_percentage
            ))
            
        # Fulfillment
        wh = random.choice(self._warehouses)
        promised = o.order_date + timedelta(days=random.randint(5, 14))
        
        # Check factors for delay
        qty_factor = sum(i.quantity for i in items) > 20
        delayed = random.random() < (0.4 if qty_factor else 0.1)
        
        shipped = o.order_date + timedelta(days=random.randint(1, 3))
        if delayed:
            actual = promised + timedelta(days=random.randint(1, 10))
            status = "DELAYED"
        else:
            actual = promised - timedelta(days=random.randint(0, 3))
            status = "DELIVERED"
            
        self._fulfillments.append(Fulfillment(
            fulfillment_id=f"ful_{self.fake.uuid4()[:8]}",
            order_id=order_id,
            warehouse_id=wh.warehouse_id,
            promised_delivery_date=promised,
            shipped_date=shipped,
            actual_delivery_date=actual,
            status=status,
            created_at=o.order_date
        ))

    # Interface Implementations
    def get_customers(self) -> List[Customer]: return self._customers
    def get_products(self) -> List[Product]: return self._products
    def get_sales_representatives(self) -> List[SalesRepresentative]: return self._sales_reps
    def get_quotations(self) -> List[Quotation]: return self._quotations
    def get_quotation_items(self) -> List[QuotationItem]: return self._quotation_items
    def get_orders(self) -> List[Order]: return self._orders
    def get_order_items(self) -> List[OrderItem]: return self._order_items
    def get_approval_history(self) -> List[ApprovalHistory]: return self._approval_history
    def get_deal_events(self) -> List[DealEvent]: return self._deal_events
    def get_inventory(self) -> List[Inventory]: return self._inventory
    def get_warehouses(self) -> List[Warehouse]: return self._warehouses
    def get_fulfillments(self) -> List[Fulfillment]: return self._fulfillments
