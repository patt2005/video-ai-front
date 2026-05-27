import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/authContext';
import '../../styles/Image.css';
import { ImageResultModal } from '../../components/modals/imageResultModal';
import { ImageTutorialStepCard, type ImageTutorialStep } from './imageTutorialStepCard';
import { SHOWCASE_IMAGES } from '../../_mock/images';
import { imageService } from '../../services/imageService';

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

const SIZES = ['1:1', '16:9', '9:16', '4:3'] as const;
type ImageSize = typeof SIZES[number];

const RESOLUTIONS = ['1K', '2K', '4K'] as const;
type ImageResolution = typeof RESOLUTIONS[number];

export default function Image() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [prompt, setPrompt] = useState(searchParams.get('prompt') ?? '');
  const [selectedSize, setSelectedSize] = useState<ImageSize>('1:1');
  const [selectedResolution, setSelectedResolution] = useState<ImageResolution>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Prompt is empty', {
        description: 'Enter a description of the image you want to generate.',
      });
      return;
    }

    if (!user?.id) {
      toast.error('Not logged in', {
        description: 'You must be logged in to generate images.',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    const toastId = toast.loading('Generating image…', {
      description: 'This may take a few seconds.',
    });

    try {
      const resultUrl = await imageService.generateImageAndPoll(
        {
          prompt,
          size: selectedSize,
          resolution: selectedResolution,
          imageUrls: [],
        },
        (progress) => {
          toast.loading(`Generating image… ${progress}%`, { id: toastId });
        }
      );

      setGeneratedImage(resultUrl);
      setResultModalOpen(true);
      toast.dismiss(toastId);
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
            {/* Prompt — grows to fill space */}
            <textarea
              className="prompt-input image-prompt-grow"
              placeholder="Describe the scene you imagine"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            {/* Bottom controls */}
            <div className="image-bottom-controls">
              {/* Model picker (display only) */}
              <div className="image-model-row">
                <img
                  src="https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-avatar/avatars/nanobanana.webp"
                  alt="Nano Banana"
                  className="image-model-icon"
                />
                <span className="image-model-name">Nano Banana</span>
              </div>

              <div className="image-option-group">
                <span className="model-select-field-label">Size</span>
                <div className="image-option-pills">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`image-option-pill${selectedSize === s ? ' image-option-pill--active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="image-option-group">
                <span className="model-select-field-label">Resolution</span>
                <div className="image-option-pills">
                  {RESOLUTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`image-option-pill${selectedResolution === r ? ' image-option-pill--active' : ''}`}
                      onClick={() => setSelectedResolution(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
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
            </div>

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
