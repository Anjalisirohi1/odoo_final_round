import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Main Form & State
  const [productData, setProductData] = useState({
    id: id || 'PRD-2026-089',
    catalog_id: 'PRD-2026-089',
    name: 'Enterprise Executive Ergonomic Suite',
    category_id: '',
    category_name: 'Office Furniture & Ergonomics',
    unit: 'UNIT',
    price: 18500,
    cost_price: 6500,
    tax_rate: 18,
    description: 'High-grade ergonomic executive workspace seating engineered for 24/7 durability, featuring adjustable 4D lumbar support, breathable tension mesh, and synchronized multi-tilt mechanism.',
    is_subscription: true,
    recurring_frequency: 'Monthly',
    quantity_on_hand: 342,
    billing_config: {
      billing_frequency: 'Monthly',
      billing_start: 'Beginning of Period',
      next_billing: 'Auto-calculated',
      lifecycle_status: 'Active'
    },
    variants: [
      { id: 'v1', attribute: 'Color', values: ['Blue', 'Black'], extra_price: '₹0 (Included in base)' },
      { id: 'v2', attribute: 'RAM', values: ['4GB', '8GB'], extra_price: '+₹3,000 (on 8GB tier)' },
      { id: 'v3', attribute: 'Manufacturer', values: ['Dell', 'HP'], extra_price: '+₹2,000 / +₹3,000' }
    ],
    pricelists: [
      { id: 'pl1', tier: 'Bronze Tier', badge: null, currency: 'INR (₹)', rule: 'Base price, no adjustment', baseline: 'Standard catalogue baseline: ₹18,500', status: 'Active', discount: 'Baseline' },
      { id: 'pl2', tier: 'Silver Tier', badge: null, currency: 'INR (₹)', rule: '5% below base price', baseline: 'Calculated price: ₹17,575', status: 'Active', discount: '-5.0%' },
      { id: 'pl3', tier: 'Gold Tier', badge: 'Premium', currency: 'INR (₹)', rule: '10% below base price', baseline: 'Calculated price: ₹16,650', status: 'Active', discount: '-10.0%' }
    ]
  });

  // Modals state for Variant & Pricelist
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [newVariant, setNewVariant] = useState({ attribute: '', values: '', extra_price: '' });

  const [showPricelistModal, setShowPricelistModal] = useState(false);
  const [editingPricelistId, setEditingPricelistId] = useState(null);
  const [newPricelist, setNewPricelist] = useState({ tier: '', discount_pct: '5' });

  useEffect(() => {
    fetchProductDetails();
    fetchCategories();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products/categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/products/${id || 'PRD-2026-089'}`);
      const result = await res.json();
      if (result.success && result.data) {
        setProductData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProduct = async () => {
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:5000/api/products/${productData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const result = await res.json();

      if (result.success) {
        setToastMessage('Product details & pricelists saved successfully!');
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(`Error: ${result.message || 'Failed to save product'}`);
      }
    } catch (err) {
      console.error('Save product error:', err);
      alert('Failed to connect to backend server.');
    } finally {
      setSaving(false);
    }
  };

  // --- Variant Handlers ---
  const handleOpenAddVariant = () => {
    setEditingVariantId(null);
    setNewVariant({ attribute: '', values: '', extra_price: '' });
    setShowVariantModal(true);
  };

  const handleEditVariant = (v) => {
    setEditingVariantId(v.id);
    setNewVariant({
      attribute: v.attribute,
      values: Array.isArray(v.values) ? v.values.join(', ') : v.values,
      extra_price: v.extra_price || ''
    });
    setShowVariantModal(true);
  };

  const handleSaveVariant = (e) => {
    e.preventDefault();
    if (!newVariant.attribute || !newVariant.values) return;
    const valuesArr = newVariant.values.split(',').map(v => v.trim()).filter(Boolean);

    if (editingVariantId) {
      setProductData(prev => ({
        ...prev,
        variants: prev.variants.map(v => 
          v.id === editingVariantId 
            ? { ...v, attribute: newVariant.attribute, values: valuesArr, extra_price: newVariant.extra_price || '₹0 (Included in base)' }
            : v
        )
      }));
    } else {
      const added = {
        id: `v_${Date.now()}`,
        attribute: newVariant.attribute,
        values: valuesArr,
        extra_price: newVariant.extra_price || '₹0 (Included in base)'
      };
      setProductData(prev => ({
        ...prev,
        variants: [...prev.variants, added]
      }));
    }

    setShowVariantModal(false);
    setEditingVariantId(null);
    setNewVariant({ attribute: '', values: '', extra_price: '' });
  };

  const handleDeleteVariant = (vId) => {
    setProductData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== vId)
    }));
  };

  // --- Pricelist Handlers ---
  const handleOpenAddPricelist = () => {
    setEditingPricelistId(null);
    setNewPricelist({ tier: '', discount_pct: '5' });
    setShowPricelistModal(true);
  };

  const handleEditPricelist = (pl) => {
    setEditingPricelistId(pl.id);
    const tierName = pl.tier.replace(/ Tier$/i, '');
    const discPct = pl.discount ? Math.abs(parseFloat(pl.discount)) || '0' : '0';
    setNewPricelist({
      tier: tierName,
      discount_pct: discPct.toString()
    });
    setShowPricelistModal(true);
  };

  const handleSavePricelist = (e) => {
    e.preventDefault();
    if (!newPricelist.tier) return;
    const discPct = parseFloat(newPricelist.discount_pct) || 0;
    const baseP = parseFloat(productData.price) || 0;
    const calcP = Math.round(baseP * (1 - discPct / 100));

    if (editingPricelistId) {
      setProductData(prev => ({
        ...prev,
        pricelists: prev.pricelists.map(pl => {
          if (pl.id === editingPricelistId) {
            return {
              ...pl,
              tier: newPricelist.tier.includes('Tier') ? newPricelist.tier : `${newPricelist.tier} Tier`,
              rule: discPct === 0 ? 'Base price, no adjustment' : `${discPct}% below base price`,
              baseline: `Calculated price: ₹${calcP.toLocaleString('en-IN')}`,
              discount: discPct === 0 ? 'Baseline' : `-${discPct.toFixed(1)}%`
            };
          }
          return pl;
        })
      }));
    } else {
      const added = {
        id: `pl_${Date.now()}`,
        tier: `${newPricelist.tier} Tier`,
        badge: discPct >= 10 ? 'Custom' : null,
        currency: 'INR (₹)',
        rule: discPct === 0 ? 'Base price, no adjustment' : `${discPct}% below base price`,
        baseline: `Calculated price: ₹${calcP.toLocaleString('en-IN')}`,
        status: 'Active',
        discount: discPct === 0 ? 'Baseline' : `-${discPct.toFixed(1)}%`
      };

      setProductData(prev => ({
        ...prev,
        pricelists: [...prev.pricelists, added]
      }));
    }

    setShowPricelistModal(false);
    setEditingPricelistId(null);
    setNewPricelist({ tier: '', discount_pct: '5' });
  };

  const handleDeletePricelist = (plId) => {
    setProductData(prev => ({
      ...prev,
      pricelists: prev.pricelists.filter(pl => pl.id !== plId)
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased">
      <DashboardHeader activeTab="products" />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between transition-all">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white font-bold text-xs">✕</button>
          </div>
        )}

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <span>DealFlow360</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              <a href="/products" className="hover:underline">Product Catalog</a>
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              <span className="text-slate-900 font-semibold">Product Details</span>
            </nav>
            <h1 className="text-2xl font-bold text-slate-900">Product & Pricelist</h1>
            <p className="text-xs text-slate-500 mt-1">Manage product information, variants, recurring billing configuration and customer-tier pricing.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/products')}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs shadow-xs transition"
            >
              ← Back to Products
            </button>
            <button 
              onClick={handleSaveProduct}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              <span>{saving ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-xs text-slate-500 font-medium">
            Loading product & pricelist specifications...
          </div>
        ) : (
          <div className="space-y-6">

            {/* SECTION 1: GENERAL INFO */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>General Info</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Primary attributes, SKU specifications, tax parameters, and recurring cadence.</p>
                </div>
                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold text-slate-600">
                  Catalog ID: {productData.catalog_id}
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                    <input 
                      type="text" 
                      value={productData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                      <select 
                        value={productData.category_id || ''}
                        onChange={(e) => handleInputChange('category_id', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                      >
                        <option value="">{productData.category_name || 'Select Category'}</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Unit *</label>
                      <select 
                        value={productData.unit}
                        onChange={(e) => handleInputChange('unit', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                      >
                        <option value="UNIT">UNIT</option>
                        <option value="LICENSE">LICENSE</option>
                        <option value="SERVICE">SERVICE</option>
                        <option value="MONTH">MONTH</option>
                        <option value="YEAR">YEAR</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price (Base Rate) *</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={productData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-16 pr-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">INR (₹)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Standard baseline price before customer-tier or volume discounts.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                    <textarea 
                      rows="3"
                      value={productData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    ></textarea>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tax % *</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={productData.tax_rate}
                        onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Standard GST rate applicable on commercial procurement invoices.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Subscription Item</label>
                    <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                      <button 
                        type="button"
                        onClick={() => handleInputChange('is_subscription', true)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${productData.is_subscription ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Yes
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleInputChange('is_subscription', false)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${!productData.is_subscription ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        No
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Enables automated recurring billing generation and renewal tracking.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Recurring Frequency *</label>
                    <select 
                      value={productData.recurring_frequency}
                      onChange={(e) => handleInputChange('recurring_frequency', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity on Hand *</label>
                    <input 
                      type="number" 
                      value={productData.quantity_on_hand}
                      onChange={(e) => handleInputChange('quantity_on_hand', parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Available inventory quantity across central and regional distribution depots.</p>
                  </div>
                </div>
              </div>

              {/* RECURRING BILLING CONFIGURATION CARD */}
              {productData.is_subscription && (
                <div className="mx-6 mb-6 p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-blue-600 text-white">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">RECURRING BILLING CONFIGURATION</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">Active</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Active subscription parameters synchronized with the DealFlow360 Recurring Invoicing Engine.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">BILLING FREQUENCY</span>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">{productData.recurring_frequency}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">BILLING START</span>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">{productData.billing_config?.billing_start || 'Beginning of Period'}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">NEXT BILLING</span>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">{productData.billing_config?.next_billing || 'Auto-calculated'}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">LIFECYCLE STATUS</span>
                      <div className="text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{productData.billing_config?.lifecycle_status || 'Active'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: PRODUCT VARIANTS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Product Variants</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Configure optional product attributes and additional pricing.</p>
                </div>
                <button 
                  onClick={handleOpenAddVariant}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-lg text-xs transition flex items-center gap-1"
                >
                  <span>+ Add Variant</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">ATTRIBUTE</th>
                      <th className="py-3 px-5">VALUES</th>
                      <th className="py-3 px-5">EXTRA PRICE</th>
                      <th className="py-3 px-5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {productData.variants && productData.variants.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                          <span>{v.attribute}</span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex flex-wrap gap-1.5">
                            {v.values.map((val, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                <span>{val}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          {v.extra_price}
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-2">
                          <button onClick={() => handleEditVariant(v)} className="text-blue-600 hover:underline font-semibold text-xs">Edit</button>
                          <span className="text-slate-300">|</span>
                          <button onClick={() => handleDeleteVariant(v.id)} className="text-rose-600 hover:underline font-semibold text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 3: PRICELISTS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Pricelists</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Define pricing behavior for different customer tiers.</p>
                </div>
                <button 
                  onClick={handleOpenAddPricelist}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-lg text-xs transition flex items-center gap-1"
                >
                  <span>+ Add Pricelist</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">CUSTOMER TIER</th>
                      <th className="py-3 px-5">CURRENCY</th>
                      <th className="py-3 px-5">PRICE RULE</th>
                      <th className="py-3 px-5">STATUS</th>
                      <th className="py-3 px-5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {productData.pricelists && productData.pricelists.map((pl) => (
                      <tr key={pl.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${pl.tier.includes('Bronze') ? 'bg-amber-700' : pl.tier.includes('Silver') ? 'bg-slate-400' : 'bg-amber-400'}`}></span>
                            <span>{pl.tier}</span>
                            {pl.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                                {pl.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-700">{pl.currency}</td>
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900">{pl.rule}</div>
                          <div className={`text-[11px] font-medium ${pl.tier.includes('Gold') ? 'text-amber-700' : pl.tier.includes('Silver') ? 'text-blue-600' : 'text-slate-400'}`}>
                            {pl.baseline}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{pl.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-2">
                          <button onClick={() => handleEditPricelist(pl)} className="text-blue-600 hover:underline font-semibold text-xs">Edit</button>
                          <span className="text-slate-300">|</span>
                          <button onClick={() => handleDeletePricelist(pl.id)} className="text-rose-600 hover:underline font-semibold text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PRICING RULES AUTOMATIC ADJUSTMENT SUB-CARD */}
              <div className="p-6 bg-slate-50/50 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">PRICING RULES</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Automatic Quotation Adjustment</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Bronze */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900">Bronze</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">Baseline</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">Base price</div>
                    <p className="text-[11px] text-slate-400">No automatic concession</p>
                  </div>

                  {/* Silver */}
                  <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900">Silver</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">-5.0%</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">5% customer-tier adjustment</div>
                    <p className="text-[11px] text-slate-400">Pre-authorized delegation</p>
                  </div>

                  {/* Gold */}
                  <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900">Gold</span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">-10.0%</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">10% customer-tier adjustment</div>
                    <p className="text-[11px] text-slate-400">Preferred enterprise accounts</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pt-1">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>Customer-specific pricing is automatically applied based on the customer tier selected during quotation creation.</span>
                </p>
              </div>
            </div>

            {/* FOOTER NOTICE BANNER */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-3">
              <div className="p-1 rounded-md bg-amber-500 text-white font-bold text-xs mt-0.5">
                ⚠
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold">Required Configuration Notice</div>
                <div className="text-amber-800">Product details should be completed before the product is made available for quotation. Recurring products will be invoiced automatically at the beginning of each billing period.</div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Add / Edit Variant Modal */}
      {showVariantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {editingVariantId ? 'Edit Product Variant' : '+ Add Product Variant'}
            </h3>
            <form onSubmit={handleSaveVariant} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attribute Name (e.g. Storage, RAM, Color)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Storage"
                  value={newVariant.attribute}
                  onChange={(e) => setNewVariant({ ...newVariant, attribute: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Values (comma separated)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 256GB, 512GB, 1TB"
                  value={newVariant.values}
                  onChange={(e) => setNewVariant({ ...newVariant, values: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Extra Price Rule</label>
                <input 
                  type="text" 
                  placeholder="e.g. +₹5,000 (on 1TB tier)"
                  value={newVariant.extra_price}
                  onChange={(e) => setNewVariant({ ...newVariant, extra_price: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowVariantModal(false)} className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg">
                  {editingVariantId ? 'Update Variant' : 'Save Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Pricelist Modal */}
      {showPricelistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {editingPricelistId ? 'Edit Customer Pricelist Tier' : '+ Add Customer Pricelist Tier'}
            </h3>
            <form onSubmit={handleSavePricelist} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Tier Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Platinum Tier"
                  value={newPricelist.tier}
                  onChange={(e) => setNewPricelist({ ...newPricelist, tier: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discount % Below Base Price</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  max="50"
                  value={newPricelist.discount_pct}
                  onChange={(e) => setNewPricelist({ ...newPricelist, discount_pct: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPricelistModal(false)} className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg">
                  {editingPricelistId ? 'Update Pricelist' : 'Save Pricelist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}
