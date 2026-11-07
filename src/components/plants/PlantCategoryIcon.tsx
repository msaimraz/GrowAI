import React from 'react';
import {
  Sprout,
  Carrot,
  Leaf,
  Salad,
  Flower2,
  Home,
  Sun,
  Sparkles,
  LucideProps,
} from 'lucide-react';

export interface PlantCategoryIconProps extends Omit<LucideProps, 'ref'> {
  category: string;
  size?: number;
  className?: string;
}

export function PlantCategoryIcon({
  category,
  size = 18,
  className = '',
  ...props
}: PlantCategoryIconProps) {
  const norm = (category || '').toLowerCase().trim();

  switch (norm) {
    case 'all':
    case 'sprouts':
    case 'microgreens':
      return <Sprout size={size} className={className} {...props} />;

    case 'edible':
    case 'vegetables-fruits':
    case 'vegetables':
    case 'fruits':
      return <Carrot size={size} className={className} {...props} />;

    case 'herbs':
    case 'herbs-greens':
      return <Leaf size={size} className={className} {...props} />;

    case 'leafy':
    case 'greens':
      return <Salad size={size} className={className} {...props} />;

    case 'flowers':
    case 'flowering':
      return <Flower2 size={size} className={className} {...props} />;

    case 'indoor':
    case 'indoor-decorative':
    case 'decorative':
      return <Home size={size} className={className} {...props} />;

    case 'balcony':
    case 'outdoor':
      return <Sun size={size} className={className} {...props} />;

    case 'beginner':
    case 'medicinal-aromatic':
    case 'medicinal':
      return <Sparkles size={size} className={className} {...props} />;

    default:
      return <Sprout size={size} className={className} {...props} />;
  }
}

