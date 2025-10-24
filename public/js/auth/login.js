// ===== MARTFLEET - GERENCIADOR DE LOGIN FIREBASE =====
// Versão Firebase Auth com tratamento completo de autenticação

class GerenciadorLoginFirebase {
    constructor() {
        // Elementos do DOM
        this.formulario = document.getElementById('loginForm');
        this.campoEmail = document.getElementById('email');
        this.campoSenha = document.getElementById('password');
        this.botaoEnviar = document.getElementById('submitBtn');
        this.botaoAlternarSenha = document.getElementById('passwordToggle');
        this.textoBotao = document.getElementById('btnText');
        this.carregandoBotao = document.getElementById('btnLoading');
        
        // Estados
        this.estaProcessando = false;
        
        // Inicializa a classe
        this.inicializar();
    }

    inicializar() {
        // Verifica se Firebase está disponível
        if (typeof firebase === 'undefined') {
            console.error('Firebase não carregado');
            MartFleetUtils.NotificationSystem.error('Erro de configuração do sistema');
            return;
        }

        // Configura todos os event listeners e funcionalidades
        this.configurarEventListeners();
        this.configurarValidacaoTempoReal();
        this.configurarAnimacoesInputs();
        this.configurarAtalhosTeclado();
        
        console.log('✅ Gerenciador de Login Firebase inicializado');
    }

    configurarEventListeners() {
        // Submissão do formulário
        this.formulario.addEventListener('submit', (e) => this.manipularSubmissao(e));
        
        // Alternar visibilidade da senha
        this.botaoAlternarSenha.addEventListener('click', () => this.alternarVisibilidadeSenha());
        
        // Validação em tempo real
        this.campoEmail.addEventListener('input', () => this.validarEmail());
        this.campoSenha.addEventListener('input', () => this.validarSenha());
        
        // Preenchimento automático do navegador
        this.configurarPreenchimentoAutomatico();
    }

    configurarValidacaoTempoReal() {
        // Validação com debounce para melhor performance
        this.validacaoEmailDebounce = MartFleetUtils.Performance.debounce(() => this.validarEmail(), 300);
        this.validacaoSenhaDebounce = MartFleetUtils.Performance.debounce(() => this.validarSenha(), 300);
        
        this.campoEmail.addEventListener('input', this.validacaoEmailDebounce);
        this.campoSenha.addEventListener('input', this.validacaoSenhaDebounce);
    }

    configurarAnimacoesInputs() {
        // Adiciona animações de focus para todos os inputs
        const inputs = this.formulario.querySelectorAll('input');
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
                this.parentElement.classList.add('scale-105');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
                this.parentElement.classList.remove('scale-105');
            });
        });
    }

    configurarAtalhosTeclado() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter para submeter formulário
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.formulario.dispatchEvent(new Event('submit'));
            }
            
            // Escape para limpar formulário
            if (e.key === 'Escape') {
                this.limparFormulario();
            }
        });
    }

    configurarPreenchimentoAutomatico() {
        // Detecta quando o navegador preenche automaticamente
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (this.campoEmail.value) this.validarEmail();
                if (this.campoSenha.value) this.validarSenha();
            }, 100);
        });
    }

    alternarVisibilidadeSenha() {
        if (this.estaProcessando) return;
        
        // Alterna entre mostrar e esconder a senha
        const ehSenha = this.campoSenha.type === 'password';
        this.campoSenha.type = ehSenha ? 'text' : 'password';
        
        // Atualiza ícone do botão
        const icone = this.botaoAlternarSenha.querySelector('i');
        icone.className = ehSenha ? 'fas fa-eye-slash' : 'fas fa-eye';
        
        // Feedback visual de animação
        MartFleetUtils.DOMHelpers.addTempClass(this.botaoAlternarSenha, 'scale-110', 200);
        
        // Tracking de analytics
        MartFleet.trackEvent('UI Interaction', 'password_toggled', 'Login Page');
    }

    validarEmail() {
        const email = this.campoEmail.value.trim();
        const elementoErro = document.getElementById('emailError');
        const iconeSucesso = document.getElementById('emailValidIcon');
        const iconeErro = document.getElementById('emailErrorIcon');
        
        // Reseta estados anteriores
        this.resetarEstadoInput(this.campoEmail, iconeSucesso, iconeErro, elementoErro);
        
        if (!email) {
            this.definirEstadoInput(this.campoEmail, 'erro', 'Email é obrigatório', iconeSucesso, iconeErro, elementoErro);
            return false;
        }
        
        if (!MartFleetUtils.Validators.email(email)) {
            this.definirEstadoInput(this.campoEmail, 'erro', 'Por favor, insira um email válido', iconeSucesso, iconeErro, elementoErro);
            return false;
        }
        
        this.definirEstadoInput(this.campoEmail, 'sucesso', '', iconeSucesso, iconeErro, elementoErro);
        return true;
    }

    validarSenha() {
        const senha = this.campoSenha.value;
        const elementoErro = document.getElementById('passwordError');
        const iconeSucesso = document.getElementById('passwordValidIcon');
        const iconeErro = document.getElementById('passwordErrorIcon');
        
        // Reseta estados anteriores
        this.resetarEstadoInput(this.campoSenha, iconeSucesso, iconeErro, elementoErro);
        
        if (!senha) {
            this.definirEstadoInput(this.campoSenha, 'erro', 'Palavra-passe é obrigatória', iconeSucesso, iconeErro, elementoErro);
            return false;
        }
        
        if (senha.length < 6) {
            this.definirEstadoInput(this.campoSenha, 'erro', 'A senha deve ter pelo menos 6 caracteres', iconeSucesso, iconeErro, elementoErro);
            return false;
        }
        
        this.definirEstadoInput(this.campoSenha, 'sucesso', '', iconeSucesso, iconeErro, elementoErro);
        return true;
    }

    resetarEstadoInput(input, iconeSucesso, iconeErro, elementoErro) {
        // Remove todas as classes de estado e reseta visual
        input.classList.remove('input-success', 'input-error', 'firebase-input-valid', 'firebase-input-invalid');
        iconeSucesso.classList.add('opacity-0');
        iconeErro.classList.add('opacity-0');
        elementoErro.classList.add('opacity-0');
        elementoErro.textContent = '';
    }

    definirEstadoInput(input, estado, mensagem, iconeSucesso, iconeErro, elementoErro) {
        if (estado === 'sucesso') {
            input.classList.add('input-success', 'firebase-input-valid');
            input.classList.remove('input-error', 'firebase-input-invalid');
            iconeSucesso.classList.remove('opacity-0');
            iconeErro.classList.add('opacity-0');
            elementoErro.classList.add('opacity-0');
        } else if (estado === 'erro') {
            input.classList.add('input-error', 'firebase-input-invalid');
            input.classList.remove('input-success', 'firebase-input-valid');
            iconeErro.classList.remove('opacity-0');
            iconeSucesso.classList.add('opacity-0');
            elementoErro.textContent = mensagem;
            elementoErro.classList.remove('opacity-0');
            
            // Animação de shake para indicar erro
            MartFleetUtils.DOMHelpers.addTempClass(input, 'error-shake', 500);
        }
    }

    async manipularSubmissao(e) {
        e.preventDefault();
        
        if (this.estaProcessando) return;
        
        console.log('🔄 Iniciando processo de login Firebase...');
        
        // Valida todos os campos
        const emailValido = this.validarEmail();
        const senhaValida = this.validarSenha();
        
        if (!emailValido || !senhaValida) {
            MartFleetUtils.NotificationSystem.error('Por favor, corrija os erros no formulário');
            this.tremerFormulario();
            return;
        }
        
        // Mostra estado de carregamento
        this.definirEstadoCarregamento(true);
        this.estaProcessando = true;
        
        try {
            await this.realizarLoginFirebase();
        } catch (erro) {
            console.error('Erro no login Firebase:', erro);
            this.tratarErroFirebase(erro);
        } finally {
            this.definirEstadoCarregamento(false);
            this.estaProcessando = false;
        }
    }

    async realizarLoginFirebase() {
        // Prepara dados do formulário
        const dadosFormulario = {
            email: this.campoEmail.value.trim(),
            senha: this.campoSenha.value,
            lembrar: document.getElementById('remember').checked
        };
        
        console.log('📤 Autenticando com Firebase...', { 
            email: dadosFormulario.email, 
            lembrar: dadosFormulario.lembrar 
        });

        // Configura persistência baseado no "Lembrar-me"
        const persistence = dadosFormulario.lembrar ? 
            firebase.auth.Auth.Persistence.LOCAL : 
            firebase.auth.Auth.Persistence.SESSION;

        await firebase.auth().setPersistence(persistence);

        // Realiza autenticação com Firebase
        const userCredential = await firebase.auth().signInWithEmailAndPassword(
            dadosFormulario.email, 
            dadosFormulario.senha
        );

        const user = userCredential.user;
        
        console.log('✅ Login Firebase bem-sucedido:', { 
            uid: user.uid, 
            email: user.email,
            emailVerified: user.emailVerified 
        });

        // Verifica se o email foi verificado
        if (!user.emailVerified) {
            MartFleetUtils.NotificationSystem.warning(
                'Por favor, verifique seu email antes de continuar. ' +
                '<a href="#" onclick="gerenciadorLogin.reenviarVerificacaoEmail()" class="underline font-semibold">Reenviar verificação</a>',
                6000
            );
        }

        // Login bem sucedido
        MartFleetUtils.NotificationSystem.success('🎉 Login realizado com sucesso!');

        // Tracking de sucesso
        MartFleet.trackEvent('Authentication', 'login_success', 'Firebase Auth');

        // Animação de sucesso
        MartFleetUtils.DOMHelpers.addTempClass(this.botaoEnviar, 'bg-green-500', 1000);

        // O redirecionamento será tratado pelo auth state listener no main.js
        // Mas podemos forçar uma navegação aqui se necessário
        setTimeout(() => {
            this.redirecionarAposLogin();
        }, 1000);
    }

    tratarErroFirebase(erro) {
        let mensagemErro = 'Erro ao fazer login. Tente novamente.';
        
        switch (erro.code) {
            case 'auth/invalid-email':
                mensagemErro = 'Email inválido. Verifique o formato do email.';
                this.campoEmail.focus();
                break;
                
            case 'auth/user-disabled':
                mensagemErro = 'Esta conta foi desativada. Entre em contato com o suporte.';
                break;
                
            case 'auth/user-not-found':
                mensagemErro = 'Nenhuma conta encontrada com este email.';
                this.campoEmail.focus();
                break;
                
            case 'auth/wrong-password':
                mensagemErro = 'Senha incorreta. Tente novamente ou recupere sua senha.';
                this.campoSenha.focus();
                break;
                
            case 'auth/too-many-requests':
                mensagemErro = 'Muitas tentativas de login. Tente novamente mais tarde ou recupere sua senha.';
                break;
                
            case 'auth/network-request-failed':
                mensagemErro = 'Erro de conexão. Verifique sua internet e tente novamente.';
                break;
                
            case 'auth/operation-not-allowed':
                mensagemErro = 'Operação não permitida. Entre em contato com o suporte.';
                break;
                
            default:
                mensagemErro = `Erro inesperado: ${erro.message}`;
                break;
        }
        
        MartFleetUtils.NotificationSystem.error(mensagemErro);
        this.tremerFormulario();
        
        // Tracking de erro
        MartFleet.trackEvent('Authentication', `login_error_${erro.code}`, 'Firebase Auth');
    }

    async reenviarVerificacaoEmail() {
        try {
            const user = firebase.auth().currentUser;
            if (user) {
                await user.sendEmailVerification();
                MartFleetUtils.NotificationSystem.success('Email de verificação reenviado! Verifique sua caixa de entrada.');
                MartFleet.trackEvent('Authentication', 'email_verification_resent', 'Firebase Auth');
            }
        } catch (error) {
            console.error('Erro ao reenviar verificação:', error);
            MartFleetUtils.NotificationSystem.error('Erro ao reenviar email de verificação');
        }
    }

    redirecionarAposLogin() {
        // Usa a função de navegação do sistema SPA
        // O role será carregado pelo auth state listener no main.js
        if (window.MartFleetApp.userRole === 'owner') {
            window.MartFleet.navigateWithAuthCheck('owner-dashboard', '/templates/owner/dashboard.html', 'owner');
        } else if (window.MartFleetApp.userRole === 'driver') {
            window.MartFleet.navigateWithAuthCheck('driver-dashboard', '/templates/driver/dashboard.html', 'driver');
        } else {
            // Role não definido ou usuário comum
            window.loadPage('/templates/index.html');
        }
    }

    definirEstadoCarregamento(carregando) {
        if (carregando) {
            this.botaoEnviar.disabled = true;
            this.textoBotao.classList.add('hidden');
            this.carregandoBotao.classList.remove('hidden');
            this.botaoEnviar.classList.add('btn-loading');
            this.botaoEnviar.classList.remove('hover:scale-105', 'hover:shadow-xl');
            
            // Adiciona overlay de loading
            document.body.classList.add('auth-processing');
        } else {
            this.botaoEnviar.disabled = false;
            this.textoBotao.classList.remove('hidden');
            this.carregandoBotao.classList.add('hidden');
            this.botaoEnviar.classList.remove('btn-loading');
            this.botaoEnviar.classList.add('hover:scale-105', 'hover:shadow-xl');
            
            // Remove overlay de loading
            document.body.classList.remove('auth-processing');
        }
    }

    tremerFormulario() {
        // Animação de tremor para indicar erro no formulário
        MartFleetUtils.DOMHelpers.addTempClass(this.formulario, 'animate-shake', 500);
    }

    limparFormulario() {
        if (this.estaProcessando) return;
        
        // Reseta todos os campos e estados do formulário
        this.formulario.reset();
        const inputs = this.formulario.querySelectorAll('input');
        
        inputs.forEach(input => {
            const iconeSucesso = input.id === 'email' ? document.getElementById('emailValidIcon') : document.getElementById('passwordValidIcon');
            const iconeErro = input.id === 'email' ? document.getElementById('emailErrorIcon') : document.getElementById('passwordErrorIcon');
            const elementoErro = document.getElementById(input.id + 'Error');
            this.resetarEstadoInput(input, iconeSucesso, iconeErro, elementoErro);
        });
        
        MartFleetUtils.NotificationSystem.info('Formulário limpo');
        MartFleet.trackEvent('UI Interaction', 'form_cleared', 'Login Page');
    }

    // Método para preenchimento rápido (apenas para desenvolvimento)
    preencherCredenciaisDemo(tipo = 'driver') {
        if (process.env.NODE_ENV === 'production') return;
        
        const demos = {
            owner: {
                email: 'demo.owner@martfleet.com',
                senha: 'demo123456'
            },
            driver: {
                email: 'demo.driver@martfleet.com', 
                senha: 'demo123456'
            }
        };
        
        const demo = demos[tipo];
        if (demo) {
            this.campoEmail.value = demo.email;
            this.campoSenha.value = demo.senha;
            
            // Dispara validação
            this.validarEmail();
            this.validarSenha();
            
            MartFleetUtils.NotificationSystem.info(`Credenciais de ${tipo} preenchidas (APENAS DESENVOLVIMENTO)`);
            MartFleet.trackEvent('Demo', `credentials_filled_${tipo}`, 'Login Page');
        }
    }
}

// Adiciona animação de tremor ao CSS se não existir
if (!document.querySelector('#login-firebase-animations')) {
    const estilo = document.createElement('style');
    estilo.id = 'login-firebase-animations';
    estilo.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.5s ease-in-out;
        }
        .error-shake {
            animation: shake 0.5s ease-in-out;
        }
        .auth-processing {
            filter: blur(1px);
            pointer-events: none;
        }
        .auth-processing::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.5);
            z-index: 40;
        }
    `;
    document.head.appendChild(estilo);
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda o Firebase estar pronto
    const initLoginManager = () => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            window.gerenciadorLogin = new GerenciadorLoginFirebase();
        } else {
            setTimeout(initLoginManager, 100);
        }
    };

    initLoginManager();
});

// Export para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GerenciadorLoginFirebase;
}