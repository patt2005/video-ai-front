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

async function downloadMedia(url: string, contentType: 'video' | 'image') {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = contentType === 'image'
      ? `explore-image-${Date.now()}.jpg`
      : `explore-video-${Date.now()}.mp4`;
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

  const promptText = video?.prompt ?? (video ? `${video.title}. ${video.description}` : '');

  const isImage = video?.contentType === 'image';

  const handleRecreate = () => {
    onOpenChange(false);
    const dest = isImage ? '/image' : '/video';
    navigate(`${dest}?prompt=${encodeURIComponent(promptText)}`);
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
              {video && (isImage ? (
                <img
                  src={video.videoUrl}
                  alt={video.title}
                  className="explore-video-modal-video"
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <video
                  src={video.videoUrl}
                  controls
                  playsInline
                  className="explore-video-modal-video"
                  aria-label={video.title}
                />
              ))}
            </div>
            <div className="explore-video-modal-panel">
              <div className="explore-video-modal-panel-top">
                <div className="explore-video-modal-actions">
                  <button
                    type="button"
                    className="explore-video-modal-download"
                    onClick={() => video && downloadMedia(video.videoUrl, video.contentType)}
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
              {video?.userId && (
                <button
                  type="button"
                  className="explore-video-modal-user"
                  onClick={() => { onOpenChange(false); navigate(`/profile/${video.userId}`); }}
                >
                  {video.userAvatar ? (
                    <img src={video.userAvatar} alt={video.userName ?? 'Creator'} className="explore-video-modal-user-avatar" />
                  ) : (
                    <Icon icon="mdi:account-circle" width={18} />
                  )}
                  <span>{video.userName ?? video.userEmail ?? 'View creator'}</span>
                </button>
              )}
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
