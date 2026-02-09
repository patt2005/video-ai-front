import './Explore.css';
import { Link } from 'react-router-dom';
import longCardIcon from '../../assets/longcardicon.png';
import video1 from '../../assets/video1.mp4';
import video2 from '../../assets/video2.mp4';
import video3 from '../../assets/video3.mp4';
import video4 from '../../assets/video4.mp4';
import video5 from '../../assets/video5.mp4';
import video6 from '../../assets/video6.mp4';
import video7 from '../../assets/video7.mp4';
import video8 from '../../assets/video8.mp4';

export default function Explore() {
    return (
        <div className="page-wrapper explore-wrapper">
            <p className="explore-description">
              Follow your dream creating Videos wit MovyAI
            </p>
            <div className="explore-cards-row">
                <div className="explore-card">
                    <video className="explore-card-thumb" autoPlay loop muted playsInline>
                        <source src={video1} type="video/mp4" />
                    </video>
                    <h2 className="explore-card-title">Feel the Time</h2>
                    <p className="explore-card-text">Explore impressive features fast and secure.</p>
                </div>
                <div className="explore-card">
                    <video className="explore-card-thumb" autoPlay loop muted playsInline>
                        <source src={video2} type="video/mp4" />
                    </video>
                    <h2 className="explore-card-title">Nature's Beauty</h2>
                    <p className="explore-card-text">Immerse yourself in serene landscapes and natural wonders.</p>
                </div>
                <div className="explore-card">
                    <video className="explore-card-thumb" autoPlay loop muted playsInline>
                        <source src={video3} type="video/mp4" />
                    </video>
                    <h2 className="explore-card-title">Artistic Vision</h2>
                    <p className="explore-card-text">Transform everyday moments into extraordinary visual experiences.</p>
                </div>
                <div className="explore-card">
                    <video className="explore-card-thumb" autoPlay loop muted playsInline>
                        <source src={video4} type="video/mp4" />
                    </video>
                    <h2 className="explore-card-title">Creative Flow</h2>
                    <p className="explore-card-text">Unleash your creativity with artistic effects and unique compositions.</p>
                </div>
                <div className="explore-card">
                    <video className="explore-card-thumb" autoPlay loop muted playsInline>
                        <source src={video5} type="video/mp4" />
                    </video>
                    <h2 className="explore-card-title">Motion Graphics</h2>
                    <p className="explore-card-text">Dynamic animations that bring your stories to life with style.</p>
                </div>
                <div className="explore-card">
                    <video className="explore-card-thumb" autoPlay loop muted playsInline>
                        <source src={video6} type="video/mp4" />
                    </video>
                    <h2 className="explore-card-title">Epic Moments</h2>
                    <p className="explore-card-text">Capture unforgettable scenes with cinematic quality and impact.</p>
                </div>
                <div className="explore-card">
                    <video className="explore-card-thumb" autoPlay loop muted playsInline>
                        <source src={video7} type="video/mp4" />
                    </video>
                    <h2 className="explore-card-title">Lifestyle Stories</h2>
                    <p className="explore-card-text">Capture viral characters</p>
                </div>
                <div className="explore-card">
                    <video className="explore-card-thumb" autoPlay loop muted playsInline>
                        <source src={video8} type="video/mp4" />
                    </video>
                    <h2 className="explore-card-title">Abstract Art</h2>
                    <p className="explore-card-text">Experiment with colors, shapes, and mesmerizing visual pattern.</p>
                </div>
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
