import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken, getUserRole, getDefaultRouteForRole } from '../../utils/auth';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const token = getAuthToken();
  const userRole = getUserRole();
  const location = useLocation();

  // If no auth token, redirect to Login / Signup page
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified and user's role is not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    const defaultRoute = getDefaultRouteForRole(userRole);

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            🚫
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Your assigned role <strong className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{userRole || 'UNKNOWN'}</strong> does not have permission to view screen: <code className="text-slate-800 font-mono">{location.pathname}</code>.
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1 mb-6">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">Permitted Roles:</span>
            <div className="flex flex-wrap gap-1">
              {allowedRoles.map(r => (
                <span key={r} className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[11px] border border-blue-200">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <a
            href={defaultRoute}
            className="inline-block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
          >
            Go to Your Dashboard ({userRole})
          </a>
        </div>
      </div>
    );
  }

  return children;
}
