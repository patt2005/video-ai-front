import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/Image.css';
import { ImageResultModal } from '../../components/modals/imageResultModal';
import { ImageTutorialStepCard, type ImageTutorialStep } from './imageTutorialStepCard';
import { SHOWCASE_IMAGES } from '../../_mock/images';

const IMAGE_TUTORIAL_STEPS: ImageTutorialStep[] = [
  {
    step: 1,
    icon: 'mdi:image-plus',
    title: 'Add reference image',
    description: 'Upload or paste an image to guide style or subject (optional).',
  },
  {
    step: 2,
    icon: 'mdi:lead-pencil',
    title: 'Enter prompt',
    description: 'Describe the scene you imagine, with details.',
  },
  {
    step: 3,
    icon: 'mdi:image-check',
    title: 'Get your image',
    description: 'Click Generate to create your final image.',
  },
];

const GOOGLE_ICON = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/500px-Google_%22G%22_logo.svg.png';

const MODELS = [
  { id: 'nano-banana', name: 'Nano Banana', iconUrl: GOOGLE_ICON },
] as const;

export default function Image() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<(typeof MODELS)[number]['id']>('nano-banana');
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [promptImage, setPromptImage] = useState<{ file: File; preview: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);
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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Prompt is empty', {
        description: 'Enter a description of the image you want to generate.',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    const toastId = toast.loading('Generating image…', {
      description: 'This may take a few seconds.',
    });

    try {
        //TODO: Call the backend to generate image
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 3000);
    } catch (err) {
      toast.error('Generation failed', {
        id: toastId,
        description: err instanceof Error ? err.message : 'Something went wrong.',
      });
    } finally {
      setIsGenerating(false);
    }
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
                  <img src="/upload.png" alt="" width={24} height={24} className="prompt-image-placeholder-icon" />
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

          <button
            type="button"
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="image-generate-loading">
                <Icon icon="mdi:loading" width={20} className="image-generate-spinner" />
                Generating…
              </span>
            ) : (
              'Generate'
            )}
          </button>

          <ImageResultModal
            open={resultModalOpen}
            onOpenChange={setResultModalOpen}
            imageSrc={generatedImage}
          />
          </div>
        </div>

        <section className="image-tutorial" aria-labelledby="image-tutorial-title">
        <div
          className="image-tutorial-showcase-scroll overflow-x-auto scroll-smooth flex gap-3 py-2 -mx-1 mb-4"
          aria-label="AI generated images showcase"
        >
          <div className="image-tutorial-showcase-track flex gap-3 flex-nowrap">
            {[...SHOWCASE_IMAGES, ...SHOWCASE_IMAGES, ...SHOWCASE_IMAGES].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="image-tutorial-showcase-img w-20 h-20 flex-shrink-0 rounded-lg object-cover"
              />
            ))}
          </div>
        </div>

        <h2 id="image-tutorial-title" className="image-tutorial-title">
          How to generate images
        </h2>
        <p className="image-tutorial-subtitle">
          Follow these three steps to create your image — add a reference (optional), describe your idea, then generate.
        </p>
        <div className="image-tutorial-steps">
          {IMAGE_TUTORIAL_STEPS.map((tutorial) => (
            <ImageTutorialStepCard key={tutorial.step} {...tutorial} />
          ))}
        </div>
        </section>
      </div>
    </div>
  );
}
