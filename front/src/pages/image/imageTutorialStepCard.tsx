import { Icon } from '@iconify/react';
import '../../styles/Image.css';

export type ImageTutorialStep = {
  step: number;
  icon: string;
  title: string;
  description: string;
};

type ImageTutorialStepCardProps = ImageTutorialStep;

export function ImageTutorialStepCard({ step, icon, title, description }: ImageTutorialStepCardProps) {
  return (
    <div className="image-tutorial-step">
      <span className="image-tutorial-step-badge" aria-hidden>
        {step}
      </span>
      <div className="image-tutorial-step-icon-wrap">
        <Icon icon={icon} className="image-tutorial-step-icon" width={36} />
      </div>
      <h3 className="image-tutorial-step-title">{title}</h3>
      <p className="image-tutorial-step-desc">{description}</p>
    </div>
  );
}
