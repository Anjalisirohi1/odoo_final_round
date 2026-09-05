import { useState, useEffect } from 'react';

export default function NewQuotationModal({ isOpen, onClose, onSuccess }) {
  const [customers, setCustomers] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  const [products, setProducts] = useState([]);
  const [priceListItems, setPriceListItems] = useState([]);
  const [variantsByProduct, setVariantsByProduct] = useState({});
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedPriceList, setSelectedPriceList] = useState('');
  
  const [items, setItems] = useState([{ product_id: '', variant_id: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 18 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  // Fetch items when a price list is selected
  useEffect(() => {
    if (selectedPriceList) {
      fetchPriceListItems(selectedPriceList);
    } else {
      setPriceListItems([]);
    }
  }, [selectedPriceList]);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('dealflow_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [custRes, plRes, prodRes] = await Promise.all([
        fetch('http://localhost:5000/api/customers', { headers }),
        fetch('http://localhost:5000/api/price-lists', { headers }),
        fetch('http://localhost:5000/api/products', { headers })
      ]);

      if (custRes.ok) {
        const data = await custRes.json();
        setCustomers(data.data || []);
      }
      if (plRes.ok) {
        const data = await plRes.json();
        setPriceLists(data.data || []);
      }
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch modal data', err);
    }
  };

  const fetchPriceListItems = async (priceListId) => {
    const token = localStorage.getItem('dealflow_token');
    try {
      const res = await fetch(`http://localhost:5000/api/price-lists/${priceListId}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPriceListItems(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVariants = async (productId) => {
    if (variantsByProduct[productId]) return; // already fetched
    
    const token = localStorage.getItem('dealflow_token');
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/variants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVariantsByProduct(prev => ({ ...prev, [productId]: data.data || [] }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'product_id' && value) {
      fetchVariants(value);
      // Reset variant when product changes
      newItems[index].variant_id = '';
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', variant_id: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 18 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Calculate Totals dynamically
  const totals = items.reduce((acc, item) => {
    const plItem = priceListItems.find(pli => pli.product_id === item.product_id);
    const basePrice = plItem ? Number(plItem.price) : 0;
    const taxRate = plItem ? Number(plItem.tax_rate) : 18;

    // Add variant extra price
    const productVariants = item.product_id ? (variantsByProduct[item.product_id] || []) : [];
    const variant = productVariants.find(v => v.id === item.variant_id);
    const extraPrice = variant ? Number(variant.extra_price) : 0;
    
    const unitPrice = basePrice + extraPrice;

    const gross = (Number(item.quantity) || 0) * unitPrice;
    const discount = gross * ((Number(item.discount_percent) || 0) / 100);
    const net = gross - discount;
    const tax = net * (taxRate / 100);
    
    return {
      subtotal: acc.subtotal + gross,
      discount: acc.discount + discount,
      tax: acc.tax + tax,
      total: acc.total + net + tax
    };
  }, { subtotal: 0, discount: 0, tax: 0, total: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const token = localStorage.getItem('dealflow_token');
    
    const payload = {
      customer_id: selectedCustomer,
      price_list_id: selectedPriceList,
      items: items.map(i => {
        const plItem = priceListItems.find(pli => pli.product_id === i.product_id);
        const basePrice = plItem ? Number(plItem.price) : 0;
        const taxRate = plItem ? Number(plItem.tax_rate) : 18;

        const productVariants = i.product_id ? (variantsByProduct[i.product_id] || []) : [];
        const variant = productVariants.find(v => v.id === i.variant_id);
        const extraPrice = variant ? Number(variant.extra_price) : 0;
        
        const unitPrice = basePrice + extraPrice;

        return {
          ...i,
          quantity: Number(i.quantity),
          discount_percent: Number(i.discount_percent),
          unit_price: unitPrice,
          tax_rate: taxRate
        };
      })
    };

    try {
      const res = await fetch('http://localhost:5000/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('Quotation Created Successfully!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Network error while creating quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Create New Quotation</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <form id="new-quote-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer</label>
                <select 
                  required
                  value={selectedCustomer}
                  onChange={e => setSelectedCustomer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                >
                  <option value="">Select Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name} ({c.tier_name})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price List</label>
                <select 
                  required
                  value={selectedPriceList}
                  onChange={e => setSelectedPriceList(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                >
                  <option value="">Select Price List...</option>
                  {priceLists.map(pl => (
                    <option key={pl.id} value={pl.id}>{pl.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-slate-800">Line Items</label>
                <button type="button" onClick={addItem} className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {items.map((item, index) => {
                  const productVariants = item.product_id ? (variantsByProduct[item.product_id] || []) : [];
                  const plItem = priceListItems.find(pli => pli.product_id === item.product_id);
                  const basePrice = plItem ? Number(plItem.price) : 0;
                  
                  const variant = productVariants.find(v => v.id === item.variant_id);
                  const extraPrice = variant ? Number(variant.extra_price) : 0;
                  
                  const unitPrice = basePrice + extraPrice;
                  
                  const lineGross = (Number(item.quantity) || 0) * unitPrice;
                  const lineNet = lineGross - (lineGross * ((Number(item.discount_percent) || 0) / 100));

                  return (
                    <div key={index} className="flex flex-wrap items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Product</label>
                        <select 
                          required
                          value={item.product_id}
                          onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        >
                          <option value="">Select Product...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-32">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Variant</label>
                        <select 
                          value={item.variant_id}
                          onChange={e => handleItemChange(index, 'variant_id', e.target.value)}
                          disabled={productVariants.length === 0}
                          className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        >
                          <option value="">None</option>
                          {productVariants.map(v => (
                            <option key={v.id} value={v.id}>{v.attribute_name}: {v.attribute_value}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Qty</label>
                        <input 
                          type="number" min="1" required
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Price</label>
                        <input 
                          type="number" readOnly
                          value={unitPrice}
                          className="w-full bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-600 outline-none cursor-not-allowed"
                        />
                      </div>

                      <div className="w-20">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Disc %</label>
                        <input 
                          type="number" min="0" max="100" required
                          value={item.discount_percent}
                          onChange={e => handleItemChange(index, 'discount_percent', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div className="w-24 flex flex-col justify-end">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Net Total</label>
                        <div className="px-1 py-1.5 text-sm font-semibold text-slate-900">
                          ₹{lineNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)} className="mt-6 p-1.5 text-slate-400 hover:text-rose-500 transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals Section */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-end">
              <div className="w-72 space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-medium text-slate-900">₹{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount:</span>
                  <span className="font-medium text-rose-600">-₹{totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax:</span>
                  <span className="font-medium text-slate-900">₹{totals.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-base">Grand Total:</span>
                  <span className="font-extrabold text-brand-700 text-lg">₹{totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition">
            Cancel
          </button>
          <button 
            type="submit" form="new-quote-form" 
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg shadow-md shadow-brand-600/25 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Creating...' : 'Create Quotation'}
            {!isSubmitting && <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
          </button>
        </div>
      </div>
    </div>
  );
}
