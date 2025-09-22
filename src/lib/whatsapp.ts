import { config } from '@/config';

export interface WhatsAppMessage {
  chatId: string;
  text: string;
}

export class WhatsAppService {
  private baseUrl: string;
  private apiKey: string;
  private session: string;

  constructor() {
    this.baseUrl = config.whatsapp.url;
    this.apiKey = config.whatsapp.apiKey;
    this.session = config.whatsapp.session;
  }

  async sendMessage(chatId: string, message: string): Promise<boolean> {
    try {
      console.log('📱 Enviando mensagem WhatsApp para:', chatId);

      const response = await fetch(`${this.baseUrl}/api/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey
        },
        body: JSON.stringify({
          session: this.session,
          chatId: `${chatId}@c.us`,
          text: message
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao enviar mensagem WhatsApp:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      console.log('✅ Mensagem WhatsApp enviada com sucesso:', result);
      return true;

    } catch (error) {
      console.error('❌ Erro na conexão com WAHA:', error);
      return false;
    }
  }

  async sendNewProposalNotification(phoneNumber: string, clientName: string, propostaId: string): Promise<boolean> {
    // Criar data no fuso horário de Brasília
    const brasiliaDate = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const message = `🏠 *NOVA PROPOSTA RECEBIDA*

📋 *Cliente:* ${clientName}
🔖 *ID da Proposta:* ${propostaId}
📅 *Data:* ${brasiliaDate}

✅ Uma nova proposta foi enviada e está aguardando análise.

📱 Sistema Lotus Cidade`;

    return this.sendMessage(phoneNumber, message);
  }
}

export const whatsappService = new WhatsAppService();