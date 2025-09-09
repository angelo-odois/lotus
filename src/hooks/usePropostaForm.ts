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
  valorFinanciar: ''
};

export function usePropostaForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{filename?: string}>({});

  const totalSteps = 7;

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

  const validateCurrentStep = useCallback(() => {
    console.log(`🔍 Validando step ${currentStep}...`);
    
    const requiredFields: { [key in Step]: (keyof FormData)[] } = {
      1: ['nome', 'cpfCnpj', 'rgInsEst', 'orgaoExpedidor', 'sexo', 'dataNascimento', 
          'naturalidade', 'nacionalidade', 'telefoneCelular', 'email', 'profissao', 'estadoCivil'],
      2: ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf'],
      3: shouldShowSpouseStep() ? ['nomeConjuge', 'cpfConjuge', 'rgConjuge', 'orgaoExpedidorConjuge', 
          'sexoConjuge', 'dataNascimentoConjuge', 'naturalidadeConjuge', 'nacionalidadeConjuge', 
          'telefoneCelularConjuge', 'profissaoConjuge'] : [],
      4: ['empreendimento'],
      5: ['unidadeNumero', 'valorImovel', 'valorEntrada'],
      6: [], // Documentos opcionais
      7: [] // Finalização
    };

    const fieldsToValidate = requiredFields[currentStep] || [];
    console.log(`📋 Campos a validar no step ${currentStep}:`, fieldsToValidate);
    
    const emptyFields = [];
    
    for (const field of fieldsToValidate) {
      const value = formData[field];
      const isEmpty = !value || value.toString().trim() === '';
      
      console.log(`📝 Campo ${field}: "${value}" -> ${isEmpty ? 'VAZIO' : 'OK'}`);
      
      if (isEmpty) {
        emptyFields.push(field);
      }
    }

    if (emptyFields.length > 0) {
      console.log(`❌ Campos vazios: ${emptyFields.join(', ')}`);
      return false;
    }

    console.log(`✅ Todos os campos do step ${currentStep} estão preenchidos`);
    return true;
  }, [currentStep, formData, shouldShowSpouseStep]);

  const nextStep = useCallback(() => {
    console.log(`🔄 nextStep chamado: currentStep=${currentStep}`);
    console.log(`📊 Dados atuais do formulário:`, formData);
    
    try {
      const isValid = validateCurrentStep();
      console.log(`✅ Resultado validação: ${isValid}`);
      
      if (isValid) {
        if (currentStep < totalSteps) {
          const next = getNextValidStep();
          console.log(`➡️ Avançando de ${currentStep} para ${next}`);
          setTimeout(() => {
            setCurrentStep(next);
          }, 0);
        } else {
          console.log('📤 Último step - será enviado via submitForm');
        }
      } else {
        console.log(`❌ Validação falhou no step ${currentStep}`);
        console.log('📋 Dados que falharam na validação:', formData);
      }
    } catch (error) {
      console.error('❌ Erro no nextStep:', error);
    }
  }, [currentStep, validateCurrentStep, getNextValidStep, totalSteps, formData]);

  const prevStep = useCallback(() => {
    try {
      if (currentStep > 1) {
        const prev = getPrevValidStep();
        console.log(`⬅️ Voltando para step ${prev}`);
        setTimeout(() => {
          setCurrentStep(prev);
        }, 0);
      }
    } catch (error) {
      console.error('❌ Erro no prevStep:', error);
    }
  }, [currentStep, getPrevValidStep]);

  const goToStep = useCallback((step: Step) => {
    if (step === 3 && !shouldShowSpouseStep()) {
      const adjustedStep = step < currentStep ? 2 : 4;
      setCurrentStep(adjustedStep as Step);
    } else {
      setCurrentStep(step);
    }
  }, [currentStep, shouldShowSpouseStep]);

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
    console.log('📎 Documentos anexados:', uploadedFiles.length);
    
    try {
      const submitData = {
        ...formData,
        dataEnvio: new Date().toISOString(),
        timestamp: Date.now(),
        documentos: uploadedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          category: file.category,
          base64: file.base64
        }))
      };

      console.log('📊 Dados para envio:', {
        nome: submitData.nome,
        empreendimento: submitData.empreendimento,
        documentos: submitData.documentos.length
      });

      // Enviar para API
      const response = await fetch('/api/proposta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Proposta enviada:', result);
        
        setSuccessData({ filename: result.filename });
        setIsSuccess(true);
      } else {
        const errorText = await response.text();
        console.error('❌ Erro servidor:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar:', error);
      alert('❌ Erro ao enviar proposta. Verifique o console para detalhes.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, uploadedFiles]);

  const startNewProposal = useCallback(() => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setUploadedFiles([]);
    setIsSuccess(false);
    setSuccessData({});
  }, []);

  // Auto-skip do step 3 (cônjuge) quando não aplicável
  useEffect(() => {
    if (currentStep === 3 && !shouldShowSpouseStep()) {
      console.log('🔄 Auto-pular step 3 (cônjuge) - avançando para step 4');
      // Safari precisa de setTimeout para state updates
      const timer = setTimeout(() => {
        setCurrentStep(4);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, shouldShowSpouseStep]);

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