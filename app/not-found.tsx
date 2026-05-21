import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] sm:text-[160px] font-black leading-none select-none"
             style={{ WebkitTextStroke: "2px #ff6b35", color: "transparent" }}>
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[16px] font-bold text-gray-400 bg-dark px-4">PAGE NOT FOUND</span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white mb-3">This part doesn&apos;t exist</h1>
        <p className="text-gray-500 text-[14px] leading-relaxed mb-8">
          Looks like this page drove off the lot. Try searching for what you need,
          or head back to the home page.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-6 py-3 rounded-xl transition-colors text-[14px]"
          >
            <Home size={16} />
            Go Home
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 bg-dark-secondary hover:bg-dark-card border border-dark-border text-white font-bold px-6 py-3 rounded-xl transition-colors text-[14px]"
          >
            <Search size={16} />
            Search Parts
          </Link>
          <Link
            href="/browse"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-[14px] font-medium transition-colors"
          >
            <ArrowLeft size={14} />
            Browse All
          </Link>
        </div>
      </div>
    </div>
  );
}
