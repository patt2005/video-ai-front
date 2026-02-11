import * as Dialog from '@radix-ui/react-dialog';
import { Icon } from '@iconify/react';
import '../../styles/Image.css';

type ImageResultModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string | null;
};

function downloadImage(dataUrl: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `generated-image-${Date.now()}.png`;
  link.click();
}

export function ImageResultModal({ open, onOpenChange, imageSrc }: ImageResultModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="image-result-modal-overlay" />
        <Dialog.Content className="image-result-modal-content" aria-describedby={undefined}>
          <div className="image-result-modal-header">
            <Dialog.Title className="image-result-modal-title">Your image</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="image-result-modal-close"
                aria-label="Close"
              >
                <Icon icon="mdi:close" width={22} />
              </button>
            </Dialog.Close>
          </div>
          <div className="image-result-modal-body">
            {imageSrc && (
              <img
                id="image-result-modal-img"
                src={imageSrc}
                alt="Generated result"
                className="image-result-modal-img"
              />
            )}
          </div>
          <div className="image-result-modal-actions">
            <button
              type="button"
              className="image-result-modal-btn image-result-modal-btn-primary"
              onClick={() => imageSrc && downloadImage(imageSrc)}
              disabled={!imageSrc}
            >
              <Icon icon="mdi:download" width={20} />
              Download
            </button>
            <button
              type="button"
              className="image-result-modal-btn image-result-modal-btn-secondary"
              disabled
              title="Coming soon"
            >
              <Icon icon="mdi:share-variant" width={20} />
              Share
            </button>
            <Dialog.Close asChild>
              <button type="button" className="image-result-modal-btn image-result-modal-btn-ghost">
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
