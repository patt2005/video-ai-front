type FeatureItem = {
  badge?: 'TOP' | 'NEW';
  title: string;
  description: string;
};

type ModelItem = {
  badge?: 'TOP' | 'NEW';
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  { title: 'Edit Video', description: 'Advanced video editing' },
  { badge: 'TOP', title: 'Inpaint', description: 'Select an area, describe the change' },
  { badge: 'NEW', title: 'Relight', description: 'Adjust lighting position, color, and brightness' },
  { title: 'AI Stylist', description: 'Find your perfect look' },
  { title: 'Upscale', description: 'Enhance resolution and quality' },
  { title: 'Skin Enhancer', description: 'Natural, realistic skin textures' },
  { title: 'Angles', description: 'Generate from different angles' },
];

const models: ModelItem[] = [
  { title: 'Nano Banana Pro Inpaint', description: 'Maximum detail and accuracy' },
  { title: 'Nano Banana Inpaint', description: 'Fast, lightweight edits' },
  { title: 'Product Placement', description: 'Seamless product integration' },
  { title: 'Topaz', description: 'High-resolution upscaler' },
  { badge: 'NEW', title: 'Grok Imagine Edit', description: 'Edit videos with text prompts' },
  { badge: 'TOP', title: 'Kling Motion Control', description: 'Control motion with video reference' },
  { badge: 'TOP', title: 'Kling 01 Edit', description: 'Advanced video editing' },
];

function Badge({ kind }: { kind: 'TOP' | 'NEW' }) {
  return <span className={`pill pill--${kind.toLowerCase()}`}>{kind}</span>;
}

function RowCard({
  badge,
  title,
  description,
}: {
  badge?: 'TOP' | 'NEW';
  title: string;
  description: string;
}) {
  return (
    <div className="row-card">
      <div className="row-icon" aria-hidden="true" />
      <div className="row-body">
        <div className="row-title">
          {badge ? <Badge kind={badge} /> : null}
          <span>{title}</span>
        </div>
        <div className="row-desc">{description}</div>
      </div>
    </div>
  );
}

export default function Video() {
  return (
    <div className="video-page">
      <div className="video-cols">
        <section>
          <div className="col-title">Features</div>
          <div className="stack">
            {features.map((item) => (
              <RowCard
                key={`${item.title}-${item.description}`}
                badge={item.badge}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="col-title">Models</div>
          <div className="stack">
            {models.map((item) => (
              <RowCard
                key={`${item.title}-${item.description}`}
                badge={item.badge}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

