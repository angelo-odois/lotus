export const config = {
  whatsapp: {
    url: process.env.WAHA_URL || 'https://waha.nexuso2.com',
    apiKey: process.env.WAHA_API_KEY || 'D2EFC7EDF3E4425F917DBAE37D3D0B74',
    phone: process.env.WAHA_PHONE || '556199911676',
    session: process.env.WAHA_SESSION || 'lotus'
  },
  
  empreendimentos: {
    haya: 'HAYA',
    kasa: 'KASA',
    vert: 'VERT',
    alma: 'ALMA'
  } as const,

  steps: [
    'Dados Pessoais',
    'Endereço', 
    'Cônjuge',
    'Empreendimento',
    'Unidade',
    'Documentos',
    'Finalização'
  ] as const,

  ufs: [
    'DF', 'GO', 'SP', 'RJ', 'MG', 'AC', 'AL', 'AP', 'AM', 'BA', 
    'CE', 'ES', 'MA', 'MT', 'MS', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RN', 'RS', 'RO', 'RR', 'SC', 'SE', 'TO'
  ] as const
};

export type EmpreendimentoKey = keyof typeof config.empreendimentos;
export type UF = typeof config.ufs[number];