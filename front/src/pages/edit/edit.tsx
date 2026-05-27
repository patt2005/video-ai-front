import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import '../../styles/edit.css';

type RefImage = { file: File; preview: string };

export default function Edit() {
  const [sourceVideo, setSourceVideo] = useState<{ file: File; preview: string } | null>(null);
  const [referenceImages, setReferenceImages] = useState<RefImage[]>([]);
  const [editPrompt, setEditPrompt] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  void setEditPrompt;

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('video/')) {
      toast.error('Invalid file', { description: 'Please select a video file.' });
      return;
    }
    if (sourceVideo?.preview) URL.revokeObjectURL(sourceVideo.preview);
    setSourceVideo({ file, preview: URL.createObjectURL(file) });
    e.target.value = '';
  };

  const clearSourceVideo = () => {
    if (sourceVideo?.preview) URL.revokeObjectURL(sourceVideo.preview);
    setSourceVideo(null);
  };
  void clearSourceVideo;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newRefs: RefImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      newRefs.push({ file, preview: URL.createObjectURL(file) });
    }
    if (newRefs.length) {
      setReferenceImages((prev) => [...prev, ...newRefs].slice(0, 4));
    }
    e.target.value = '';
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleApplyEdit = async () => {
    if (!sourceVideo) {
      toast.error('No video', {
        description: 'Upload a video to edit first.',
      });
      return;
    }
    if (!editPrompt.trim()) {
      toast.error('Edit prompt is empty', {
        description: 'Describe how you want to edit the video (e.g. "change the sky to sunset", "add rain").',
      });
      return;
    }

    setIsApplying(true);
    const toastId = toast.loading('Applying edit…', {
      description: 'AI is editing your video. This may take a minute.',
    });

    try {
      // TODO: call backend (e.g. Veo 3 / Sora-style API) with:
      // - sourceVideo.file (or URL)
      // - referenceImages (optional)
      // - editPrompt
      await new Promise((r) => setTimeout(r, 3000));
      toast.success('Edit applied', { id: toastId });
    } catch (err) {
      toast.error('Edit failed', {
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
        <header className="edit-page-header">
          <h1 className="edit-page-title">Edit video with AI</h1>
          <p className="edit-page-subtitle">
            Upload a video, add reference images (optional), and describe your edit. Models like Veo 3 or Sora will apply the changes.
          </p>
        </header>

        <div className="edit-page-layout">
          <div className="edit-panel">
            {/* Source video */}
            <div className="edit-section">
              <label className="edit-section-label">Source video</label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="edit-file-input"
                aria-label="Upload video to edit"
                onChange={handleVideoSelect}
              />
              {sourceVideo ? (
                  <a></a>
                // <div className="edit-video-preview-wrap">
                //   <video
                //     src={sourceVideo.preview}
                //     className="edit-video-preview"
                //     controls
                //     muted
                //     playsInline
                //     aria-label="Source video preview"
                //   />
                //   <button
                //     type="button"
                //     className="edit-video-clear"
                //     onClick={clearSourceVideo}
                //     aria-label="Remove video"
                //   >
                //     <Icon icon="mdi:close" width={18} />
                //   </button>
                // </div>
              ) : (
                <button
                  type="button"
                  className="edit-upload-area"
                  onClick={() => videoInputRef.current?.click()}
                  aria-label="Upload video"
                >
                  <Icon icon="mdi:video-plus" width={32} height={32} className="edit-upload-icon" />
                  <span>Upload video to edit</span>
                </button>
              )}
            </div>

            {/* Reference images */}
            <div className="edit-section edit-section--ref-images">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="edit-file-input"
                aria-label="Add reference images"
                onChange={handleImageSelect}
              />
              <div className="edit-ref-images">
                {referenceImages.map((ref, i) => (
                  <div key={i} className="edit-ref-thumb-wrap">
                    <img src={ref.preview} alt="" className="edit-ref-thumb" />
                    <button
                      type="button"
                      className="edit-ref-remove"
                      onClick={() => removeReferenceImage(i)}
                      aria-label="Remove reference image"
                    >
                      <Icon icon="mdi:close" width={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit prompt */}
            {/*<div className="edit-section">*/}
            {/*  <label className="edit-section-label" htmlFor="edit-prompt">Edit prompt</label>*/}
            {/*  <textarea*/}
            {/*    id="edit-prompt"*/}
            {/*    className="edit-prompt-input"*/}
            {/*    placeholder="e.g. Change the sky to a dramatic sunset, add light rain, make the scene look like winter..."*/}
            {/*    value={editPrompt}*/}
            {/*    onChange={(e) => setEditPrompt(e.target.value)}*/}
            {/*    rows={4}*/}
            {/*    aria-label="Describe how to edit the video"*/}
            {/*  />*/}
            {/*</div>*/}

            <button
              type="button"
              className="edit-apply-btn"
              onClick={handleApplyEdit}
              disabled={isApplying || !sourceVideo || !editPrompt.trim()}
            >
              {isApplying ? (
                <span className="edit-apply-loading">
                  <Icon icon="mdi:loading" width={20} className="edit-apply-spinner" />
                  Applying…
                </span>
              ) : (
                'Apply edit'
              )}
            </button>
          </div>

          <aside className="edit-tips">
            <div className="edit-tips-image-wrap">
              <img
                src="https://placehold.co/400x220/1f2937/9ca3af?text=How+it+works"
                alt=""
                className="edit-tips-image"
              />
            </div>
            <h2 className="edit-tips-title">How it works</h2>
            <ul className="edit-tips-list">
              <li>
                <Icon icon="mdi:video" width={20} aria-hidden />
                <span>Upload the video you want to change.</span>
              </li>
              <li>
                <Icon icon="mdi:image-multiple" width={20} aria-hidden />
                <span>Optionally add reference images for style or content.</span>
              </li>
              <li>
                <Icon icon="mdi:lead-pencil" width={20} aria-hidden />
                <span>Describe the edit in plain language (e.g. “add snow”, “change to night”).</span>
              </li>
              <li>
                <Icon icon="mdi:robot" width={20} aria-hidden />
                <span>AI (Veo 3 / Sora-style) will apply your edit to the video.</span>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
