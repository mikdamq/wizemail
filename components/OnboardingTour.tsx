'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const TOUR_STEPS = [
  {
    title: 'Welcome to Wizemail!',
    content: 'This quick tour will open the builder and point to the main controls you will use to create, preview, personalize, and export an HTML email.',
    target: null,
    route: '/',
  },
  {
    title: 'Start with a blank canvas',
    content: 'This is the fastest way into the editor. The tour will open the builder from here and continue inside the app.',
    target: '[data-tour="start-builder"]',
    route: '/',
  },
  {
    title: 'Add sections',
    content: 'Use Add section to place email blocks like headers, hero areas, images, buttons, and layouts onto the canvas.',
    target: '[data-tour="add-section"]',
    route: '/builder',
  },
  {
    title: 'Visual & Code Editing',
    content: 'Switch between Visual (drag & drop) and Code (direct HTML) modes. Your changes sync automatically.',
    target: '[data-tour="mode-toggle"]',
    route: '/builder',
  },
  {
    title: 'Merge Variables',
    content: 'Use Variables to add merge tags like {{firstName}} and preview them with sample values while keeping the raw tags in exported HTML.',
    target: '[data-tour="variables"]',
    route: '/builder',
  },
  {
    title: 'Real-time Preview',
    content: 'See how your email looks across different email clients. Test with Gmail, Outlook, and Apple Mail.',
    target: '[data-tour="preview"]',
    route: '/builder',
  },
  {
    title: 'Edit selected content',
    content: 'When you select a section, this panel becomes the control room for copy, images, spacing, accessibility, and compatibility checks.',
    target: '[data-tour="inspector"]',
    route: '/builder',
  },
  {
    title: 'Export & Test',
    content: 'Export optimized HTML for your ESP, or send test emails directly from the builder.',
    target: '[data-tour="export"]',
    route: '/builder',
  },
];

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });
  const [tooltipHeight, setTooltipHeight] = useState(260);

  const step = TOUR_STEPS[currentStep];
  const isOnStepRoute = pathname === step.route;

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => onComplete?.(), 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => onSkip?.(), 300);
  };

  const measureTarget = useCallback(() => {
    if (!step.target || !isOnStepRoute) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (!element) {
      setTargetRect(null);
      return;
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    window.setTimeout(() => {
      setTargetRect(element.getBoundingClientRect());
    }, 220);
  }, [isOnStepRoute, step.target]);

  useEffect(() => {
    if (!isOnStepRoute) {
      router.replace(step.route, { scroll: false });
    }
  }, [isOnStepRoute, router, step.route]);

  useEffect(() => {
    const measureViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    const frame = window.requestAnimationFrame(() => {
      measureViewport();
      measureTarget();
    });
    const retry = window.setTimeout(measureTarget, 500);
    window.addEventListener('resize', measureViewport);
    window.addEventListener('resize', measureTarget);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(retry);
      window.removeEventListener('resize', measureViewport);
      window.removeEventListener('resize', measureTarget);
    };
  }, [measureTarget]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const height = tooltipRef.current?.offsetHeight;
      if (height) setTooltipHeight(height);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentStep, viewport.width]);

  if (!isVisible) return null;

  const spotlightPadding = 8;
  const spotlight = targetRect ? {
    left: Math.max(8, targetRect.left - spotlightPadding),
    top: Math.max(8, targetRect.top - spotlightPadding),
    right: Math.min(viewport.width - 8, targetRect.right + spotlightPadding),
    bottom: Math.min(viewport.height - 8, targetRect.bottom + spotlightPadding),
  } : null;
  const spotlightWidth = spotlight ? spotlight.right - spotlight.left : 0;
  const spotlightHeight = spotlight ? spotlight.bottom - spotlight.top : 0;
  const tooltipGap = 18;
  const tooltipWidth = Math.min(384, viewport.width - 32);
  const spaceAbove = spotlight ? spotlight.top - tooltipGap - 16 : 0;
  const spaceBelow = spotlight ? viewport.height - spotlight.bottom - tooltipGap - 16 : 0;
  const placement = spotlight
    ? spaceBelow >= tooltipHeight
      ? 'bottom'
      : spaceAbove >= tooltipHeight
      ? 'top'
      : 'floating'
    : 'center';
  const tooltipLeft = spotlight
    ? Math.max(16, Math.min(spotlight.left + spotlightWidth / 2 - tooltipWidth / 2, viewport.width - tooltipWidth - 16))
    : undefined;
  const tooltipTop = spotlight
    ? placement === 'top'
      ? Math.max(16, spotlight.top - tooltipGap - tooltipHeight)
      : placement === 'bottom'
      ? Math.min(viewport.height - tooltipHeight - 16, spotlight.bottom + tooltipGap)
      : Math.max(16, Math.min(spotlight.top + spotlightHeight / 2 - tooltipHeight / 2, viewport.height - tooltipHeight - 16))
    : undefined;
  const arrowLeft = spotlight
    ? Math.max(tooltipLeft ?? 16, Math.min(spotlight.left + spotlightWidth / 2 - 6, (tooltipLeft ?? 16) + tooltipWidth - 18))
    : undefined;

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      {/* Backdrop */}
      {!spotlight && (
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
      )}

      {spotlight && (
        <>
          <div
            className="absolute left-0 right-0 top-0 bg-black/65 backdrop-blur-[2px]"
            style={{ height: spotlight.top }}
          />
          <div
            className="absolute left-0 right-0 bottom-0 bg-black/65 backdrop-blur-[2px]"
            style={{ top: spotlight.bottom }}
          />
          <div
            className="absolute left-0 bg-black/65 backdrop-blur-[2px]"
            style={{ top: spotlight.top, width: spotlight.left, height: spotlightHeight }}
          />
          <div
            className="absolute right-0 bg-black/65 backdrop-blur-[2px]"
            style={{ top: spotlight.top, left: spotlight.right, height: spotlightHeight }}
          />
        </>
      )}

      {spotlight && (
        <>
          <div
            className="absolute rounded-xl border border-[#818cf8] shadow-[0_18px_44px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(129,140,248,0.18)] transition-all duration-200"
            style={{
              left: spotlight.left,
              top: spotlight.top,
              width: spotlightWidth,
              height: spotlightHeight,
            }}
          />
          {placement !== 'floating' && (
            <div
              className="absolute h-3 w-3 rotate-45 bg-[#1c1c1f] border-[#2a2a2e]"
              style={{
                left: arrowLeft,
                top: placement === 'top' ? (tooltipTop ?? 0) + tooltipHeight - 6 : (tooltipTop ?? 0) - 6,
                borderLeftWidth: placement === 'bottom' ? 1 : 0,
                borderTopWidth: placement === 'bottom' ? 1 : 0,
                borderRightWidth: placement === 'top' ? 1 : 0,
                borderBottomWidth: placement === 'top' ? 1 : 0,
              }}
            />
          )}
        </>
      )}

      {/* Tour content */}
      <div
        className={`relative flex min-h-full p-4 ${spotlight ? '' : 'items-center justify-center'}`}
      >
        <div
          ref={tooltipRef}
          className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-xl shadow-2xl max-w-md w-full pointer-events-auto transition-all duration-200"
          style={spotlight ? {
            position: 'fixed',
            width: tooltipWidth,
            left: tooltipLeft,
            top: tooltipTop,
          } : undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#2a2a2e]">
            <h3 className="text-lg font-semibold text-[#f4f4f5]">{step.title}</h3>
            <button
              onClick={handleSkip}
              className="text-[#3a3a3e] hover:text-[#f4f4f5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6">
              {step.content}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-1 mb-6">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-[#6366f1]' : 'bg-[#2a2a2e]'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f4f4f5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSkip}
                  className="px-3 py-2 text-sm text-[#3a3a3e] hover:text-[#a1a1aa] transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white text-sm font-medium rounded hover:bg-[#818cf8] transition-colors"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? 'Get started' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
