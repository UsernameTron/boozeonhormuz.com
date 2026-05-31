import { OGImageRoute } from 'astro-og-canvas';

// Per-page social cards — gold-on-black brand treatment. The homepage uses the
// hero photo (/og-home.jpg, set in BaseLayout); these cover the static routes.
const pages = {
  'evidence-lounge': { title: 'The Evidence Lounge', description: 'Clips, commercials, songs, and assorted very legal receipts.' },
  watch: { title: 'Watch', description: 'Episodes of Who the Hell Is Don Biggly?' },
  products: { title: 'Products', description: 'Premium amenities for the discerning crisis.' },
  'sponsor-reads': { title: 'Sponsor Reads', description: 'A word from our very legal sponsors.' },
  quotes: { title: 'Quotes', description: 'Things that were, regrettably, said out loud.' },
  about: { title: 'Who the Hell Is Don Biggly?', description: 'An introduction, reluctantly provided.' },
  legal: { title: 'Very Legal Disclaimer', description: 'This is parody. A lot of people, everyone really knows that.' },
};

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    logo: undefined,
    bgGradient: [
      [17, 17, 17],
      [35, 35, 35],
    ],
    border: { color: [200, 162, 74], width: 14, side: 'inline-start' }, // brass spine
    padding: 80,
    font: {
      title: { color: [200, 162, 74], size: 80, weight: 'Bold', lineHeight: 1.1 }, // gold
      description: { color: [244, 232, 208], size: 34, lineHeight: 1.4 }, // champagne
    },
  }),
});
