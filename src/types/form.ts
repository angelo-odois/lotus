export interface FormData {
  // Dados Pessoais (1º Proponente)
  nome: string;
  cpfCnpj: string;
  rgInsEst: string;
  orgaoExpedidor: string;
  sexo: 'masculino' | 'feminino' | '';
  dataNascimento: string;
  naturalidade: string;
  nacionalidade: string;
  telefoneCelular: string;
  telefoneComercial?: string;
  email: string;
  profissao: string;
  estadoCivil: 'solteiro' | 'casado' | 'separado' | 'divorciado' | 'viuvo' | 'uniao-estavel' | '';

  // Endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;

  // Cônjuge (2º Proponente)
  nomeConjuge?: string;
  cpfConjuge?: string;
  rgConjuge?: string;
  orgaoExpedidorConjuge?: string;
  sexoConjuge?: 'masculino' | 'feminino' | '';
  dataNascimentoConjuge?: string;
  naturalidadeConjuge?: string;
  nacionalidadeConjuge?: string;
  telefoneCelularConjuge?: string;
  emailConjuge?: string;
  profissaoConjuge?: string;

  // Empreendimento e Unidade
  empreendimento: 'haya' | 'kasa' | 'vert' | 'alma' | '';
  unidadeNumero: string;

  // Valores
  valorImovel: string;
  valorEntrada: string;
  valorFinanciar: string;

  // Metadados
  dataEnvio?: string;
  timestamp?: number;
}

export interface FileUpload {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  category: string;
  base64?: string;
}

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface WhatsAppConfig {
  url: string;
  apiKey: string;
  phone: string;
  session: string;
}