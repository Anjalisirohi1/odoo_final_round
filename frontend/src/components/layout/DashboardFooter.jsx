export default function DashboardFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div>
          © 2025 DealFlow360 Technologies, Inc. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a className="hover:text-slate-800 transition" href="#">Privacy Policy</a>
          <a className="hover:text-slate-800 transition" href="#">Terms of Service</a>
          <a className="hover:text-slate-800 transition" href="#">Security Controls</a>
          <a className="hover:text-slate-800 transition" href="#">Enterprise Support</a>
        </div>
      </div>
    </footer>
  );
}
