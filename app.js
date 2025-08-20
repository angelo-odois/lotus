// Lotus Proposta System - Frontend JavaScript

// State management
let currentStep = 1;
const totalSteps = 4;
let proposalData = {};

// Elements
const steps = document.querySelectorAll('.step');
const stepDots = document.querySelectorAll('.step-dot');
const progressLabels = document.querySelectorAll('.progress-label');
const progressFill = document.getElementById('progressFill');
const btnNext = document.getElementById('btnNext');
const btnBack = document.getElementById('btnBack');
const form = document.getElementById('lotusForm');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Lotus Proposta System carregado');
    updateProgress();
    setupEventListeners();
    loadSavedData();
});

function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = progress + '%';

    // Update step indicators
    stepDots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index + 1 === currentStep) {
            dot.classList.add('active');
        }
    });

    // Update progress labels
    progressLabels.forEach((label, index) => {
        label.classList.remove('active');
        if (index + 1 === currentStep) {
            label.classList.add('active');
        }
    });
}

function showStep(step) {
    steps.forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');

    btnBack.style.display = step > 1 ? 'block' : 'none';
    btnNext.innerHTML = step === totalSteps ? 'Finalizar Proposta' : 'Continuar →';

    updateProgress();
    
    if (step === totalSteps) {
        updateSummary();
    }
}

function validateStep(step) {
    const stepElement = document.getElementById(`step${step}`);
    const requiredInputs = stepElement.querySelectorAll('[required]');
    
    for (let input of requiredInputs) {
        if (input.type === 'radio') {
            const radioGroup = stepElement.querySelectorAll(`[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                input.focus();
                alert('Por favor, selecione uma opção');
                return false;
            }
        } else if (!input.value.trim()) {
            input.focus();
            alert('Por favor, preencha todos os campos obrigatórios');
            return false;
        }
    }
    return true;
}

function updateSummary() {
    document.getElementById('summaryNome').textContent = 
        document.getElementById('nome').value || '-';
    
    const empreendimento = document.querySelector('input[name="empreendimento"]:checked');
    document.getElementById('summaryEmpreendimento').textContent = 
        empreendimento ? empreendimento.value.toUpperCase() : '-';
    
    document.getElementById('summaryUnidade').textContent = 
        document.getElementById('unidadeNumero').value || '-';
    
    const valorTotal = document.getElementById('valorImovel').value;
    document.getElementById('summaryValorTotal').textContent = 
        valorTotal ? formatCurrency(valorTotal) : '-';
    
    const entrada = document.getElementById('valorEntrada').value;
    document.getElementById('summaryEntrada').textContent = 
        entrada ? formatCurrency(entrada) : '-';
    
    const financiamento = document.getElementById('valorFinanciar').value;
    document.getElementById('summaryFinanciamento').textContent = 
        financiamento ? formatCurrency(financiamento) : '-';
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function calculateFinancing() {
    const valorTotal = parseFloat(document.getElementById('valorImovel').value) || 0;
    const entrada = parseFloat(document.getElementById('valorEntrada').value) || 0;
    const financiamento = Math.max(0, valorTotal - entrada);
    
    document.getElementById('valorFinanciar').value = financiamento.toFixed(2);
}

function setupEventListeners() {
    // Navigation
    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
            } else {
                submitForm();
            }
        }
    });

    btnBack.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    // CPF mask
    document.getElementById('cpf').addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        this.value = value;
    });

    // Phone mask
    document.getElementById('telefone').addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        this.value = value;
    });

    // Financial calculations
    document.getElementById('valorImovel').addEventListener('input', calculateFinancing);
    document.getElementById('valorEntrada').addEventListener('input', calculateFinancing);

    // Step navigation via dots
    stepDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const targetStep = index + 1;
            if (targetStep <= currentStep) {
                currentStep = targetStep;
                showStep(currentStep);
            }
        });
    });

    // Auto-save
    form.addEventListener('input', saveFormData);
}

function submitForm() {
    console.log('📝 Enviando proposta...');
    
    // Collect form data
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Structure proposal data
    proposalData = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        cliente: {
            nome: data.nome,
            cpf: data.cpf,
            rg: data.rg,
            dataNascimento: data.dataNascimento,
            telefone: data.telefone,
            email: data.email,
            profissao: data.profissao,
            renda: parseFloat(data.renda),
            estadoCivil: data.estadoCivil
        },
        imovel: {
            empreendimento: data.empreendimento,
            unidade: data.unidadeNumero,
            valorTotal: parseFloat(data.valorImovel)
        },
        financeiro: {
            entrada: parseFloat(data.valorEntrada),
            financiamento: parseFloat(data.valorFinanciar),
            prazo: parseInt(data.prazoFinanciamento),
            sistema: data.sistemaFinanciamento
        },
        status: 'pendente'
    };

    console.log('✅ Proposta estruturada:', proposalData);

    // Save to localStorage
    localStorage.setItem('lotusProposal', JSON.stringify(proposalData));

    // Show success message
    form.style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';

    // Setup download links
    setupDownloadLinks();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    console.log('🎉 Proposta finalizada com sucesso!');
}

function generateId() {
    return 'LOTUS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function setupDownloadLinks() {
    // PDF Download (simulated)
    document.getElementById('downloadPDF').addEventListener('click', (e) => {
        e.preventDefault();
        generatePDF();
    });

    // JSON Download
    document.getElementById('downloadJSON').addEventListener('click', (e) => {
        e.preventDefault();
        downloadJSON();
    });
}

function generatePDF() {
    // Generate PDF content as text
    const pdfContent = `
LOTUS CIDADE - PROPOSTA DE COMPRA
═══════════════════════════════════════════════════════════════

PROPOSTA: ${proposalData.id}
DATA: ${new Date(proposalData.timestamp).toLocaleDateString('pt-BR')}
STATUS: ${proposalData.status.toUpperCase()}

CLIENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${proposalData.cliente.nome}
CPF: ${proposalData.cliente.cpf}
RG: ${proposalData.cliente.rg}
Data Nascimento: ${new Date(proposalData.cliente.dataNascimento).toLocaleDateString('pt-BR')}
Telefone: ${proposalData.cliente.telefone}
E-mail: ${proposalData.cliente.email}
Profissão: ${proposalData.cliente.profissao}
Renda: ${formatCurrency(proposalData.cliente.renda)}
Estado Civil: ${proposalData.cliente.estadoCivil.toUpperCase()}

IMÓVEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Empreendimento: ${proposalData.imovel.empreendimento.toUpperCase()}
Unidade: ${proposalData.imovel.unidade}
Valor Total: ${formatCurrency(proposalData.imovel.valorTotal)}

FINANCEIRO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Entrada: ${formatCurrency(proposalData.financeiro.entrada)}
Financiamento: ${formatCurrency(proposalData.financeiro.financiamento)}
Prazo: ${proposalData.financeiro.prazo} anos
Sistema: ${proposalData.financeiro.sistema.toUpperCase()}

═══════════════════════════════════════════════════════════════
Lotus Cidade - www.lotuscidade.com.br
Documento gerado em: ${new Date().toLocaleString('pt-BR')}
═══════════════════════════════════════════════════════════════
    `;

    // Download as text file
    downloadFile(pdfContent, `proposta-${proposalData.id}.txt`, 'text/plain');
    
    console.log('📄 PDF simulado gerado e baixado');
}

function downloadJSON() {
    const jsonContent = JSON.stringify(proposalData, null, 2);
    downloadFile(jsonContent, `proposta-${proposalData.id}.json`, 'application/json');
    
    console.log('📊 JSON gerado e baixado');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function saveFormData() {
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    localStorage.setItem('lotusFormData', JSON.stringify(data));
}

function loadSavedData() {
    const savedData = localStorage.getItem('lotusFormData');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'radio') {
                    const radio = document.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    element.value = data[key];
                }
            }
        });
        console.log('📂 Dados salvos carregados');
    }
}

// Initialize
showStep(1);

console.log('✅ Lotus Proposta System inicializado');
