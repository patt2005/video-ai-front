import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/authContext';
import '../../styles/edit.css';

type OutputMode = 'image' | 'video';

export default function Edit() {
  const { user } = useAuth();
  const [sourceImage, setSourceImage] = useState<{ file: File; preview: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [outputMode, setOutputMode] = useState<OutputMode>('image');
  const [isApplying, setIsApplying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Invalid file', { description: 'Please select an image file.' });
      return;
    }
    if (sourceImage?.preview) URL.revokeObjectURL(sourceImage.preview);
    setSourceImage({ file, preview: URL.createObjectURL(file) });
    e.target.value = '';
  };

  const clearSourceImage = () => {
    if (sourceImage?.preview) URL.revokeObjectURL(sourceImage.preview);
    setSourceImage(null);
  };

  const handleApply = async () => {
    if (!sourceImage) {
      toast.error('No image selected', { description: 'Upload a starting image first.' });
      return;
    }
    if (!prompt.trim()) {
      toast.error('Prompt is empty', { description: 'Describe what you want to generate.' });
      return;
    }
    if (!user?.id) {
      toast.error('Not logged in');
      return;
    }

    setIsApplying(true);
    const toastId = toast.loading(`Generating ${outputMode}…`, {
      description: 'This may take a moment.',
    });

    try {
      // TODO: wire up image-to-image / image-to-video API
      await new Promise((r) => setTimeout(r, 3000));
      toast.success('Done!', { id: toastId });
    } catch (err) {
      toast.error('Generation failed', {
        id: toastId,
        description: err instanceof Error ? err.message : 'Something went wrong.',
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="edit-page">
      <div className="edit-page-inner">

        {/* Header */}
        <header className="edit-header">
          <h1 className="edit-header-title">Edit with AI</h1>
          <p className="edit-header-sub">Upload a starting image, describe your idea, and generate a new image or video.</p>
        </header>

        <div className="edit-layout">

          {/* Left — controls */}
          <div className="edit-panel">

            {/* Image upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="edit-file-input-hidden"
              onChange={handleImageSelect}
            />
            {sourceImage ? (
              <div className="edit-source-preview">
                <img src={sourceImage.preview} alt="Source" className="edit-source-img" />
                <button
                  type="button"
                  className="edit-source-clear"
                  onClick={clearSourceImage}
                  aria-label="Remove image"
                >
                  <Icon icon="mdi:close" width={16} />
                </button>
                <button
                  type="button"
                  className="edit-source-replace"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon icon="mdi:image-edit" width={16} />
                  Replace
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="edit-upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="edit-upload-icon-wrap">
                  <Icon icon="mdi:image-plus" width={32} height={32} />
                </div>
                <span className="edit-upload-label">Upload starting image</span>
                <span className="edit-upload-hint">PNG, JPG, WEBP up to 20 MB</span>
              </button>
            )}

            {/* Prompt */}
            <textarea
              className="edit-prompt"
              placeholder="Describe what you want to generate from this image…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            {/* Bottom bar — output mode + generate */}
            <div className="edit-bottom-bar">

              {/* Output mode toggle */}
              <div className="edit-mode-toggle">
                <button
                  type="button"
                  className={`edit-mode-btn${outputMode === 'image' ? ' edit-mode-btn--active' : ''}`}
                  onClick={() => setOutputMode('image')}
                >
                  <Icon icon="mdi:image" width={16} />
                  Image
                </button>
                <button
                  type="button"
                  className={`edit-mode-btn${outputMode === 'video' ? ' edit-mode-btn--active' : ''}`}
                  onClick={() => setOutputMode('video')}
                >
                  <Icon icon="mdi:video" width={16} />
                  Video
                </button>
              </div>

              {/* Generate */}
              <button
                type="button"
                className="edit-generate-btn"
                onClick={handleApply}
                disabled={isApplying || !sourceImage || !prompt.trim()}
              >
                {isApplying ? (
                  <>
                    <Icon icon="mdi:loading" width={18} className="edit-spinner" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:auto-awesome" width={18} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right — result / placeholder */}
          <div className="edit-result-panel">
            <div className="edit-result-empty">
              <div className="edit-result-empty-icon">
                <Icon icon="mdi:image-auto-adjust" width={48} />
              </div>
              <p className="edit-result-empty-title">Your result will appear here</p>
              <p className="edit-result-empty-sub">Upload an image and describe what you want to create</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
