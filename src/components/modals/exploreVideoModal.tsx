import * as Dialog from '@radix-ui/react-dialog';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { ExploreVideo } from '../../types/video/exploreVideo';
import '../../styles/explore.css';

type ExploreVideoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: ExploreVideo | null;
};

async function downloadVideo(url: string) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `explore-video-${Date.now()}.mp4`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

async function shareUrl(url: string, title: string) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        url,
        title,
        text: title,
      });
      toast.success('Shared');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        copyUrlToClipboard(url);
      }
    }
  } else {
    copyUrlToClipboard(url);
  }
}

function copyUrlToClipboard(url: string) {
  navigator.clipboard.writeText(url).then(
    () => toast.success('Link copied to clipboard'),
    () => toast.error('Could not copy link')
  );
}

export function ExploreVideoModal({ open, onOpenChange, video }: ExploreVideoModalProps) {
  const navigate = useNavigate();

  const promptText = video?.prompt ?? (video ? `${video.title}. ${video.subtitle}` : '');
  const model = video?.model ?? 'Kling 2.6 Pro';
  const aspectRatio = video?.aspectRatio ?? '1:1';
  const duration = video?.duration ?? '5 sec';
  const fileType = video?.fileType ?? 'MP4';

  const handleRecreate = () => {
    onOpenChange(false);
    navigate('/video');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="explore-video-modal-overlay" />
        <Dialog.Content
          className="explore-video-modal-content"
          aria-describedby={undefined}
        >
          <div className="explore-video-modal-layout">
            <div className="explore-video-modal-media">
              {video && (
                <video
                  src={video.videoUrl}
                  controls
                  playsInline
                  className="explore-video-modal-video"
                  aria-label={video.title}
                />
              )}
            </div>
            <div className="explore-video-modal-panel">
              <div className="explore-video-modal-panel-top">
                <div className="explore-video-modal-actions">
                  <button
                    type="button"
                    className="explore-video-modal-download"
                    onClick={() => video && downloadVideo(video.videoUrl)}
                    disabled={!video}
                  >
                    <Icon icon="mdi:download" width={20} />
                    Download
                  </button>
                  <button
                    type="button"
                    className="explore-video-modal-share"
                    onClick={() => video && shareUrl(video.videoUrl, video.title)}
                    disabled={!video}
                  >
                    <Icon icon="mdi:share-variant" width={20} />
                    Share
                  </button>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="explore-video-modal-close"
                    aria-label="Close"
                  >
                    <Icon icon="mdi:close" width={22} />
                  </button>
                </Dialog.Close>
              </div>
              <div className="explore-video-modal-prompt-wrap">
                <h3 className="explore-video-modal-label">Prompt</h3>
                <div className="explore-video-modal-prompt-text">{promptText || '—'}</div>
              </div>
              <div className="explore-video-modal-settings">
                <h3 className="explore-video-modal-label">Settings</h3>
                <div className="explore-video-modal-setting">
                  <span className="explore-video-modal-setting-label">Model</span>
                  <span className="explore-video-modal-setting-value">{model}</span>
                </div>
                <div className="explore-video-modal-setting">
                  <span className="explore-video-modal-setting-label">Aspect ratio</span>
                  <span className="explore-video-modal-setting-value">
                    <Icon icon="mdi:checkbox-blank" width={16} className="explore-video-modal-setting-icon" />
                    {aspectRatio}
                  </span>
                </div>
                <div className="explore-video-modal-setting">
                  <span className="explore-video-modal-setting-label">Duration</span>
                  <span className="explore-video-modal-setting-value">
                    <Icon icon="mdi:clock-outline" width={16} className="explore-video-modal-setting-icon" />
                    {duration}
                  </span>
                </div>
                <div className="explore-video-modal-setting">
                  <span className="explore-video-modal-setting-label">File type</span>
                  <span className="explore-video-modal-setting-value">{fileType}</span>
                </div>
              </div>
              <button
                type="button"
                className="explore-video-modal-recreate"
                onClick={handleRecreate}
              >
                <Icon icon="mdi:refresh" width={20} />
                Recreate
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
