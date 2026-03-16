import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { exploreVideos } from '../../_mock/videos';
import '../../styles/explore.css';
import type { ExploreVideo } from '../../types/video/exploreVideo';
import ExploreCard from './exploreCard';
import { ExploreVideoModal } from '../../components/modals/exploreVideoModal';

export default function Explore() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<ExploreVideo | null>(null);

    const handleCardClick = (video: ExploreVideo) => {
        setSelectedVideo(video);
        setModalOpen(true);
    };

    return (
        <div className="page-wrapper">
            <p className="explore-description">
              Follow your dreams
            </p>
            <div className="explore-cards-row">
                {exploreVideos.map((video) => (
                    <ExploreCard
                        key={video.title}
                        video={video}
                        onClick={() => handleCardClick(video)}
                    />
                ))}
            </div>
            <div className="explore-full-card">
                <span className="explore-full-icon" aria-hidden="true">
                    <Icon icon="mdi:tag-percent" width={80} height={80} />
                </span>
                <div className="explore-full-thumb">
                    <h2 className="explore-full-title">CLICK NOW FOR EXCLUSIVE USE THE DISCOUNT</h2>
                    <p className="explore-full-text">Be the first to join our journey</p>
                </div>
                <Link to="/pricing" className="explore-full-button">
                    View Pricing
                </Link>
            </div>

            <h2 className="explore-section-title">Mixed Media</h2>

            <div className="explore-grid">
                {[...exploreVideos, ...exploreVideos].slice(0, 7).map((video, index) => (
                    <div
                        key={`${video.title}-${index}`}
                        role="button"
                        tabIndex={0}
                        className={`explore-grid-item${index === 3 || index === 6 ? ' explore-grid-item--wide' : ''}`}
                        onClick={() => handleCardClick(video)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleCardClick(video);
                            }
                        }}
                        aria-label={`Open ${video.title}`}
                    >
                        <video className="explore-grid-item-thumb" autoPlay loop muted playsInline>
                            <source src={video.videoUrl} type="video/mp4" />
                        </video>
                    </div>
                ))}
            </div>

            <ExploreVideoModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                video={selectedVideo}
            />
        </div>
    )
}
