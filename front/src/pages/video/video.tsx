import { useRef, useState } from 'react';
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
  const [referenceImage, setReferenceImage] = useState<{ file: File; preview: string; url: string } | null>(null);
  const [prompt, setPrompt] = useState(searchParams.get('prompt') ?? '');
  const [selectedModel, setSelectedModel] = useState<VideoModel>('Veo31Fast');
  const [selectedRatio, setSelectedRatio] = useState<VideoAspectRatio>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const imageUrls = referenceImage ? [referenceImage.url] : [];

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (referenceImage?.preview) URL.revokeObjectURL(referenceImage.preview);
    // Use object URL as placeholder — in a real flow you'd upload and get a hosted URL
    const preview = URL.createObjectURL(file);
    setReferenceImage({ file, preview, url: preview });
    e.target.value = '';
  };

  const clearReferenceImage = () => {
    if (referenceImage?.preview) URL.revokeObjectURL(referenceImage.preview);
    setReferenceImage(null);
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

        <div className="video-page-options">
          <div className="video-page-option-group">
            {MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`video-option-pill${selectedModel === m.id ? ' video-option-pill--active' : ''}`}
                onClick={() => setSelectedModel(m.id)}
                disabled={isGenerating}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="video-page-option-group">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r}
                type="button"
                className={`video-option-pill${selectedRatio === r ? ' video-option-pill--active' : ''}`}
                onClick={() => setSelectedRatio(r)}
                disabled={isGenerating}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="video-page-panel-inner">
          <div className="video-page-panel-bar">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="video-page-panel-file-input"
              aria-label="Upload image reference"
              onChange={handleImageSelect}
            />
            {referenceImage ? (
              <div className="video-page-panel-ref-wrap">
                <img
                  src={referenceImage.preview}
                  alt="Reference"
                  className="video-page-panel-ref-thumb"
                />
                <button
                  type="button"
                  className="video-page-panel-ref-clear"
                  onClick={clearReferenceImage}
                  aria-label="Remove reference image"
                >
                  <Icon icon="mdi:close" width={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="video-page-panel-add-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add image reference"
                disabled={selectedModel === 'Veo31Lite'}
                title={selectedModel === 'Veo31Lite' ? 'Image-to-video not supported by Lite model' : undefined}
              >
                <Icon icon="mdi:plus" width={22} height={22} />
              </button>
            )}
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
