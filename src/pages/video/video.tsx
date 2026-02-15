import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/Video.css';
import { pollTaskUntilComplete, text2video, image2video, ViduError } from '../../lib/vidu';
import { VideoResultModal } from '../../components/modals/VideoResultModal';

const HERO_VIDEO_URL = 'https://static.cdn-luma.com/files/9addaf78a63cfe17/hero-shorter.mp4';
const ARROW_ICON_SIZE = 20;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Video() {
  const [referenceImage, setReferenceImage] = useState<{ file: File; preview: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      toast.error('Prompt is empty', {
        description: 'Describe your video idea to generate.',
      });
      return;
    }

    const trimmedPrompt = prompt.trim();
    setIsGenerating(true);
    setPrompt('');
    const toastId = toast.loading('Generating video…', {
      description: 'This may take a few seconds.',
    });

    try {
      let taskId: string;
      if (referenceImage) {
        const dataUrl = await fileToDataUrl(referenceImage.file);
        taskId = await image2video(dataUrl, trimmedPrompt);
      } else {
        taskId = await text2video(trimmedPrompt);
      }

      console.log('Task id returned:');
      console.log(taskId);

      const status = await pollTaskUntilComplete(taskId, {
        progressHandler: (progress) => {
          if (progress != null && progress >= 1) return;
          toast.loading('Generating video…', {
            id: toastId,
            description: progress != null ? `Progress: ${Math.round(progress * 100)}%` : 'Processing…',
          });
        },
      });

      const videoUrl = status.creations?.[0]?.url ?? null;
      if (videoUrl) {
        setResultVideoUrl(videoUrl);
        setResultModalOpen(true);
      }

      toast.success('Video generated', {
        id: toastId,
        description: 'Your video is ready.',
      });
    } catch (err) {
      const message = err instanceof ViduError ? err.message : err instanceof Error ? err.message : 'Something went wrong.';
      toast.error('Generation failed', {
        id: toastId,
        description: message,
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
