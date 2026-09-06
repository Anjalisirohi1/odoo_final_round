import React, { useState, useEffect, useMemo } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import { 
  ShieldCheck, Plus, Check, Edit, Copy, Trash2, ArrowDown, 
  AlertTriangle, RefreshCw, Layers, CheckCircle2, ChevronRight, X, Sparkles, Sliders
} from 'lucide-react';
import apiFetch from '../utils/api';

export default function DiscountRulesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matrix, setMatrix] = useState(null);
  
  const [activeTab, setActiveTab] = useState('Discount Tiers');
  const [selectedTierId, setSelectedTierId] = useState('DISC-TIER-03');
  
  // Interactive Simulator state
  const [simDiscount, setSimDiscount] = useState(18.0);

  // Edit Step Modal State
  const [editingStep, setEditingStep] = useState(null);

  // Add Tier Modal State
  const [isAddTierModalOpen, setIsAddTierModalOpen] = useState(false);
  const [newTierForm, setNewTierForm] = useState({
    name: '',
    min_discount: 0,
    max_discount: 10,
    auto_approval: false,
    max_approver_level: 'Sales Manager'
  });

  const fetchGovernanceData = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/discount-rules/governance');
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setMatrix(json.data);
        }
      }
    } catch (err) {
      console.error('Fetch governance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const selectedTier = useMemo(() => {
    return matrix?.tiers?.find(t => t.id === selectedTierId) || matrix?.tiers?.[2] || null;
  }, [matrix, selectedTierId]);

  // Handle tier edit form change
  const handleTierFormChange = (field, value) => {
    if (!matrix || !selectedTier) return;
    const updatedTiers = matrix.tiers.map(t => {
      if (t.id === selectedTier.id) {
        return { ...t, [field]: value };
      }
      return t;
    });
    setMatrix({ ...matrix, tiers: updatedTiers });
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/discount-rules/governance/save', {
        method: 'POST',
        body: JSON.stringify(matrix)
      });
      const json = await res.json();
      if (res.ok) {
        alert(json.message || 'Governance Matrix saved successfully!');
        if (json.data) setMatrix(json.data);
      } else {
        alert('Failed to save governance matrix');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving governance matrix.');
    } finally {
      setSaving(false);
    }
  };

  // Add new tier
  const handleAddTier = (e) => {
    e.preventDefault();
    if (!newTierForm.name) return;
    const newId = `DISC-TIER-0${(matrix?.tiers?.length || 0) + 1}`;
    const newTierObj = {
      id: newId,
      name: newTierForm.name,
      min_discount: Number(newTierForm.min_discount),
      max_discount: Number(newTierForm.max_discount),
      auto_approval: newTierForm.auto_approval,
      approval_required: !newTierForm.auto_approval,
      max_approver_level: newTierForm.max_approver_level,
      status: 'Active',
      margin_floor: 15.0,
      applies_to: 'All Accounts'
    };

    setMatrix(prev => ({
      ...prev,
      tiers: [...(prev?.tiers || []), newTierObj]
    }));
    setSelectedTierId(newId);
    setIsAddTierModalOpen(false);
    setNewTierForm({ name: '', min_discount: 0, max_discount: 10, auto_approval: false, max_approver_level: 'Sales Manager' });
  };

  // Add Step to chain
  const handleAddChainStep = () => {
    const nextNum = (matrix?.chainSteps?.length || 0) + 1;
    const newStep = {
      step: nextNum,
      title: `Step ${nextNum} Approver`,
      trigger: `Discount > ${nextNum * 5}.0%`,
      assigned: 'Designated Role',
      sla: 'Escalate after 24 Hours'
    };
    setMatrix(prev => ({
      ...prev,
      chainSteps: [...(prev?.chainSteps || []), newStep]
    }));
  };

  // Remove Step from chain
  const handleRemoveChainStep = (stepNum) => {
    setMatrix(prev => ({
      ...prev,
      chainSteps: prev.chainSteps.filter(s => s.step !== stepNum).map((s, idx) => ({ ...s, step: idx + 1 }))
    }));
  };

  // Live Simulator computation
  const simulationResult = useMemo(() => {
    const disc = Number(simDiscount) || 0;
    if (disc <= 5.0) {
      return {
        passed: ['Tier 1 (5%): Passed - Auto Approved'],
        required: [],
        routing: 'Auto-Approved (No Escalation)',
        sla: 'Instant Auto-Approve'
      };
    } else if (disc <= 10.0) {
      return {
        passed: ['Tier 1 (5%): Passed'],
        required: ['Tier 2 (10%): Sales Manager Approval Required'],
        routing: 'Sales Manager (Direct Team Lead)',
        sla: '12.0 hrs target'
      };
    } else if (disc <= 15.0) {
      return {
        passed: ['Tier 1 (5%): Passed', 'Tier 2 (10%): Passed'],
        required: ['Tier 3 (15%): Regional Sales Manager Required'],
        routing: 'Regional Sales Leadership (Alex Vance)',
        sla: '24.0 hrs target'
      };
    } else if (disc <= 20.0) {
      return {
        passed: ['Tier 1 (5%): Passed', 'Tier 2 (10%): Passed'],
        required: ['Tier 4: Regional Mgr & Finance Review Required'],
        routing: 'Alex Vance & Finance Desk',
        sla: '4.0 hrs target'
      };
    } else {
      return {
        passed: ['Tier 1 (5%): Passed', 'Tier 2 (10%): Passed', 'Tier 3 (15%): Passed'],
        required: ['Tier 5: Executive Committee & VP Sign-Off Required'],
        routing: 'VP Sales & Executive Committee (CFO)',
        sla: '48.0 hrs target'
      };
    }
  }, [simDiscount]);

  if (loading && !matrix) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <DashboardHeader activeTab="discount-rules" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">Loading Governance & Approval Chain Matrix...</p>
          </div>
        </div>
        <DashboardFooter />
      </div>
    );
  }

  const tiers = matrix?.tiers || [];
  const chainSteps = matrix?.chainSteps || [];
  const policyTriggers = matrix?.policyTriggers || {};
  const auditLog = matrix?.auditLog || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      <DashboardHeader activeTab="discount-rules" />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <span>DealFlow360</span>
              <span className="text-slate-300">/</span>
              <span>Settings</span>
              <span className="text-slate-300">/</span>
              <span>Sales Policies</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">Discount & Approval Rules</span>
            </nav>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Discount Tiers & Approval Chain</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {matrix?.status || 'Live in Production'}
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Configure discount thresholds and define multi-level approval workflows for commercial pricing exceptions.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchGovernanceData}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs shadow-2xs cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveChanges}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Saving Matrix...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Sub Navigation Pills Tab Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            {['Discount Tiers', 'Approval Chain', 'Policy Settings', 'Audit & History'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-100/80'
                }`}
              >
                {tab}
                {tab === 'Approval Chain' && (
                  <span className="ml-2 px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
                    {chainSteps.length} Steps
                  </span>
                )}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono font-bold text-slate-400">
            {matrix?.version || 'v4.8.2'}
          </span>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Discount Tier Configuration Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base font-bold text-slate-900">Discount Tier Configuration</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Define maximum discount limits and the approval requirements for each pricing tier.</p>
                </div>

                <button 
                  onClick={() => setIsAddTierModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Discount Tier
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">TIER</th>
                      <th className="px-4 py-3">DISCOUNT RANGE</th>
                      <th className="px-4 py-3 text-center">AUTO APPROVAL</th>
                      <th className="px-4 py-3 text-center">APPROVAL REQUIRED</th>
                      <th className="px-4 py-3">MAX APPROVER LEVEL</th>
                      <th className="px-4 py-3 text-center">STATUS</th>
                      <th className="px-4 py-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {tiers.map(t => {
                      const isSelected = selectedTier?.id === t.id;
                      return (
                        <tr 
                          key={t.id} 
                          onClick={() => setSelectedTierId(t.id)}
                          className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/60 font-semibold' : 'hover:bg-slate-50/60'}`}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{t.name}</span>
                              {isSelected && (
                                <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-blue-600 text-white rounded">
                                  SELECTED
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-900">
                            {t.min_discount}% – {t.max_discount >= 100 ? 'Above 20.0%' : `${t.max_discount}%`}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {t.auto_approval ? (
                              <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">Yes</span>
                            ) : (
                              <span className="text-slate-400 font-semibold">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {t.approval_required ? (
                              <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-md">Yes</span>
                            ) : (
                              <span className="text-slate-400 font-semibold">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-800">
                            {t.max_approver_level}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                              <button 
                                onClick={() => setSelectedTierId(t.id)}
                                className={`text-xs font-bold ${isSelected ? 'text-blue-600 font-extrabold' : 'text-blue-600 hover:underline'}`}
                              >
                                {isSelected ? 'Editing' : 'Edit'}
                              </button>
                              <button 
                                onClick={() => {
                                  const dup = { ...t, id: `DISC-TIER-0${tiers.length + 1}`, name: `${t.name} (Copy)` };
                                  setMatrix(prev => ({ ...prev, tiers: [...prev.tiers, dup] }));
                                }}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline"
                              >
                                Duplicate
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Edit Tier Panel (Interactive Form Editor) */}
            {selectedTier && (
              <div className="bg-white rounded-2xl border border-blue-200/90 p-6 shadow-xs space-y-4 relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      Edit Tier: {selectedTier.name} <span className="text-xs text-slate-500 font-normal">({selectedTier.id})</span>
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                      Selected for Editing
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Rule ID: #{selectedTier.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tier Name</label>
                    <input 
                      type="text" 
                      value={selectedTier.name}
                      onChange={e => handleTierFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select 
                      value={selectedTier.status}
                      onChange={e => handleTierFormChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 font-medium"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Minimum Discount Threshold</label>
                    <input 
                      type="number" step="0.1"
                      value={selectedTier.min_discount}
                      onChange={e => handleTierFormChange('min_discount', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Maximum Discount Threshold</label>
                    <input 
                      type="number" step="0.1"
                      value={selectedTier.max_discount}
                      onChange={e => handleTierFormChange('max_discount', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Approval Required</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTierFormChange('approval_required', !selectedTier.approval_required)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                          selectedTier.approval_required 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        {selectedTier.approval_required ? 'Enabled' : 'Disabled'}
                      </button>
                      <span className="text-slate-500 text-[11px]">Quotes require formal sign-off</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Required Approver Level</label>
                    <select 
                      value={selectedTier.max_approver_level}
                      onChange={e => handleTierFormChange('max_approver_level', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 font-medium"
                    >
                      <option value="—">—</option>
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="Regional Sales Mgr">Regional Sales Manager (Tier-2)</option>
                      <option value="Finance Director">Finance Director</option>
                      <option value="VP / Executive Committee">VP / Executive Committee</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Maximum Allowed Margin Reduction</label>
                    <input 
                      type="number" step="0.1"
                      value={selectedTier.margin_floor || 8.0}
                      onChange={e => handleTierFormChange('margin_floor', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 font-bold"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Prevents quotation if gross margin falls below minimum floor</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Applies To</label>
                    <select 
                      value={selectedTier.applies_to || 'All Enterprise & Mid-Market Accounts'}
                      onChange={e => handleTierFormChange('applies_to', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 font-medium"
                    >
                      <option value="All Accounts">All Accounts</option>
                      <option value="All Enterprise & Mid-Market Accounts">All Enterprise & Mid-Market Accounts</option>
                      <option value="Strategic Key Accounts">Strategic Key Accounts</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button 
                    onClick={fetchGovernanceData}
                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs cursor-pointer"
                  >
                    Revert
                  </button>
                  <button 
                    onClick={() => alert('Tier changes applied to draft matrix!')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Apply to Draft
                  </button>
                </div>
              </div>
            )}

            {/* 3. Additional Policy Conditions & Commercial Triggers Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Additional Policy Conditions & Commercial Triggers</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Global guardrails that trigger approval requests regardless of base discount tier.</p>
                </div>
                <span className="text-xs font-mono text-slate-400 font-medium">Matrix: {matrix?.matrixCode || 'AUTH-502'}</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Condition 1 */}
                <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={policyTriggers.require_limit_approval ?? true}
                      onChange={e => setMatrix({ ...matrix, policyTriggers: { ...policyTriggers, require_limit_approval: e.target.checked } })}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Require approval when discount exceeds customer-specific negotiated limit</span>
                      <span className="text-slate-500 text-[11px]">Compares requested deal discount against client master service contract terms.</span>
                    </div>
                  </label>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs whitespace-nowrap">
                    Customer Tier Policy Matrix v2
                  </span>
                </div>

                {/* Condition 2 */}
                <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={policyTriggers.require_margin_approval ?? true}
                      onChange={e => setMatrix({ ...matrix, policyTriggers: { ...policyTriggers, require_margin_approval: e.target.checked } })}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Require approval when final gross margin falls below threshold floor</span>
                      <span className="text-slate-500 text-[11px]">Enforces finance margin governance rule #MARGIN-204 across all SKU bundles.</span>
                    </div>
                  </label>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs whitespace-nowrap">
                    Minimum Gross Margin: {policyTriggers.margin_threshold || 25.0}%
                  </span>
                </div>

                {/* Condition 3 */}
                <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={policyTriggers.require_high_value_approval ?? true}
                      onChange={e => setMatrix({ ...matrix, policyTriggers: { ...policyTriggers, require_high_value_approval: e.target.checked } })}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Require approval for high-value contract quotations</span>
                      <span className="text-slate-500 text-[11px]">Elevates authority when total contract commitment crosses enterprise cap.</span>
                    </div>
                  </label>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs whitespace-nowrap">
                    High Value Deal Threshold: ₹{(policyTriggers.high_value_threshold || 1000000).toLocaleString()}
                  </span>
                </div>

                {/* Condition 4 (Disabled) */}
                <div className="p-3.5 bg-slate-100/50 border border-slate-200/50 rounded-xl flex items-center justify-between opacity-75">
                  <label className="flex items-start gap-3 cursor-not-allowed">
                    <input 
                      type="checkbox" 
                      checked={policyTriggers.allow_rep_override ?? false}
                      disabled
                      className="mt-0.5 rounded border-slate-300 text-slate-400 cursor-not-allowed" 
                    />
                    <div>
                      <span className="font-bold text-slate-700 block">Allow direct sales reps to override standard policy limits without managerial review</span>
                      <span className="text-rose-600 text-[11px]">Restricted by corporate governance matrix AUTH-502</span>
                    </div>
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400 italic">
                    Disabled by Admin Policy
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="space-y-6">
            
            {/* 1. Approval Chain Sequence Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Approval Chain Sequence</h3>
                  <p className="text-[11px] text-slate-500">Sequential approver routing executed when discount triggers fire.</p>
                </div>
                <button 
                  onClick={handleAddChainStep}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition cursor-pointer"
                >
                  + Add Step
                </button>
              </div>

              <div className="space-y-3 relative">
                {chainSteps.map((step, idx) => (
                  <React.Fragment key={step.step}>
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2 relative group hover:border-blue-300 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold flex items-center justify-center">
                            {step.step}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{step.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              const newTitle = prompt('Edit Step Title:', step.title);
                              if (newTitle) {
                                const newSteps = chainSteps.map(s => s.step === step.step ? { ...s, title: newTitle } : s);
                                setMatrix({ ...matrix, chainSteps: newSteps });
                              }
                            }}
                            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleRemoveChainStep(step.step)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs space-y-1 pl-8">
                        <div className="text-slate-700">
                          <strong className="text-slate-900">Trigger:</strong> {step.trigger}
                        </div>
                        <div className="text-slate-500">
                          <strong>Assigned:</strong> {step.assigned}
                        </div>
                        <div className="text-rose-600 font-semibold text-[11px]">
                          SLA: {step.sla}
                        </div>
                      </div>
                    </div>

                    {idx < chainSteps.length - 1 && (
                      <div className="flex justify-center my-1">
                        <ArrowDown className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 2. Policy Flow Preview (Rule Simulator) Widget */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Policy Flow Preview</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400">Rule Simulator</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Test Quotation Discount %:</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" step="0.5"
                      value={simDiscount}
                      onChange={e => setSimDiscount(e.target.value)}
                      className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-slate-500">e.g. 18.0% (QT-16482)</span>
                  </div>
                </div>

                <div className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-xl space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">
                    Sample Case: <strong className="text-blue-700 font-mono">Quotation Discount: {simDiscount}%</strong>
                  </span>
                  
                  <div className="space-y-1 font-mono text-[11px]">
                    {simulationResult.passed.map((p, idx) => (
                      <div key={idx} className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> ↳ {p}
                      </div>
                    ))}
                    {simulationResult.required.map((r, idx) => (
                      <div key={idx} className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> ↳ {r}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-baseline text-xs">
                    <span className="text-slate-500 font-medium">Expected Routing:</span>
                    <strong className="text-slate-900 font-bold">{simulationResult.routing}</strong>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="text-slate-400">Next SLA Window:</span>
                    <span className="text-blue-600 font-semibold">{simulationResult.sla}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Current Policy Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3 text-xs">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Current Policy Summary</h3>
              
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Active Discount Tiers</span>
                <strong className="text-slate-900 text-sm font-bold">{tiers.length}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <span className="text-slate-500">Configured Approval Levels</span>
                <strong className="text-slate-900 text-sm font-bold">{chainSteps.length}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <span className="text-slate-500">Max Auto-Approved Discount</span>
                <strong className="text-emerald-600 text-sm font-bold">5.0%</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <span className="text-slate-500">Highest Escalation Authority</span>
                <strong className="text-slate-900 font-bold">VP / Exec Committee</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <span className="text-slate-500">Policy Version</span>
                <strong className="text-blue-700 font-mono font-bold">{matrix?.version || 'v4.8.2'}</strong>
              </div>
            </div>

            {/* 4. Recent Policy Changes (Audit Log) Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Recent Policy Changes</h3>
                <span className="text-[11px] text-slate-400 font-medium">Audit Log</span>
              </div>

              <div className="space-y-2.5">
                {auditLog.map(item => (
                  <div key={item.id} className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <strong className="text-slate-800 font-bold">{item.author}</strong>
                      <span className="text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Policy Enforcement Notice Footer Banner */}
        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-900 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Policy Enforcement Notice:</strong> Changes to discount policies and approval chains will immediately govern newly created quotations. Existing pending approval requests (such as APR-10482) will continue following the snapshot policy active at time of submission.
          </p>
        </div>

      </main>

      {/* Add Discount Tier Modal */}
      {isAddTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Discount Tier</h3>
              <button onClick={() => setIsAddTierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTier} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tier Name</label>
                <input 
                  type="text" 
                  value={newTierForm.name}
                  onChange={e => setNewTierForm({ ...newTierForm, name: e.target.value })}
                  placeholder="e.g. Senior VP Sign-Off"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Discount (%)</label>
                  <input 
                    type="number" step="0.1"
                    value={newTierForm.min_discount}
                    onChange={e => setNewTierForm({ ...newTierForm, min_discount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Discount (%)</label>
                  <input 
                    type="number" step="0.1"
                    value={newTierForm.max_discount}
                    onChange={e => setNewTierForm({ ...newTierForm, max_discount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Approver Level</label>
                <select 
                  value={newTierForm.max_approver_level}
                  onChange={e => setNewTierForm({ ...newTierForm, max_approver_level: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Regional Sales Mgr">Regional Sales Manager (Tier-2)</option>
                  <option value="Finance Director">Finance Director</option>
                  <option value="VP / Executive Committee">VP / Executive Committee</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddTierModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer">
                  Add Tier
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
