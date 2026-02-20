(function () {
    'use strict';

    var API_URL = 'http://127.0.0.1:5001/api';
    var ICONS = {
        eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
        eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
    };

    var CHAR_SETS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };

    document.addEventListener('DOMContentLoaded', function () {
        var passwordResult = document.getElementById('passwordResult');
        var lengthRange = document.getElementById('lengthRange');
        var lengthValue = document.getElementById('lengthValue');
        var useUppercase = document.getElementById('useUppercase');
        var useLowercase = document.getElementById('useLowercase');
        var useNumbers = document.getElementById('useNumbers');
        var useSymbols = document.getElementById('useSymbols');
        var generateBtn = document.getElementById('generateBtn');
        var copyBtn = document.getElementById('copyPassword');
        var toggleBtn = document.getElementById('toggleVisibility');
        var feedbackMsg = document.getElementById('feedbackMessage');
        var strengthBar = document.getElementById('strengthBar');
        var strengthText = document.getElementById('strengthText');

        var authModal = document.getElementById('authModal');
        var navLinks = document.getElementById('navLinks');
        var vaultView = document.getElementById('vaultView');
        var profileView = document.getElementById('profileView');
        var vaultList = document.getElementById('vaultList');
        var deleteModal = document.getElementById('deleteModal');
        var confirmDeleteBtn = document.getElementById('confirmDelete');
        var cancelDeleteBtn = document.getElementById('cancelDelete');
        var deleteId = null;

        var isPasswordVisible = false;
        var currentPassword = '';
        var user = JSON.parse(localStorage.getItem('user')) || null;
        var token = localStorage.getItem('token') || null;

        function getRandomValues(length) {
            if (window.crypto && window.crypto.getRandomValues) {
                var array = new Uint32Array(length);
                window.crypto.getRandomValues(array);
                return array;
            } else {
                throw new Error('Tu navegador no soporta generación segura.');
            }
        }

        function calculateStrength(password) {
            if (!password) return { label: '-', class: '', score: 0 };
            var score = 0;
            if (password.length >= 12) score++;
            if (password.length >= 16) score++;
            if (password.length >= 24) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/[a-z]/.test(password)) score++;
            if (/[0-9]/.test(password)) score++;
            if (/[^A-Za-z0-9]/.test(password)) score++;
            if (score <= 3) return { label: 'Débil', class: 'weak', score: score };
            if (score <= 5) return { label: 'Media', class: 'medium', score: score };
            if (score <= 6) return { label: 'Fuerte', class: 'strong', score: score };
            return { label: 'Muy Fuerte', class: 'very-strong', score: score };
        }

        function updateDisplay() {
            if (!passwordResult) return;
            var displayText = isPasswordVisible ? currentPassword : '*'.repeat(currentPassword.length);
            passwordResult.textContent = displayText;
        }

        function updateStrengthMeter(password) {
            var strength = calculateStrength(password);
            strengthBar.className = 'strength-bar ' + strength.class;
            strengthText.textContent = 'Fortaleza: ' + strength.label;
        }

        function generatePassword() {
            var charset = '';
            if (useUppercase.checked) charset += CHAR_SETS.uppercase;
            if (useLowercase.checked) charset += CHAR_SETS.lowercase;
            if (useNumbers.checked) charset += CHAR_SETS.numbers;
            if (useSymbols.checked) charset += CHAR_SETS.symbols;
            if (!charset) {
                showFeedback('Selecciona una opción', 'error');
                return;
            }
            var length = parseInt(lengthRange.value);
            var randomArray = getRandomValues(length);
            var password = '';
            for (var i = 0; i < length; i++) password += charset[randomArray[i] % charset.length];
            currentPassword = password;
            updateDisplay();
            updateStrengthMeter(currentPassword);

            // Mostrar opciones de guardado si hay sesión
            if (user) {
                document.getElementById('saveLabelGroup').classList.remove('hidden');
                document.getElementById('passwordLabel').value = '';
            }
        }

        function showFeedback(message, type) {
            feedbackMsg.textContent = message;
            feedbackMsg.style.color = type === 'error' ? 'var(--danger)' : 'var(--success)';
            feedbackMsg.classList.add('show');
            setTimeout(() => feedbackMsg.classList.remove('show'), 4000);
        }

        function updateNav() {
            if (user) {
                navLinks.innerHTML = `
                    <button id="vaultBtn" class="nav-btn">Bóveda</button>
                    <button id="profileBtn" class="nav-btn">Hola, ${user.firstName}</button>
                    <button id="logoutBtn" class="nav-btn">Salir</button>
                `;
                document.getElementById('logoutBtn').onclick = logout;
                document.getElementById('vaultBtn').onclick = () => {
                    vaultView.classList.remove('hidden');
                    fetchVault();
                };
                document.getElementById('profileBtn').onclick = openProfile;
            } else {
                navLinks.innerHTML = `
                    <button id="loginOpen" class="nav-btn">Entrar</button>
                    <button id="registerOpen" class="nav-btn accent">Registrarse</button>
                `;
                document.getElementById('loginOpen').onclick = () => openAuthModal('login');
                document.getElementById('registerOpen').onclick = () => openAuthModal('register');
                document.getElementById('saveLabelGroup').classList.add('hidden');
            }
        }

        function logout() {
            localStorage.clear();
            user = null; token = null;
            updateNav();
            vaultView.classList.add('hidden');
            showFeedback('Sesión cerrada');
        }

        function openAuthModal(mode) {
            authModal.classList.add('show');
            document.getElementById('loginFormContainer').classList.toggle('hidden', mode !== 'login');
            document.getElementById('registerFormContainer').classList.toggle('hidden', mode === 'login');
        }

        function openProfile() {
            profileView.classList.remove('hidden');
            document.getElementById('profFirstName').value = user.firstName;
            document.getElementById('profLastName').value = user.lastName;
            document.getElementById('profEmail').value = user.email;
            if (user.profileImage) {
                document.getElementById('profileImg').src = `${API_URL.replace('/api', '')}${user.profileImage}`;
            }
        }

        // --- Registro e Inicio de Sesión ---

        document.getElementById('loginForm').onsubmit = async function (e) {
            e.preventDefault();
            var email = document.getElementById('loginEmail').value;
            var password = document.getElementById('loginPassword').value;
            try {
                var response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                var data = await response.json();
                if (response.ok) {
                    user = data.user; token = data.token;
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', token);
                    authModal.classList.remove('show');
                    updateNav();
                    showFeedback('¡Bienvenido!');
                } else showFeedback(data.msg, 'error');
            } catch (err) { showFeedback('Error de conexión', 'error'); }
        };

        document.getElementById('registerForm').onsubmit = async function (e) {
            e.preventDefault();
            var firstName = document.getElementById('regFirstName').value;
            var lastName = document.getElementById('regLastName').value;
            var email = document.getElementById('regEmail').value;
            var password = document.getElementById('regPassword').value;

            try {
                var response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, password })
                });

                var data = await response.json();
                if (response.ok) {
                    user = data.user; token = data.token;
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', token);
                    authModal.classList.remove('show');
                    updateNav();
                    showFeedback('Registro exitoso');
                } else {
                    console.error('Error del servidor:', data);
                    showFeedback(data.msg + (data.error ? ': ' + data.error : ''), 'error');
                }
            } catch (err) {
                console.error('Error de red o procesamiento:', err);
                showFeedback('Error de conexión', 'error');
            }
        };

        document.getElementById('profileForm').onsubmit = async function (e) {
            e.preventDefault();
            var formData = new FormData();
            formData.append('firstName', document.getElementById('profFirstName').value);
            formData.append('lastName', document.getElementById('profLastName').value);

            var avatarFile = document.getElementById('avatarInput').files[0];
            if (avatarFile) formData.append('avatar', avatarFile);

            try {
                var response = await fetch(`${API_URL}/auth/update`, {
                    method: 'PUT',
                    headers: { 'x-auth-token': token },
                    body: formData
                });
                var data = await response.json();
                if (response.ok) {
                    user = data;
                    localStorage.setItem('user', JSON.stringify(user));
                    updateNav();
                    showFeedback('Perfil actualizado');
                } else showFeedback(data.msg, 'error');
            } catch (err) {
                showFeedback('Error de conexión', 'error');
            }
        };

        // Previsualizar avatar
        document.getElementById('avatarInput').onchange = function (e) {
            var file = e.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    document.getElementById('profileImg').src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        };

        // --- Gestión de Bóveda ---

        async function saveToVault() {
            var label = document.getElementById('passwordLabel').value || 'Sin etiqueta';
            var strength = calculateStrength(currentPassword).label;

            try {
                var response = await fetch(`${API_URL}/passwords`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({
                        value: currentPassword,
                        label: label,
                        strength: strength
                    })
                });

                if (response.ok) {
                    showFeedback('Guardado en la bóveda');
                    document.getElementById('saveLabelGroup').classList.add('hidden');
                    document.getElementById('passwordLabel').value = '';
                } else {
                    var data = await response.json();
                    showFeedback(data.msg || 'Error al guardar', 'error');
                }
            } catch (err) {
                showFeedback('Error de conexión', 'error');
            }
        }

        async function fetchVault() {
            vaultList.innerHTML = '<p class="empty-msg">Cargando...</p>';
            try {
                var response = await fetch(`${API_URL}/passwords`, {
                    headers: { 'x-auth-token': token }
                });
                var data = await response.json();
                if (response.ok) {
                    renderVault(data);
                }
            } catch (err) {
                vaultList.innerHTML = '<p class="empty-msg">Error al cargar</p>';
            }
        }

        function renderVault(passwords) {
            if (passwords.length === 0) {
                vaultList.innerHTML = '<p class="empty-msg">No tienes contraseñas guardadas.</p>';
                return;
            }
            vaultList.innerHTML = passwords.map(p => `
                <div class="password-card">
                    <div class="card-header">
                        <span class="card-label">${p.label}</span>
                        <span class="strength-text" style="color: var(--accent)">${p.strength}</span>
                    </div>
                    <div class="card-pass">
                        <span>${p.value}</span>
                        <button class="delete-btn" data-id="${p._id}">Eliminar</button>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.onclick = () => deletePassword(btn.dataset.id);
            });
        }

        async function deletePassword(id) {
            deleteId = id;
            deleteModal.classList.add('show');
        }

        async function processDelete() {
            if (!deleteId) return;
            try {
                var response = await fetch(`${API_URL}/passwords/${deleteId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (response.ok) {
                    showFeedback('Eliminado');
                    deleteModal.classList.remove('show');
                    fetchVault();
                }
            } catch (err) {
                showFeedback('Error al eliminar', 'error');
            }
        }

        // Eventos básicos
        document.querySelector('.close-modal').onclick = () => authModal.classList.remove('show');
        document.getElementById('closeVault').onclick = () => vaultView.classList.add('hidden');
        document.getElementById('closeProfile').onclick = () => profileView.classList.add('hidden');
        document.getElementById('syncVault').onclick = fetchVault;

        document.getElementById('confirmSave').onclick = saveToVault;

        confirmDeleteBtn.onclick = processDelete;
        cancelDeleteBtn.onclick = () => deleteModal.classList.remove('show');

        toggleBtn.onclick = (e) => {
            e.preventDefault();
            isPasswordVisible = !isPasswordVisible;
            updateDisplay();
            toggleBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="${isPasswordVisible ? 'icon-eye-off' : 'icon-eye'}">
                    ${isPasswordVisible ? ICONS.eyeOff : ICONS.eye}
                </svg>
            `;
        };

        copyBtn.onclick = (e) => {
            e.preventDefault();
            if (!currentPassword) {
                showFeedback('Genera una contraseña primero', 'error');
                return;
            }
            navigator.clipboard.writeText(currentPassword).then(() => {
                showFeedback('Copiado al portapapeles');
            }).catch(err => {
                console.error('Error al copiar:', err);
                showFeedback('Error al copiar', 'error');
            });
        };

        generateBtn.onclick = (e) => { e.preventDefault(); generatePassword(); };
        lengthRange.oninput = (e) => { lengthValue.textContent = e.target.value; generatePassword(); };

        updateNav();
        generatePassword();
    });
})();