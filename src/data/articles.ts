import { EditorialArticle } from '@/types/article';

export const ARTICLES_DATA: EditorialArticle[] = [
  {
    id: 'article-1',
    slug: 'five-growth-essentials',
    title: 'The Five Growth Essentials of Home Botany',
    summary:
      'Master the critical environmental inputs—water, light, airflow, living soil nutrition, and root volume—that govern plant vigor in compact urban spaces.',
    category: 'beginner',
    categoryLabel: 'Beginner Gardening Essentials',
    publishedAt: '2026-10-15',
    keyTakeaways: [
      'Water when the top 3 cm of substrate is dry, not by a rigid calendar.',
      'Fruiting crops require 6+ hours of direct sun; leafy greens thrive on 3-4 hours.',
      'Permanent pore space in potting soil is essential for root cellular respiration.',
    ],
    seo: {
      metaTitle: 'The Five Growth Essentials of Home Botany — GrowAI',
      metaDescription:
        'A comprehensive guide to environmental variables for container and balcony gardening.',
    },
  },
  {
    id: 'article-2',
    slug: 'vertical-rack-microclimates',
    title: 'Designing Vertical Farming Racks & Tiered Microclimates',
    summary:
      'How to stack plants vertically to optimize sunlight capture, manage cascade drainage, and prevent air stagnation on apartment balconies.',
    category: 'vertical-farming',
    categoryLabel: 'Vertical Farming & Microclimates',
    publishedAt: '2026-10-18',
    keyTakeaways: [
      'Top tiers receive highest photoperiod intensity and wind exposure; ideal for dwarf tomatoes and basil.',
      'Middle tiers maintain moderate humidity and sheltered light; ideal for lettuces and strawberries.',
      'Bottom tiers hold heaviest containers and moisture runoff; ideal for mint and shade-tolerant herbs.',
    ],
    seo: {
      metaTitle: 'Designing Vertical Farming Racks — GrowAI',
      metaDescription:
        'Maximize limited small spaces with vertical tiered shelving and smart microclimate management.',
    },
  },
  {
    id: 'article-3',
    slug: 'botanical-lifecycle-stages',
    title: 'Deciphering the Botanical Lifecycle: Seed to Harvest',
    summary:
      'Understand the developmental milestones from radicle emergence and cotyledons to true leaves, flowering, and seed saving.',
    category: 'growth-stages',
    categoryLabel: 'Botanical Lifecycle & Growth Stages',
    publishedAt: '2026-10-20',
    keyTakeaways: [
      'Cotyledons are embryonic seed leaves; true leaves indicate authentic photosynthetic capacity.',
      'Pinching early terminal buds on herbs stimulates lateral branching and doubled yields.',
      'Continuous cut-and-come-again harvesting prevents leafy greens from bolting prematurely.',
    ],
    seo: {
      metaTitle: 'Deciphering the Botanical Lifecycle — GrowAI',
      metaDescription:
        'A developmental guide from seed embryo to harvest and seed collection.',
    },
  },
  {
    id: 'article-4',
    slug: '3rs-sustainable-urban-gardening',
    title: 'The 3Rs of Sustainable Urban Gardening: Reduce, Reuse, Recycle',
    summary:
      'Close the ecological loop on your balcony: reduce municipal water demand with cascade capture, upcycle food-grade containers, and compost kitchen scraps.',
    category: 'sustainability-3rs',
    categoryLabel: 'Sustainable Gardening & The 3Rs',
    publishedAt: '2026-10-22',
    keyTakeaways: [
      'Reduce: Collect top-tier runoff with drip trays to irrigate lower thirsty shelves.',
      'Reuse: Transform #2 (HDPE) and #5 (PP) food containers into safe, drainage-drilled planters.',
      'Recycle: Maintain a 2:1 brown-to-green carbon ratio for odorless balcony composting.',
    ],
    seo: {
      metaTitle: 'The 3Rs of Sustainable Urban Gardening — GrowAI',
      metaDescription:
        'Practical zero-waste gardening techniques for eco-conscious home growers.',
    },
  },
  {
    id: 'article-5',
    slug: 'common-balcony-plant-problems',
    title: 'Troubleshooting Common Balcony Plant Pathology & Deficiencies',
    summary:
      'Learn how to identify, prevent, and treat powdery mildew, aphid infestations, blossom end rot, and iron chlorosis organically.',
    category: 'troubleshooting',
    categoryLabel: 'Troubleshooting & Pathology',
    publishedAt: '2026-10-25',
    keyTakeaways: [
      'Interveinal yellowing on young leaves suggests iron chlorosis from alkaline pH.',
      'Black sunken fruit bottoms (blossom end rot) indicate irregular watering hindering calcium uptake.',
      'Diluted potassium bicarbonate or neem oil spray treats fungal spore germination safely.',
    ],
    seo: {
      metaTitle: 'Troubleshooting Balcony Plant Problems — GrowAI',
      metaDescription:
        'Organic diagnosis and remedies for common indoor and balcony gardening challenges.',
    },
  },
];

export function getArticleBySlug(slug: string): EditorialArticle | undefined {
  return ARTICLES_DATA.find((a) => a.slug === slug);
}
