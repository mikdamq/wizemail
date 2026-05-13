'use client';

import { useEffect, useState } from 'react';
import { OnboardingTour } from '@/components/OnboardingTour';

const TOUR_SEEN_KEY = 'wizemail-tour-seen';
const TOUR_TRIGGER_KEY = 'wizemail-show-tour';

export function OnboardingController() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowTour(
        localStorage.getItem(TOUR_TRIGGER_KEY) === 'true' &&
        localStorage.getItem(TOUR_SEEN_KEY) !== 'true'
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const finishTour = () => {
    localStorage.setItem(TOUR_SEEN_KEY, 'true');
    localStorage.removeItem(TOUR_TRIGGER_KEY);
    setShowTour(false);
  };

  if (!showTour) return null;

  return (
    <OnboardingTour
      onComplete={finishTour}
      onSkip={finishTour}
    />
  );
}
