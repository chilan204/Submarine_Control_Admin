export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0a1628]/75 border border-[#00ffaa]/10 rounded-2xl backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}
