import type { AppInfo } from '../types';

export const allApps: AppInfo[] = [
  {
    id: "seo-optimizer",
    name: "Avada SEO Image Optimizer",
    url: "https://apps.shopify.com/avada-seo-suite?utm_source=event_shopx_2025&utm_medium=website",
    tags: ['all', 'beginners', 'scaling', 'migrators', 'fashion', 'b2b']
  },
  {
    id: "blog-builder",
    name: "SEO On: AI Blog Post Builder",
    url: "https://apps.shopify.com/seoon-blog?utm_source=event_shopx_2025&utm_medium=website",
    tags: ['all', 'scaling', 'migrators', 'b2b', 'fashion']
  },
  {
    id: "product-description",
    name: "SEO On: AI Product Description",
    url: "https://apps.shopify.com/ai-product-copy?surface_intra_position=2&surface_type=partners&surface_version=redesign",
    tags: ['all', 'beginners', 'dropshippers', 'fashion']
  },
  {
    id: "aeo-optimizer",
    name: "SEO On: AEO optimizer llms.txt",
    url: "https://apps.shopify.com/aeo-llms-txt?surface_intra_position=4&surface_type=partners&surface_version=redesign",
    tags: ['all', 'scaling', 'b2b']
  }
];

export const audienceOptions = [
  { value: "all", label: "All Merchants (General Audience)"},
  { value: "beginners", label: "Beginner Store Owners (New to Shopify, need foundational SEO)"},
  { value: "scaling", label: "Scaling Brands (Optimizing for conversion & speed at scale)"},
  { value: "dropshippers", label: "Dropshippers (Focused on product descriptions & quick setup)"},
  { value: "fashion", label: "DTC Fashion Brands (Emphasis on visual SEO & branding)"},
  { value: "migrators", label: "Marketplace Migrators (Moving from Etsy/Amazon, need to build organic traffic)"},
  { value: "b2b", label: "B2B Merchants (Content focused on wholesale & technical SEO)"},
];