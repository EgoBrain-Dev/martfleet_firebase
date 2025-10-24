/**
 * MARTFLEET - JavaScript Principal para Firebase PWA
 * Responsável pela funcionalidade global do sistema SPA
 * Mobile menu, interações básicas, animações e gerenciamento de estado
 */

// Estado global da aplicação
window.MartFleetApp = {
    currentUser: null,
    userRole: null,
    currentPage: 'index',
    isLoading: false,
    isOnline: true
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Inicializa a aplicação Firebase
 */
async function initializeApp() {
    try {
        // Verifica se Firebase está carregado
        if (typeof firebase === 'undefined') {
            console.error('Firebase não carregado');
            return;
        }

        // Inicializa componentes globais
        initializeGlobalComponents();
        
        // Configura estado de autenticação
        await initializeAuthState();
        
        // Configura detecção de conectividade
        initializeConnectivity();
        
        // Configura service worker para PWA
        initializeServiceWorker();
        
        console.log('🚀 MartFleet App inicializada com Firebase');

    } catch (error) {
        console.error('Erro na inicialização:', error);
        MartFleetUtils.NotificationSystem.error('Erro ao inicializar aplicação');
    }
}

/**
 * Inicializa componentes globais
 */
function initializeGlobalComponents() {
    // ===== MOBILE MENU FUNCTIONALITY =====
    initializeMobileMenu();
    
    // ===== DROPDOWN FUNCTIONALITY =====
    initializeDropdowns();
    
    // ===== ACCESSIBILITY IMPROVEMENTS =====
    improveAccessibility();
    
    // ===== PERFORMANCE OPTIMIZATIONS =====
    optimizePerformance();
    
    // ===== ANIMAÇÕES GLOBAIS =====
    initializeAnimations();
    
    // ===== NAVEGAÇÃO SPA =====
    initializeSPANavigation();
}

/**
 * Inicializa estado de autenticação
 */
async function initializeAuthState() {
    return new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                // Usuário logado
                window.MartFleetApp.currentUser = user;
                await loadUserRole(user.uid);
                updateUIForAuthState(true);
                MartFleetUtils.NotificationSystem.success(`Bem-vindo de volta!`, 3000);
            } else {
                // Usuário não logado
                window.MartFleetApp.currentUser = null;
                window.MartFleetApp.userRole = null;
                updateUIForAuthState(false);
            }
            unsubscribe();
            resolve();
        });
    });
}

/**
 * Carrega role do usuário
 */
async function loadUserRole(userId) {
    try {
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .get();
            
        if (userDoc.exists) {
            window.MartFleetApp.userRole = userDoc.data().role;
        }
    } catch (error) {
        console.error('Erro ao carregar role:', error);
    }
}

/**
 * Atualiza UI baseado no estado de autenticação
 */
function updateUIForAuthState(isLoggedIn) {
    // Mostra/oculta elementos baseado no estado de autenticação
    const authElements = document.querySelectorAll('[data-auth-state]');
    
    authElements.forEach(element => {
        const authState = element.getAttribute('data-auth-state');
        
        if (authState === 'signed-in' && isLoggedIn) {
            element.classList.remove('hidden');
        } else if (authState === 'signed-out' && !isLoggedIn) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });

    // Atualiza informações do usuário no header
    updateUserInfoInHeader();
}

/**
 * Atualiza informações do usuário no header
 */
function updateUserInfoInHeader() {
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    
    if (window.MartFleetApp.currentUser) {
        const user = window.MartFleetApp.currentUser;
        
        if (userAvatar) {
            userAvatar.src = user.photoURL || '/assets/img/avatar_default.png';
            userAvatar.alt = user.displayName || 'Usuário';
        }
        
        if (userName) {
            userName.textContent = user.displayName || user.email;
        }
        
        if (userRole) {
            userRole.textContent = window.MartFleetApp.userRole === 'owner' ? 'Proprietário' : 
                                 window.MartFleetApp.userRole === 'driver' ? 'Motorista' : 'Usuário';
        }
    }
}

/**
 * Inicializa detecção de conectividade
 */
function initializeConnectivity() {
    // Verifica estado online/offline
    window.addEventListener('online', () => {
        window.MartFleetApp.isOnline = true;
        hideOfflineIndicator();
        MartFleetUtils.NotificationSystem.success('Conexão restaurada', 2000);
    });

    window.addEventListener('offline', () => {
        window.MartFleetApp.isOnline = false;
        showOfflineIndicator();
        MartFleetUtils.NotificationSystem.warning('Você está offline', 3000);
    });

    // Estado inicial
    window.MartFleetApp.isOnline = navigator.onLine;
    if (!navigator.onLine) {
        showOfflineIndicator();
    }
}

function showOfflineIndicator() {
    let indicator = document.getElementById('offline-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.className = 'offline-indicator';
        indicator.innerHTML = `
            <i class="fas fa-wifi mr-2"></i>
            Você está offline - Algumas funcionalidades podem não estar disponíveis
        `;
        document.body.appendChild(indicator);
    }
    indicator.classList.remove('hidden');
}

function hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
        indicator.classList.add('hidden');
    }
}

/**
 * Inicializa Service Worker para PWA
 */
function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('Service Worker registrado com sucesso:', registration);
                
                // Verifica se há atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Nova versão do Service Worker encontrada:', newWorker);
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            MartFleetUtils.NotificationSystem.info(
                                'Nova versão disponível! Atualize a página.',
                                5000
                            );
                        }
                    });
                });
            })
            .catch(function(error) {
                console.log('Falha no registro do Service Worker:', error);
            });
    }
}

/**
 * Inicializa o menu mobile
 */
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
            
            // Anima o ícone do hamburger
            const icon = mobileMenuButton.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        });

        // Fecha o menu ao clicar fora
        document.addEventListener('click', function(event) {
            if (mobileMenu && !mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuButton.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Fecha o menu ao redimensionar para desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 1024 && mobileMenu) {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuButton.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
}

/**
 * Inicializa dropdowns
 */
function initializeDropdowns() {
    // Usando event delegation para dropdowns dinâmicos
    document.addEventListener('click', function(e) {
        const dropdownButton = e.target.closest('[data-dropdown-toggle]');
        if (dropdownButton) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdownId = dropdownButton.getAttribute('data-dropdown-toggle');
            const dropdown = document.getElementById(dropdownId);
            
            if (dropdown) {
                // Fecha outros dropdowns abertos
                document.querySelectorAll('[data-dropdown].open').forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('open');
                        otherDropdown.classList.add('hidden');
                    }
                });
                
                // Alterna dropdown atual
                dropdown.classList.toggle('hidden');
                dropdown.classList.toggle('open');
                
                // Anima ícone se existir
                const icon = dropdownButton.querySelector('.dropdown-icon');
                if (icon) {
                    icon.style.transform = dropdown.classList.contains('hidden') ? 
                        'rotate(0deg)' : 'rotate(180deg)';
                }
            }
        }
        
        // Fecha dropdowns ao clicar fora
        if (!e.target.closest('[data-dropdown]') && !e.target.closest('[data-dropdown-toggle]')) {
            document.querySelectorAll('[data-dropdown].open').forEach(dropdown => {
                dropdown.classList.remove('open');
                dropdown.classList.add('hidden');
                
                // Reseta ícones
                const icon = dropdown.previousElementSibling?.querySelector('.dropdown-icon');
                if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        }
    });
}

/**
 * Inicializa navegação SPA
 */
function initializeSPANavigation() {
    // Navegação por links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[data-spa]');
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');
            const page = link.getAttribute('data-page');
            
            if (href && page) {
                navigateToPage(page, href);
            }
        }
    });
    
    // Navegação por botões
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button[data-spa-page]');
        if (button) {
            const page = button.getAttribute('data-spa-page');
            const href = button.getAttribute('data-spa-href');
            
            if (page && href) {
                navigateToPage(page, href);
            }
        }
    });
}

/**
 * Navega para uma página (SPA)
 */
async function navigateToPage(pageName, pagePath) {
    if (window.MartFleetApp.isLoading) return;
    
    try {
        window.MartFleetApp.isLoading = true;
        window.MartFleetApp.currentPage = pageName;
        
        // Mostra estado de carregamento
        document.body.classList.add('spa-loading');
        
        // Carrega a página
        await loadPage(pagePath);
        
        // Atualiza componentes após navegação
        initializePageComponents();
        
        // Rola para o topo
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Erro na navegação:', error);
        MartFleetUtils.NotificationSystem.error('Erro ao carregar página');
    } finally {
        window.MartFleetApp.isLoading = false;
        document.body.classList.remove('spa-loading');
    }
}

/**
 * Inicializa componentes específicos da página
 */
function initializePageComponents() {
    // Reinicializa utilitários para novo conteúdo
    if (window.initMartFleetUtils) {
        window.initMartFleetUtils();
    }
    
    // Inicializa animações para elementos recém-carregados
    initializeAnimations();
    
    // Configura eventos específicos da página
    setupPageSpecificEvents();
}

/**
 * Configura eventos específicos da página atual
 */
function setupPageSpecificEvents() {
    const currentPage = window.MartFleetApp.currentPage;
    
    switch (currentPage) {
        case 'index':
            initializeHomeInteractions();
            break;
        case 'owner-dashboard':
            // Será inicializado quando carregarmos o dashboard
            break;
        case 'driver-dashboard':
            // Será inicializado quando carregarmos o dashboard
            break;
        // Adicione mais casos conforme necessário
    }
}

/**
 * Melhora a acessibilidade
 */
function improveAccessibility() {
    // Adiciona roles ARIA para elementos interativos
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.setAttribute('aria-haspopup', 'true');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-label', 'Menu principal');
        
        mobileMenuButton.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
        });
    }
    
    // Melhora o foco em formulários
    document.addEventListener('focusin', function(e) {
        if (e.target.matches('input, select, textarea')) {
            e.target.closest('.form-group')?.classList.add('focused');
        }
    });
    
    document.addEventListener('focusout', function(e) {
        if (e.target.matches('input, select, textarea')) {
            e.target.closest('.form-group')?.classList.remove('focused');
        }
    });
}

/**
 * Otimizações de performance
 */
function optimizePerformance() {
    // Lazy loading para imagens com Intersection Observer
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

/**
 * Inicializa animações globais
 */
function initializeAnimations() {
    // Inicializa contadores animados
    initCounters();
    
    // Inicializa animações de scroll
    initScrollAnimations();
    
    // Inicializa elementos interativos
    initInteractiveElements();
}

/**
 * Inicializa contadores animados
 */
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function startCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

/**
 * Inicializa animações de scroll
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .cta-content, .card-hover');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
}

/**
 * Inicializa elementos interativos
 */
function initInteractiveElements() {
    // Add hover effects aos cards
    const featureCards = document.querySelectorAll('.feature-card, .card-hover');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Inicializa interações específicas da página inicial
 */
function initializeHomeInteractions() {
    // Verifica se estamos na página inicial
    if (document.querySelector('.hero-section')) {
        // Add loading state aos botões CTA
        const ctaButtons = document.querySelectorAll('.btn-primary, .btn-hero');
        ctaButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (this.hasAttribute('data-spa')) {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Carregando...';
                    this.disabled = true;
                    
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.disabled = false;
                    }, 2000);
                }
            });
        });
    }
}

// ===== FUNÇÕES GLOBAIS =====
window.MartFleet = {
    /**
     * Mostra um loading state
     */
    showLoading: function(element) {
        element.classList.add('loading');
        element.disabled = true;
        const originalText = element.innerHTML;
        element.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Carregando...';
        element.dataset.originalText = originalText;
    },
    
    /**
     * Esconde um loading state
     */
    hideLoading: function(element) {
        element.classList.remove('loading');
        element.disabled = false;
        if (element.dataset.originalText) {
            element.innerHTML = element.dataset.originalText;
        }
    },
    
    /**
     * Faz logout do usuário
     */
    logout: async function() {
        try {
            await firebase.auth().signOut();
            MartFleetUtils.NotificationSystem.success('Logout realizado com sucesso');
            
            // Redireciona para home
            setTimeout(() => {
                navigateToPage('index', '/templates/index.html');
            }, 1000);
            
        } catch (error) {
            console.error('Erro no logout:', error);
            MartFleetUtils.NotificationSystem.error('Erro ao fazer logout');
        }
    },
    
    /**
     * Verifica permissões do usuário
     */
    hasPermission: function(requiredRole) {
        const userRole = window.MartFleetApp.userRole;
        
        if (requiredRole === 'any') return true;
        if (requiredRole === 'authenticated') return !!window.MartFleetApp.currentUser;
        
        return userRole === requiredRole;
    },
    
    /**
     * Navega para uma página com verificação de permissão
     */
    navigateWithAuthCheck: function(pageName, pagePath, requiredRole = 'any') {
        if (!this.hasPermission(requiredRole)) {
            MartFleetUtils.NotificationSystem.error('Você não tem permissão para acessar esta página');
            return;
        }
        
        navigateToPage(pageName, pagePath);
    },
    
    /**
     * Track eventos para analytics
     */
    trackEvent: function(category, action, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
        
        // Também log no Firestore se usuário estiver logado
        if (window.MartFleetApp.currentUser) {
            firebase.firestore().collection('analytics').add({
                category,
                action,
                label,
                userId: window.MartFleetApp.currentUser.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            }).catch(console.error);
        }
        
        console.log(`Event tracked: ${category} - ${action} - ${label}`);
    }
};

// Export para módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.MartFleet;
}