/**
 * MARTFLEET - Utilitários JavaScript para Firebase
 * Funções auxiliares, validações, formatações e helpers adaptados para Firebase
 */

// ===== FIREBASE HELPERS =====
const FirebaseHelpers = {
    /**
     * Converte documento Firestore para objeto
     */
    firestoreToObject: function(doc) {
        if (!doc.exists) return null;
        return {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || null,
            updatedAt: doc.data().updatedAt?.toDate?.() || null
        };
    },

    /**
     * Converte coleção Firestore para array
     */
    firestoreToArray: function(snapshot) {
        return snapshot.docs.map(doc => this.firestoreToObject(doc));
    },

    /**
     * Prepara dados para Firestore (remove undefined e converte dates)
     */
    prepareForFirestore: function(data) {
        const prepared = { ...data };
        
        // Remove campos undefined
        Object.keys(prepared).forEach(key => {
            if (prepared[key] === undefined) {
                delete prepared[key];
            }
        });

        // Adiciona timestamps se não existirem
        if (!prepared.createdAt) {
            prepared.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        }
        prepared.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

        return prepared;
    },

    /**
     * Upload de arquivo para Firebase Storage
     */
    uploadFile: async function(file, path, onProgress = null) {
        try {
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`${path}/${Date.now()}_${file.name}`);
            const uploadTask = fileRef.put(file);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        if (onProgress) {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            onProgress(progress);
                        }
                    },
                    (error) => {
                        reject(error);
                    },
                    async () => {
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        resolve({
                            url: downloadURL,
                            path: uploadTask.snapshot.ref.fullPath,
                            name: file.name,
                            size: file.size,
                            type: file.type
                        });
                    }
                );
            });
        } catch (error) {
            throw new Error(`Erro no upload: ${error.message}`);
        }
    },

    /**
     * Deleta arquivo do Firebase Storage
     */
    deleteFile: async function(filePath) {
        try {
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(filePath);
            await fileRef.delete();
            return true;
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            return false;
        }
    },

    /**
     * Gerencia estado de autenticação
     */
    getAuthState: function() {
        return new Promise((resolve) => {
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            });
        });
    },

    /**
     * Verifica se usuário é owner
     */
    isOwner: async function(userId) {
        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(userId)
                .get();
            
            return userDoc.exists && userDoc.data().role === 'owner';
        } catch (error) {
            console.error('Erro ao verificar role:', error);
            return false;
        }
    },

    /**
     * Verifica se usuário é driver
     */
    isDriver: async function(userId) {
        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(userId)
                .get();
            
            return userDoc.exists && userDoc.data().role === 'driver';
        } catch (error) {
            console.error('Erro ao verificar role:', error);
            return false;
        }
    }
};

// ===== NOTIFICAÇÕES FIREBASE =====
const NotificationSystem = {
    /**
     * Mostra notificação
     */
    show: function(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notifications-container') || this.createContainer();
        
        const notification = document.createElement('div');
        notification.className = `flash-message animate-fade-in-up`;
        notification.innerHTML = `
            <div class="flash-content flash-${type}">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                        <div class="flash-icon">
                            <i class="fas ${this.getIcon(type)}"></i>
                        </div>
                        <div class="flash-text">${message}</div>
                    </div>
                    <button class="flash-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="flash-progress">
                    <div class="flash-progress-bar"></div>
                </div>
            </div>
        `;

        container.appendChild(notification);

        // Auto-remove após duração
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }

        return notification;
    },

    /**
     * Cria container de notificações se não existir
     */
    createContainer: function() {
        const container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'flash-messages-container';
        document.body.appendChild(container);
        return container;
    },

    /**
     * Retorna ícone baseado no tipo
     */
    getIcon: function(type) {
        const icons = {
            success: 'fa-check',
            error: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    },

    /**
     * Mostra erro
     */
    error: function(message, duration = 5000) {
        return this.show(message, 'error', duration);
    },

    /**
     * Mostra sucesso
     */
    success: function(message, duration = 3000) {
        return this.show(message, 'success', duration);
    },

    /**
     * Mostra aviso
     */
    warning: function(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    },

    /**
     * Mostra informação
     */
    info: function(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
};

// ===== VALIDAÇÕES =====
const Validators = {
    /**
     * Valida email
     */
    email: function(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Valida telefone (formato Moçambicano)
     */
    phone: function(phone) {
        const regex = /^(\+258|258)?\s?8[2-7][0-9]{7}$/;
        return regex.test(phone.replace(/\s/g, ''));
    },

    /**
     * Valida BI (Bilhete de Identidade)
     */
    biNumber: function(bi) {
        const regex = /^[0-9]{9}[A-Z]{2}[0-9]{3}$/;
        return regex.test(bi.toUpperCase());
    },

    /**
     * Valida matrícula de veículo
     */
    licensePlate: function(plate) {
        const regex = /^[A-Z]{2}-[0-9]{2}-[0-9]{2}$|^[A-Z]{3}-[0-9]{3}$/;
        return regex.test(plate.toUpperCase());
    },

    /**
     * Valida valor monetário
     */
    currency: function(amount) {
        const regex = /^[0-9]+(\.[0-9]{1,2})?$/;
        return regex.test(amount) && parseFloat(amount) > 0;
    },

    /**
     * Valida se é número
     */
    number: function(value) {
        return !isNaN(value) && !isNaN(parseFloat(value));
    },

    /**
     * Valida se está vazio
     */
    required: function(value) {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return value !== null && value !== undefined;
    },

    /**
     * Valida comprimento mínimo
     */
    minLength: function(value, min) {
        return value.length >= min;
    },

    /**
     * Valida comprimento máximo
     */
    maxLength: function(value, max) {
        return value.length <= max;
    }
};

// ===== FORMATAÇÕES =====
const Formatters = {
    /**
     * Formata número de telefone
     */
    phone: function(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 9 && cleaned.startsWith('8')) {
            return `+258 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
        }
        return phone;
    },

    /**
     * Formata valor monetário
     */
    currency: function(amount, currency = 'MZN') {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Formata número
     */
    number: function(number, decimals = 0) {
        return new Intl.NumberFormat('pt-MZ', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    },

    /**
     * Formata data
     */
    date: function(dateString, options = {}) {
        if (!dateString) return '-';
        
        const date = dateString?.toDate ? dateString.toDate() : new Date(dateString);
        const defaultOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        return date.toLocaleDateString('pt-MZ', mergedOptions);
    },

    /**
     * Formata data e hora
     */
    datetime: function(dateString) {
        if (!dateString) return '-';
        
        const date = dateString?.toDate ? dateString.toDate() : new Date(dateString);
        return date.toLocaleString('pt-MZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Formata matrícula
     */
    licensePlate: function(plate) {
        return plate.toUpperCase().replace(/([A-Z]{2})([0-9]{2})([0-9]{2})/, '$1-$2-$3');
    },

    /**
     * Formata nome próprio (capitaliza)
     */
    capitalizeName: function(name) {
        return name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
};

// ===== HELPERS DE TEMPO =====
const TimeHelpers = {
    /**
     * Calcula diferença entre datas
     */
    timeDifference: function(from, to) {
        const fromDate = from?.toDate ? from.toDate() : new Date(from);
        const toDate = to?.toDate ? to.toDate() : new Date(to);
        
        const diff = toDate - fromDate;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return { days, hours, minutes, totalMinutes: Math.floor(diff / (1000 * 60)) };
    },

    /**
     * Formata duração
     */
    formatDuration: function(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    },

    /**
     * Adiciona dias a uma data
     */
    addDays: function(date, days) {
        const result = date?.toDate ? date.toDate() : new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    /**
     * Verifica se é hoje
     */
    isToday: function(date) {
        const dateObj = date?.toDate ? date.toDate() : new Date(date);
        const today = new Date();
        return today.toDateString() === dateObj.toDateString();
    },

    /**
     * Verifica se é no futuro
     */
    isFuture: function(date) {
        const dateObj = date?.toDate ? date.toDate() : new Date(date);
        return dateObj > new Date();
    }
};

// ===== MANIPULAÇÃO DE ARQUIVOS =====
const FileHelpers = {
    /**
     * Valida tipo de arquivo
     */
    validateFileType: function(file, allowedTypes) {
        return allowedTypes.includes(file.type);
    },

    /**
     * Valida tamanho do arquivo
     */
    validateFileSize: function(file, maxSizeMB) {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    },

    /**
     * Converte bytes para formato legível
     */
    formatBytes: function(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
};

// ===== HELPERS DE DOM =====
const DOMHelpers = {
    /**
     * Mostra elemento com fade in
     */
    show: function(element) {
        element.classList.remove('hidden');
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    },

    /**
     * Esconde elemento com fade out
     */
    hide: function(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            element.classList.add('hidden');
            element.style.transition = '';
            element.style.opacity = '';
            element.style.transform = '';
        }, 300);
    },

    /**
     * Toggle elemento com animação
     */
    toggle: function(element) {
        if (element.classList.contains('hidden')) {
            this.show(element);
        } else {
            this.hide(element);
        }
    },

    /**
     * Deleta elemento com animação
     */
    remove: function(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            element.remove();
        }, 300);
    },

    /**
     * Adiciona classe temporariamente
     */
    addTempClass: function(element, className, duration = 1000) {
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }
};

// ===== UTILITÁRIOS DE PERFORMANCE =====
const Performance = {
    /**
     * Debounce function
     */
    debounce: function(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Throttle function
     */
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ===== EXPORTAÇÃO DOS MÓDULOS =====
window.MartFleetUtils = {
    FirebaseHelpers,
    NotificationSystem,
    Validators,
    Formatters,
    TimeHelpers,
    FileHelpers,
    DOMHelpers,
    Performance
};

// ===== INICIALIZAÇÃO PARA SPA =====
/**
 * Inicializa utilitários para conteúdo dinâmico
 */
window.initMartFleetUtils = function() {
    initInputMasks();
    initTooltips();
};

/**
 * Inicializa máscaras de input
 */
function initInputMasks() {
    // Máscara para telefone
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('258')) {
                value = value.substring(3);
            }
            if (value.length > 0) {
                value = value.substring(0, 9);
                if (value.length > 3) {
                    value = value.substring(0, 3) + ' ' + value.substring(3);
                }
                if (value.length > 7) {
                    value = value.substring(0, 7) + ' ' + value.substring(7);
                }
            }
            e.target.value = value;
        });
    });

    // Máscara para matrícula
    const plateInputs = document.querySelectorAll('input[data-mask="license-plate"]');
    plateInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (value.length > 6) value = value.substring(0, 6);
            
            if (value.length > 2) {
                value = value.substring(0, 2) + '-' + value.substring(2);
            }
            if (value.length > 5) {
                value = value.substring(0, 5) + '-' + value.substring(5);
            }
            
            e.target.value = value;
        });
    });
}

/**
 * Inicializa tooltips
 */
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltipText = e.target.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'fixed z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg';
    tooltip.textContent = tooltipText;
    tooltip.id = 'current-tooltip';
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('current-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMartFleetUtils);
} else {
    initMartFleetUtils();
}