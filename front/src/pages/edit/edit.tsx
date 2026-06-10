import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/authContext';
import { fileService } from '../../services/fileService';
import { imageService } from '../../services/imageService';
import { videoService } from '../../services/videoService';
import '../../styles/edit.css';

type OutputMode = 'image' | 'video';

const PRESETS = [
  { icon: 'mdi:weather-night', tag: 'Restyle', title: 'Day → Night', desc: 'Same scene, swapped to cinematic night with neon.', prompt: 'Restyle as a moody night scene with neon reflections, cinematic lighting, 35mm film' },
  { icon: 'mdi:brush', tag: 'Restyle', title: 'Photo → Anime', desc: 'Ghibli-style watercolor illustration.', prompt: 'Convert to a Studio Ghibli-style anime illustration, watercolor backgrounds, soft outlines' },
  { icon: 'mdi:image-remove', tag: 'Remove', title: 'Erase background', desc: 'Isolate the subject on a clean gradient.', prompt: 'Remove the background entirely and replace it with a clean studio gradient' },
  { icon: 'mdi:play-circle', tag: 'Animate', title: 'Bring to life', desc: 'Turn the still into a 4s cinematic shot.', prompt: 'Animate as a 4-second cinematic shot: slow dolly-in toward the subject, light wind in the hair' },
  { icon: 'mdi:arrow-expand-all', tag: 'Expand', title: 'Outpaint to 16:9', desc: 'Extend the frame, keep subject centered.', prompt: 'Expand the canvas: extend the scene to a 16:9 frame, keep subject centered' },
  { icon: 'mdi:arrow-up-bold', tag: 'Enhance', title: 'Upscale 4K', desc: 'Sharper detail without losing natural grain.', prompt: 'Upscale to 4K with photoreal detail, sharpen fabric and skin textures, keep grain natural' },
  { icon: 'mdi:account', tag: 'Swap', title: 'Swap wardrobe', desc: 'Change clothing while preserving identity.', prompt: "Replace the subject's wardrobe with a tailored black wool overcoat, keep face and pose" },
  { icon: 'mdi:palette', tag: 'Grade', title: 'Wes Anderson palette', desc: 'Pastel, symmetrical, soft-shadow grade.', prompt: 'Match the color and grade of a Wes Anderson film: pastel palette, symmetrical framing, soft shadows' },
];

export default function Edit() {
  const { user } = useAuth();
  const [sourceImage, setSourceImage] = useState<{ file: File; preview: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [outputMode, setOutputMode] = useState<OutputMode>('image');
  const [isApplying, setIsApplying] = useState(false);
  const [result, setResult] = useState<{ type: OutputMode; url: string } | null>(null);
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
    if (!sourceImage) { toast.error('No image selected', { description: 'Upload a starting image first.' }); return; }
    if (!prompt.trim()) { toast.error('Prompt is empty', { description: 'Describe what you want to generate.' }); return; }
    if (!user?.id) { toast.error('Not logged in'); return; }

    setIsApplying(true);
    const toastId = toast.loading('Uploading image…', { description: 'This may take a moment.' });

    try {
      const { key } = await fileService.uploadFile(sourceImage.file);
      const imageUrl = fileService.getPreviewUrl(key);
      toast.loading(`Generating ${outputMode}…`, { id: toastId });

      if (outputMode === 'image') {
        const resultUrl = await imageService.generateImageAndPoll(
          { prompt, size: '1:1', resolution: '1K', imageUrls: [imageUrl] },
          (p) => toast.loading(`Generating image… ${p}%`, { id: toastId }),
        );
        setResult({ type: 'image', url: resultUrl });
      } else {
        const resultUrl = await videoService.generateVideoAndPoll(
          { prompt, aspectRatio: '16:9', model: 'Veo31Fast', imageUrls: [imageUrl] },
          (p) => toast.loading(`Generating video… ${p}%`, { id: toastId }),
        );
        setResult({ type: 'video', url: resultUrl });
      }
      toast.success('Done!', { id: toastId });
    } catch (err) {
      toast.error('Generation failed', { id: toastId, description: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setIsApplying(false);
    }
  };

  const hasImage = !!sourceImage;
  const hasPrompt = prompt.trim().length >= 4;

  return (
    <div className="ed-page">

      {/* ── PAGE HEADER ── */}
      <div className="ed-container">
        <div className="ed-page-head">
          <h1 className="ed-page-title">Edit anything with <em>a sentence.</em></h1>
          <p className="ed-page-sub">Upload a starting image, describe the change, and get back a new image or short video — same composition, your edit applied.</p>
        </div>
      </div>

      {/* ── WORKBENCH ── */}
      <div className="ed-container">
        <div className="ed-workbench">

          {/* ── LEFT sidebar ── */}
          <aside className="ed-panel ed-sidebar" aria-label="Edit controls">

            {/* Upload */}
            <div className="ed-field">
              <div className="ed-field-label">
                <span>Starting image</span>
                <span className="ed-field-hint">{sourceImage ? sourceImage.file.name.slice(0, 20) : 'Required'}</span>
              </div>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="ed-file-hidden" onChange={handleImageSelect} />
              {sourceImage ? (
                <div className="ed-upload ed-upload--filled">
                  <img src={sourceImage.preview} alt="Source" className="ed-upload-img" />
                  <div className="ed-upload-actions">
                    <button type="button" className="ed-upload-action" title="Replace" onClick={() => fileInputRef.current?.click()}>
                      <Icon icon="mdi:refresh" width={13} color="#fff" />
                    </button>
                    <button type="button" className="ed-upload-action" title="Remove" onClick={clearSourceImage}>
                      <Icon icon="mdi:close" width={13} color="#fff" />
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className="ed-upload" onClick={() => fileInputRef.current?.click()}>
                  <div className="ed-upload-ico">
                    <Icon icon="mdi:image-plus" width={28} />
                  </div>
                  <div>
                    <div className="ed-upload-t">Drop or click to upload</div>
                    <div className="ed-upload-d">An anchor for style, subject, and composition</div>
                  </div>
                  <div className="ed-upload-formats">
                    <span>PNG</span><span>JPG</span><span>WEBP</span><span>up to 20MB</span>
                  </div>
                </button>
              )}
            </div>

            {/* Prompt */}
            <div className="ed-field">
              <div className="ed-field-label">
                <span>Edit prompt</span>
              </div>
              <textarea
                className="ed-prompt"
                placeholder="What should change? e.g. 'turn the day scene into a moody night with neon signs reflecting on wet pavement'"
                value={prompt}
                maxLength={600}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {/* Spacer */}
            <div className="ed-sidebar-spacer" />

            {/* Output type */}
            <div className="ed-field">
              <div className="ed-field-label">
                <span>Output</span>
                <span className="ed-field-hint">Choose what to generate</span>
              </div>
              <div className="ed-segments" role="radiogroup">
                <button
                  type="button"
                  className={`ed-seg${outputMode === 'image' ? ' ed-seg--active' : ''}`}
                  onClick={() => setOutputMode('image')}
                >
                  <Icon icon="mdi:image" width={16} />
                  Image <span className="ed-seg-sm">1 cr</span>
                </button>
                <button
                  type="button"
                  className={`ed-seg${outputMode === 'video' ? ' ed-seg--active' : ''}`}
                  onClick={() => setOutputMode('video')}
                >
                  <Icon icon="mdi:video" width={16} />
                  Video <span className="ed-seg-sm">8 cr</span>
                </button>
              </div>
            </div>

            {/* Generate */}
            <div className="ed-generate-wrap">
              <button
                type="button"
                className="ed-generate"
                onClick={handleApply}
                disabled={isApplying || !hasImage || !hasPrompt}
              >
                {isApplying ? (
                  <><Icon icon="mdi:loading" width={16} className="ed-spinner" />Generating…</>
                ) : (
                  <><Icon icon="mdi:auto-awesome" width={16} />Generate {outputMode}<span className="ed-kbd">⌘ ↵</span></>
                )}
              </button>
            </div>
          </aside>

          {/* ── RIGHT canvas ── */}
          <div className="ed-canvas ed-canvas--full">

            {/* Result panel */}
            <div className="ed-panel ed-result-panel ed-result-panel--full">
              <div className="ed-result-head">
                <div className={`ed-result-title${result ? ' ed-result-title--live' : ''}`}>
                  <span className="ed-result-dot" />
                  <span>Result</span>
                </div>
                <div className="ed-result-actions">
                  {result && (
                    <a href={result.url} download className="ed-tool-btn">
                      <Icon icon="mdi:download" width={12} />Download
                    </a>
                  )}
                  <button type="button" className="ed-tool-btn" disabled={!result} onClick={() => { setResult(null); }}>
                    <Icon icon="mdi:refresh" width={12} />Re-run
                  </button>
                </div>
              </div>

              <div className="ed-result-stage">
                {result ? (
                  result.type === 'image' ? (
                    <img src={result.url} alt="Generated result" className="ed-result-media" />
                  ) : (
                    <video src={result.url} controls autoPlay loop className="ed-result-media" />
                  )
                ) : (
                  <div className="ed-empty-state">
                    <div className="ed-empty-ico">
                      <Icon icon="mdi:image-auto-adjust" width={36} />
                    </div>
                    <h3 className="ed-empty-title">Your result will appear <em>here.</em></h3>
                    <p className="ed-empty-sub">Add a starting image and a clear instruction, then hit Generate.</p>
                    <ul className="ed-checklist">
                      <li className={hasImage ? 'ed-check--done' : ''}>
                        <span className="ed-chk"><Icon icon="mdi:check" width={10} /></span>
                        Upload a starting image
                      </li>
                      <li className={hasPrompt ? 'ed-check--done' : ''}>
                        <span className="ed-chk"><Icon icon="mdi:check" width={10} /></span>
                        Describe the change you want
                      </li>
                      <li className="ed-check--done">
                        <span className="ed-chk"><Icon icon="mdi:check" width={10} /></span>
                        Pick output: image or video
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
