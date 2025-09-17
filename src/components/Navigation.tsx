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
  const handlePrevClick = () => {
    console.log('🔘 Botão Prev clicado!');
    try {
      onPrev();
    } catch (error) {
      console.error('❌ Erro no Prev:', error);
    }
  };

  const handleNextClick = () => {
    console.log('🔘 Botão clicado!', currentStep === totalSteps ? 'ENVIAR' : 'NEXT');
    try {
      if (currentStep === totalSteps && onSubmit) {
        onSubmit();
      } else {
        onNext();
      }
    } catch (error) {
      console.error('❌ Erro no Next:', error);
    }
  };

  return (
    <div className="flex justify-between items-center mt-6 sm:mt-8 gap-2">
      <button
        type="button"
        onClick={handlePrevClick}
        disabled={currentStep === 1}
        className={`
          flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base
          ${currentStep === 1 
            ? 'invisible' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        <ChevronLeft size={20} />
        Voltar
      </button>

      <div className="text-xs sm:text-sm text-gray-500 text-center flex-1 max-w-[100px]">
        Passo {currentStep} de {totalSteps}
      </div>

      <button
        type="button"
        onClick={handleNextClick}
        disabled={isSubmitting}
        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
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