export default function Footer() {
  return (
    <footer className="relative z-10 w-full py-4 border-t border-slate-200 bg-white/80 backdrop-blur-sm text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>© 2025 DealFlow360 Technologies, Inc. All rights reserved.</div>
        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <a className="hover:text-slate-900 transition-colors" href="#privacy">Privacy Policy</a>
          <a className="hover:text-slate-900 transition-colors" href="#terms">Terms of Service</a>
          <a className="hover:text-slate-900 transition-colors" href="#security">Security Controls</a>
        </div>
      </div>
    </footer>
  );
}
