'use client';

import { useState, useCallback, useEffect } from 'react';
import { FormData, Step, FileUpload } from '@/types/form';

const initialFormData: FormData = {
  // Dados Pessoais
  nome: '',
  cpfCnpj: '',
  rgInsEst: '',
  orgaoExpedidor: '',
  sexo: '',
  dataNascimento: '',
  naturalidade: '',
  nacionalidade: 'Brasileira',
  telefoneCelular: '',
  telefoneComercial: '',
  email: '',
  profissao: '',
  estadoCivil: '',

  // Endereço
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',

  // Cônjuge
  nomeConjuge: '',
  cpfConjuge: '',
  rgConjuge: '',
  orgaoExpedidorConjuge: '',
  sexoConjuge: '',
  dataNascimentoConjuge: '',
  naturalidadeConjuge: '',
  nacionalidadeConjuge: 'Brasileira',
  telefoneCelularConjuge: '',
  emailConjuge: '',
  profissaoConjuge: '',

  // Empreendimento
  empreendimento: '',
  unidadeNumero: '',

  // Valores
  valorImovel: '',
  valorEntrada: '',
  valorFinanciar: '',

  // Valores específicos do VERT
  valorSinal: '',
  valorMensais: '',
  parcelasMensais: '',
  valorSemestral: '',
  parcelasSemestrais: '',
  valorChaves: ''
};

export function usePropostaForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{filename?: string; propostaId?: string}>({});

  const totalSteps = 6;

  const updateFormData = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const shouldShowSpouseStep = useCallback(() => {
    return formData.estadoCivil === 'casado' || formData.estadoCivil === 'uniao-estavel';
  }, [formData.estadoCivil]);

  const getNextValidStep = useCallback((): Step => {
    let nextStep = (currentStep + 1) as Step;
    if (nextStep === 3 && !shouldShowSpouseStep()) {
      nextStep = 4;
    }
    return Math.min(nextStep, totalSteps) as Step;
  }, [currentStep, shouldShowSpouseStep]);

  const getPrevValidStep = useCallback((): Step => {
    let prevStep = (currentStep - 1) as Step;
    if (currentStep === 4 && !shouldShowSpouseStep()) {
      prevStep = 2; // Pular step 3 quando voltar do 4
    }
    return Math.max(prevStep, 1) as Step;
  }, [currentStep, shouldShowSpouseStep]);

  const validateCurrentStep = () => {
    console.log(`🔍 Validando step ${currentStep}...`);
    console.log(`📊 FormData completo:`, formData);

    // Validação dinâmica para step 5 baseada no empreendimento
    const getStep5Fields = (): (keyof FormData)[] => {
      const baseFields: (keyof FormData)[] = ['unidadeNumero'];

      if (formData.empreendimento === 'vert') {
        return [...baseFields, 'valorSinal', 'valorMensais', 'parcelasMensais', 'valorSemestral', 'parcelasSemestrais', 'valorChaves'];
      } else {
        return [...baseFields, 'valorImovel', 'valorEntrada'];
      }
    };

    const requiredFields: { [key in Step]: (keyof FormData)[] } = {
      1: ['nome', 'cpfCnpj', 'rgInsEst', 'orgaoExpedidor', 'sexo', 'dataNascimento',
          'naturalidade', 'nacionalidade', 'telefoneCelular', 'email', 'profissao', 'estadoCivil'],
      2: ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf'],
      3: shouldShowSpouseStep() ? ['nomeConjuge', 'cpfConjuge', 'rgConjuge', 'orgaoExpedidorConjuge',
          'sexoConjuge', 'dataNascimentoConjuge', 'naturalidadeConjuge', 'nacionalidadeConjuge',
          'telefoneCelularConjuge', 'profissaoConjuge'] : [],
      4: ['empreendimento'],
      5: getStep5Fields(),
      6: [] // Finalização
    };

    const fieldsToValidate = requiredFields[currentStep] || [];
    console.log(`📋 Campos a validar no step ${currentStep}:`, fieldsToValidate);
    
    const emptyFields = [];
    
    for (const field of fieldsToValidate) {
      const value = formData[field];
      // Validação mais robusta para Safari
      let isEmpty = false;
      
      if (value === null || value === undefined) {
        isEmpty = true;
      } else if (typeof value === 'string') {
        isEmpty = value.trim() === '';
      } else {
        isEmpty = String(value).trim() === '';
      }
      
      console.log(`📝 Campo ${field}: "${value}" (tipo: ${typeof value}) -> ${isEmpty ? 'VAZIO' : 'OK'}`);
      
      if (isEmpty) {
        emptyFields.push(field);
      }
    }

    if (emptyFields.length > 0) {
      console.log(`❌ Campos vazios: ${emptyFields.join(', ')}`);
      alert(`⚠️ Preencha os seguintes campos: ${emptyFields.join(', ')}`);
      return false;
    }

    console.log(`✅ Todos os campos do step ${currentStep} estão preenchidos`);
    return true;
  };

  const nextStep = () => {
    console.log(`🔄 nextStep chamado: currentStep=${currentStep}`);
    console.log(`📊 Dados atuais do formulário:`, formData);
    
    try {
      const isValid = validateCurrentStep();
      console.log(`✅ Resultado validação: ${isValid}`);
      
      if (isValid) {
        if (currentStep < totalSteps) {
          let next = currentStep + 1;
          // Pular step 3 se não for casado
          if (next === 3 && !shouldShowSpouseStep()) {
            next = 4;
          }
          console.log(`➡️ Avançando de ${currentStep} para ${next}`);
          setCurrentStep(next as Step);
        } else {
          console.log('📤 Último step - será enviado via submitForm');
        }
      } else {
        console.log(`❌ Validação falhou no step ${currentStep}`);
        alert('⚠️ Preencha todos os campos obrigatórios antes de continuar');
      }
    } catch (error) {
      console.error('❌ Erro no nextStep:', error);
      alert('❌ Erro interno. Tente novamente.');
    }
  };

  const prevStep = () => {
    try {
      if (currentStep > 1) {
        let prev = currentStep - 1;
        // Pular step 3 quando voltar do 4 e não for casado
        if (currentStep === 4 && !shouldShowSpouseStep()) {
          prev = 2;
        }
        console.log(`⬅️ Voltando para step ${prev}`);
        setCurrentStep(prev as Step);
      }
    } catch (error) {
      console.error('❌ Erro no prevStep:', error);
    }
  };

  const goToStep = (step: Step) => {
    try {
      if (step === 3 && !shouldShowSpouseStep()) {
        const adjustedStep = step < currentStep ? 2 : 4;
        setCurrentStep(adjustedStep as Step);
      } else {
        setCurrentStep(step);
      }
    } catch (error) {
      console.error('❌ Erro no goToStep:', error);
    }
  };

  const calculateFinancing = useCallback(() => {
    const valorImovel = parseFloat(formData.valorImovel.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const valorEntrada = parseFloat(formData.valorEntrada.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const valorFinanciar = valorImovel - valorEntrada;
    
    if (valorFinanciar >= 0) {
      const formatted = valorFinanciar.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      updateFormData('valorFinanciar', formatted);
    }
  }, [formData.valorImovel, formData.valorEntrada, updateFormData]);

  const submitForm = useCallback(async () => {
    setIsSubmitting(true);
    console.log('📤 Enviando formulário...', formData);

    try {
      const submitData = {
        ...formData,
        dataEnvio: new Date().toISOString(),
        timestamp: Date.now(),
        documentos: { arquivos: [] }
      };

      console.log('📊 Dados para envio:', {
        nome: submitData.nome,
        empreendimento: submitData.empreendimento
      });

      // Gerar PDF diretamente
      const response = await fetch('/api/proposta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ PDF gerado:', result);
        
        setSuccessData({
          filename: result.filename,
          downloadUrl: result.downloadUrl,
          message: result.message,
          propostaId: result.propostaId
        });
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro servidor:', response.status, errorData);
        throw new Error(`Erro ${response.status}: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar:', error);
      alert('❌ Erro ao enviar proposta. Verifique o console para detalhes.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const startNewProposal = useCallback(() => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setUploadedFiles([]);
    setIsSuccess(false);
    setSuccessData({});
  }, []);

  // Verificação manual do step 3 - removido useEffect automático para Safari
  const checkAndSkipSpouseStep = () => {
    if (currentStep === 3 && !shouldShowSpouseStep()) {
      console.log('🔄 Pulando step 3 (cônjuge) - avançando para step 4');
      setCurrentStep(4);
      return true;
    }
    return false;
  };

  return {
    // Estado
    currentStep,
    formData,
    uploadedFiles,
    isSubmitting,
    isSuccess,
    successData,
    totalSteps,
    
    // Computed
    shouldShowSpouseStep: shouldShowSpouseStep(),
    progressPercentage: ((shouldShowSpouseStep() ? currentStep : (currentStep > 3 ? currentStep - 1 : currentStep)) /
                        (shouldShowSpouseStep() ? totalSteps : totalSteps - 1)) * 100,
    
    // Actions
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    calculateFinancing,
    setUploadedFiles,
    submitForm,
    startNewProposal
  };
}