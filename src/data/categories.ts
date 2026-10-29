import { CategoryMetadata } from '@/types/plant';

export const PLANT_CATEGORIES: CategoryMetadata[] = [
  {
    id: 'vegetables-fruits',
    label: 'Vegetables & Fruits',
    description: 'Compact fruiting crops and root vegetables suitable for home containers and vertical towers.',
    iconName: 'Apple',
  },
  {
    id: 'herbs-greens',
    label: 'Herbs & Leafy Greens',
    description: 'Fast-growing kitchen culinary staples, tender salad leaves, and cut-and-come-again herbs.',
    iconName: 'Salad',
  },
  {
    id: 'indoor-decorative',
    label: 'Indoor & Decorative',
    description: 'Hardy foliage plants celebrated for home beauty, low-maintenance care, and ambient greenery.',
    iconName: 'Home',
  },
  {
    id: 'flowering',
    label: 'Flowering Plants',
    description: 'Pollinator-attracting blooms and natural pest-repellent garden companions for bright spaces.',
    iconName: 'Flower2',
  },
  {
    id: 'medicinal-aromatic',
    label: 'Traditional Medicinal & Aromatic',
    description: 'Revered botanicals traditionally used for comforting herbal infusions and aromatic tea gardens.',
    iconName: 'Sparkles',
  },
  {
    id: 'microgreens',
    label: 'Microgreens & Quick-Harvest',
    description: 'Nutrient-dense young shoots ready to harvest in 7 to 14 days on bright kitchen windowsills.',
    iconName: 'Sprout',
  },
];
