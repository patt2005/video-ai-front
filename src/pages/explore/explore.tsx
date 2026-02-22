import '../../styles/explore.css';
import { Link } from 'react-router-dom';
import longCardIcon from '../../assets/longcardicon.png';
import { exploreVideos, previewVideos } from '../../_mock/videos.ts';
import ExploreCard from './exploreCard';

export default function Explore() {
    return (
        <div className="page-wrapper">
            <p className="explore-description">
              Follow your dream creating Videos wit MovyAI
            </p>
            <div className="explore-cards-row">
                {exploreVideos.map((video) => (
                    <ExploreCard key={video.title} video={video} />
                ))}
            </div>
            <div className="explore-full-card">
                <img src={longCardIcon} alt="icon" className="explore-full-icon" />
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
                {previewVideos.slice(0, 7).map((video, index) => (
                    <div
                        key={`${video.videoUrl}-${index}`}
                        className={`explore-grid-item${index === 3 || index === 6 ? ' explore-grid-item--wide' : ''}`}
                    >
                        <video className="explore-grid-item-thumb" autoPlay loop muted playsInline>
                            <source src={video.videoUrl} type="video/mp4" />
                        </video>
                    </div>
                ))}
            </div>
        </div>
    )
}
