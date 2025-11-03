interface StepIndicatorProps {
  currentStep: 'vocabulary' | 'games' | 'link';
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <div className={`flex items-center gap-2 ${currentStep === 'vocabulary' ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'vocabulary' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          1
        </div>
        <span className="text-sm font-medium">Vocabulary</span>
      </div>
      <div className="w-12 h-0.5 bg-border" />
      <div className={`flex items-center gap-2 ${currentStep === 'games' ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'games' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          2
        </div>
        <span className="text-sm font-medium">Games</span>
      </div>
      <div className="w-12 h-0.5 bg-border" />
      <div className={`flex items-center gap-2 ${currentStep === 'link' ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'link' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          3
        </div>
        <span className="text-sm font-medium">Link</span>
      </div>
    </div>
  );
}
