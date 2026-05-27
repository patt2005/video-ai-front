import { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/authContext';
import '../../styles/Video.css';
import { VideoResultModal } from '../../components/modals/videoResultModal';
import { videoService, type VideoModel, type VideoAspectRatio } from '../../services/videoService';

const HERO_VIDEO_URL = 'https://static.cdn-luma.com/files/9addaf78a63cfe17/hero-shorter.mp4';
const ARROW_ICON_SIZE = 20;

const MODELS: { id: VideoModel; label: string }[] = [
  { id: 'Veo31Fast', label: 'Fast' },
  { id: 'Veo31Lite', label: 'Lite' },
  { id: 'Veo31Quality', label: 'Quality' },
];

const ASPECT_RATIOS: VideoAspectRatio[] = ['16:9', '9:16', '1:1', '4:3'];

export default function Video() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [prompt, setPrompt] = useState(searchParams.get('prompt') ?? '');
  const [selectedModel, setSelectedModel] = useState<VideoModel>('Veo31Fast');
  const [selectedRatio, setSelectedRatio] = useState<VideoAspectRatio>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      toast.error('Prompt is empty', {
        description: 'Describe your video idea to generate.',
      });
      return;
    }

    if (!user?.id) {
      toast.error('Not logged in', {
        description: 'You must be logged in to generate videos.',
      });
      return;
    }

    const promptText = prompt;
    setIsGenerating(true);
    setPrompt('');
    const toastId = toast.loading('Generating video…', {
      description: 'Videos take 90–300 seconds. Hang tight.',
    });

    try {
      const imageUrls: string[] = [];

      const url = await videoService.generateVideoAndPoll(
        {
          prompt: promptText,
          aspectRatio: selectedRatio,
          model: selectedModel,
          imageUrls,
        },
        (progress) => {
          toast.loading(`Generating video… ${progress}%`, { id: toastId });
        }
      );

      setResultVideoUrl(url);
      setResultModalOpen(true);
      toast.dismiss(toastId);
    } catch (err) {
      toast.error('Generation failed', {
        id: toastId,
        description: err instanceof Error ? err.message : 'Something went wrong.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="video-page">
      <div className="video-page-bg">
        <video
          className="video-page-video"
          src={HERO_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        />
        <div className="video-page-overlay" aria-hidden />
      </div>

      <div className="video-page-panel">
        <header className="video-page-header">
          <h1 className="video-page-title">Create your video</h1>
          <p className="video-page-subtitle">
            Add a reference image (optional), describe your idea, then hit the arrow to generate.
          </p>
        </header>

        <div className="video-page-panel-inner">
          <div className="video-page-panel-bar">
            <div className="video-settings-wrap" ref={settingsRef}>
              <button
                type="button"
                className="video-page-panel-add-btn video-settings-btn"
                onClick={() => setSettingsOpen((o) => !o)}
                aria-label="Video settings"
                disabled={isGenerating}
              >
                <Icon icon="mdi:tune-variant" width={20} height={20} />
              </button>
              {settingsOpen && (
                <div className="video-settings-popup">
                  <p className="video-settings-popup-label">Model</p>
                  <div className="video-settings-popup-row">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`video-option-pill${selectedModel === m.id ? ' video-option-pill--active' : ''}`}
                        onClick={() => setSelectedModel(m.id)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <p className="video-settings-popup-label">Aspect ratio</p>
                  <div className="video-settings-popup-row">
                    {ASPECT_RATIOS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`video-option-pill${selectedRatio === r ? ' video-option-pill--active' : ''}`}
                        onClick={() => setSelectedRatio(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <input
              type="text"
              className="video-page-panel-input"
              placeholder="Describe your video..."
              aria-label="Video prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isGenerating) handleGenerateClick(); }}
            />
            <button
              type="button"
              className="video-page-panel-arrow"
              aria-label="Generate video"
              style={{ '--arrow-icon-size': `${ARROW_ICON_SIZE}px` } as React.CSSProperties}
              onClick={handleGenerateClick}
              disabled={isGenerating}
            >
              <span className="video-page-panel-arrow-icon">
                {isGenerating
                  ? <Icon icon="mdi:loading" width={ARROW_ICON_SIZE} height={ARROW_ICON_SIZE} className="video-generate-spinner" />
                  : <Icon icon="mdi:arrow-right" width={ARROW_ICON_SIZE} height={ARROW_ICON_SIZE} />
                }
              </span>
            </button>
          </div>
        </div>
      </div>
      <VideoResultModal
        open={resultModalOpen}
        onOpenChange={setResultModalOpen}
        videoUrl={resultVideoUrl}
      />
    </div>
  );
}
