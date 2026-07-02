export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-white text-slate-900 print:static print:overflow-visible">
      {children}
    </div>
  );
}
