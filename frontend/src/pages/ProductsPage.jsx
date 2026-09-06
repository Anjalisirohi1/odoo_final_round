import { useState, useEffect } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    cost_price: '',
    unit: 'UNIT',
    tax_rate: '18',
    description: '',
    is_active: true
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products/categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
        if (data.data.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateMargin = () => {
    const p = parseFloat(formData.price) || 0;
    const c = parseFloat(formData.cost_price) || 0;
    if (p <= 0) return '0.0%';
    const m = ((p - c) / p) * 100;
    return `${m.toFixed(1)}%`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Product Name is required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (result.success) {
        setToastMessage(`Product "${formData.name}" added successfully!`);
        setTimeout(() => setToastMessage(null), 4000);
        setIsModalOpen(false);
        setFormData({
          name: '',
          category_id: categories.length > 0 ? categories[0].id : '',
          price: '',
          cost_price: '',
          unit: 'UNIT',
          tax_rate: '18',
          description: '',
          is_active: true
        });
        fetchProducts();
      } else {
        alert(`Error: ${result.message || 'Failed to save product'}`);
      }
    } catch (err) {
      console.error('Create product error:', err);
      alert('Server connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || p.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <span>DealFlow360</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              <span className="text-slate-900 font-semibold">Product Catalog</span>
            </nav>
            <h1 className="text-2xl font-bold text-slate-900">Product Dashboard & SKUs</h1>
            <p className="text-xs text-slate-500 mt-1">Manage global enterprise product offerings, base price lists, and margin rules.</p>
          </div>
          <div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2"
            >
              <span>+ Add New SKU / Product</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input 
              type="text" 
              placeholder="Search products by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">Category:</span>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900">
              Global Product Catalog ({filteredProducts.length} Items)
            </h2>
            <span className="text-xs text-slate-500 font-medium">Admin Catalog Controls</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading catalog data...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">No products match your criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">SKU / ID</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Base Price</th>
                    <th className="py-3 px-4">Cost Price</th>
                    <th className="py-3 px-4">Target Margin</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        <a href={`/products/${p.id}`} className="hover:text-blue-600 hover:underline">
                          {p.id ? `SKU-${p.id.substring(0, 8).toUpperCase()}` : 'SKU-NEW'}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <a href={`/products/${p.id}`} className="hover:text-blue-600 hover:underline">
                          {p.name}
                        </a>
                        {p.description && <p className="text-[11px] text-slate-400 font-normal">{p.description}</p>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {p.category_name || 'GENERAL'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{parseFloat(p.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        ₹{parseFloat(p.cost_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">
                        {p.margin_percentage ? `${parseFloat(p.margin_percentage).toFixed(1)}%` : '100.0%'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 uppercase font-mono text-[11px]">
                        {p.unit || 'UNIT'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {p.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a href={`/products/${p.id}`} className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
                          View Details
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add New SKU / Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">+ Add New SKU / Product</h3>
                <p className="text-xs text-slate-500">Create a new item in the global enterprise catalog</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1 rounded-lg hover:bg-slate-200/50"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                <input 
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Enterprise Analytics Cloud Node"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select 
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Billing Unit</label>
                  <select 
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="UNIT">UNIT</option>
                    <option value="LICENSE">LICENSE</option>
                    <option value="SERVICE">SERVICE</option>
                    <option value="MONTH">MONTH</option>
                    <option value="YEAR">YEAR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Price (₹) *</label>
                  <input 
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 100000"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input 
                    type="number"
                    name="cost_price"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 40000"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Margin</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-emerald-700 flex items-center h-[34px]">
                    {calculateMargin()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  name="description"
                  rows="2"
                  placeholder="Optional technical description or SLA specs..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 font-bold">Publish to Active Catalog</span>
                </label>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
                  >
                    {submitting ? 'Saving...' : 'Save Product SKU'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}
