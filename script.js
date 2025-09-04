// 📱 Configuração avançada de viewport para mobile
// Configuração WAHA para WhatsApp
const WAHA_URL = 'https://waha.nexuso2.com';
const WAHA_API_KEY = '083D38CBCA7707EAAC23CFC1A6A9A26BA9F854FC81D66AA01C0A6BC0298182299BF6A16004384F4891454A69BB15641ECE3919597CA103B82BCFEF3BD24A7EAF';
const WHATSAPP_PHONE = '+5561999911676';

// Variáveis globais
let currentStep = 1;
const totalSteps = 7; // ✅ Agora com step de documentos
const formData = {};
const uploadedFiles = [];
const fileCategories = {};

// 📱 Sistema de detecção e compensação de teclado mobile
class MobileKeyboardHandler {
    constructor() {
        this.isKeyboardVisible = false;
        this.keyboardHeight = 0;
        this.activeInput = null;
        this.originalViewportHeight = window.innerHeight;
        this.setupViewportHandling();
        this.setupVisualViewport();
        this.setupInputFocusHandling();
    }

    // 📱 Configurar manipulação de viewport dinâmico
    setupViewportHandling() {
        // Atualizar variável CSS de viewport height
        const updateVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        updateVH();

        // Listeners para mudanças de viewport
        window.addEventListener('resize', () => {
            setTimeout(updateVH, 100);
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                updateVH();
                this.originalViewportHeight = window.innerHeight;
            }, 300);
        });

        // Listener para mudanças na tela (útil para PWAs)
        if (screen && screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                setTimeout(updateVH, 200);
            });
        }
    }

    // 📱 Configurar Visual Viewport API (melhor detecção de teclado)
    setupVisualViewport() {
        if (window.visualViewport) {
            const visualViewport = window.visualViewport;

            visualViewport.addEventListener('resize', () => {
                this.handleViewportChange();
            });

            visualViewport.addEventListener('scroll', () => {
                this.handleViewportScroll();
            });
        }
    }

    // 📱 Manipular mudanças no viewport (detectar teclado)
    handleViewportChange() {
        if (!window.visualViewport) return;

        const viewport = window.visualViewport;
        const heightDifference = window.innerHeight - viewport.height;
        const wasKeyboardVisible = this.isKeyboardVisible;

        // Detectar se teclado está visível (diferença significativa na altura)
        this.isKeyboardVisible = heightDifference > 150; // threshold para detectar teclado
        this.keyboardHeight = this.isKeyboardVisible ? heightDifference : 0;

        // Atualizar variável CSS com altura do teclado
        document.documentElement.style.setProperty('--keyboard-height', `${this.keyboardHeight}px`);

        // Aplicar/remover classe para compensação de teclado
        const container = document.querySelector('.main-container');
        if (this.isKeyboardVisible) {
            container.classList.add('keyboard-compensated');
        } else {
            container.classList.remove('keyboard-compensated');
        }

        // Se teclado acabou de aparecer e há input ativo
        if (this.isKeyboardVisible && !wasKeyboardVisible && this.activeInput) {
            setTimeout(() => this.scrollToActiveInput(), 100);
        }

        console.log(`🔧 Keyboard: ${this.isKeyboardVisible ? 'visible' : 'hidden'}, Height: ${this.keyboardHeight}px`);
    }

    // 📱 Manipular scroll do viewport
    handleViewportScroll() {
        // Opcional: ajustes adicionais quando viewport faz scroll
    }

    // 📱 Configurar manipulação de foco em inputs
    setupInputFocusHandling() {
        const inputs = document.querySelectorAll('.form-input');

        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                this.activeInput = e.target;
                this.handleInputFocus(e.target);
            });

            input.addEventListener('blur', (e) => {
                this.activeInput = null;
                this.handleInputBlur(e.target);
            });

            // Prevenir comportamento padrão que pode interferir
            input.addEventListener('touchstart', (e) => {
                e.currentTarget.style.touchAction = 'manipulation';
            }, { passive: true });
        });
    }

    // 📱 Manipular foco em input
    handleInputFocus(input) {
        console.log(`📱 Input focused:`, input.id);

        // Aguardar teclado aparecer antes de fazer scroll
        setTimeout(() => {
            if (this.activeInput === input) {
                this.scrollToActiveInput();
            }
        }, 300); // Delay para iOS
    }

    // 📱 Manipular perda de foco em input
    handleInputBlur(input) {
        console.log(`📱 Input blurred:`, input.id);
    }

    // 📱 Scroll inteligente para input ativo
    scrollToActiveInput() {
        if (!this.activeInput) return;

        const input = this.activeInput;
        const rect = input.getBoundingClientRect();
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        
        // Calcular posição ideal (1/3 da tela do topo)
        const idealPosition = viewportHeight / 3;
        const currentPosition = rect.top;
        
        // Se input está muito baixo ou muito alto
        if (currentPosition > viewportHeight - 100 || currentPosition < 100) {
            const scrollOffset = currentPosition - idealPosition;
            
            console.log(`📱 Scrolling to input. Current: ${currentPosition}px, Ideal: ${idealPosition}px, Offset: ${scrollOffset}px`);
            
            window.scrollBy({
                top: scrollOffset,
                behavior: 'smooth'
            });
        }
    }
}

// 📱 Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Lotus Form - Mobile Optimized Version with Documents');

    // Inicializar handler de teclado mobile
    const keyboardHandler = new MobileKeyboardHandler();
    window.keyboardHandler = keyboardHandler; // Para debug

    // Configurações tradicionais
    updateProgress();
    setupEventListeners();
    setupInputMasks();
    setupMaritalStatusHandler();
    setupValueCalculations();
    setupCepLookup();
    setupFileUpload(); // ✅ Documentos

    // Debug: informações do dispositivo
    console.log(`📱 Device Info:
        - Screen: ${screen.width}x${screen.height}
        - Window: ${window.innerWidth}x${window.innerHeight}
        - Visual Viewport: ${window.visualViewport ? 'supported' : 'not supported'}
        - User Agent: ${navigator.userAgent.includes('iPhone') ? 'iPhone' : navigator.userAgent.includes('Android') ? 'Android' : 'Other'}
    `);
});


// ✅ Configurar upload de arquivos
function setupFileUpload() {
    const fileInput = document.getElementById('fileInputGlobal');
    const uploadContainer = document.getElementById('uploadContainer');

    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Efeitos visuais
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        uploadContainer.classList.add('drag-over');
    }

    function unhighlight() {
        uploadContainer.classList.remove('drag-over');
    }

    // Manipular drop
    uploadContainer.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Click para selecionar
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });
}

// ✅ Processar arquivos
function handleFiles(files) {
    ([...files]).forEach(processFile);
    updateDocumentSummary();
}

// ✅ Processar arquivo individual
function processFile(file) {
    // Validar tipo de arquivo
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        alert(`Arquivo ${file.name} não é suportado. Use PDF, JPG, JPEG ou PNG.`);
        return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert(`Arquivo ${file.name} excede o limite de 10MB.`);
        return;
    }

    // Converter arquivo para base64 para incluir na proposta
    const reader = new FileReader();
    reader.onload = async function(e) {
        const fileId = Date.now() + Math.random();
        const fileObj = {
            id: fileId,
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            category: detectCategory(file.name),
            base64: e.target.result // Adicionar dados base64
        };

        // Se for PDF, converter páginas para imagens
        if (file.type === 'application/pdf') {
            try {
                console.log(`📄 Convertendo PDF ${file.name}...`);
                const pdfImages = await convertPDFToImages(e.target.result);
                fileObj.pdfImages = pdfImages;
                console.log(`✅ PDF ${file.name} convertido para ${pdfImages.length} imagem(ns)`);
            } catch (error) {
                console.log(`❌ Erro ao converter PDF ${file.name}:`, error);
                // Continuar sem as imagens do PDF
                fileObj.pdfImages = [];
            }
        }

        uploadedFiles.push(fileObj);
        
        // Adicionar à categoria correspondente
        if (!fileCategories[fileObj.category]) {
            fileCategories[fileObj.category] = [];
        }
        fileCategories[fileObj.category].push(fileObj);

        // Atualizar UI
        addFileToList(fileObj);
        updateCategoryCards();
        
        console.log(`📄 Arquivo ${file.name} processado`);
    };
    
    reader.readAsDataURL(file);
}

// Converter PDF para imagens usando PDF.js
async function convertPDFToImages(base64Data) {
    try {
        // Carregar PDF.js se não estiver disponível
        if (!window.pdfjsLib) {
            await loadPDFJS();
        }

        // Converter base64 para array buffer
        const binaryString = atob(base64Data.split(',')[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Carregar PDF
        const pdf = await pdfjsLib.getDocument(bytes).promise;
        const images = [];

        // Converter cada página em imagem
        for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) { // Limitar a 5 páginas
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Converter canvas para base64
            const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
            images.push(imageBase64);
        }

        return images;
    } catch (error) {
        console.error('Erro ao converter PDF:', error);
        return [];
    }
}

// Carregar biblioteca PDF.js
function loadPDFJS() {
    return new Promise((resolve, reject) => {
        if (window.pdfjsLib) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve();
        };
        script.onerror = () => reject(new Error('Erro ao carregar PDF.js'));
        document.head.appendChild(script);
    });
}

// ✅ Detectar categoria do documento pelo nome
function detectCategory(filename) {
    const lowerName = filename.toLowerCase();
    
    // Documentos do cônjuge
    if (lowerName.includes('conjuge') || lowerName.includes('cônjuge')) {
        if (lowerName.includes('rg')) {
            return 'rg-conjuge';
        } else if (lowerName.includes('cpf')) {
            return 'cpf-conjuge';
        } else if (lowerName.includes('renda') || lowerName.includes('salario') || lowerName.includes('holerite')) {
            return 'renda-conjuge';
        }
    }
    
    // Documentos principais
    if (lowerName.includes('rg')) {
        return 'rg';
    } else if (lowerName.includes('cpf')) {
        return 'cpf';
    } else if (lowerName.includes('residencia') || lowerName.includes('endereco') || lowerName.includes('comprovante')) {
        return 'residencia';
    } else if (lowerName.includes('renda') || lowerName.includes('salario') || lowerName.includes('holerite')) {
        return 'renda';
    } else if (lowerName.includes('casamento') || lowerName.includes('certidao')) {
        return 'casamento';
    } else {
        return 'outros';
    }
}

// ✅ Adicionar arquivo à lista visual
function addFileToList(fileObj) {
    const filesList = document.getElementById('filesList');
    const fileSize = (fileObj.size / 1024).toFixed(2);
    
    const categoryLabels = {
        'rg': 'RG',
        'cpf': 'CPF',
        'residencia': 'Comp. Residência',
        'renda': 'Comp. Renda',
        'casamento': 'Cert. Casamento',
        'rg-conjuge': 'RG Cônjuge',
        'cpf-conjuge': 'CPF Cônjuge',
        'renda-conjuge': 'Renda Cônjuge',
        'outros': 'Outros'
    };

    const fileIcon = fileObj.type.includes('pdf') ? '📄' : '🖼️';
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.id = `file-${fileObj.id}`;
    fileItem.innerHTML = `
        <div class="file-icon">${fileIcon}</div>
        <div class="file-info">
            <span class="file-name">${fileObj.name}</span>
            <div class="file-details">
                <span>${fileSize} KB</span>
                <span class="file-category">${categoryLabels[fileObj.category]}</span>
            </div>
        </div>
        <div class="file-remove" onclick="removeFile(${fileObj.id})">✕</div>
    `;
    
    filesList.appendChild(fileItem);
}

// ✅ Remover arquivo
function removeFile(fileId) {
    // Remover da lista
    const index = uploadedFiles.findIndex(f => f.id === fileId);
    if (index > -1) {
        const file = uploadedFiles[index];
        
        // Remover da categoria
        if (fileCategories[file.category]) {
            const catIndex = fileCategories[file.category].findIndex(f => f.id === fileId);
            if (catIndex > -1) {
                fileCategories[file.category].splice(catIndex, 1);
            }
            if (fileCategories[file.category].length === 0) {
                delete fileCategories[file.category];
            }
        }
        
        uploadedFiles.splice(index, 1);
    }
    
    // Remover elemento visual
    const element = document.getElementById(`file-${fileId}`);
    if (element) {
        element.remove();
    }
    
    updateCategoryCards();
    updateDocumentSummary();
}

// ✅ Atualizar cards de categoria
function updateCategoryCards() {
    const categories = ['rg', 'cpf', 'residencia', 'renda', 'casamento', 'rg-conjuge', 'cpf-conjuge', 'renda-conjuge'];
    
    categories.forEach(category => {
        const card = document.querySelector(`[data-category="${category}"]`);
        if (card) {
            const count = fileCategories[category] ? fileCategories[category].length : 0;
            const countElement = card.querySelector('.category-count');
            
            countElement.textContent = `${count} arquivo(s)`;
            
            if (count > 0) {
                card.classList.add('has-files');
                countElement.classList.add('success');
            } else {
                card.classList.remove('has-files');
                countElement.classList.remove('success');
            }
        }
    });
}

// ✅ Atualizar resumo de documentos
function updateDocumentSummary() {
    const summaryDocumentos = document.getElementById('summaryDocumentos');
    
    if (summaryDocumentos) {
        const count = uploadedFiles.length;
        summaryDocumentos.textContent = count > 0 ? `${count} arquivo(s)` : 'Nenhum documento anexado';
    }
}

// ✅ Atualizar visibilidade dos documentos do cônjuge
function updateSpouseDocuments(show) {
    const spouseDocs = document.querySelectorAll('.spouse-doc');
    const spouseInfo = document.getElementById('spouseDocsInfo');
    
    spouseDocs.forEach(doc => {
        doc.style.display = show ? 'block' : 'none';
    });
    
    if (spouseInfo) {
        spouseInfo.style.display = show ? 'inline' : 'none';
    }
}

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('btnNext').addEventListener('click', nextStep);
    document.getElementById('btnBack').addEventListener('click', prevStep);

    document.querySelectorAll('.step-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            const targetStep = parseInt(this.dataset.step);
            if (targetStep <= currentStep || targetStep === currentStep + 1) {
                goToStep(targetStep);
            }
        });
    });
}

// Configurar máscaras de entrada
function setupInputMasks() {
    // Máscara CPF/CNPJ
    const cpfCnpjInput = document.getElementById('cpfCnpj');
    cpfCnpjInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            // CPF
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
        } else {
            // CNPJ
            value = value.replace(/(\d{2})(\d)/, '$1.$2');
            value = value.replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
            value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
        }
        
        e.target.value = value;
    });

    // Máscara CPF cônjuge
    const cpfConjugeInput = document.getElementById('cpfConjuge');
    if (cpfConjugeInput) {
        cpfConjugeInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
            e.target.value = value;
        });
    }

    // Máscara telefone
    const phoneInputs = ['telefoneCelular', 'telefoneComercial'];
    phoneInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length >= 2) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                }
                if (value.length >= 10) {
                    if (value.length === 14) { // (11) 12345-6789
                        value = value.replace(/(\(\d{2}\) \d{4})(\d)/, '$1-$2');
                    } else if (value.length === 15) { // (11) 12345-67890
                        value = value.replace(/(\(\d{2}\) \d{5})(\d)/, '$1-$2');
                    }
                }
                
                e.target.value = value;
            });
        }
    });

    // Máscara CEP
    const cepInput = document.getElementById('cep');
    cepInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 5) {
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = value;
    });
}

// Configurar estado civil
function setupMaritalStatusHandler() {
    const estadoCivilInputs = document.querySelectorAll('input[name="estadoCivil"]');
    
    estadoCivilInputs.forEach(input => {
        input.addEventListener('change', function() {
            const isMarriedOrUnion = this.value === 'casado' || this.value === 'uniao-estavel';
            updateSpouseVisibility(isMarriedOrUnion);
            updateSpouseDocuments(isMarriedOrUnion); // ✅ Atualizar docs do cônjuge
        });
    });
}

function updateSpouseVisibility(show) {
    const spouseFields = document.querySelectorAll('.spouse-field');
    spouseFields.forEach(field => {
        if (show) {
            field.setAttribute('required', 'required');
        } else {
            field.removeAttribute('required');
            field.value = '';
        }
    });
}

// Configurar cálculos de valores
function setupValueCalculations() {
    const valorImovelInput = document.getElementById('valorImovel');
    const valorEntradaInput = document.getElementById('valorEntrada');
    const valorFinanciarInput = document.getElementById('valorFinanciar');

    function formatCurrency(input) {
        let value = input.value.replace(/\D/g, '');
        value = (parseInt(value) / 100).toFixed(2);
        value = value.replace('.', ',');
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        input.value = value;
        return parseFloat(value.replace(/\./g, '').replace(',', '.'));
    }

    function calculateFinancing() {
        const valorImovel = parseFloat(valorImovelInput.value.replace(/\./g, '').replace(',', '.')) || 0;
        const valorEntrada = parseFloat(valorEntradaInput.value.replace(/\./g, '').replace(',', '.')) || 0;
        const valorFinanciar = valorImovel - valorEntrada;
        
        if (valorFinanciar >= 0) {
            let formattedValue = valorFinanciar.toFixed(2);
            formattedValue = formattedValue.replace('.', ',');
            formattedValue = formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            valorFinanciarInput.value = formattedValue;
        }
    }

    valorImovelInput.addEventListener('input', function() {
        formatCurrency(this);
        calculateFinancing();
    });

    valorEntradaInput.addEventListener('input', function() {
        formatCurrency(this);
        calculateFinancing();
    });
}

// Configurar busca de CEP
function setupCepLookup() {
    const cepInput = document.getElementById('cep');
    
    cepInput.addEventListener('blur', async function() {
        const cep = this.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    document.getElementById('logradouro').value = data.logradouro || '';
                    document.getElementById('bairro').value = data.bairro || '';
                    document.getElementById('cidade').value = data.localidade || '';
                    document.getElementById('uf').value = data.uf || '';
                    
                    document.getElementById('numero').focus();
                }
            } catch (error) {
                console.log('Erro ao buscar CEP:', error);
            }
        }
    });
}

// Navegação entre passos
function nextStep() {
    if (validateStep()) {
        saveStepData();
        
        if (currentStep < totalSteps) {
            const nextValidStep = getNextValidStep();
            currentStep = nextValidStep;
            showStep(currentStep);
            updateProgress();
        } else {
            submitForm();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        const prevValidStep = getPrevValidStep();
        currentStep = prevValidStep;
        showStep(currentStep);
        updateProgress();
    }
}

function goToStep(step) {
    // Verificar se deve pular step do cônjuge
    if (step === 3 && !shouldShowSpouseStep()) {
        step = step === currentStep - 1 ? 2 : 4;
    }
    
    currentStep = step;
    showStep(currentStep);
    updateProgress();
}

function getNextValidStep() {
    let nextStep = currentStep + 1;
    if (nextStep === 3 && !shouldShowSpouseStep()) {
        nextStep = 4;
    }
    return nextStep;
}

function getPrevValidStep() {
    let prevStep = currentStep - 1;
    if (prevStep === 3 && !shouldShowSpouseStep()) {
        prevStep = 2;
    }
    return prevStep;
}

function shouldShowSpouseStep() {
    const estadoCivil = getSelectedRadioValue('estadoCivil');
    return estadoCivil === 'casado' || estadoCivil === 'uniao-estavel';
}

function getSelectedRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
}

function showStep(step) {
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active');
    });

    document.getElementById(`step${step}`).classList.add('active');

    const btnBack = document.getElementById('btnBack');
    const btnNext = document.getElementById('btnNext');

    btnBack.style.display = step === 1 ? 'none' : 'block';
    btnNext.textContent = step === totalSteps ? 'Enviar Proposta' : 'Continuar →';

    if (step === totalSteps) {
        updateSummary();
    }

    // 📱 Scroll para o topo do novo step em mobile
    if (window.innerWidth <= 768) {
        const stepElement = document.getElementById(`step${step}`);
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Validação
function validateStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        const isVisible = field.offsetParent !== null;
        
        if (isVisible && !field.value) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    // Documentação é opcional, não precisa validar

    if (!isValid) {
        // Scroll to first error
        const firstError = currentStepElement.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }

    return isValid;
}

// Salvar dados do passo
function saveStepData() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const inputs = currentStepElement.querySelectorAll('input, select');

    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
        } else if (input.type === 'checkbox') {
            formData[input.name] = input.checked;
        } else if (input.type !== 'file') {
            formData[input.name] = input.value;
        }
    });
}

// Atualizar resumo
function updateSummary() {
    document.getElementById('summaryNome').textContent = formData.nome || '-';
    
    const isMarriedOrUnion = formData.estadoCivil === 'casado' || formData.estadoCivil === 'uniao-estavel';
    if (isMarriedOrUnion && formData.nomeConjuge) {
        document.getElementById('summaryConjugeItem').style.display = 'flex';
        document.getElementById('summaryConjuge').textContent = formData.nomeConjuge;
    } else {
        document.getElementById('summaryConjugeItem').style.display = 'none';
    }

    const empreendimentoNames = {
        'haya': 'HAYA',
        'kasa': 'KASA',
        'vert': 'VERT',
        'alma': 'ALMA'
    };

    document.getElementById('summaryEmpreendimento').textContent = 
        empreendimentoNames[formData.empreendimento] || '-';
    document.getElementById('summaryUnidade').textContent = formData.unidadeNumero || '-';
    
    // Atualizar valores se existirem
    if (formData.valorImovel) {
        document.getElementById('summaryValorImovel').textContent = `R$ ${formData.valorImovel}`;
    }
    if (formData.valorEntrada) {
        document.getElementById('summaryValorEntrada').textContent = `R$ ${formData.valorEntrada}`;
    }
    if (formData.valorFinanciar) {
        document.getElementById('summaryValorFinanciar').textContent = `R$ ${formData.valorFinanciar}`;
    }
    
    updateDocumentSummary(); // ✅ Atualizar documentos
}

// Atualizar barra de progresso
function updateProgress() {
    // Calcular progresso
    let totalValidSteps = shouldShowSpouseStep() ? totalSteps : totalSteps - 1;
    let currentValidStep = currentStep;
    
    // Se não mostra cônjuge e currentStep > 3, ajustar para cálculo do progresso
    if (!shouldShowSpouseStep() && currentStep > 3) {
        currentValidStep = currentStep - 1;
    }
    
    const progressPercentage = (currentValidStep / totalValidSteps) * 100;
    document.getElementById('progressFill').style.width = `${progressPercentage}%`;

    // Atualizar labels
    for (let i = 1; i <= totalSteps; i++) {
        const label = document.getElementById(`label${i}`);
        if (!label) continue;
        
        // Skip do cônjuge se não deve mostrar
        if (i === 3 && !shouldShowSpouseStep()) {
            label.classList.remove('active');
            continue;
        }
        
        let shouldActivate = false;
        
        if (shouldShowSpouseStep()) {
            shouldActivate = currentStep >= i;
        } else {
            if (i <= 2) {
                shouldActivate = currentStep >= i;
            } else if (i > 3) {
                shouldActivate = (currentStep - 1) >= (i - 1);
            }
        }
        
        if (shouldActivate) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    }

    // Atualizar dots
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        const stepNumber = index + 1;
        
        if (stepNumber === 3 && !shouldShowSpouseStep()) {
            dot.classList.remove('active');
            return;
        }
        
        let shouldActivate = false;
        
        if (shouldShowSpouseStep()) {
            shouldActivate = currentStep >= stepNumber;
        } else {
            if (stepNumber <= 2) {
                shouldActivate = currentStep >= stepNumber;
            } else if (stepNumber > 3) {
                shouldActivate = (currentStep - 1) >= (stepNumber - 1);
            }
        }
        
        if (shouldActivate) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Enviar formulário
async function submitForm() {
    saveStepData();
    
    const loadingSpinner = document.getElementById('loadingSpinner');
    const btnNext = document.getElementById('btnNext');
    
    loadingSpinner.classList.add('show');
    btnNext.disabled = true;
    
    const submitData = {
        ...formData,
        dataEnvio: new Date().toISOString(),
        timestamp: Date.now(),
        // ✅ Dados dos documentos
        documentos: uploadedFiles.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
            category: f.category,
            base64: f.base64, // Incluir dados base64 para impressão
            pdfImages: f.pdfImages || [] // Incluir imagens do PDF se houver
        })),
        documentosEnvioPosterior: false,
        quantidadeDocumentos: uploadedFiles.length,
        // ✅ Informações do webhook
        webhookUrl: WEBHOOK_URL,
        deviceInfo: {
            userAgent: navigator.userAgent,
            screenSize: `${screen.width}x${screen.height}`,
            windowSize: `${window.innerWidth}x${window.innerHeight}`,
            hasVisualViewport: !!window.visualViewport,
            isMobile: window.innerWidth <= 768
        }
    };
    
    console.log('📤 Enviando dados:', submitData);
    console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
    
    try {
        // Gerar PDF localmente para download imediato
        console.log('📄 Gerando PDF para download...');
        const pdfBlob = await generatePropostaPDFBlob(submitData);
        
        let pdfUrl = null;
        if (pdfBlob) {
            pdfUrl = URL.createObjectURL(pdfBlob);
            console.log('✅ PDF gerado localmente:', pdfUrl);
        }
        
        // Salvar PDF no servidor e enviar via WhatsApp
        if (pdfBlob) {
            await savePDFToServer(pdfBlob, `proposta-lotus-${submitData.nome ? submitData.nome.replace(/\s+/g, '-').toLowerCase() : 'cliente'}-${Date.now()}.pdf`, submitData);
        }
        
        // Enviar proposta via WhatsApp usando WAHA
        sendWhatsAppMessage(submitData, pdfUrl);
        
        // Mostrar sucesso com PDF local
        mostrarSucesso(submitData, pdfUrl);
        
    } catch (error) {
        console.log('❌ Erro no processo:', error);
        mostrarSucesso(submitData, null);
    }
    
    // Salvar localmente como backup
    localStorage.setItem('ultimaProposta_' + Date.now(), JSON.stringify(submitData));
    
    loadingSpinner.classList.remove('show');
    btnNext.disabled = false;
}

// Gerar PDF da proposta
async function generatePropostaPDF(formData) {
    try {
        console.log('📄 Iniciando geração de proposta...');
        
        // Criar página de proposta como HTML
        const propostaHTML = generatePropostaHTML(formData);
        console.log('📄 HTML da proposta gerado');
        
        // Abrir nova janela com a proposta para que o usuário possa imprimir como PDF
        const newWindow = window.open('', '_blank');
        newWindow.document.write(propostaHTML);
        newWindow.document.close();
        
        // Automaticamente abrir o diálogo de impressão
        setTimeout(() => {
            newWindow.print();
        }, 500);
        
        console.log('✅ Janela de impressão aberta');
        return {
            printOpened: true,
            htmlContent: propostaHTML
        };
        
    } catch (error) {
        console.error('❌ Erro ao gerar proposta:', error);
        return null;
    }
}

// Gerar PDF como blob para envio via webhook
async function generatePropostaPDFBlob(formData) {
    try {
        console.log('📄 Gerando PDF blob para webhook...');
        console.log('📄 Dados recebidos:', JSON.stringify(formData, null, 2));
        
        // Carregar biblioteca html2pdf
        await loadHTML2PDF();
        console.log('📄 html2pdf carregado');
        
        // Criar página de proposta como HTML
        const propostaHTML = generatePropostaHTML(formData);
        console.log('📄 HTML gerado, tamanho:', propostaHTML.length, 'caracteres');
        
        // Debug: Verificar se o HTML não está vazio
        if (!propostaHTML || propostaHTML.length < 100) {
            console.error('❌ HTML gerado está vazio ou muito pequeno');
            console.log('📄 HTML gerado:', propostaHTML.substring(0, 500));
            throw new Error('HTML da proposta está vazio');
        }
        
        // Criar elemento temporário para gerar PDF
        const element = document.createElement('div');
        element.innerHTML = propostaHTML;
        element.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 800px;
            background: white;
            font-family: Arial, sans-serif;
            visibility: hidden;
        `;
        document.body.appendChild(element);
        
        console.log('📄 Elemento criado e anexado ao DOM');
        console.log('📄 Elemento scroll height:', element.scrollHeight);
        console.log('📄 Elemento scroll width:', element.scrollWidth);
        
        // Aguardar mais tempo para o DOM se estabilizar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se o elemento tem conteúdo
        if (element.scrollHeight === 0 || element.scrollWidth === 0) {
            console.error('❌ Elemento não tem dimensões válidas');
            console.log('📄 Inner HTML length:', element.innerHTML.length);
            document.body.removeChild(element);
            throw new Error('Elemento HTML não renderizou corretamente');
        }
        
        // Configurações do PDF mais robustas
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `proposta-lotus-${formData.nome ? formData.nome.replace(/\s+/g, '-').toLowerCase() : 'cliente'}-${Date.now()}.pdf`,
            image: { 
                type: 'jpeg', 
                quality: 0.98
            },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: element.scrollWidth,
                height: element.scrollHeight
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait'
            }
        };
        
        console.log('📄 Configurações do PDF:', JSON.stringify(opt, null, 2));
        console.log('📄 Iniciando geração do PDF...');
        
        // Gerar PDF como blob
        const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
        
        console.log('📄 PDF blob criado, tamanho:', pdfBlob?.size, 'bytes');
        
        // Limpar elemento temporário
        document.body.removeChild(element);
        
        // Validar se o blob foi criado corretamente
        if (!pdfBlob || pdfBlob.size === 0) {
            throw new Error('PDF blob está vazio ou não foi criado');
        }
        
        // Verificar se o tamanho é razoável (pelo menos 1KB)
        if (pdfBlob.size < 1024) {
            console.warn('⚠️ PDF muito pequeno:', pdfBlob.size, 'bytes');
        }
        
        console.log('✅ PDF blob válido gerado para webhook');
        return pdfBlob;
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF blob:', error);
        console.error('❌ Detalhes:', error.message);
        console.error('❌ Stack:', error.stack);
        
        // Tentar limpar elemento se ainda estiver no DOM
        const leftoverElements = document.querySelectorAll('[style*="-9999px"]');
        leftoverElements.forEach(el => {
            try {
                document.body.removeChild(el);
            } catch (e) {
                console.warn('⚠️ Não foi possível limpar elemento:', e);
            }
        });
        
        return null;
    }
}

// Carregar biblioteca html2pdf
function loadHTML2PDF() {
    return new Promise((resolve, reject) => {
        if (window.html2pdf) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Erro ao carregar html2pdf'));
        document.head.appendChild(script);
    });
}

// Converter blob para base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Helper para obter label da categoria de documento
function getCategoryLabel(category) {
    const categoryLabels = {
        'rg': 'RG',
        'cpf': 'CPF',
        'residencia': 'Comp. Residência',
        'renda': 'Comp. Renda',
        'casamento': 'Cert. Casamento',
        'rg-conjuge': 'RG Cônjuge',
        'cpf-conjuge': 'CPF Cônjuge',
        'renda-conjuge': 'Renda Cônjuge',
        'outros': 'Outros'
    };
    return categoryLabels[category] || 'Documento';
}

// Gerar HTML da proposta com dados preenchidos
function generatePropostaHTML(formData) {
    const currentDate = new Date();
    const numeroProsposta = `LP${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}${String(currentDate.getHours()).padStart(2, '0')}${String(currentDate.getMinutes()).padStart(2, '0')}`;
    
    // Mapear empreendimentos
    const empreendimentoNames = {
        'haya': 'HAYA',
        'kasa': 'KASA', 
        'vert': 'VERT',
        'alma': 'ALMA'
    };

    const enderecoCompleto = `${formData.logradouro || ''} ${formData.numero || ''} ${formData.complemento || ''}`.trim();
    const estadoCivil = formData.estadoCivil || '';
    const isMarriedOrUnion = estadoCivil === 'casado' || estadoCivil === 'uniao-estavel';
    
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Proposta de Compra - Lotus - ${formData.nome || 'Cliente'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', Arial, sans-serif; 
            font-size: 11px; 
            line-height: 1.4;
            color: #1A1A1A;
            margin: 0;
            padding: 20px;
            background: #fff;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            border: 2px solid #FFC629;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #FFC629 0%, #FFD93D 100%);
            padding: 30px;
            text-align: center;
            position: relative;
            border-bottom: 3px solid #E6B324;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
        }
        
        .logo-container {
            position: relative;
            z-index: 2;
            display: inline-block;
            background: #1A1A1A;
            padding: 15px 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .logo-svg {
            height: 35px;
            width: auto;
        }
        
        .header h1 { 
            position: relative;
            z-index: 2;
            font-size: 20px; 
            font-weight: bold; 
            text-transform: uppercase;
            color: #1A1A1A;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
        .header .number {
            position: relative;
            z-index: 2;
            background: #1A1A1A;
            color: #FFC629;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 12px;
            display: inline-block;
        }
        
        .content {
            padding: 30px;
        }
        
        .section { 
            margin-bottom: 30px; 
            background: #FEFCF7;
            border: 1px solid #F5F5F5;
            border-radius: 8px;
            padding: 20px;
        }
        
        .section-title { 
            background: linear-gradient(135deg, #FFC629 0%, #FFD93D 100%);
            font-weight: bold; 
            font-size: 14px;
            padding: 12px 20px; 
            border: 2px solid #E6B324;
            border-radius: 25px;
            margin-bottom: 20px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #1A1A1A;
            box-shadow: 0 2px 8px rgba(255, 198, 41, 0.2);
        }
        
        .form-row { 
            display: flex; 
            margin-bottom: 15px; 
            align-items: center; 
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .form-group { 
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            min-width: 200px;
        }
        
        .form-group.full { 
            flex: 1;
            min-width: 300px;
        }
        
        .form-label { 
            font-weight: bold; 
            margin-right: 10px;
            color: #5A5A5A;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
            min-width: 80px;
        }
        
        .form-value { 
            border-bottom: 2px solid #FFC629;
            padding: 4px 8px;
            min-width: 120px;
            background: #fff;
            color: #1A1A1A;
            font-weight: 500;
        }
        
        .checkbox-group {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .checkbox { 
            display: inline-block; 
            width: 14px; 
            height: 14px; 
            border: 2px solid #FFC629;
            border-radius: 3px;
            text-align: center; 
            font-size: 10px;
            font-weight: bold;
            background: #fff;
            position: relative;
        }
        
        .checked {
            background: #FFC629;
            color: #1A1A1A;
        }
        
        .checked::after { 
            content: "✓";
            position: absolute;
            top: -1px;
            left: 1px;
        }
        
        .values-section {
            background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
            border: 2px solid #10B981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .value-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .value-item:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 13px;
        }
        
        .value-label {
            font-weight: bold;
            color: #374151;
        }
        
        .value-amount {
            font-weight: bold;
            color: #10B981;
            font-size: 14px;
        }
        
        .conditions { 
            margin-top: 30px;
            background: #F8F8F8;
            border-radius: 8px;
            padding: 20px;
        }
        
        .conditions h3 {
            font-weight: bold;
            margin-bottom: 15px;
            color: #1A1A1A;
            text-transform: uppercase;
            font-size: 13px;
            letter-spacing: 0.5px;
        }
        
        .condition-item { 
            margin-bottom: 15px; 
            text-align: justify;
            line-height: 1.5;
            padding: 10px;
            background: #fff;
            border-radius: 6px;
            border-left: 4px solid #FFC629;
        }
        
        .signatures { 
            margin-top: 50px; 
            display: flex; 
            justify-content: space-between;
            gap: 40px;
        }
        
        .signature-box { 
            text-align: center; 
            flex: 1;
        }
        
        .signature-line { 
            border-top: 2px solid #1A1A1A;
            height: 80px; 
            margin-bottom: 10px;
            margin-top: 40px;
        }
        
        .signature-label {
            font-weight: bold;
            color: #5A5A5A;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
        }
        
        .date-location {
            text-align: center;
            margin: 30px 0;
            font-weight: bold;
            font-size: 13px;
            color: #1A1A1A;
        }
        
        .footer { 
            background: #1A1A1A;
            color: #FFC629;
            padding: 25px;
            text-align: center; 
            font-size: 10px;
            margin-top: 40px;
        }
        
        .footer .brand {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 8px;
            text-transform: lowercase;
            letter-spacing: -0.5px;
        }
        
        .footer .contact {
            color: #8A8A8A;
            line-height: 1.5;
        }
        
        .page-break {
            page-break-before: always;
            margin-top: 40px;
        }
        
        .no-page-break {
            page-break-inside: avoid;
        }
        
        @media print {
            body { 
                margin: 0; 
                padding: 10mm; 
                font-size: 10px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .container { 
                border: none; 
                border-radius: 0; 
                max-width: none;
                width: 100%;
            }
            
            .header { 
                background: #FFC629 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .section-title {
                background: #FFC629 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .values-section {
                background: #F0FDF4 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .footer {
                background: #1A1A1A !important;
                color: #FFC629 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <svg class="logo-svg" viewBox="0 0 141 44" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
                    <path d="M121.544 33.2592C121.544 36.9227 123.731 38.7544 128.044 38.7544C131.412 38.7544 133.598 37.3363 133.598 34.9728C133.598 31.9002 130.23 31.132 126.271 30.1866C121.072 28.9457 114.926 27.5867 114.926 20.9097C114.926 15.3554 119.831 11.6919 127.63 11.6919C135.726 11.6919 140.275 15.1781 140.275 21.8551H133.244C133.067 18.2507 131.235 16.7735 127.394 16.7735C124.262 16.7735 122.253 18.1325 122.253 20.3188C122.253 23.5687 126.744 24.3959 131.294 25.5186C136.08 26.8185 140.925 28.5321 140.925 34.3819C140.925 40.2907 135.962 43.836 127.985 43.836C119.299 43.836 114.454 40.1726 114.276 33.2592H121.544Z" fill="#ffffff"></path>
                    <path d="M102.931 39.05C100.568 42.2999 96.8452 43.5998 93.2998 43.5998C89.2818 43.5998 86.5638 42.0635 84.6729 39.4636C83.1957 37.3955 82.9003 34.2639 82.9003 29.8322V12.5193H89.9318V29.5959C89.9318 34.0866 90.5818 38.2228 95.5452 38.2228C97.7315 38.2228 99.386 37.4546 100.568 35.8592C101.749 34.2639 102.459 31.7821 102.459 28.0005V12.5193H109.549V43.009H102.931V39.05Z" fill="#ffffff"></path>
                    <path d="M65.8946 4.95459H72.9852V12.5179H79.0122V17.9541H72.9852V32.3126C72.9852 36.0942 73.8124 37.8078 76.6487 37.8078C77.2987 37.8078 77.9486 37.8078 79.0713 37.5714V43.0076C77.4759 43.4212 76.1169 43.5394 74.5215 43.5394C68.4354 43.5394 65.8946 40.644 65.8946 33.7307V17.9541H60.9902V12.5179H65.8946V4.95459Z" fill="#ffffff"></path>
                    <path d="M44.6113 11.6919C53.9473 11.6919 59.8561 18.1325 59.8561 27.764C59.8561 37.3954 53.9473 43.836 44.5522 43.836C35.2753 43.836 29.4255 37.3954 29.4255 27.764C29.4255 18.1325 35.3344 11.6919 44.6113 11.6919ZM44.6113 17.128C39.6478 17.128 36.8116 21.2051 36.8116 27.764C36.8116 34.2046 39.5888 38.3999 44.5522 38.3999C49.5747 38.3999 52.4701 34.3228 52.4701 27.764C52.4701 21.2051 49.5747 17.128 44.6113 17.128Z" fill="#ffffff"></path>
                    <path d="M7.99252 0.109375V36.7442H28.2599V43.0076H0.488281V0.109375H7.99252Z" fill="#ffffff"></path>
                </svg>
            </div>
            <h1>Proposta de Compra com Recibo de Sinal</h1>
            <div class="number">Nº ${numeroProsposta}</div>
        </div>
        
        <div class="content">
            <!-- Dados Pessoais -->
            <div class="section no-page-break">
                <div class="form-row">
                    <div class="form-group full">
                        <span class="form-label">NOME/1º PROPONENTE:</span>
                        <span class="form-value">${formData.nome || ''}</span>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <span class="form-label">CPF/CNPJ:</span>
                        <span class="form-value">${formData.cpfCnpj || ''}</span>
                    </div>
                    <div class="form-group">
                        <span class="form-label">RG:</span>
                        <span class="form-value">${formData.rgInsEst || ''}</span>
                    </div>
                    <div class="form-group">
                        <span class="form-label">ÓRGÃO EXP.:</span>
                        <span class="form-value">${formData.orgaoExpedidor || ''}</span>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <span class="form-label">SEXO:</span>
                        <span class="form-value">${formData.sexo || ''}</span>
                    </div>
                    <div class="form-group">
                        <span class="form-label">NATURALIDADE:</span>
                        <span class="form-value">${formData.naturalidade || ''}</span>
                    </div>
                    <div class="form-group">
                        <span class="form-label">NACIONALIDADE:</span>
                        <span class="form-value">${formData.nacionalidade || ''}</span>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <span class="form-label">TELEFONE:</span>
                        <span class="form-value">${formData.telefoneCelular || ''}</span>
                    </div>
                    <div class="form-group">
                        <span class="form-label">PROFISSÃO:</span>
                        <span class="form-value">${formData.profissao || ''}</span>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group full">
                        <span class="form-label">E-MAIL:</span>
                        <span class="form-value">${formData.email || ''}</span>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group full">
                        <span class="form-label">ENDEREÇO:</span>
                        <span class="form-value">${enderecoCompleto}</span>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <span class="form-label">BAIRRO:</span>
                        <span class="form-value">${formData.bairro || ''}</span>
                    </div>
                    <div class="form-group">
                        <span class="form-label">CIDADE:</span>
                        <span class="form-value">${formData.cidade || ''}</span>
                    </div>
                    <div class="form-group">
                        <span class="form-label">CEP:</span>
                        <span class="form-value">${formData.cep || ''}</span>
                    </div>
                </div>

                <div class="form-row">
                    <span class="form-label">ESTADO CIVIL:</span>
                    <div class="checkbox-group">
                        <div class="checkbox-item">
                            <span class="checkbox ${estadoCivil === 'casado' ? 'checked' : ''}"></span>
                            <span>Casado</span>
                        </div>
                        <div class="checkbox-item">
                            <span class="checkbox ${estadoCivil === 'solteiro' ? 'checked' : ''}"></span>
                            <span>Solteiro</span>
                        </div>
                        <div class="checkbox-item">
                            <span class="checkbox ${estadoCivil === 'divorciado' ? 'checked' : ''}"></span>
                            <span>Divorciado</span>
                        </div>
                        <div class="checkbox-item">
                            <span class="checkbox ${estadoCivil === 'uniao-estavel' ? 'checked' : ''}"></span>
                            <span>União Estável</span>
                        </div>
                    </div>
                </div>

                ${isMarriedOrUnion ? `
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #F5F5F5;">
                    <div class="form-row">
                        <div class="form-group full">
                            <span class="form-label">CÔNJUGE/2º PROPONENTE:</span>
                            <span class="form-value">${formData.nomeConjuge || ''}</span>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <span class="form-label">CPF CÔNJUGE:</span>
                            <span class="form-value">${formData.cpfConjuge || ''}</span>
                        </div>
                        <div class="form-group">
                            <span class="form-label">RG CÔNJUGE:</span>
                            <span class="form-value">${formData.rgConjuge || ''}</span>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <span class="form-label">PROFISSÃO CÔNJUGE:</span>
                            <span class="form-value">${formData.profissaoConjuge || ''}</span>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- Dados do Imóvel -->
            <div class="section-title page-break">DADOS DO IMÓVEL OBJETO DESTA PROPOSTA</div>
            <div class="section no-page-break">
                <div class="form-row">
                    <div class="form-group">
                        <span class="form-label">EMPREENDIMENTO:</span>
                        <span class="form-value">${empreendimentoNames[formData.empreendimento] || formData.empreendimento || ''}</span>
                    </div>
                    <div class="form-group">
                        <span class="form-label">INCORPORADORA:</span>
                        <span class="form-value">LOTUS CIDADE</span>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <span class="form-label">UNIDADE Nº:</span>
                        <span class="form-value">${formData.unidadeNumero || ''}</span>
                    </div>
                    <div class="form-group">
                        <span class="form-label">CIDADE:</span>
                        <span class="form-value">Brasília-DF</span>
                    </div>
                </div>
            </div>

            <!-- Valores Financeiros -->
            <div class="section-title">VALORES DA PROPOSTA</div>
            <div class="values-section">
                <div class="value-item">
                    <span class="value-label">(A) VALOR DA PROPOSTA:</span>
                    <span class="value-amount">R$ ${formData.valorImovel || '0,00'}</span>
                </div>
                <div class="value-item">
                    <span class="value-label">(B) VALOR DE ENTRADA:</span>
                    <span class="value-amount">R$ ${formData.valorEntrada || '0,00'}</span>
                </div>
                <div class="value-item">
                    <span class="value-label">(C) VALOR A FINANCIAR:</span>
                    <span class="value-amount">R$ ${formData.valorFinanciar || '0,00'}</span>
                </div>
            </div>

            <!-- Condições -->
            <div class="conditions no-page-break">
                <h3>Condições Gerais:</h3>
                <div class="condition-item">
                    <strong>1 -</strong> A presente proposta ficará sujeita a confirmação pela Incorporadora, facultado-lhe recusar expressamente esta proposta no prazo de até 48 (quarenta e oito) horas, contadas desta data.
                </div>
                <div class="condition-item">
                    <strong>2 -</strong> Pelo presente instrumento o proponente retro qualificado promete comprar o(s) imóvel(is) objeto(s) deste pelo preço e prazos ali estabelecidos, obrigando-se a comparecer à sede da Construtora para assinar o instrumento particular de promessa de compra e venda da unidade no prazo de 72 (setenta e duas) horas contadas desta data.
                </div>
                <div class="condition-item">
                    <strong>3 -</strong> No caso de financiamento junto a um agente financeiro, o proponente comprador obriga-se quando solicitado, a comprovar, no prazo de até 72 (setenta e duas) horas, a renda exigida pelo agente financeiro e a fornecer todos os documentos necessários exigidos.
                </div>
                <div class="condition-item">
                    <strong>4 -</strong> Os valores descritos nos itens (A), (B) e (C) da presente Proposta de Compra compõem o preço total da Unidade conforme tabela de venda disponibilizada pela Incorporadora.
                </div>
            </div>

            ${formData.documentos && formData.documentos.length > 0 ? `

            
            ${formData.documentos.map((doc) => `
                <div class="page-break">
                    <div style="background: #fff; border: 2px solid #FFC629; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; background: #FEFCF7; padding: 15px; border-radius: 6px;">
                            <span style="font-size: 32px;">${doc.type && doc.type.includes('pdf') ? '📄' : '🖼️'}</span>
                            <div>
                                <div style="font-weight: bold; font-size: 14px; color: #1A1A1A; margin-bottom: 5px;">${doc.name}</div>
                                <div style="font-size: 11px; color: #5A5A5A;">
                                    <strong>${doc.category ? getCategoryLabel(doc.category) : 'Documento'}</strong> • 
                                    ${doc.size ? Math.round(doc.size / 1024) + ' KB' : 'N/A'} • 
                                    ${doc.type || 'N/A'}
                                </div>
                            </div>
                        </div>
                        
                        ${doc.base64 && doc.type.includes('image') ? `
                            <div style="text-align: center; margin: 20px 0;">
                                <img src="${doc.base64}" 
                                     alt="${doc.name}" 
                                     style="max-width: 100%; 
                                            max-height: 600px; 
                                            border: 1px solid #E5E7EB; 
                                            border-radius: 6px;
                                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            </div>
                        ` : ''}
                        
                        ${doc.type && doc.type.includes('pdf') ? `
                            ${doc.pdfImages && doc.pdfImages.length > 0 ? `
                                ${doc.pdfImages.map((pageImage, pageIndex) => `
                                    <div style="text-align: center; margin: 20px 0; page-break-inside: avoid;">
                                        <div style="font-weight: bold; margin-bottom: 10px; color: #5A5A5A; font-size: 11px;">
                                            Página ${pageIndex + 1} de ${doc.pdfImages.length}
                                        </div>
                                        <img src="${pageImage}" 
                                             alt="${doc.name} - Página ${pageIndex + 1}" 
                                             style="max-width: 100%; 
                                                    max-height: 700px; 
                                                    border: 1px solid #E5E7EB; 
                                                    border-radius: 6px;
                                                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    </div>
                                    ${pageIndex < doc.pdfImages.length - 1 ? '<div style="page-break-before: always;"></div>' : ''}
                                `).join('')}
                            ` : `
                                <div style="text-align: center; padding: 40px; background: #F8F8F8; border-radius: 6px; margin: 20px 0;">
                                    <div style="font-size: 48px; margin-bottom: 15px;">📄</div>
                                    <div style="font-weight: bold; color: #1A1A1A;">Documento PDF</div>
                                    <div style="font-size: 11px; color: #5A5A5A; margin-top: 5px;">
                                        ${doc.name}<br>
                                        Não foi possível renderizar o PDF
                                    </div>
                                </div>
                            `}
                        ` : ''}
                    </div>
                </div>
            `).join('')}
            ` : ''}

            <div class="date-location">
                Brasília-DF, ${formatDate(currentDate)}
            </div>

            <div class="signatures">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-label">Proponente(s) Comprador(es)</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-label">CORRETOR</div>
                </div>
            </div>
        </div>

    </div>
</body>
</html>`;
}

// Mostrar mensagem de sucesso
function mostrarSucesso(data, pdfUrl = null) {
    console.log('🎉 Mostrando tela de sucesso...');
    console.log('📊 Dados:', data);
    console.log('🔗 PDF URL:', pdfUrl);
    
    document.querySelector('.form-content').style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    
    // Sempre mostrar seção de download
    const downloadSection = document.getElementById('downloadSection');
    const downloadLink = document.getElementById('downloadLink');
    
    if (downloadSection) {
        downloadSection.style.display = 'block';
        console.log('📄 Seção de download mostrada');
        
        if (downloadLink) {
            if (pdfUrl) {
                downloadLink.href = pdfUrl;
                downloadLink.download = `proposta-lotus-${data.nome ? data.nome.replace(/\s+/g, '-').toLowerCase() : 'cliente'}-${Date.now()}.pdf`;
                downloadLink.style.opacity = '1';
                downloadLink.style.pointerEvents = 'auto';
                downloadLink.onclick = null;
                console.log('📄 Download PDF configurado:', pdfUrl);
            } else {
                // Se não há PDF, gerar na hora
                downloadLink.href = '#';
                downloadLink.onclick = (e) => {
                    e.preventDefault();
                    generateAndDownloadPDF(data);
                };
                downloadLink.style.opacity = '1';
                downloadLink.style.pointerEvents = 'auto';
                console.log('📄 Download configurado para gerar na hora');
            }
        }
    }
    
    console.log('✅ Tela de sucesso configurada');
}

// Gerar e fazer download do PDF na hora
async function generateAndDownloadPDF(data) {
    try {
        console.log('📄 Gerando PDF na hora...');
        const downloadLink = document.getElementById('downloadLink');
        
        // Mostrar loading no botão
        if (downloadLink) {
            downloadLink.innerHTML = `
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                    </path>
                </svg>
                Gerando PDF...
            `;
            downloadLink.style.pointerEvents = 'none';
        }
        
        const pdfBlob = await generatePropostaPDFBlob(data);
        
        if (pdfBlob) {
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const filename = `proposta-lotus-${data.nome ? data.nome.replace(/\s+/g, '-').toLowerCase() : 'cliente'}-${Date.now()}.pdf`;
            
            // Criar link temporário para download
            const tempLink = document.createElement('a');
            tempLink.href = pdfUrl;
            tempLink.download = filename;
            tempLink.style.display = 'none';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            
            // Atualizar botão de download
            if (downloadLink) {
                downloadLink.href = pdfUrl;
                downloadLink.download = filename;
                downloadLink.innerHTML = `
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Baixar Novamente
                `;
                downloadLink.style.pointerEvents = 'auto';
            }
            
            console.log('✅ PDF gerado e baixado:', filename);
        } else {
            console.log('❌ Erro ao gerar PDF');
            if (downloadLink) {
                downloadLink.innerHTML = `
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Tentar Novamente
                `;
                downloadLink.style.pointerEvents = 'auto';
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF na hora:', error);
        
        if (downloadLink) {
            downloadLink.innerHTML = `
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Erro - Tentar Novamente
            `;
            downloadLink.style.pointerEvents = 'auto';
        }
    }
}

// 📱 Função para enviar mensagem via WhatsApp usando WAHA
async function sendWhatsAppMessage(submitData, pdfUrl) {
    try {
        console.log('📱 Enviando proposta via WhatsApp...');
        
        // Formatar dados da proposta para mensagem
        const cliente = submitData.clienteNome || 'Cliente';
        const projeto = submitData.tipoProjeto || 'Projeto';
        const valor = submitData.valorTotal || 'N/A';
        const dataEntrega = submitData.prazoEntrega || 'A definir';
        
        const mensagem = `🌟 *NOVA PROPOSTA GERADA - LOTUS*\n\n` +
            `👤 *Cliente:* ${cliente}\n` +
            `🏗️ *Projeto:* ${projeto}\n` +
            `💰 *Valor:* R$ ${valor}\n` +
            `📅 *Prazo:* ${dataEntrega}\n\n` +
            `📄 *PDF da proposta foi gerado com sucesso!*\n` +
            `🔗 Link: ${window.location.origin}\n\n` +
            `✅ *Status:* Aguardando análise do cliente`;

        // Enviar mensagem via WAHA API
        const response = await fetch(`${WAHA_URL}/api/sendText`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': WAHA_API_KEY,
            },
            body: JSON.stringify({
                session: 'default',
                chatId: `${WHATSAPP_PHONE}@c.us`,
                text: mensagem
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Proposta enviada via WhatsApp com sucesso:', result);
            
            // Mostrar notificação de sucesso
            showNotification('📱 Proposta enviada via WhatsApp!', 'success');
        } else {
            console.error('❌ Erro ao enviar via WhatsApp:', response.status);
            showNotification('❌ Erro ao enviar WhatsApp', 'error');
        }
        
    } catch (error) {
        console.error('❌ Erro na comunicação com WAHA:', error);
        showNotification('❌ Erro na comunicação com WhatsApp', 'error');
    }
}

// 🔔 Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
    }, 5000);
}

// 💾 Função para salvar PDF no servidor
async function savePDFToServer(pdfBlob, filename, clientData) {
    try {
        console.log('💾 Salvando PDF no servidor...');
        console.log('📄 Arquivo:', filename);
        console.log('📊 Dados do cliente:', clientData);
        
        // Converter blob para base64
        const base64PDF = await blobToBase64(pdfBlob);
        
        // Preparar dados para envio
        const payload = {
            pdfBase64: base64PDF,
            filename: filename,
            clientData: clientData
        };
        
        // Enviar para o endpoint PHP
        const response = await fetch('/save-pdf.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ PDF salvo no servidor:', result);
            
            if (result.success) {
                showNotification(`📁 PDF salvo: ${result.numeroProsposta}`, 'success');
                console.log('📂 Pasta criada:', result.folderPath);
                console.log('📄 Caminho do PDF:', result.pdfPath);
            } else {
                console.error('❌ Erro no servidor:', result.error);
                showNotification('❌ Erro ao salvar PDF no servidor', 'error');
            }
        } else {
            console.error('❌ Erro HTTP ao salvar PDF:', response.status);
            showNotification('❌ Erro de conexão ao salvar PDF', 'error');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar PDF no servidor:', error);
        showNotification('❌ Erro ao salvar PDF no servidor', 'error');
    }
}

// 🔄 Função auxiliar para converter blob em base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // Remove o prefixo 'data:application/pdf;base64,'
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}