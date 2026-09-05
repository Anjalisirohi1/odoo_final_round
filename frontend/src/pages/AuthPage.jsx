import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AuthFeatures from '../components/auth/AuthFeatures';
import AuthForm from '../components/auth/AuthForm';

export default function AuthPage() {
  return (
    <div className="h-full font-sans antialiased text-slate-800 bg-slate-50 flex flex-col min-h-screen relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Canvas Grid */}
      <div aria-hidden="true" className="fixed inset-0 subtle-grid pointer-events-none z-0"></div>
      <div aria-hidden="true" className="fixed inset-0 glow-effect pointer-events-none z-0"></div>

      <Header />

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10" data-purpose="main-auth-container">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <AuthFeatures />
          <AuthForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
