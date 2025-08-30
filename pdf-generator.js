// Gerador de PDF da Proposta Lotus
class PropostaPDFGenerator {
    constructor() {
        this.templateUrl = 'proposta-template.html';
    }

    // Gerar PDF a partir dos dados do formulário
    async generatePDF(formData) {
        try {
            // Carregar template HTML
            const template = await this.loadTemplate();
            
            // Processar dados e substituir placeholders
            const processedData = this.processFormData(formData);
            const htmlContent = this.replacePlaceholders(template, processedData);
            
            // Gerar PDF usando html2pdf
            const element = document.createElement('div');
            element.innerHTML = htmlContent;
            element.style.display = 'none';
            document.body.appendChild(element);
            
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `proposta-lotus-${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };

            // Gerar PDF
            const pdf = await html2pdf().set(opt).from(element).save();
            
            // Limpar elemento temporário
            document.body.removeChild(element);
            
            return pdf;
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw error;
        }
    }

    // Carregar template HTML
    async loadTemplate() {
        const response = await fetch(this.templateUrl);
        if (!response.ok) {
            throw new Error('Erro ao carregar template');
        }
        return await response.text();
    }

    // Processar dados do formulário
    processFormData(formData) {
        const currentDate = new Date();
        const numeroProsposta = `LP${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}${String(currentDate.getHours()).padStart(2, '0')}${String(currentDate.getMinutes()).padStart(2, '0')}`;
        
        // Mapear nomes dos empreendimentos
        const empreendimentoNames = {
            'haya': 'HAYA',
            'kasa': 'KASA', 
            'vert': 'VERT',
            'alma': 'ALMA'
        };

        // Endereços dos empreendimentos
        const enderecoEmpreendimentos = {
            'haya': 'QS 01 Rua 212, Lote 11/21, Águas Claras - DF',
            'kasa': 'QS 02 Rua 122, Lote 05/15, Águas Claras - DF',
            'vert': 'QS 03 Rua 132, Lote 08/18, Águas Claras - DF',
            'alma': 'QS 04 Rua 142, Lote 10/20, Águas Claras - DF'
        };

        // Datas de entrega dos empreendimentos (exemplo)
        const previsaoEntregas = {
            'haya': 'Dezembro/2025',
            'kasa': 'Janeiro/2026', 
            'vert': 'Fevereiro/2026',
            'alma': 'Março/2026'
        };

        // Processar endereço completo
        const enderecoCompleto = `${formData.logradouro || ''} ${formData.numero || ''} ${formData.complemento || ''}`.trim();

        // Processar estado civil
        const estadoCivil = formData.estadoCivil || '';
        const isMarriedOrUnion = estadoCivil === 'casado' || estadoCivil === 'uniao-estavel';

        return {
            // Dados básicos
            numeroProsposta: numeroProsposta,
            nome: formData.nome || '',
            cpfCnpj: formData.cpfCnpj || '',
            rg: formData.rg || '',
            orgaoExpedidor: formData.orgaoExpedidor || '',
            dataNascimento: formData.dataNascimento || '',
            naturalidade: formData.naturalidade || '',
            nacionalidade: formData.nacionalidade || 'Brasileira',
            telefoneCelular: formData.telefoneCelular || '',
            telefoneComercial: formData.telefoneComercial || '',
            profissao: formData.profissao || '',
            email: formData.email || '',
            rendaMensal: formData.rendaMensal || '',
            
            // Endereço
            enderecoCompleto: enderecoCompleto,
            bairro: formData.bairro || '',
            cidade: formData.cidade || '',
            uf: formData.uf || '',
            cep: formData.cep || '',
            
            // Estado civil (checkboxes)
            estadoCivilCasado: estadoCivil === 'casado' ? 'checked' : '',
            estadoCivilSolteiro: estadoCivil === 'solteiro' ? 'checked' : '',
            estadoCivilSeparado: estadoCivil === 'separado' ? 'checked' : '',
            estadoCivilDivorciado: estadoCivil === 'divorciado' ? 'checked' : '',
            estadoCivilViuvo: estadoCivil === 'viuvo' ? 'checked' : '',
            estadoCivilUniaoEstavel: estadoCivil === 'uniao-estavel' ? 'checked' : '',
            
            // Sexo (assumindo masculino por padrão, pode ser melhorado)
            sexoMasc: 'checked',
            sexoFem: '',
            
            // Dados do cônjuge
            displayConjuge: isMarriedOrUnion ? 'display: block' : 'display: none',
            nomeConjuge: formData.nomeConjuge || '',
            cpfConjuge: formData.cpfConjuge || '',
            rgConjuge: formData.rgConjuge || '',
            orgaoExpedidorConjuge: formData.orgaoExpedidorConjuge || '',
            
            // Dados do imóvel
            empreendimento: empreendimentoNames[formData.empreendimento] || formData.empreendimento || '',
            enderecoEmpreendimento: enderecoEmpreendimentos[formData.empreendimento] || '',
            unidadeNumero: formData.unidadeNumero || '',
            previsaoEntrega: previsaoEntregas[formData.empreendimento] || '',
            
            // Valores financeiros
            valorImovel: formData.valorImovel || '',
            valorComissao: '0,00', // Pode ser calculado se necessário
            valorContrato: formData.valorImovel || '',
            valorEntrada: formData.valorEntrada || '',
            
            // Condições de pagamento (valores padrão)
            quantidadeParcelas1: '1',
            periodicidade1: 'À vista',
            valorParcela1: formData.valorEntrada || '',
            vencimento1: this.formatDate(currentDate),
            indiceCorrecao1: 'N/A',
            indiceCorrecao2: 'N/A',
            
            // Dados adicionais
            tipoPagamento1: formData.formaPagamento || 'Transferência Bancária',
            banco1: '',
            agencia1: '',
            numeroCheque1: '',
            dataDeposito1: this.formatDate(currentDate),
            
            // Data atual
            dataAtual: this.formatDate(currentDate),
            
            // Corretor
            nomeCorretor: 'Angelo Silva',
            creci: '12345-DF'
        };
    }

    // Substituir placeholders no template
    replacePlaceholders(template, data) {
        let result = template;
        
        // Substituir todos os placeholders {{campo}}
        Object.keys(data).forEach(key => {
            const placeholder = `{{${key}}}`;
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            result = result.replace(regex, data[key] || '');
        });

        // Processar checkboxes
        result = result.replace(/{{([^}]+)}}/g, (match, key) => {
            if (data[key] === 'checked') {
                return 'checked';
            }
            return '';
        });

        return result;
    }

    // Formatar data para exibição
    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Gerar PDF e retornar como blob
    async generatePDFBlob(formData) {
        try {
            // Carregar template HTML
            const template = await this.loadTemplate();
            
            // Processar dados e substituir placeholders
            const processedData = this.processFormData(formData);
            const htmlContent = this.replacePlaceholders(template, processedData);
            
            // Criar elemento temporário
            const element = document.createElement('div');
            element.innerHTML = htmlContent;
            element.style.display = 'none';
            document.body.appendChild(element);
            
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `proposta-lotus-${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };

            // Gerar PDF como blob
            const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
            
            // Limpar elemento temporário
            document.body.removeChild(element);
            
            return pdfBlob;
            
        } catch (error) {
            console.error('Erro ao gerar PDF blob:', error);
            throw error;
        }
    }
}

// Função para carregar biblioteca html2pdf se necessário
function loadHTML2PDF() {
    return new Promise((resolve, reject) => {
        if (window.html2pdf) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Erro ao carregar biblioteca html2pdf'));
        document.head.appendChild(script);
    });
}

// Exportar para uso global
window.PropostaPDFGenerator = PropostaPDFGenerator;
window.loadHTML2PDF = loadHTML2PDF;