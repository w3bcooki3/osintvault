        // Create floating particles
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = window.innerWidth < 768 ? 15 : 30;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
                particle.style.width = particle.style.height = (Math.random() * 4 + 2) + 'px';
                particlesContainer.appendChild(particle);
            }
        }

        // Create connecting lines
        function createConnectingLines() {
            const linesContainer = document.getElementById('connecting-lines');
            const lineCount = window.innerWidth < 768 ? 3 : 6;
            
            for (let i = 0; i < lineCount; i++) {
                const line = document.createElement('div');
                line.className = 'connection-line';
                line.style.top = Math.random() * 100 + '%';
                line.style.left = Math.random() * 50 + '%';
                line.style.width = Math.random() * 200 + 100 + 'px';
                line.style.animationDelay = Math.random() * 4 + 's';
                line.style.animationDuration = (Math.random() * 2 + 3) + 's';
                linesContainer.appendChild(line);
            }
        }

        // Enhanced card hover effects
        document.querySelectorAll('.evidence-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.zIndex = '10';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.zIndex = '1';
            });
        });


        // Initialize animations
        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
            createConnectingLines();
            
            // Stagger card animations
            const cards = document.querySelectorAll('.evidence-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = (index * 0.1) + 's';
                card.style.animation = 'slideIn 0.8s ease forwards';
            });
        });

        // Add slide in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        // Resize handler for responsive particles
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                document.getElementById('particles').innerHTML = '';
                document.getElementById('connecting-lines').innerHTML = '';
                createParticles();
                createConnectingLines();
            }, 250);
        });