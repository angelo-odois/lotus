interface WhatsAppMessage {
  to: string;
  text: string;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppService {
  private apiUrl: string;
  private token: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || '';
    this.token = process.env.WHATSAPP_API_TOKEN || '';
  }

  async sendMessage(to: string, message: string): Promise<WhatsAppResponse> {
    try {
      // Se não há configuração, simular sucesso para desenvolvimento
      if (!this.apiUrl || !this.token) {
        console.log('📱 [WhatsApp] Modo de simulação - enviando mensagem:');
        console.log(`📱 [WhatsApp] Para: ${to}`);
        console.log(`📱 [WhatsApp] Mensagem: ${message}`);
        return { success: true, messageId: 'sim_' + Date.now() };
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: to,
          text: message
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, messageId: data.id || 'unknown' };
      } else {
        const error = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${error}` };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async sendNewProposalNotification(
    adminNumber: string,
    clientName: string,
    propostaId: string
  ): Promise<boolean> {
    const message = `🏠 *Nova Proposta Recebida - Lotus Cidade*

👤 *Cliente:* ${clientName}
🆔 *ID da Proposta:* ${propostaId}
📅 *Data:* ${new Date().toLocaleString('pt-BR')}

📋 Uma nova proposta foi submetida no sistema.
🔗 Acesse o dashboard para visualizar os detalhes.

---
💻 Sistema Lotus Cidade`;

    const result = await this.sendMessage(adminNumber, message);

    if (result.success) {
      console.log(`✅ [WhatsApp] Notificação enviada com sucesso para ${adminNumber}`);
      return true;
    } else {
      console.error(`❌ [WhatsApp] Erro ao enviar notificação: ${result.error}`);
      return false;
    }
  }

  async sendDocumentRequest(
    clientNumber: string,
    clientName: string,
    propostaId: string
  ): Promise<boolean> {
    const message = `🏠 *Lotus Cidade - Envio de Documentos*

Olá ${clientName}! 👋

✅ Sua proposta foi recebida com sucesso!
🆔 *ID da Proposta:* ${propostaId}

📎 *Próximo passo:* Envie seus documentos através deste WhatsApp:

📋 *Documentos necessários:*
• RG (frente e verso)
• CPF
• Comprovante de renda
• Comprovante de residência
• Outros documentos solicitados

📱 *Como enviar:*
1. Tire fotos claras dos documentos
2. Envie através deste WhatsApp
3. Aguarde confirmação do recebimento

🕐 Nossa equipe analisará seus documentos em até 24 horas.

Obrigado por escolher a Lotus Cidade! 🏡`;

    const result = await this.sendMessage(clientNumber, message);

    if (result.success) {
      console.log(`✅ [WhatsApp] Solicitação de documentos enviada para ${clientNumber}`);
      return true;
    } else {
      console.error(`❌ [WhatsApp] Erro ao enviar solicitação: ${result.error}`);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();