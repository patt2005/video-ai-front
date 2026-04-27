import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/authContext';
import '../../styles/Video.css';
import { VideoResultModal } from '../../components/modals/videoResultModal';
import { videoService, type CreateVideoTaskParams } from '../../services/videoService';
import { fileService } from '../../services/fileService';

const HERO_VIDEO_URL = 'https://static.cdn-luma.com/files/9addaf78a63cfe17/hero-shorter.mp4';
const ARROW_ICON_SIZE = 20;

export default function Video() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [referenceImage, setReferenceImage] = useState<{ file: File; preview: string } | null>(null);
  const [prompt, setPrompt] = useState(searchParams.get('prompt') ?? '');
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

    const promptText = prompt;
    setIsGenerating(true);
    setPrompt('');
    const toastId = toast.loading('Generating video…', {
      description: 'This may take a few seconds.',
    });

    let imageUrl: string | null = null;

    try {
      if (fileInputRef.current !== null) {
        const file = fileInputRef.current.files?.[0];
        if (file) {
          const result = await fileService.uploadFile(file);
          if (result) imageUrl = result.url;
        }
      }

      const params: CreateVideoTaskParams = {
        imageUrl,
        prompt: promptText,
      };

      const { url } = await videoService.createTask(params, {
        userId: user?.id,
      });
      setResultVideoUrl(url);
      setResultModalOpen(true);

      setTimeout(() => {
        toast.dismiss(toastId);
      }, 3000);
    } catch (err) {
      toast.error('Generation failed', {
        id: toastId,
        description: 'Something went wrong.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (referenceImage?.preview) URL.revokeObjectURL(referenceImage.preview);
    setReferenceImage({ file, preview: URL.createObjectURL(file) });
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
                <Icon icon="mdi:arrow-right" width={ARROW_ICON_SIZE} height={ARROW_ICON_SIZE} />
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
