import '../../styles/Explore.css';
import { Link } from 'react-router-dom';
import longCardIcon from '../../assets/longcardicon.png';
import { exploreVideos } from '../../_mock/videos.ts';

export default function Explore() {
    return (
        <div className="page-wrapper explore-wrapper">
            <p className="explore-description">
              Follow your dream creating Videos wit MovyAI
            </p>
            <div className="explore-cards-row">
                {exploreVideos.map((video) => (
                    <div className="explore-card" key={video.title}>
                        <video className="explore-card-thumb" autoPlay loop muted playsInline>
                            <source src={video.videoUrl} type="video/mp4" />
                        </video>
                        <h2 className="explore-card-title">{video.title}</h2>
                        <p className="explore-card-text">{video.subtitle}</p>
                    </div>
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
                <div className="explore-grid-item">01</div>
                <div className="explore-grid-item">02</div>
                <div className="explore-grid-item">03</div>
                <div className="explore-grid-item explore-grid-item--wide">04</div>
                <div className="explore-grid-item">05</div>
                <div className="explore-grid-item">06</div>
                <div className="explore-grid-item explore-grid-item--wide">07</div>
            </div>
        </div>
    )
}
