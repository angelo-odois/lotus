'use client';

import { usePropostaForm } from '@/hooks/usePropostaForm';
import { StepDadosPessoais } from './steps/StepDadosPessoais';
import { StepEndereco } from './steps/StepEndereco';
import { StepConjuge } from './steps/StepConjuge';
import { StepEmpreendimento } from './steps/StepEmpreendimento';
import { StepUnidade } from './steps/StepUnidade';
import { StepDocumentos } from './steps/StepDocumentos';
import { StepFinalizacao } from './steps/StepFinalizacao';
import { ProgressBar } from './ProgressBar';
import { Navigation } from './Navigation';
import { Header } from './Header';
import { SuccessPage } from './SuccessPage';
import Image from 'next/image';

export function PropostaForm() {
  const {
    currentStep,
    formData,
    uploadedFiles,
    isSubmitting,
    isSuccess,
    successData,
    totalSteps,
    shouldShowSpouseStep,
    progressPercentage,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    calculateFinancing,
    setUploadedFiles,
    startNewProposal,
    submitForm
  } = usePropostaForm();

  const renderStep = () => {
    console.log(`👁️ Renderizando step: ${currentStep}, shouldShowSpouseStep: ${shouldShowSpouseStep}`);
    
    switch (currentStep) {
      case 1:
        console.log('📄 Renderizando StepDadosPessoais');
        return <StepDadosPessoais formData={formData} updateFormData={updateFormData} />;
      case 2:
        console.log('📄 Renderizando StepEndereco');
        return <StepEndereco formData={formData} updateFormData={updateFormData} />;
      case 3:
        if (shouldShowSpouseStep) {
          console.log('📄 Renderizando StepConjuge');
          return <StepConjuge formData={formData} updateFormData={updateFormData} />;
        } else {
          console.log('⏭️ Step cônjuge pulado - renderizando step 4');
          // Em vez de null, renderizar o próximo step
          return <StepEmpreendimento formData={formData} updateFormData={updateFormData} />;
        }
      case 4:
        console.log('📄 Renderizando StepEmpreendimento');
        return <StepEmpreendimento formData={formData} updateFormData={updateFormData} />;
      case 5:
        console.log('📄 Renderizando StepUnidade');
        return <StepUnidade formData={formData} updateFormData={updateFormData} calculateFinancing={calculateFinancing} />;
      case 6:
        console.log('📄 Renderizando StepDocumentos');
        return <StepDocumentos uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} shouldShowSpouseStep={shouldShowSpouseStep} />;
      case 7:
        console.log('📄 Renderizando StepFinalizacao');
        return <StepFinalizacao formData={formData} uploadedFiles={uploadedFiles} shouldShowSpouseStep={shouldShowSpouseStep} />;
      default:
        console.log('📄 Renderizando StepDadosPessoais (default)');
        return <StepDadosPessoais formData={formData} updateFormData={updateFormData} />;
    }
  };

  // Se sucesso, mostrar tela de sucesso
  if (isSuccess) {
    return (
      <SuccessPage
        customerName={formData.nome || 'Cliente'}
        pdfFilename={successData.filename}
        onNewProposal={startNewProposal}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCF7] font-inter">
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-[#FFC629]/10 overflow-hidden max-w-5xl w-full">
          <Header />
          
          <div className="p-8 md:p-12">
            <ProgressBar 
              currentStep={currentStep}
              totalSteps={totalSteps}
              progressPercentage={progressPercentage}
              shouldShowSpouseStep={shouldShowSpouseStep}
              goToStep={goToStep}
            />

            <div className="mt-8">
              {renderStep()}
            </div>

            <Navigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              isSubmitting={isSubmitting}
              onNext={nextStep}
              onPrev={prevStep}
              onSubmit={submitForm}
            />
          </div>

          <footer className="bg-[#1A1A1A] text-white p-12 md:p-16 text-center">
            <div className="flex justify-center mb-6">
              <Image 
                src="/logo.svg" 
                alt="Lotus" 
                width={140} 
                height={45} 
                className="filter invert brightness-0 contrast-100" 
              />
            </div>
            <p className="text-lg font-semibold text-[#FFC629] mb-2">
              Lotus Cidade
            </p>
            <p className="text-sm text-gray-300 mb-1">
              lotuscidade.com.br
            </p>
            <p className="text-xs text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Setor Comercial Sul, Quadra 9, Ed. Parque Cidade Corporate, Torre A, Sala 1105, Brasília-DF
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}