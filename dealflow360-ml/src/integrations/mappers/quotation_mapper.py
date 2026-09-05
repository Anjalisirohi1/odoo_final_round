from typing import Dict, Any, List, Optional
from datetime import datetime
from src.domain.quotation import Quotation, QuotationItem

class QuotationMapper:
    """
    Transforms quotation data and line items into canonical Quotation domain entities.
    """

    @staticmethod
    def to_item_domain(data: Dict[str, Any]) -> QuotationItem:
        qty = max(1, int(data.get("quantity", 1)))
        orig_price = float(data.get("original_price", data.get("unit_price", 0.0)))
        disc_pct = float(data.get("discount_percentage", 0.0))
        final_price = float(data.get("final_price", orig_price * (1.0 - disc_pct / 100.0)))
        cost_price = float(data.get("cost_price", 0.0))
        margin_amt = float(data.get("margin_amount", final_price - cost_price))
        margin_pct = (margin_amt / final_price * 100.0) if final_price > 0 else 0.0

        return QuotationItem(
            quote_item_id=str(data.get("quote_item_id", data.get("item_id", "item_1"))),
            quotation_id=str(data.get("quotation_id", "")) if "quotation_id" in data else None,
            product_id=str(data.get("product_id", "")),
            product_name=data.get("product_name"),
            quantity=qty,
            unit_price=orig_price,
            discount_percentage=disc_pct,
            discount_amount=float(data.get("discount_amount", orig_price * (disc_pct / 100.0))),
            final_price=final_price,
            cost_price=cost_price,
            margin_amount=margin_amt,
            margin_percentage=margin_pct
        )

    @classmethod
    def to_domain(
        cls,
        data: Dict[str, Any],
        items_data: Optional[List[Dict[str, Any]]] = None
    ) -> Quotation:
        raw_items = items_data or data.get("items", [])
        mapped_items = [cls.to_item_domain(it) for it in raw_items]

        created_at_val = data.get("created_at")
        if isinstance(created_at_val, str):
            try:
                created_at_val = datetime.fromisoformat(created_at_val)
            except Exception:
                created_at_val = None

        updated_at_val = data.get("updated_at")
        if isinstance(updated_at_val, str):
            try:
                updated_at_val = datetime.fromisoformat(updated_at_val)
            except Exception:
                updated_at_val = None

        total_amt = float(data.get("total_amount", sum(it.final_price * it.quantity for it in mapped_items)))
        total_disc = float(data.get("total_discount", sum(it.discount_amount * it.quantity for it in mapped_items)))
        total_marg = float(data.get("total_margin", sum(it.margin_amount * it.quantity for it in mapped_items)))

        disc_pct = data.get("discount_percentage")
        if disc_pct is None and total_amt > 0:
            disc_pct = (total_disc / (total_amt + total_disc)) * 100.0 if (total_amt + total_disc) > 0 else 0.0

        marg_pct = data.get("margin_percentage")
        if marg_pct is None and total_amt > 0:
            marg_pct = (total_marg / total_amt) * 100.0

        return Quotation(
            quotation_id=str(data.get("quotation_id", "")),
            customer_id=str(data.get("customer_id", "")),
            sales_rep_id=str(data.get("sales_rep_id", "rep_default")),
            total_amount=max(0.0, total_amt),
            total_discount=max(0.0, total_disc),
            total_margin=total_marg,
            discount_percentage=disc_pct,
            margin_percentage=marg_pct,
            status=str(data.get("status", "DRAFT")).upper(),
            items=mapped_items,
            created_at=created_at_val,
            updated_at=updated_at_val,
            metadata=data.get("metadata", {})
        )
