import { useState } from 'react';
import { Icon } from '@iconify/react';
import './Image.css';

const MODELS = [
  { id: 'general', name: 'GENERAL', thumbnail: null },
  { id: 'character', name: 'CHARACTER', thumbnail: null },
] as const;

export default function Image() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [stylePreset, setStylePreset] = useState('Soul');
  const [resolution, setResolution] = useState('1.5k');
  const [turboOn, setTurboOn] = useState(true);
  const [imageCount, setImageCount] = useState(1);
  const [selectedModel, setSelectedModel] = useState<(typeof MODELS)[number]['id']>('general');

  const maxImages = 4;

  return (
    <div className="image-page">
      <div className="image-page-header">
        <h1 className="image-page-title">Image</h1>
        <p className="image-page-subtitle">
          Create stunning, high-aesthetic images in seconds
        </p>
      </div>

      <div className="image-create-panel">
        <div className="image-create-left">
          <div className="prompt-area">
            <button type="button" className="prompt-add-btn" aria-label="Upload or add">
              <Icon icon="mdi:plus" width={20} />
            </button>
            <textarea
              className="prompt-input"
              placeholder="Upload image as a prompt or Describe the scene you imagine"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="generation-options">
            <button type="button" className="option-btn">
              <Icon icon="mdi:scroll-text" width={18} />
              <span>{stylePreset}</span>
              <Icon icon="mdi:chevron-down" width={16} />
            </button>
            <button type="button" className="option-btn">
              <Icon icon="mdi:aspect-ratio" width={18} />
              <span>{aspectRatio}</span>
              <Icon icon="mdi:chevron-down" width={16} />
            </button>
            <button type="button" className="option-btn">
              <Icon icon="mdi:diamond-stone" width={18} />
              <span>{resolution}</span>
              <Icon icon="mdi:chevron-down" width={16} />
            </button>
            <button
              type="button"
              className={`option-btn option-toggle ${turboOn ? 'on' : ''}`}
              onClick={() => setTurboOn(!turboOn)}
            >
              <Icon icon="mdi:lightning-bolt" width={18} />
              <span>{turboOn ? 'On' : 'Off'}</span>
            </button>
            <div className="option-count">
              <button
                type="button"
                className="count-btn"
                onClick={() => setImageCount((c) => Math.max(1, c - 1))}
                aria-label="Decrease count"
              >
                <Icon icon="mdi:minus" width={18} />
              </button>
              <span className="count-value">
                {imageCount}/{maxImages}
              </span>
              <button
                type="button"
                className="count-btn"
                onClick={() => setImageCount((c) => Math.min(maxImages, c + 1))}
                aria-label="Increase count"
              >
                <Icon icon="mdi:plus" width={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="image-create-right">
          <button type="button" className="model-add-btn">
            <Icon icon="mdi:plus" width={24} />
            <span>CHARACTER</span>
          </button>

          <div className="model-select-card">
            <div className="model-select-header">
              <button type="button" className="model-change-btn">
                <Icon icon="mdi:pencil" width={14} />
                <span>Change</span>
              </button>
            </div>
            <div className="model-select-preview">
              <div className="model-preview-placeholder">
                <Icon icon="mdi:image-outline" width={48} />
              </div>
              <span className="model-select-label">
                {MODELS.find((m) => m.id === selectedModel)?.name ?? 'GENERAL'}
              </span>
            </div>
          </div>

          <button type="button" className="generate-btn">
            Generate + {imageCount}
          </button>
        </div>
      </div>
    </div>
  );
}
