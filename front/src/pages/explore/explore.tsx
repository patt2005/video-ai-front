import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import '../../styles/explore.css';
import type { ExploreVideo } from '../../types/video/exploreVideo';
import ExploreCard from './exploreCard';
import { ExploreVideoModal } from '../../components/modals/exploreVideoModal';
import { exploreService } from '../../services/exploreService';
import { paths } from '../../routes/paths';

const PROMPTS = [
  'Crowd of cyclists in neon Tokyo rain, wide shot',
  'Aerial view of a misty Norwegian fjord at dawn',
  'Close-up of coffee blooming in slow motion',
  'Time-lapse of a city waking up at golden hour',
];

const BRANDS = ['NORTHWIND', 'Lumen & Co.', '// kindred', 'Atelier', 'PARALLEL', 'Field Notes', 'studio.eight'];

export default function Explore() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExploreVideo | null>(null);
  const [videos, setVideos] = useState<ExploreVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Animated placeholder typewriter
  const [displayText, setDisplayText] = useState('');
  const promptIndex = useRef(0);
  const charIndex = useRef(0);
  const deleting = useRef(false);

  useEffect(() => {
    const tick = () => {
      const current = PROMPTS[promptIndex.current];
      if (!deleting.current) {
        charIndex.current += 1;
        setDisplayText(current.slice(0, charIndex.current));
        if (charIndex.current === current.length) {
          deleting.current = true;
          return setTimeout(tick, 1800);
        }
      } else {
        charIndex.current -= 1;
        setDisplayText(current.slice(0, charIndex.current));
        if (charIndex.current === 0) {
          deleting.current = false;
          promptIndex.current = (promptIndex.current + 1) % PROMPTS.length;
        }
      }
      setTimeout(tick, deleting.current ? 28 : 52);
    };
    const t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    exploreService.getAll()
      .then(setVideos)
      .catch(console.error)
      .finally(() => setLoading(false));
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
    <div className="ex-page">

      {/* ── HERO ── */}
      <section className="ex-hero">
        <div className="ex-container">

          {/* Eyebrow badge */}
          <div className="ex-eyebrow">
            <span className="ex-eyebrow-tag">New</span>
            <span><b>MovyAI v3</b> — 4K cinematic video from a single prompt</span>
            <span className="ex-eyebrow-chev">→</span>
          </div>

          {/* Headline */}
          <h1 className="ex-hero-title">
            Films from a <em>sentence.</em>
          </h1>
          <p className="ex-hero-sub">
            Type an idea, get a finished video. MovyAI turns natural language into
            broadcast-quality footage, stills, and edits — in seconds, not weeks.
          </p>

          {/* Prompt bar */}
          <div
            className="ex-prompt"
            role="button"
            tabIndex={0}
            onClick={() => navigate(paths.video)}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(paths.video); }}
            aria-label="Try a prompt"
          >
            <div className="ex-prompt-text">
              <span>{displayText}</span>
              <span className="ex-caret" aria-hidden />
            </div>
            <div className="ex-prompt-chips">
              <span className="ex-chip">
                <Icon icon="mdi:video" width={12} />
                Video
              </span>
              <span className="ex-chip">16:9</span>
            </div>
            <button
              type="button"
              className="ex-go"
              aria-label="Generate"
              onClick={(e) => { e.stopPropagation(); navigate(paths.video); }}
            >
              <Icon icon="mdi:arrow-right" width={18} color="#fff" />
            </button>
          </div>

          {/* Meta row */}
          <div className="ex-meta">
            <span>No credit card</span>
            <span className="ex-dot" />
            <span>3 free renders / day</span>
            <span className="ex-dot" />
            <span>Commercial license</span>
          </div>
        </div>
      </section>

      {/* ── LOGO STRIP ── */}
      <section className="ex-logos">
        <div className="ex-container">
          <div className="ex-logos-label">Trusted by creative teams at</div>
          <div className="ex-logos-row">
            {BRANDS.map((b) => (
              <span key={b} className="ex-logo">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE: AI VIDEO ── */}
      <section className="ex-section">
        <div className="ex-container">
          <div className="ex-section-head">
            <div className="ex-section-left">
              <h2 className="ex-section-title">Made with MovyAI <em>by people like you.</em></h2>
              <p className="ex-section-sub">A living gallery of generations from our community. Click any tile to open the details.</p>
            </div>
            <div className="ex-section-right">
              <Link to={paths.image} className="ex-btn">Try Image</Link>
              <Link to={paths.video} className="ex-btn ex-btn--primary">
                Make a video
                <Icon icon="mdi:arrow-right" width={14} />
              </Link>
            </div>
          </div>

          {(() => {
            const videoItems = videos.filter(v => v.contentType === 'video');
            if (videoItems.length === 0) return null;
            return (
              <>
                <div className="ex-cards-row">
                  {videoItems.slice(0, 4).map((video) => (
                    <ExploreCard key={video.title} video={video} onClick={() => handleCardClick(video)} />
                  ))}
                </div>
                <div className="ex-grid">
                  {videoItems.slice(0, 7).map((video, index) => (
                    <div
                      key={`v-${video.title}-${index}`}
                      role="button"
                      tabIndex={0}
                      className={`ex-grid-item${index === 3 || index === 6 ? ' ex-grid-item--wide' : ''}`}
                      onClick={() => handleCardClick(video)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(video); } }}
                      aria-label={`Open ${video.title}`}
                    >
                      <video className="ex-grid-thumb" autoPlay loop muted playsInline>
                        <source src={video.videoUrl} type="video/mp4" />
                      </video>
                      <div className="ex-grid-meta">
                        <div className="ex-grid-title">{video.title}</div>
                        {video.prompt && <div className="ex-grid-sub">{video.prompt}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          {videos.filter(v => v.contentType === 'video').length === 0 && (
            <div className="ex-empty">
              <Icon icon="mdi:video-outline" width={48} />
              <p>No videos yet — be the first to generate one.</p>
              <Link to={paths.video} className="ex-btn ex-btn--primary">Generate video</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── SHOWCASE: AI IMAGE ── */}
      <section className="ex-section ex-section--image">
        <div className="ex-container">
          <div className="ex-section-head">
            <div className="ex-section-left">
              <h2 className="ex-section-title">Stills that <em>speak for themselves.</em></h2>
              <p className="ex-section-sub">AI-generated images from the community — from photorealistic portraits to surreal art.</p>
            </div>
            <div className="ex-section-right">
              <Link to={paths.image} className="ex-btn ex-btn--primary">
                Generate image
                <Icon icon="mdi:arrow-right" width={14} />
              </Link>
            </div>
          </div>

          {(() => {
            const imageItems = videos.filter(v => v.contentType === 'image');
            if (imageItems.length === 0) return null;
            return (
              <>
                <div className="ex-cards-row">
                  {imageItems.slice(0, 4).map((video) => (
                    <ExploreCard key={video.title} video={video} onClick={() => handleCardClick(video)} />
                  ))}
                </div>
                <div className="ex-grid">
                  {imageItems.slice(0, 7).map((video, index) => (
                    <div
                      key={`i-${video.title}-${index}`}
                      role="button"
                      tabIndex={0}
                      className={`ex-grid-item${index === 3 || index === 6 ? ' ex-grid-item--wide' : ''}`}
                      onClick={() => handleCardClick(video)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(video); } }}
                      aria-label={`Open ${video.title}`}
                    >
                      <img className="ex-grid-thumb" src={video.videoUrl} alt={video.title} />
                      <div className="ex-grid-meta">
                        <div className="ex-grid-title">{video.title}</div>
                        {video.prompt && <div className="ex-grid-sub">{video.prompt}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          {videos.filter(v => v.contentType === 'image').length === 0 && (
            <div className="ex-empty">
              <Icon icon="mdi:image-outline" width={48} />
              <p>No images yet — be the first to generate one.</p>
              <Link to={paths.image} className="ex-btn ex-btn--primary">Generate image</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── PRICING CTA ── */}
      <section className="ex-cta-section">
        <div className="ex-container">
          <div className="ex-cta">
            <h3 className="ex-cta-title">Ready to create something <em>remarkable?</em></h3>
            <p className="ex-cta-sub">Join thousands of creators turning ideas into cinematic content in seconds.</p>
            <div className="ex-cta-actions">
              <Link to={paths.pricing} className="ex-btn ex-btn--outline">See pricing</Link>
              <Link to={paths.signup ?? paths.video} className="ex-btn ex-btn--primary">
                Start free
                <Icon icon="mdi:arrow-right" width={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ExploreVideoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        video={selectedVideo}
      />
    </div>
  );
}
