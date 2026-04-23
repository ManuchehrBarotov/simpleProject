
const header = document.querySelector('.header');
const hamburger = document.createElement('button');
const mobileMenu = document.createElement('div');
const navList = document.querySelector('.nav__list');
const mobileClose = document.createElement('button');

hamburger.className = 'hamburger';
hamburger.innerHTML = `<span class="hamburger__line"></span>
    <span class="hamburger__line"></span>
    <span class="hamburger__line"></span>
`;

// Создаем мобильное меню
mobileMenu.className = 'mobile-menu';
mobileMenu.innerHTML = `
    <div class="mobile-nav">
        <ul class="mobile-nav__list">
            ${Array.from(navList.children).map(li => `
                <li class="mobile-nav__item">
                    <a href="${li.querySelector('a').href}" class="mobile-nav__link">
                        ${li.querySelector('a').textContent}
                    </a>
                </li>
            `).join('')}
        </ul>
    </div>
`;

mobileClose.className = 'mobile-close';
mobileClose.innerHTML = '<i class="fas fa-times"></i>';

document.querySelector('.nav').appendChild(hamburger);
document.body.appendChild(mobileMenu);
mobileMenu.appendChild(mobileClose);

// Функции
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
}

function updateActiveLink() {
    const currentHash = window.location.hash || '#home';
    
    // Обновляем активные ссылки в основном меню
    document.querySelectorAll('.nav__list a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentHash);
    });
    
    // Обновляем активные ссылки в мобильном меню
    document.querySelectorAll('.mobile-nav__link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentHash);
    });
}


window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Обработчики событий
hamburger.addEventListener('click', toggleMobileMenu);
mobileClose.addEventListener('click', closeMobileMenu);

// Закрытие мобильного меню при клике на ссылку
document.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Обновление активной ссылки при загрузке и хэш-изменении
window.addEventListener('load', updateActiveLink);
window.addEventListener('hashchange', updateActiveLink);

// Закрытие мобильного меню при клике вне его
document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('active') && 
        !mobileMenu.contains(e.target) && 
        !hamburger.contains(e.target)) {
        closeMobileMenu();
    }
});

// Закрытие по ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
    }
});


// Анимированные счетчики
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000; // 2 секунды
        const step = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + '+';
                counter.classList.add('animated');
            }
        };
        
        // Запуск при попадании в область видимости
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', animateCounters);


// Обработка формы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('consultation-form');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeModal = document.getElementById('closeModal');
    const scrollTopBtn = document.getElementById('scrollTop');
    const openMapBtn = document.getElementById('openMap');

    // Отправка формы
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Валидация
            if (!validateForm()) {
                return;
            }
            
            // Имитация отправки
            const formData = new FormData(form);
            console.log('Форма отправлена:', Object.fromEntries(formData));
            
            // Показ модального окна
            successModal.classList.add('active');
            form.reset();
            
            // Анимация отправки
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // Валидация формы
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            field.classList.remove('error');
            
            if (!field.value.trim()) {
                field.classList.add('error');
                showError(field, 'Это поле обязательно для заполнения');
                isValid = false;
            } else if (field.type === 'email' && field.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    field.classList.add('error');
                    showError(field, 'Введите корректный email');
                    isValid = false;
                }
            } else if (field.type === 'tel' && field.value) {
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (!phoneRegex.test(field.value)) {
                    field.classList.add('error');
                    showError(field, 'Введите корректный номер телефона');
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }

    // Показать ошибку
    function showError(field, message) {
        let errorElement = field.parentElement.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentElement.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.color = '#dc2626';
        errorElement.style.fontSize = '0.85rem';
        errorElement.style.marginTop = '5px';
    }

    // Закрытие модального окна
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            successModal.classList.remove('active');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            successModal.classList.remove('active');
        });
    }

    // Закрытие модального окна при клике вне его
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });

    // Кнопка "Наверх"
    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Открытие карты
    if (openMapBtn) {
        openMapBtn.addEventListener('click', function() {
            const mapUrl = 'https://www.google.com/maps?q=Москва,+ул.+Тверская,+д.+10';
            window.open(mapUrl, '_blank');
        });
    }

    // Маска для телефона
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length === 0) {
                e.target.value = '';
                return;
            }
            
            if (value.length <= 1) {
                e.target.value = '+7 (' + value;
            } else if (value.length <= 4) {
                e.target.value = '+7 (' + value.slice(1, 4);
            } else if (value.length <= 7) {
                e.target.value = '+7 (' + value.slice(1, 4) + ') ' + value.slice(4, 7);
            } else if (value.length <= 9) {
                e.target.value = '+7 (' + value.slice(1, 4) + ') ' + value.slice(4, 7) + '-' + value.slice(7, 9);
            } else {
                e.target.value = '+7 (' + value.slice(1, 4) + ') ' + value.slice(4, 7) + '-' + value.slice(7, 9) + '-' + value.slice(9, 11);
            }
        });
    }

    // Стили для ошибок
    const style = document.createElement('style');
    style.textContent = `
        .error {
            border-color: #dc2626 !important;
            background: #fef2f2;
        }
        
        .error:focus {
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
        }
        
        .error-message {
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});

// Инициализация карты (заглушка)
function initMap() {
    console.log('Карта инициализирована');
    // Здесь будет интеграция с Google Maps или Яндекс.Картами
    // Например: new google.maps.Map(document.querySelector('.map-container'), {...});
}