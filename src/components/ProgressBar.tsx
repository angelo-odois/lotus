import { Step } from '@/types/form';
import { config } from '@/config';

interface ProgressBarProps {
  currentStep: Step;
  totalSteps: number;
  progressPercentage: number;
  shouldShowSpouseStep: boolean;
  goToStep: (step: Step) => void;
}

export function ProgressBar({ 
  currentStep, 
  totalSteps, 
  progressPercentage, 
  shouldShowSpouseStep,
  goToStep 
}: ProgressBarProps) {
  return (
    <div className="mb-8">
      {/* Labels dos passos - estilo mais próximo do original */}
      <div className="flex flex-wrap justify-between gap-2 mb-6">
        {config.steps.map((label, index) => {
          const stepNum = (index + 1) as Step;
          const isSpouseStep = stepNum === 3;
          
          if (isSpouseStep && !shouldShowSpouseStep) {
            return <div key={stepNum} className="flex-1" />; // Espaço vazio proporcional
          }

          const isActive = currentStep >= stepNum;
          const isAccessible = stepNum <= currentStep || stepNum === currentStep + 1;
          
          return (
            <button
              key={stepNum}
              onClick={() => isAccessible ? goToStep(stepNum) : undefined}
              className={`
                flex-1 text-xs md:text-sm font-medium px-2 py-2 rounded-lg transition-all duration-300 cursor-pointer text-center
                ${isActive 
                  ? 'text-[#1A1A1A] bg-[#FFC629] shadow-lg font-semibold' 
                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700'
                }
                ${!isAccessible ? 'cursor-not-allowed opacity-50' : ''}
              `}
              disabled={!isAccessible}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Barra de progresso - mais próxima do original */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6 shadow-inner">
        <div 
          className="bg-gradient-to-r from-[#FFC629] to-[#FFD93D] h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Indicadores circulares - estilo original */}
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNum = (index + 1) as Step;
          const isSpouseStep = stepNum === 3;
          
          if (isSpouseStep && !shouldShowSpouseStep) {
            return <div key={stepNum} className="w-10 h-10" />; // Espaço vazio
          }

          const isActive = currentStep >= stepNum;
          const isCurrent = currentStep === stepNum;

          return (
            <button
              key={stepNum}
              onClick={() => goToStep(stepNum)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-pointer
                ${isActive 
                  ? 'bg-[#FFC629] text-[#1A1A1A] shadow-lg transform scale-110' 
                  : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                }
                ${isCurrent ? 'ring-4 ring-[#FFD93D] ring-opacity-50 shadow-xl' : ''}
              `}
            >
              {stepNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}