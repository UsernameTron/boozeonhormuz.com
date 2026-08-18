import { OGImageRoute } from 'astro-og-canvas';

// Per-page social cards — gold-on-black brand treatment. The homepage uses the
// hero photo (/og-home.jpg, set in BaseLayout); these cover the static routes.
const pages = {
  album: { title: 'The Album', description: 'Musical satire, assembled in public — one tremendous track at a time.' },
  listen: { title: 'Listen', description: 'Tracks and audio from the Booze on Hormuz album.' },
  archive: { title: 'The Archive', description: 'Tracks, films, performances, stills, posters — everything, admissible.' },
  studio: { title: 'The Studio', description: 'Original musical comedy turned into finished media.' },
  play: { title: 'The Exit Strategy', description: 'The ship is sinking. The exit is free. That’s the problem. A playable Don Biggly disaster.' },
  press: { title: 'Press', description: 'What Booze on Hormuz is, in plain language.' },
  'evidence-lounge': { title: 'The Evidence Lounge', description: 'Clips, commercials, songs, and assorted very legal receipts.' },
  watch: { title: 'Watch', description: 'Music videos, performances, sketches, and shorts.' },
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
    // Local TTFs (src/assets/og-fonts/) — on-brand faces, and no build-time
    // font download (the default fetches Noto Sans from api.fontsource.org).
    fonts: ['./src/assets/og-fonts/Fraunces_700Bold.ttf', './src/assets/og-fonts/Inter_400Regular.ttf'],
    font: {
      title: { families: ['Fraunces'], color: [200, 162, 74], size: 80, weight: 'Bold', lineHeight: 1.1 }, // gold
      description: { families: ['Inter'], color: [244, 232, 208], size: 34, lineHeight: 1.4 }, // champagne
    },
  }),
});
