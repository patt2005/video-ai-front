import type { ExploreVideo } from '../../types/video/exploreVideo';

interface ExploreCardProps {
    video: ExploreVideo;
}

export default function ExploreCard({ video }: ExploreCardProps) {
    return (
        <div className="explore-card">
            <video className="explore-card-thumb" autoPlay loop muted playsInline>
                <source src={video.videoUrl} type="video/mp4" />
            </video>
            <h2 className="explore-card-title">{video.title}</h2>
            <p className="explore-card-text">{video.subtitle}</p>
        </div>
    );
}
