import animeData from '@/data/anime-data.json';
import { Episode } from '@/types';
import AnimeSearch from '@/components/AnimeSearch';

export default function Home() {
  return <AnimeSearch episodes={animeData as Episode[]} />;
}
