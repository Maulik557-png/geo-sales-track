import { useJourney as useJourneyContext } from '../contexts/JourneyContext';

export const useJourney = () => {
  return useJourneyContext();
};
