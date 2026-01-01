// ============================================
// Quantril AI Suite - Landing Page Scripts
// ============================================

// Navigation Toggle for Mobile
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    const icon = navToggle.querySelector('i');
    if (mobileMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when clicking a link
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navToggle.querySelector('i').classList.remove('fa-times');
        navToggle.querySelector('i').classList.add('fa-bars');
    });
});

// Navigate to Module
function navigateToModule(moduleName) {
    const moduleRoutes = {
        'mom-generator': './modules/mom-generator/index.html'
    };
    
    if (moduleRoutes[moduleName]) {
        window.location.href = moduleRoutes[moduleName];
    } else {
        showNotification('This module is coming soon!', 'info');
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe all solution cards and feature cards
document.querySelectorAll('.solution-card, .feature-card, .about-card').forEach(card => {
    card.classList.add('animate-target');
    observer.observe(card);
});

// Particle effect for hero section
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 10 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        particlesContainer.appendChild(particle);
    }
}

// Initialize particles
createParticles();

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'info' ? 'fa-info-circle' : type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #12121a;
        border: 1px solid #2a2a3a;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #ffffff;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make functions globally available
window.navigateToModule = navigateToModule;
