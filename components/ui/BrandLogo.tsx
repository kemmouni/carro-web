import { cn } from "@/lib/utils";

interface BrandLogoProps {
  name:      string;
  className?: string;
  size?:      number;
}

/* ── Inline SVG brand logos (monochrome, white) ────────────────── */

function ToyotaLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 206 80" width={size} height={size * 0.388} fill="currentColor">
      <ellipse cx="103" cy="40" rx="103" ry="40" fillOpacity="0"/>
      {/* Outer oval */}
      <path d="M103 7C57 7 19 22 19 40s38 33 84 33 84-15 84-33S149 7 103 7zm0 60C62 67 28 55 28 40s34-27 75-27 75 12 75 27-34 27-75 27z"/>
      {/* Center vertical oval */}
      <ellipse cx="103" cy="40" rx="17" ry="28" fill="none" stroke="currentColor" strokeWidth="6"/>
      {/* Left horizontal oval */}
      <ellipse cx="65" cy="30" rx="38" ry="18" fill="none" stroke="currentColor" strokeWidth="6"/>
      {/* Right horizontal oval */}
      <ellipse cx="141" cy="30" rx="38" ry="18" fill="none" stroke="currentColor" strokeWidth="6"/>
    </svg>
  );
}

function NissanLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 220 60" width={size} height={size * 0.273} fill="currentColor">
      <rect x="2" y="2" width="216" height="56" rx="28" ry="28" fill="none" stroke="currentColor" strokeWidth="4"/>
      <rect x="2" y="27" width="216" height="6" fill="currentColor"/>
      <text x="110" y="46" textAnchor="middle" fontSize="28" fontWeight="bold" fontFamily="Arial, sans-serif" fill="currentColor" stroke="none">NISSAN</text>
    </svg>
  );
}

function BMWLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="currentColor">
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4"/>
      <line x1="50" y1="2" x2="50" y2="98" stroke="currentColor" strokeWidth="4"/>
      <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="4"/>
      <text x="50" y="40" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="Arial" fill="currentColor">BMW</text>
    </svg>
  );
}

function MercedesLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="currentColor">
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="4"/>
      <polygon points="50,8 76,62 24,62" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
    </svg>
  );
}

function LexusLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} fill="currentColor">
      <ellipse cx="80" cy="40" rx="78" ry="38" fill="none" stroke="currentColor" strokeWidth="4"/>
      <text x="80" y="52" textAnchor="middle" fontSize="38" fontWeight="300" fontFamily="Georgia, serif" fill="currentColor" letterSpacing="2">L</text>
    </svg>
  );
}

function HondaLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 72" width={size * 0.83} height={size} fill="currentColor">
      <path d="M4 68V4h14v24h24V4h14v64H42V36H18v32z"/>
    </svg>
  );
}

function KiaLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 60" width={size} height={size * 0.3} fill="currentColor">
      <rect x="2" y="2" width="196" height="56" rx="6" fill="none" stroke="currentColor" strokeWidth="3"/>
      <text x="100" y="44" textAnchor="middle" fontSize="36" fontWeight="bold" fontFamily="Arial, sans-serif" fill="currentColor" letterSpacing="6">KIA</text>
    </svg>
  );
}

function HyundaiLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 60" width={size} height={size * 0.6} fill="currentColor">
      <ellipse cx="50" cy="30" rx="48" ry="28" fill="none" stroke="currentColor" strokeWidth="3"/>
      <text x="50" y="40" textAnchor="middle" fontSize="34" fontStyle="italic" fontWeight="bold" fontFamily="Arial, sans-serif" fill="currentColor">H</text>
    </svg>
  );
}

function FordLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 80" width={size} height={size * 0.4} fill="currentColor">
      <ellipse cx="100" cy="40" rx="98" ry="38" fill="none" stroke="currentColor" strokeWidth="4"/>
      <text x="100" y="54" textAnchor="middle" fontSize="40" fontStyle="italic" fontFamily="Georgia, serif" fill="currentColor">Ford</text>
    </svg>
  );
}

function AudiLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 60" width={size} height={size * 0.3} fill="currentColor">
      {[0, 46, 92, 138].map((x) => (
        <circle key={x} cx={x + 30} cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="5"/>
      ))}
    </svg>
  );
}

function GenericLogo({ name, size }: { name: string; size: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full border-2 border-current font-black"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name[0]}
    </div>
  );
}

const LOGO_MAP: Record<string, (props: { size: number }) => React.ReactElement> = {
  toyota:         ({ size }) => <ToyotaLogo size={size} />,
  nissan:         ({ size }) => <NissanLogo size={size} />,
  bmw:            ({ size }) => <BMWLogo size={size} />,
  "mercedes-benz":({ size }) => <MercedesLogo size={size} />,
  mercedes:       ({ size }) => <MercedesLogo size={size} />,
  lexus:          ({ size }) => <LexusLogo size={size} />,
  honda:          ({ size }) => <HondaLogo size={size} />,
  kia:            ({ size }) => <KiaLogo size={size} />,
  hyundai:        ({ size }) => <HyundaiLogo size={size} />,
  ford:           ({ size }) => <FordLogo size={size} />,
  audi:           ({ size }) => <AudiLogo size={size} />,
};

export function BrandLogo({ name, className, size = 48 }: BrandLogoProps) {
  const key   = name.toLowerCase();
  const Logo  = LOGO_MAP[key];
  const inner = Logo
    ? <Logo size={size} />
    : <GenericLogo name={name} size={size} />;

  return (
    <span className={cn("text-white flex items-center justify-center", className)}>
      {inner}
    </span>
  );
}
