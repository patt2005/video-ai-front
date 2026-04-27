import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/explore.css';
import type { ExploreVideo } from '../../types/video/exploreVideo';
import ExploreCard from './exploreCard';
import { ExploreVideoModal } from '../../components/modals/exploreVideoModal';
import longCardIcon from '../../assets/longcardicon.png';
import { exploreService } from '../../services/exploreService';

export default function Explore() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<ExploreVideo | null>(null);
    const [videos, setVideos] = useState<ExploreVideo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const videos = await exploreService.getAll();
                setVideos(videos);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const handleCardClick = (video: ExploreVideo) => {
        setSelectedVideo(video);
        setModalOpen(true);
    };

    if (loading) {
        return (
            <div className="explore-loading-screen">
                <div className="explore-spinner" />
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <p className="explore-description">
              Follow your dreams
            </p>
            <div className="explore-cards-row">
                {videos.map((video) => (
                    <ExploreCard
                        key={video.title}
                        video={video}
                        onClick={() => handleCardClick(video)}
                    />
                ))}
            </div>
            <div className="explore-full-card">
                <span className="explore-full-icon" aria-hidden="true">
                    <img src={longCardIcon} alt="icon" className="explore-full-icon" />
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
                {[...videos, ...videos].slice(0, 7).map((video, index) => (
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
