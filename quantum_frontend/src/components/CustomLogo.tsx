export function CustomLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background fill for inner area */}
      <polygon points="50,22 70,30 78,50 70,70 50,78 30,70 22,50 30,30" fill="#1e40af" fillOpacity="0.1" />

      {/* Outer octagon */}
      <polygon points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      
      {/* Inner octagon */}
      <polygon points="50,22 70,30 78,50 70,70 50,78 30,70 22,50 30,30" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      
      {/* Connecting lines */}
      <line x1="50" y1="5" x2="50" y2="22" stroke="currentColor" strokeWidth="3" />
      <line x1="82" y1="18" x2="70" y2="30" stroke="currentColor" strokeWidth="3" />
      <line x1="95" y1="50" x2="78" y2="50" stroke="currentColor" strokeWidth="3" />
      <line x1="82" y1="82" x2="70" y2="70" stroke="currentColor" strokeWidth="3" />
      <line x1="50" y1="95" x2="50" y2="78" stroke="currentColor" strokeWidth="3" />
      <line x1="18" y1="82" x2="30" y2="70" stroke="currentColor" strokeWidth="3" />
      <line x1="5" y1="50" x2="22" y2="50" stroke="currentColor" strokeWidth="3" />
      <line x1="18" y1="18" x2="30" y2="30" stroke="currentColor" strokeWidth="3" />

      {/* Nodes on outer */}
      <circle cx="50" cy="5" r="4.5" fill="#0f172a" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="82" cy="18" r="4.5" fill="#0f172a" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="95" cy="50" r="4.5" fill="#0f172a" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="82" cy="82" r="4.5" fill="#0f172a" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="50" cy="95" r="4.5" fill="#0f172a" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="18" cy="82" r="4.5" fill="#0f172a" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="5" cy="50" r="4.5" fill="#0f172a" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="18" cy="18" r="4.5" fill="#0f172a" stroke="currentColor" strokeWidth="2.5" />
      
      {/* Nodes on inner */}
      <circle cx="50" cy="22" r="3.5" fill="currentColor" />
      <circle cx="70" cy="30" r="3.5" fill="currentColor" />
      <circle cx="78" cy="50" r="3.5" fill="currentColor" />
      <circle cx="70" cy="70" r="3.5" fill="currentColor" />
      <circle cx="50" cy="78" r="3.5" fill="currentColor" />
      <circle cx="30" cy="70" r="3.5" fill="currentColor" />
      <circle cx="22" cy="50" r="3.5" fill="currentColor" />
      <circle cx="30" cy="30" r="3.5" fill="currentColor" />

      {/* Center atom orbits */}
      <ellipse cx="50" cy="50" rx="16" ry="5" transform="rotate(45 50 50)" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <ellipse cx="50" cy="50" rx="16" ry="5" transform="rotate(-45 50 50)" stroke="currentColor" strokeWidth="2.5" fill="none" />
      
      {/* Center core */}
      <circle cx="50" cy="50" r="5" fill="#a855f7" />
      <circle cx="51" cy="49" r="2" fill="#fff" fillOpacity="0.8" />
      <circle cx="48" cy="52" r="1.5" fill="#3b82f6" fillOpacity="0.9" />
    </svg>
  );
}
