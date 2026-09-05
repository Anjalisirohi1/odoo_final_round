import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthForm() {
  const [currentAuthMode, setCurrentAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const navigate = useNavigate();

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email') || '';
    const password = formData.get('password') || '';
    
    let isValid = true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailPattern.test(email.trim())) {
      setEmailError(true);
      isValid = false;
    } else {
      setEmailError(false);
    }

    if (password.length < 8) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }

    if (isValid) {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin 
        ? { email, password }
        : {
            fullName: formData.get('fullName'),
            companyName: formData.get('companyName'),
            email,
            password,
            teamSelector: formData.get('teamSelector')
          };

      try {
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Needed for HttpOnly refresh token cookie
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          // Save the access token (renaming key per new architecture instructions if we want, but sticking to dealflow_token for now, just saving accessToken instead)
          localStorage.setItem('dealflow_token', data.accessToken);
          
          const isCustomer = data.role === 'CUSTOMER';
          
          if (isCustomer) {
            navigate('/portal');
          } else {
            // Redirect internal staff to the Sales Dashboard
            navigate('/dashboard');
          }
        } else {
          alert(`Error: ${data.message || 'Authentication failed'}`);
        }
      } catch (error) {
        console.error('API Error:', error);
        alert('Failed to connect to the server. Please ensure the backend is running.');
      }
    }
  };

  const isLogin = currentAuthMode === 'login';

  return (
    <section className="lg:col-span-6 order-1 lg:order-2" data-purpose="auth-card-section">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400"></div>
        
        <div className="text-center pb-5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight" id="auth-main-title">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">Entry point for internal users and customers</p>
        </div>
        
        <div aria-label="Authentication Type" className="flex p-1 mb-6 rounded-xl bg-slate-100 border border-slate-200" role="tablist">
          <button 
            aria-selected={isLogin} 
            className={`flex-1 auth-tab-transition py-2.5 rounded-lg text-sm ${isLogin ? 'font-semibold text-slate-900 bg-white shadow-sm' : 'font-medium text-slate-600 hover:text-slate-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            onClick={() => setCurrentAuthMode('login')} role="tab" type="button">
            Log In
          </button>
          <button 
            aria-selected={!isLogin} 
            className={`flex-1 auth-tab-transition py-2.5 rounded-lg text-sm ${!isLogin ? 'font-semibold text-slate-900 bg-white shadow-sm' : 'font-medium text-slate-600 hover:text-slate-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            onClick={() => setCurrentAuthMode('signup')} role="tab" type="button">
            Sign Up
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <div className="w-full">
            <button className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-xs focus:ring-2 focus:ring-blue-500" type="button">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" fill="#EA4335"></path>
                <path d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" fill="#4285F4"></path>
                <path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.1-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" fill="#FBBC05"></path>
                <path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16C3.7 19.6 7.5 23 12 23z" fill="#34A853"></path>
              </svg>
              <span>Google Workspace</span>
            </button>
          </div>
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">or work email</span>
          </div>
        </div>

        <form className="space-y-4 mt-2" id="dealflow-auth-form" noValidate onSubmit={handleAuthSubmit}>
          {!isLogin && (
            <div className="space-y-4" id="signup-fields-container">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="full-name">Full Name</label>
                <div className="relative">
                  <input className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" id="full-name" name="fullName" placeholder="e.g. Sarah Jenkins" type="text"/>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="company-name">Company Name</label>
                  <input className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" id="company-name" name="companyName" placeholder="Acme Global Inc." type="text"/>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700" htmlFor="team-selector">Assigned Team / Unit</label>
                    <span className="text-[10px] text-blue-600 font-semibold">Multi-team setup</span>
                  </div>
                  <select className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none cursor-pointer" id="team-selector" name="teamSelector">
                    <option value="SALES_REP">SALES_REP (Enterprise / Channel)</option>
                    <option value="SALES_MANAGER">SALES_MANAGER (Deal Desk)</option>
                    <option value="FINANCE">FINANCE (Operations)</option>
                    <option value="CUSTOMER">CUSTOMER (Procurement)</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="auth-email">Email Address</label>
              <span className="text-[11px] text-slate-500 font-medium" id="email-hint">Corporate email required</span>
            </div>
            <div className="relative">
              <input className={`w-full bg-white border ${emailError ? 'border-rose-500' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none`} id="auth-email" name="email" placeholder="name@company.com" required type="email"/>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
            {emailError && <p className="text-xs text-rose-600 mt-1 font-medium" id="email-error">Please enter a valid work email address.</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="auth-password">Password</label>
              {isLogin && <a className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold" href="#forgot-password" id="forgot-password-link">Forgot Password?</a>}
            </div>
            <div className="relative">
              <input className={`w-full bg-white border ${passwordError ? 'border-rose-500' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none`} id="auth-password" name="password" placeholder="••••••••••••" required type={showPassword ? 'text' : 'password'}/>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <button aria-label="Toggle password visibility" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)} type="button">
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && <p className="text-xs text-rose-600 mt-1 font-medium" id="password-error">Password must contain at least 8 characters.</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input defaultChecked className="rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500/30 w-4 h-4" id="remember-device" type="checkbox"/>
              <span className="text-xs text-slate-600 font-medium">Remember this browser session (30 days)</span>
            </label>
          </div>

          <div className="pt-2">
            <button className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-150 flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" id="submit-auth-btn" type="submit">
              <span>{isLogin ? 'Log In to DealFlow360' : 'Create DealFlow360 Account'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
          </div>
        </form>

        <footer className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5" data-purpose="wireframe-specs-footer">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Company / team selector automatically configured for multi-team enterprise setups.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Input validation enforced for enterprise domain email &amp; password standards.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Sign Up link creates a new internal operator or customer buyer account.</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
