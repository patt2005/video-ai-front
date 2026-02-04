import './Scrollable.css';

type ScrollDirection = 'both' | 'x' | 'y';
type ScrollHeight = 'sm' | 'md' | 'lg' | 'full' | 'none';

interface ScrollableProps {
  children: React.ReactNode;
  direction?: ScrollDirection;
  height?: ScrollHeight;
  className?: string;
}

export default function Scrollable({
  children,
  direction = 'both',
  height = 'none',
  className = '',
}: ScrollableProps) {
  const classes = [
    'scrollable',
    direction === 'x' && 'scrollable--x',
    direction === 'y' && 'scrollable--y',
    height !== 'none' && `scrollable-h-${height}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
