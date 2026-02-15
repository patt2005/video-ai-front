import * as Dialog from '@radix-ui/react-dialog';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/Video.css';

type VideoResultModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string | null;
};

async function downloadVideo(url: string) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `generated-video-${Date.now()}.mp4`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

async function shareVideo(url: string) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        url,
        title: 'Generated video',
        text: 'Check out this AI-generated video.',
      });
      toast.success('Shared');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        copyVideoLink(url);
      }
    }
  } else {
    copyVideoLink(url);
  }
}

function copyVideoLink(url: string) {
  navigator.clipboard.writeText(url).then(
    () => toast.success('Link copied to clipboard'),
    () => toast.error('Could not copy link')
  );
}

export function VideoResultModal({ open, onOpenChange, videoUrl }: VideoResultModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="video-result-modal-overlay" />
        <Dialog.Content className="video-result-modal-content" aria-describedby={undefined}>
          <div className="video-result-modal-header">
            <Dialog.Title className="video-result-modal-title">Your video</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="video-result-modal-close"
                aria-label="Close"
              >
                <Icon icon="mdi:close" width={22} />
              </button>
            </Dialog.Close>
          </div>
          <div className="video-result-modal-body">
            {videoUrl && (
              <video
                src={videoUrl}
                controls
                playsInline
                className="video-result-modal-video"
                aria-label="Generated video"
              />
            )}
          </div>
          <div className="video-result-modal-actions">
            <button
              type="button"
              className="video-result-modal-btn video-result-modal-btn-primary"
              onClick={() => videoUrl && downloadVideo(videoUrl)}
              disabled={!videoUrl}
            >
              <Icon icon="mdi:download" width={20} />
              Download
            </button>
            <button
              type="button"
              className="video-result-modal-btn video-result-modal-btn-secondary"
              onClick={() => videoUrl && shareVideo(videoUrl)}
              disabled={!videoUrl}
            >
              <Icon icon="mdi:share-variant" width={20} />
              Share
            </button>
            <Dialog.Close asChild>
              <button type="button" className="video-result-modal-btn video-result-modal-btn-ghost">
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
