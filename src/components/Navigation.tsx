import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSubmit?: () => void;
}

export function Navigation({ 
  currentStep, 
  totalSteps, 
  isSubmitting, 
  onNext, 
  onPrev,
  onSubmit
}: NavigationProps) {
  const handlePrevClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔘 Botão Prev clicado!');
    onPrev();
  };

  const handleNextClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔘 Botão clicado!', currentStep === totalSteps ? 'ENVIAR' : 'NEXT');
    if (currentStep === totalSteps && onSubmit) {
      onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <div className="flex justify-between items-center mt-8">
      <button
        type="button"
        onClick={handlePrevClick}
        disabled={currentStep === 1}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
          ${currentStep === 1 
            ? 'invisible' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        <ChevronLeft size={20} />
        Voltar
      </button>

      <div className="text-sm text-gray-500">
        Passo {currentStep} de {totalSteps}
      </div>

      <button
        type="button"
        onClick={handleNextClick}
        disabled={isSubmitting}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-600 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent" />
            Enviando...
          </>
        ) : currentStep === totalSteps ? (
          <>
            <Send size={20} />
            Enviar Proposta
          </>
        ) : (
          <>
            Continuar
            <ChevronRight size={20} />
          </>
        )}
      </button>
    </div>
  );
}