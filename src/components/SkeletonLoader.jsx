import './SkeletonLoader.css'

// Skeleton Card for Projects and Blog
export function SkeletonCard() {
    return (
        <div className="skeleton-card bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            {/* Image Skeleton */}
            <div className="skeleton-image w-full h-56 bg-slate-700/50"></div>

            {/* Content Skeleton */}
            <div className="p-6 space-y-4">
                {/* Title */}
                <div className="skeleton-line h-7 w-3/4 bg-slate-700/50 rounded-lg"></div>

                {/* Description */}
                <div className="space-y-2">
                    <div className="skeleton-line h-4 w-full bg-slate-700/50 rounded"></div>
                    <div className="skeleton-line h-4 w-5/6 bg-slate-700/50 rounded"></div>
                </div>

                {/* Tech Stack / Tags */}
                <div className="flex flex-wrap gap-2">
                    <div className="skeleton-tag h-7 w-20 bg-slate-700/50 rounded-lg"></div>
                    <div className="skeleton-tag h-7 w-24 bg-slate-700/50 rounded-lg"></div>
                    <div className="skeleton-tag h-7 w-16 bg-slate-700/50 rounded-lg"></div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-2">
                    <div className="skeleton-button flex-1 h-12 bg-slate-700/50 rounded-xl"></div>
                    <div className="skeleton-button flex-1 h-12 bg-slate-700/50 rounded-xl"></div>
                </div>
            </div>
        </div>
    )
}

// Multiple Skeleton Cards
export function SkeletonGrid({ count = 6, columns = 3 }) {
    const gridClass = columns === 2
        ? "grid grid-cols-1 md:grid-cols-2 gap-8"
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"

    return (
        <div className={gridClass}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    )
}
