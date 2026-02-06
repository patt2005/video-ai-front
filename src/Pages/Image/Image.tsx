import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import './Image.css';

const GOOGLE_ICON = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/500px-Google_%22G%22_logo.svg.png';
const GPT_IMAGE_ICON = 'https://cdn-icons-png.flaticon.com/512/11865/11865326.png';

const TUTORIAL_STEP1_IMAGE = 'https://www.easemate.ai/cdn-cgi/image/w=457,h=200,f=webp/_image/home/features/2x/imageLand/step1-2x.webp';
const TUTORIAL_STEP2_IMAGE = 'https://anifun.ai/wp-content/uploads/sites/2/2025/09/two-way-to-generate-image-prompt.webp';
const TUTORIAL_STEP3_IMAGE = 'https://cdn.visualgpt.io/visualgpt/static/ai-photo-grid-maker/style-windswept-soul.webp';

const MODELS = [
  { id: 'nano-banana', name: 'Nano Banana', iconUrl: GOOGLE_ICON },
  { id: 'gpt-image', name: 'GPT Image', iconUrl: GPT_IMAGE_ICON },
] as const;

export default function Image() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [selectedModel, setSelectedModel] = useState<(typeof MODELS)[number]['id']>('nano-banana');
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [promptImage, setPromptImage] = useState<{ file: File; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setModelPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (promptImage?.preview) URL.revokeObjectURL(promptImage.preview);
    setPromptImage({ file, preview: URL.createObjectURL(file) });
    e.target.value = '';
  };

  const clearPromptImage = () => {
    if (promptImage?.preview) URL.revokeObjectURL(promptImage.preview);
    setPromptImage(null);
  };

  return (
    <div className="image-page">
      <div className="image-page-row">
        <div className="image-create-panel">
          <div className="image-create-left">
          <div className="prompt-area">
            <div className="prompt-image-picker">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="prompt-image-input"
                aria-label="Select image from computer"
                onChange={handleImageSelect}
              />
              {promptImage ? (
                <div className="prompt-image-preview-wrap">
                  <img
                    src={promptImage.preview}
                    alt="Prompt reference"
                    className="prompt-image-preview"
                  />
                  <button
                    type="button"
                    className="prompt-image-clear"
                    onClick={clearPromptImage}
                    aria-label="Remove image"
                  >
                    <Icon icon="mdi:close" width={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="prompt-image-placeholder"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload image as prompt"
                >
                  <Icon icon="mdi:image-plus" width={24} />
                  <span>Add image</span>
                </button>
              )}
            </div>
            <textarea
              className="prompt-input"
              placeholder="Describe the scene you imagine"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="generation-options">
            <button type="button" className="option-btn">
              <Icon icon="mdi:aspect-ratio" width={18} />
              <span>{aspectRatio}</span>
              <Icon icon="mdi:chevron-down" width={16} />
            </button>
          </div>

          <div className="model-select-wrapper" ref={modelPickerRef}>
            <span className="model-select-field-label">Model</span>
            <button
              type="button"
              className="model-select-card model-select-card-inline"
              onClick={() => setModelPickerOpen((o) => !o)}
              aria-expanded={modelPickerOpen}
            >
              <span className="model-select-card-row">
                <span
                  className="model-select-icon model-select-icon-primary"
                  style={{
                    WebkitMaskImage: `url(${MODELS.find((m) => m.id === selectedModel)?.iconUrl})`,
                    maskImage: `url(${MODELS.find((m) => m.id === selectedModel)?.iconUrl})`,
                  }}
                  aria-hidden
                />
                <span className="model-select-label">
                  {MODELS.find((m) => m.id === selectedModel)?.name ?? 'Nano Banana'}
                </span>
                <Icon icon="mdi:chevron-right" width={20} className="model-select-arrow" />
              </span>
            </button>
            {modelPickerOpen && (
              <div className="model-picker-dropdown">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    className={`model-picker-option ${selectedModel === model.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setModelPickerOpen(false);
                    }}
                  >
                    <span
                      className="model-picker-option-icon model-select-icon-primary"
                      style={{
                        WebkitMaskImage: `url(${model.iconUrl})`,
                        maskImage: `url(${model.iconUrl})`,
                      }}
                      aria-hidden
                    />
                    <span className="model-picker-option-name">{model.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="generate-btn">
            Generate
          </button>
          </div>
        </div>

        <section className="image-tutorial" aria-labelledby="image-tutorial-title">
        <h2 id="image-tutorial-title" className="image-tutorial-title">
          How to generate images
        </h2>
        <p className="image-tutorial-subtitle">
          Follow these three steps to create your image — add a reference (optional), describe your idea, then generate.
        </p>
        <div className="image-tutorial-steps">
          <div className="image-tutorial-step">
            <h3 className="image-tutorial-step-title">Add reference image</h3>
            <p className="image-tutorial-step-desc">
              Upload or paste an image to guide style or subject. Optional.
            </p>

            <img
                            src={TUTORIAL_STEP1_IMAGE}
                            alt=""
                            className="image-tutorial-reference-preview"
                          />
          </div>

          <div className="image-tutorial-step">
            <h3 className="image-tutorial-step-title">Enter prompt</h3>
            <p className="image-tutorial-step-desc">
              Describe the scene you imagine, with details.
            </p>
            <img
              src={TUTORIAL_STEP2_IMAGE}
              alt=""
              className="image-tutorial-reference-preview"
            />
          </div>

          <div className="image-tutorial-step">
            <h3 className="image-tutorial-step-title">Get your image</h3>
            <p className="image-tutorial-step-desc">
              Click Generate to create your final image.
            </p>
            <img
              src={TUTORIAL_STEP3_IMAGE}
              alt=""
              className="image-tutorial-reference-preview"
            />
          </div>
        </div>
        </section>
      </div>
    </div>
  );
}
