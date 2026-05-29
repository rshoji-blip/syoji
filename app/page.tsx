import animeData from '@/data/anime-data.json';
import synopsesData from '@/data/synopses.json';
import { Episode } from '@/types';
import AnimeSearch from '@/components/AnimeSearch';

const synopses = synopsesData as Record<string, string>;

const episodes: Episode[] = (animeData as Episode[]).map((ep) => ({
  ...ep,
  synopsis: synopses[ep.id] ?? undefined,
}));

export default function Home() {
  return <AnimeSearch episodes={episodes} />;
}
