import type { ExploreVideo } from '../../types/video/exploreVideo.ts';

interface ExploreCardProps {
    video: ExploreVideo;
    onClick?: () => void;
}

export default function ExploreCard({ video, onClick }: ExploreCardProps) {
    return (
        <div
            className="explore-card"
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
            aria-label={onClick ? `Open ${video.title}` : undefined}
        >
            <video className="explore-card-thumb" autoPlay loop muted playsInline>
                <source src={video.videoUrl} type="video/mp4" />
            </video>
            <h2 className="explore-card-title">{video.title}</h2>
            <p className="explore-card-text">{video.subtitle}</p>
        </div>
    );
}
