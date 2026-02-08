import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import './Image.css';
import { Modality } from '@google/genai';
import { getGenAI } from '../../lib/genai-vertex';
import { ImageResultModal } from './ImageResultModal';

const GOOGLE_ICON = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/500px-Google_%22G%22_logo.svg.png';
const GPT_IMAGE_ICON = 'https://cdn-icons-png.flaticon.com/512/11865/11865326.png';

const MODELS = [
  { id: 'nano-banana', name: 'Nano Banana', iconUrl: GOOGLE_ICON },
//   { id: 'gpt-image', name: 'GPT Image', iconUrl: GPT_IMAGE_ICON },
] as const;

const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';

function fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] ?? '';
      resolve({ data: base64, mimeType: file.type || 'image/png' });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const SHOWCASE_IMAGES = [
  "https://deepseekimagegenerator.in/public/gallery/girl.png",
  "https://image-generator.com/assets/img/ai-generated-image-main.png",
  "https://deep-image.ai/blog/content/images/2023/07/Reklama--1050-680-px---7-.jpg",
  "https://nwdistrict.ifas.ufl.edu/hort/files/2024/11/Screenshot-2024-11-22-at-1.23.54%E2%80%AFPM.png",
  "https://images.euronews.com/articles/stories/09/03/97/54/1536x864_cmsv2_f9876cfc-33a5-5247-9b9f-3b5130f7852d-9039754.jpg",
  "https://gravitec.net/blog/wp-content/uploads/2023/08/rsz_alexmaker_limitations_of_mind_in_chroma_universe_c43069fb-1540-458f-9da5-790b6fc105f5.jpg",
  "https://cdn.cgdream.ai/_next/image?url=https%3A%2F%2Fapi.cgdream.ai%2Frails%2Factive_storage%2Fblobs%2Fredirect%2FeyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBOWRubUE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ%3D%3D--e5e3a0bae84a62a61280e5a64970eb2d38d7f394%2Fad4d4a3f-e5e7-41b3-9622-5ee909d6d417_0.png&w=1080&q=95",
  "https://www.thephoblographer.com/wp-content/uploads/2023/02/AI-3.png",
  "https://images.tech.co/wp-content/uploads/2023/11/21202640/AI-generated-landscape.jpg",
  "https://www.ghacks.net/wp-content/uploads/2023/08/AI-generated-art-copyright.jpg",
  "https://media.licdn.com/dms/image/v2/D5612AQExCHMUUIAqkg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1683151493670?e=2147483647&v=beta&t=VYdYM91-sYgzDR5FJS5VLbNglMijqbNOs1VwkFyiH50",
  "https://news.ubc.ca/wp-content/uploads/2023/08/AdobeStock_559145847.jpeg",
  "https://zatap.io/wp-content/uploads/2023/01/22acc109-736b-480c-a6f7-8ee4e0fc61ed.jpg",
  "https://www.e-spincorp.com/wp-content/uploads/2025/03/AI-Generated-Art-Generative-AI.jpeg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgW21hMGi6550AJ0vcdN3UIKE6EXfNkV7Seg&s",
  "https://p.potaufeu.asahi.com/1831-p/picture/27695628/89644a996fdd0cfc9e06398c64320fbe.jpg"
];

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
    const ai = getGenAI();

    if (!ai) {
      toast.error('API key not set', {
        description: 'Add VITE_GEMINI_API_KEY to your .env file.',
      });
      return;
    }
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
      const contents: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
        { text: prompt.trim() },
      ];

      if (promptImage?.file) {
        const { data, mimeType } = await fileToBase64(promptImage.file);
        contents.push({ inlineData: { mimeType, data } });
      }
      const response = await ai.models.generateContent({
        model: IMAGE_GEN_MODEL,
        contents,
        config: { responseModalities: [Modality.IMAGE] },
      });
      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts?.length) {
        toast.error('No content in response', { id: toastId });
        return;
      }
      for (const part of candidate.content.parts) {
        if ('inlineData' in part && part.inlineData?.data) {
          const { data, mimeType } = part.inlineData;
          setGeneratedImage(`data:${mimeType || 'image/png'};base64,${data}`);
          setResultModalOpen(true);
          toast.success('Image generated', {
            id: toastId,
            description: 'Your image is ready.',
          });
          return;
        }
      }
      toast.error('No image in response', {
        id: toastId,
        description: 'Try a prompt that clearly asks for an image.',
      });
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
          <div className="image-tutorial-step">
            <span className="image-tutorial-step-badge" aria-hidden>1</span>
            <div className="image-tutorial-step-icon-wrap">
              <Icon icon="mdi:image-plus" className="image-tutorial-step-icon" width={36} />
            </div>
            <h3 className="image-tutorial-step-title">Add reference image</h3>
            <p className="image-tutorial-step-desc">
              Upload or paste an image to guide style or subject (optional).
            </p>
          </div>

          <div className="image-tutorial-step">
            <span className="image-tutorial-step-badge" aria-hidden>2</span>
            <div className="image-tutorial-step-icon-wrap">
              <Icon icon="mdi:lead-pencil" className="image-tutorial-step-icon" width={36} />
            </div>
            <h3 className="image-tutorial-step-title">Enter prompt</h3>
            <p className="image-tutorial-step-desc">
              Describe the scene you imagine, with details.
            </p>
          </div>

          <div className="image-tutorial-step">
            <span className="image-tutorial-step-badge" aria-hidden>3</span>
            <div className="image-tutorial-step-icon-wrap">
              <Icon icon="mdi:image-check" className="image-tutorial-step-icon" width={36} />
            </div>
            <h3 className="image-tutorial-step-title">Get your image</h3>
            <p className="image-tutorial-step-desc">
              Click Generate to create your final image.
            </p>
          </div>
        </div>
        </section>
      </div>
    </div>
  );
}
