import playsData from '@/data/plays_all.json';
import { Play } from '@/types';
import PlaysSearch from '@/components/PlaysSearch';

export default function PlaysPage() {
  return <PlaysSearch plays={playsData as Play[]} />;
}
