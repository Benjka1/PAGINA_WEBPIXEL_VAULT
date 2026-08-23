document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector(".support-form-card form");

    if (!form) return;

    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const tipo = document.getElementById("tipo");
    const motivo = document.getElementById("motivo");
    const mensaje = document.getElementById("mensaje");
    const boton = form.querySelector(".support-submit");


    // =====================================================
    // CREAR / OBTENER MENSAJE DE ERROR
    // =====================================================

    function obtenerError(campo) {

        let grupo = campo.closest(".support-form-group");

        if (!grupo) return null;

        let error = grupo.querySelector(".support-field-error");

        if (!error) {

            error = document.createElement("small");
            error.className = "support-field-error";

            grupo.appendChild(error);
        }

        return error;
    }


    // =====================================================
    // LIMPIAR ERROR
    // =====================================================

    function limpiarError(campo) {

        if (!campo) return;

        const grupo = campo.closest(".support-form-group");

        if (!grupo) return;

        const error = grupo.querySelector(".support-field-error");

        if (error) {

            error.textContent = "";
            error.style.display = "none";
        }

        campo.classList.remove("support-input-error");
    }


    // =====================================================
    // MOSTRAR ERROR
    // =====================================================

    function mostrarError(campo, texto) {

        const error = obtenerError(campo);

        if (!error) return false;

        error.textContent = texto;
        error.style.display = "block";

        campo.classList.add("support-input-error");

        return false;
    }


    // =====================================================
    // VALIDAR NOMBRE
    // =====================================================

    function validarNombre() {

        limpiarError(nombre);

        if (nombre.value.trim() === "") {

            return mostrarError(
                nombre,
                "Ingresa tu nombre completo."
            );
        }

        return true;
    }


    // =====================================================
    // VALIDAR CORREO
    // =====================================================

    function validarCorreo() {

        limpiarError(correo);

        const valor = correo.value.trim();

        if (valor === "") {

            return mostrarError(
                correo,
                "Ingresa tu correo electrónico."
            );
        }

        const formatoCorreo =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoCorreo.test(valor)) {

            return mostrarError(
                correo,
                "Ingresa un correo electrónico válido."
            );
        }

        return true;
    }


    // =====================================================
    // VALIDAR TIPO
    // =====================================================

    function validarTipo() {

        limpiarError(tipo);

        if (tipo.value === "") {

            return mostrarError(
                tipo,
                "Selecciona el tipo de solicitud."
            );
        }

        return true;
    }


    // =====================================================
    // VALIDAR MOTIVO
    // =====================================================

    function validarMotivo() {

        limpiarError(motivo);

        if (motivo.value.trim() === "") {

            return mostrarError(
                motivo,
                "Indica el motivo de tu solicitud."
            );
        }

        return true;
    }


    // =====================================================
    // VALIDAR MENSAJE
    // =====================================================

    function validarMensaje() {

        limpiarError(mensaje);

        if (mensaje.value.trim() === "") {

            return mostrarError(
                mensaje,
                "Describe tu problema o consulta."
            );
        }

        return true;
    }


    // =====================================================
    // VALIDAR FORMULARIO COMPLETO
    // =====================================================

    function validarFormulario() {

        const nombreValido = validarNombre();
        const correoValido = validarCorreo();
        const tipoValido = validarTipo();
        const motivoValido = validarMotivo();
        const mensajeValido = validarMensaje();

        return (
            nombreValido &&
            correoValido &&
            tipoValido &&
            motivoValido &&
            mensajeValido
        );
    }


    // =====================================================
    // ENCONTRAR PRIMER ERROR
    // =====================================================

    function enfocarPrimerError() {

        const primerError =
            form.querySelector(".support-input-error");

        if (!primerError) return;

        primerError.focus();

        primerError.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    // =====================================================
    // VALIDACIÓN AL SALIR DEL CAMPO
    // =====================================================

    if (nombre) {
        nombre.addEventListener("blur", validarNombre);
    }

    if (correo) {
        correo.addEventListener("blur", validarCorreo);
    }

    if (tipo) {
        tipo.addEventListener("change", validarTipo);
    }

    if (motivo) {
        motivo.addEventListener("blur", validarMotivo);
    }

    if (mensaje) {
        mensaje.addEventListener("blur", validarMensaje);
    }


    // =====================================================
    // VALIDACIÓN EN TIEMPO REAL
    // =====================================================

    if (nombre) {

        nombre.addEventListener("input", () => {

            if (nombre.value.trim() !== "") {
                limpiarError(nombre);
            }

        });

    }


    if (correo) {

        correo.addEventListener("input", () => {

            const valor = correo.value.trim();

            const formatoCorreo =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (formatoCorreo.test(valor)) {
                limpiarError(correo);
            }

        });

    }


    if (tipo) {

        tipo.addEventListener("change", () => {

            if (tipo.value !== "") {
                limpiarError(tipo);
            }

        });

    }


    if (motivo) {

        motivo.addEventListener("input", () => {

            if (motivo.value.trim() !== "") {
                limpiarError(motivo);
            }

        });

    }


    if (mensaje) {

        mensaje.addEventListener("input", () => {

            if (mensaje.value.trim() !== "") {
                limpiarError(mensaje);
            }

        });

    }


    // =====================================================
    // PROCESAR SOLICITUD
    // =====================================================

    function procesarSolicitud(event) {

        if (event) {
            event.preventDefault();
        }

        if (!validarFormulario()) {

            enfocarPrimerError();

            return;
        }

        registrarSolicitud();
    }


    // =====================================================
    // SUBMIT
    // =====================================================

    form.addEventListener("submit", procesarSolicitud);


    // =====================================================
    // BOTÓN
    // =====================================================

    if (boton) {

        boton.addEventListener("click", (event) => {

            event.preventDefault();

            procesarSolicitud(event);

        });

    }


    // =====================================================
    // REGISTRAR SOLICITUD
    // =====================================================

    function registrarSolicitud() {

        const solicitud = {

            id: Date.now(),

            nombre: nombre.value.trim(),

            correo: correo.value.trim(),

            tipo: tipo.value,

            motivo: motivo.value.trim(),

            mensaje: mensaje.value.trim(),

            fecha: new Date().toLocaleString("es-CL")

        };


        // Obtener solicitudes anteriores

        let solicitudesGuardadas = [];

        try {

            solicitudesGuardadas =
                JSON.parse(
                    localStorage.getItem(
                        "pixelvault_solicitudes_soporte"
                    )
                ) || [];

        } catch (error) {

            solicitudesGuardadas = [];
        }


        // Guardar nueva solicitud

        solicitudesGuardadas.push(solicitud);


        localStorage.setItem(
            "pixelvault_solicitudes_soporte",
            JSON.stringify(solicitudesGuardadas)
        );


        // Mostrar confirmación

        mostrarMensajeExito();


        // Limpiar formulario

        form.reset();


        [
            nombre,
            correo,
            tipo,
            motivo,
            mensaje

        ].forEach(campo => {

            if (campo) {
                limpiarError(campo);
            }

        });

    }


    // =====================================================
    // MENSAJE DE ÉXITO
    // =====================================================

    function mostrarMensajeExito() {

        let mensajeExito =
            document.querySelector(".support-success-message");

        if (!mensajeExito) {

            mensajeExito =
                document.createElement("div");

            mensajeExito.className =
                "support-success-message";

            // Se agrega al body para que aparezca inmediatamente
            // en el centro de la pantalla, sin importar el scroll.
            document.body.appendChild(mensajeExito);

        }


        mensajeExito.innerHTML = `

            <div class="success-icon">
                <i class="fa-solid fa-check"></i>
            </div>

            <div class="success-content">

                <span class="success-label">
                    SOLICITUD ENVIADA
                </span>

                <strong>
                    ¡Todo listo!
                </strong>

                <p>
                    Tu solicitud fue registrada correctamente.
                    Nuestro equipo revisará tus antecedentes
                    y se pondrá en contacto contigo cuando corresponda.
                </p>

            </div>

            <div class="success-decoration">
                <i class="fa-solid fa-sparkles"></i>
            </div>

        `;


        // Mostrar

        mensajeExito.style.display = "flex";


        // Reiniciar animación

        mensajeExito.classList.remove("success-show");

        void mensajeExito.offsetWidth;

        mensajeExito.classList.add("success-show");


        // Ocultar después de 6 segundos

        setTimeout(() => {

            mensajeExito.classList.remove("success-show");

            setTimeout(() => {

                mensajeExito.style.display = "none";

            }, 400);

        }, 6000);

    }

});