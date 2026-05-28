import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/authContext';
import '../../styles/image.css';
import { ImageResultModal } from '../../components/modals/imageResultModal';
import { SHOWCASE_IMAGES } from '../../_mock/images';
import { imageService } from '../../services/imageService';

const SIZES = ['1:1', '16:9', '9:16', '4:3'] as const;
type ImageSize = typeof SIZES[number];

const RESOLUTIONS = ['1K', '2K', '4K'] as const;
type ImageResolution = typeof RESOLUTIONS[number];

const SIZE_GLYPHS: Record<ImageSize, { w: number; h: number }> = {
  '1:1':  { w: 14, h: 14 },
  '16:9': { w: 18, h: 10 },
  '9:16': { w: 10, h: 18 },
  '4:3':  { w: 16, h: 12 },
};

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
      toast.error('Prompt is empty', { description: 'Describe the image you want to generate.' });
      return;
    }
    if (!user?.id) {
      toast.error('Not logged in', { description: 'You must be logged in to generate images.' });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    const toastId = toast.loading('Generating image…', { description: 'This may take a few seconds.' });

    try {
      const resultUrl = await imageService.generateImageAndPoll(
        { prompt, size: selectedSize, resolution: selectedResolution, imageUrls: [] },
        (progress) => toast.loading(`Generating image… ${progress}%`, { id: toastId }),
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
    <div className="img-page">

      {/* ── PAGE HEADER ── */}
      <div className="img-container">
        <div className="img-page-head">
          <div className="img-page-tag">Image studio</div>
          <h1 className="img-page-title">From an idea to a <em>finished image.</em></h1>
          <p className="img-page-sub">Describe a scene, pick a model, render at 4K. Use a reference to lock style, subject or composition.</p>
        </div>
      </div>

      {/* ── WORKBENCH ── */}
      <div className="img-container">
        <div className="img-workbench">

          {/* ── LEFT: sidebar controls ── */}
          <aside className="img-panel img-sidebar" aria-label="Generation controls">

            {/* Prompt */}
            <div className="img-field">
              <div className="img-field-label">
                <span>Prompt</span>
                <span className="img-field-hint">{prompt.length} / 1000</span>
              </div>
              <textarea
                className="img-prompt"
                placeholder="Describe the scene you imagine. e.g. 'a quiet rooftop greenhouse at sunset, soft volumetric light, 35mm film'"
                value={prompt}
                maxLength={1000}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {/* Model */}
            <div className="img-field">
              <div className="img-field-label"><span>Model</span></div>
              <div className="img-model">
                <div className="img-model-ico">🍌</div>
                <div className="img-model-info">
                  <div className="img-model-name">Nano Banana</div>
                  <div className="img-model-meta">Fast · 1024×1024 · Photoreal</div>
                </div>
                <Icon icon="mdi:unfold-more-horizontal" width={16} className="img-model-chev" />
              </div>
            </div>

            {/* Aspect ratio */}
            <div className="img-field">
              <div className="img-field-label"><span>Aspect ratio</span></div>
              <div className="img-segments img-segments--4" role="radiogroup">
                {SIZES.map((s) => {
                  const g = SIZE_GLYPHS[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`img-seg${selectedSize === s ? ' img-seg--active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      <span className="img-seg-glyph" style={{ width: g.w, height: g.h }} />
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolution */}
            <div className="img-field">
              <div className="img-field-label">
                <span>Resolution</span>
                <span className="img-field-hint">1 · 2 · 5 credits</span>
              </div>
              <div className="img-segments img-segments--3" role="radiogroup">
                {RESOLUTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`img-seg${selectedResolution === r ? ' img-seg--active' : ''}`}
                    onClick={() => setSelectedResolution(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <div className="img-generate-wrap">
              <button
                type="button"
                className="img-generate"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Icon icon="mdi:loading" width={18} className="img-spinner" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:auto-awesome" width={16} />
                    Generate
                    <span className="img-kbd">⌘ ↵</span>
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* ── RIGHT: canvas ── */}
          <div className="img-canvas">

            {/* Inspiration strip */}
            <section>
              <div className="img-strip-head">
                <div>
                  <h2 className="img-strip-title">For inspiration <em>today.</em></h2>
                  <div className="img-strip-sub">Click any to reuse the prompt or remix the seed.</div>
                </div>
              </div>
              <div className="img-strip-wrap">
                <div className="img-strip">
                  {[...SHOWCASE_IMAGES, ...SHOWCASE_IMAGES].map((src, i) => (
                    <div
                      key={i}
                      className="img-tile"
                      role="button"
                      tabIndex={0}
                      onClick={() => { /* reuse prompt */ }}
                    >
                      <img src={src} alt="" className="img-tile-thumb" />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* How-to steps */}
            <section className="img-howto">
              <div className="img-howto-head">
                <h2 className="img-howto-title">How to generate <em>great</em> images.</h2>
                <p className="img-howto-sub">Three steps. Reference is optional but unlocks style consistency and faithful subject likeness.</p>
              </div>
              <div className="img-steps">

                <div className="img-step">
                  <span className="img-step-num">01</span>
                  <div className="img-step-ico">
                    <Icon icon="mdi:image-plus" width={20} />
                  </div>
                  <h3 className="img-step-title">Add a reference image</h3>
                  <p className="img-step-desc">Drop a photo, screenshot or sketch to anchor style, subject or composition. Skippable.</p>
                </div>

                <div className="img-step">
                  <span className="img-step-num">02</span>
                  <div className="img-step-ico">
                    <Icon icon="mdi:lead-pencil" width={20} />
                  </div>
                  <h3 className="img-step-title">Describe your scene</h3>
                  <p className="img-step-desc">Be specific about subject, lighting, lens, and mood. Use the prompt field on the left.</p>
                </div>

                <div className="img-step">
                  <span className="img-step-num">03</span>
                  <div className="img-step-ico">
                    <Icon icon="mdi:auto-awesome" width={20} />
                  </div>
                  <h3 className="img-step-title">Hit Generate</h3>
                  <p className="img-step-desc">Renders take ~6s at 1K, 18s at 4K. You'll get your image ready to download.</p>
                </div>

              </div>
            </section>

          </div>
        </div>
      </div>

      <ImageResultModal
        open={resultModalOpen}
        onOpenChange={setResultModalOpen}
        imageSrc={generatedImage}
      />
    </div>
  );
}
