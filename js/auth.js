document.addEventListener("DOMContentLoaded", () => {
    const USERS_KEY = "pixelvault_users";
    const SESSION_KEY = "pixelvault_session";
    const REMEMBER_KEY = "pixelvault_remembered";

    const getUsers = () => {
        try {
            const users = JSON.parse(localStorage.getItem(USERS_KEY));
            return Array.isArray(users) ? users : [];
        } catch {
            return [];
        }
    };

    const saveUsers = users => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    };

    const showStatus = (element, type, message) => {
        if (!element) return;
        element.className = `auth-message show ${type}`;
        element.textContent = message;
    };

    const clearStatus = element => {
        if (!element) return;
        element.className = "auth-message";
        element.textContent = "";
    };

    const fieldState = (input, error, message = "") => {
        if (!input) return;

        const field = input.closest(".auth-field");
        if (field) {
            field.classList.toggle("has-error", Boolean(message));
            field.classList.toggle("is-valid", !message && Boolean(input.value));
        }

        if (error) {
            error.textContent = message;
        }
    };

    const clearField = (input, error) => {
        if (!input) return;

        const field = input.closest(".auth-field");
        if (field) {
            field.classList.remove("has-error", "is-valid");
        }

        if (error) {
            error.textContent = "";
        }
    };

    // =========================================================
    // MOSTRAR / OCULTAR CONTRASEÑA
    // =========================================================

    window.togglePixelVaultPassword = function (button) {
        if (!button) return;

        const targetId = button.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (!input) return;

        const icon = button.querySelector("i");
        const show = input.type === "password";

        input.type = show ? "text" : "password";

        if (icon) {
            icon.classList.toggle("fa-eye", !show);
            icon.classList.toggle("fa-eye-slash", show);
        }

        button.setAttribute(
            "aria-label",
            show ? "Ocultar contraseña" : "Mostrar contraseña"
        );

        button.setAttribute(
            "title",
            show ? "Ocultar contraseña" : "Mostrar contraseña"
        );
    };

    // Soporte adicional para botones que no tengan onclick.
    document.addEventListener("click", event => {
        const button = event.target.closest(
            ".auth-password-toggle[data-target]"
        );

        if (!button || button.hasAttribute("onclick")) return;

        window.togglePixelVaultPassword(button);
    });

    // =========================================================
    // LOGIN
    // =========================================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        const usuario = document.getElementById("loginUsuario");
        const clave = document.getElementById("loginClave");
        const usuarioError = document.getElementById("loginUsuarioError");
        const claveError = document.getElementById("loginClaveError");
        const status = document.getElementById("loginMessage");
        const recordarme = document.getElementById("recordarme");

        const params = new URLSearchParams(window.location.search);

        // Si viene desde un registro exitoso.
        if (params.get("registro") === "ok") {
            showStatus(
                status,
                "success",
                "¡Registro completado con éxito! Ya puedes iniciar sesión."
            );
        }

        // Recuperar usuario recordado.
        const rememberedUser = localStorage.getItem(REMEMBER_KEY);
        if (rememberedUser && usuario) {
            usuario.value = rememberedUser;
            if (recordarme) recordarme.checked = true;
        }

        loginForm.addEventListener("submit", event => {
            event.preventDefault();

            clearStatus(status);
            clearField(usuario, usuarioError);
            clearField(clave, claveError);

            let valid = true;
            const loginValue = usuario?.value.trim() || "";
            const passwordValue = clave?.value || "";

            // Usuario / correo.
            if (!loginValue) {
                fieldState(
                    usuario,
                    usuarioError,
                    "Ingresa tu nombre de usuario o correo electrónico."
                );
                valid = false;
            } else if (loginValue.includes("@")) {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(loginValue)) {
                    fieldState(
                        usuario,
                        usuarioError,
                        "Ingresa un correo electrónico válido."
                    );
                    valid = false;
                }
            } else if (!/^[A-Za-z0-9_]{4,30}$/.test(loginValue)) {
                fieldState(
                    usuario,
                    usuarioError,
                    "El usuario debe tener entre 4 y 30 caracteres y usar solo letras, números o _."
                );
                valid = false;
            }

            // Clave.
            if (!passwordValue) {
                fieldState(
                    clave,
                    claveError,
                    "Ingresa tu clave de ingreso."
                );
                valid = false;
            } else if (passwordValue.length < 6) {
                fieldState(
                    clave,
                    claveError,
                    "La clave debe tener al menos 6 caracteres."
                );
                valid = false;
            }

            if (!valid) {
                showStatus(
                    status,
                    "error",
                    "Revisa los campos marcados y corrige los errores."
                );
                return;
            }

            const normalizedLogin = loginValue.toLowerCase();

            const foundUser = getUsers().find(user => {
                const userName = String(user.usuario || "").toLowerCase();
                const email = String(user.correo || "").toLowerCase();

                return (
                    (userName === normalizedLogin ||
                        email === normalizedLogin) &&
                    String(user.clave || "") === passwordValue
                );
            });

            if (!foundUser) {
                fieldState(
                    usuario,
                    usuarioError,
                    "El usuario/correo o la clave no son correctos."
                );

                showStatus(
                    status,
                    "error",
                    "No fue posible iniciar sesión. Revisa tus datos."
                );
                return;
            }

            const session = {
                usuario: foundUser.usuario,
                nombre: foundUser.nombre,
                correo: foundUser.correo
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify(session));

            if (recordarme?.checked) {
                localStorage.setItem(
                    REMEMBER_KEY,
                    foundUser.usuario
                );
            } else {
                localStorage.removeItem(REMEMBER_KEY);
            }

            showStatus(
                status,
                "success",
                `¡Inicio de sesión completado con éxito! Bienvenido, ${foundUser.nombre}.`
            );

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        });

        // Quitar el error del campo al modificarlo.
        [usuario, clave].forEach(input => {
            input?.addEventListener("input", () => {
                const error =
                    input === usuario
                        ? usuarioError
                        : claveError;

                clearField(input, error);
                clearStatus(status);
            });
        });

        document.getElementById("forgotPassword")
            ?.addEventListener("click", event => {
                event.preventDefault();

                showStatus(
                    status,
                    "error",
                    "La recuperación de contraseña todavía no está disponible."
                );
            });
    }

    // =========================================================
    // REGISTRO
    // =========================================================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        const fields = {
            nombre: document.getElementById("nombre"),
            usuario: document.getElementById("usuario"),
            correo: document.getElementById("correo"),
            clave: document.getElementById("clave"),
            confirmarClave: document.getElementById("confirmarClave"),
            fechaNacimiento: document.getElementById("fechaNacimiento"),
            direccion: document.getElementById("direccion")
        };

        const errors = {};

        Object.keys(fields).forEach(key => {
            errors[key] = document.getElementById(`${key}Error`);
        });

        const terms = document.getElementById("terminos");
        const termsError = document.getElementById("terminosError");
        const status = document.getElementById("registerMessage");

        // ---------------------------------------------------------
        // EDAD MÍNIMA: 13 AÑOS
        // ---------------------------------------------------------

        const getToday = () => {
            const now = new Date();

            return new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );
        };

        const getMinimumAgeDate = age => {
            const today = getToday();

            return new Date(
                today.getFullYear() - age,
                today.getMonth(),
                today.getDate()
            );
        };

        const formatDate = date => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        if (fields.fechaNacimiento) {
            // La fecha máxima permitida corresponde a tener 13 años.
            fields.fechaNacimiento.max =
                formatDate(getMinimumAgeDate(13));
        }

        // ---------------------------------------------------------
        // VALIDACIÓN DEL FORMULARIO
        // ---------------------------------------------------------

        registerForm.addEventListener("submit", event => {
            event.preventDefault();

            clearStatus(status);

            Object.keys(fields).forEach(key => {
                clearField(fields[key], errors[key]);
            });

            if (termsError) {
                termsError.textContent = "";
            }

            let valid = true;

            // NOMBRE COMPLETO - OBLIGATORIO
            const nombre = fields.nombre?.value.trim() || "";

            if (!nombre) {
                fieldState(
                    fields.nombre,
                    errors.nombre,
                    "El nombre completo es obligatorio."
                );
                valid = false;
            } else if (
                !/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{3,80}$/.test(nombre)
            ) {
                fieldState(
                    fields.nombre,
                    errors.nombre,
                    "El nombre solo puede contener letras y espacios."
                );
                valid = false;
            }

            // USUARIO - OBLIGATORIO
            const usuario = fields.usuario?.value.trim() || "";

            if (!usuario) {
                fieldState(
                    fields.usuario,
                    errors.usuario,
                    "El nombre de usuario es obligatorio."
                );
                valid = false;
            } else if (!/^[A-Za-z0-9_]{4,30}$/.test(usuario)) {
                fieldState(
                    fields.usuario,
                    errors.usuario,
                    "Usa entre 4 y 30 caracteres: letras, números o _."
                );
                valid = false;
            }

            // CORREO - OBLIGATORIO
            const correo =
                fields.correo?.value.trim().toLowerCase() || "";

            if (!correo) {
                fieldState(
                    fields.correo,
                    errors.correo,
                    "El correo electrónico es obligatorio."
                );
                valid = false;
            } else if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)
            ) {
                fieldState(
                    fields.correo,
                    errors.correo,
                    "Ingresa un correo electrónico válido."
                );
                valid = false;
            }

            // CLAVE - OBLIGATORIA
            const clave = fields.clave?.value || "";

            if (!clave) {
                fieldState(
                    fields.clave,
                    errors.clave,
                    "La clave de ingreso es obligatoria."
                );
                valid = false;
            } else if (clave.length < 6) {
                fieldState(
                    fields.clave,
                    errors.clave,
                    "La clave debe tener al menos 6 caracteres."
                );
                valid = false;
            }

            // REPETIR CLAVE - OBLIGATORIA
            const confirmarClave =
                fields.confirmarClave?.value || "";

            if (!confirmarClave) {
                fieldState(
                    fields.confirmarClave,
                    errors.confirmarClave,
                    "Debes repetir la clave."
                );
                valid = false;
            } else if (confirmarClave !== clave) {
                fieldState(
                    fields.confirmarClave,
                    errors.confirmarClave,
                    "Las claves no coinciden."
                );
                valid = false;
            }

            // FECHA DE NACIMIENTO - OBLIGATORIA + 13 AÑOS
            const fecha =
                fields.fechaNacimiento?.value || "";

            const today = getToday();
            const fechaMinimaEdad = getMinimumAgeDate(13);

            if (!fecha) {
                fieldState(
                    fields.fechaNacimiento,
                    errors.fechaNacimiento,
                    "La fecha de nacimiento es obligatoria."
                );
                valid = false;
            } else {
                const nacimiento =
                    new Date(`${fecha}T00:00:00`);

                if (Number.isNaN(nacimiento.getTime())) {
                    fieldState(
                        fields.fechaNacimiento,
                        errors.fechaNacimiento,
                        "Ingresa una fecha de nacimiento válida."
                    );
                    valid = false;
                } else if (nacimiento > today) {
                    fieldState(
                        fields.fechaNacimiento,
                        errors.fechaNacimiento,
                        "La fecha de nacimiento no puede ser futura."
                    );
                    valid = false;
                } else if (nacimiento > fechaMinimaEdad) {
                    fieldState(
                        fields.fechaNacimiento,
                        errors.fechaNacimiento,
                        "Debes tener al menos 13 años para crear una cuenta."
                    );
                    valid = false;
                }
            }

            // DIRECCIÓN - OPCIONAL SEGÚN RÚBRICA
            const direccion =
                fields.direccion?.value.trim() || "";

            if (direccion && direccion.length < 8) {
                fieldState(
                    fields.direccion,
                    errors.direccion,
                    "Si ingresas una dirección, debe tener al menos 8 caracteres."
                );
                valid = false;
            } else if (direccion) {
                fieldState(fields.direccion, errors.direccion);
            }

            // TÉRMINOS
            if (!terms?.checked) {
                if (termsError) {
                    termsError.textContent =
                        "Debes aceptar los términos y condiciones.";
                }

                valid = false;
            }

            if (!valid) {
                showStatus(
                    status,
                    "error",
                    "Hay errores en el formulario. Revisa los campos indicados."
                );

                // Llevar al primer campo con error.
                const firstError =
                    registerForm.querySelector(".has-error input, .has-error select");

                if (firstError) {
                    firstError.focus();
                }

                return;
            }

            // ---------------------------------------------------------
            // COMPROBAR DUPLICADOS
            // ---------------------------------------------------------

            const users = getUsers();

            const usuarioExiste = users.some(
                user =>
                    String(user.usuario || "").toLowerCase() ===
                    usuario.toLowerCase()
            );

            const correoExiste = users.some(
                user =>
                    String(user.correo || "").toLowerCase() ===
                    correo
            );

            if (usuarioExiste) {
                fieldState(
                    fields.usuario,
                    errors.usuario,
                    "Este nombre de usuario ya está registrado."
                );

                showStatus(
                    status,
                    "error",
                    "No se pudo completar el registro. Corrige el usuario indicado."
                );

                fields.usuario.focus();
                return;
            }

            if (correoExiste) {
                fieldState(
                    fields.correo,
                    errors.correo,
                    "Este correo electrónico ya está registrado."
                );

                showStatus(
                    status,
                    "error",
                    "No se pudo completar el registro. Corrige el correo indicado."
                );

                fields.correo.focus();
                return;
            }

            // ---------------------------------------------------------
            // GUARDAR USUARIO
            // ---------------------------------------------------------

            users.push({
                nombre,
                usuario,
                correo,
                clave,
                fechaNacimiento: fecha,
                direccion
            });

            saveUsers(users);

            showStatus(
                status,
                "success",
                "¡Registro completado con éxito! Redirigiendo al inicio de sesión..."
            );

            // No dejamos el formulario en un estado confuso después del éxito.
            registerForm.querySelector("button[type='submit']")
                ?.setAttribute("disabled", "true");

            setTimeout(() => {
                window.location.href =
                    "login.html?registro=ok";
            }, 1500);
        });

        // Validación visual mientras el usuario escribe.
        Object.keys(fields).forEach(key => {
            const input = fields[key];

            input?.addEventListener("input", () => {
                clearField(input, errors[key]);
                clearStatus(status);
            });

            input?.addEventListener("change", () => {
                clearField(input, errors[key]);
                clearStatus(status);
            });
        });

        terms?.addEventListener("change", () => {
            if (termsError) {
                termsError.textContent = "";
            }

            clearStatus(status);
        });
    }
});
