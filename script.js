/* ==========================================================
   COUNTDOWN
   ========================================================== */

const countdownTarget = new Date("September 30, 2026 23:59:59").getTime();

/* Actualiza los valores del contador regresivo cada segundo. */
const updateCountdown = () => {
  const now = new Date().getTime();
  const distance = countdownTarget - now;

  /* Evita mostrar valores negativos cuando finaliza la promoción. */
  if (distance < 0) {
    document.getElementById("dias").innerText = "00";
    document.getElementById("horas").innerText = "00";
    document.getElementById("minutos").innerText = "00";
    document.getElementById("segundos").innerText = "00";
    return;
  }

  /* Calcula días, horas, minutos y segundos restantes. */
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (distance % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor(
    (distance % (1000 * 60)) / 1000
  );

  /* Mantiene todos los valores con formato de dos dígitos. */
  document.getElementById("dias").innerText =
    days < 10 ? `0${days}` : days;

  document.getElementById("horas").innerText =
    hours < 10 ? `0${hours}` : hours;

  document.getElementById("minutos").innerText =
    minutes < 10 ? `0${minutes}` : minutes;

  document.getElementById("segundos").innerText =
    seconds < 10 ? `0${seconds}` : seconds;
};

/* Inicializa el contador inmediatamente y lo actualiza cada segundo. */
updateCountdown();
setInterval(updateCountdown, 1000);


/* ==========================================================
   MENU HAMBURGUESA
   ========================================================== */

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.getElementById("main-menu");

/* Abre o cierra el menú móvil y actualiza su estado accesible. */
const toggleMenu = () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

  menuToggle.setAttribute("aria-expanded", String(!isOpen));

  menuToggle.setAttribute(
    "aria-label",
    isOpen
      ? "Abrir menú de navegación"
      : "Cerrar menú de navegación"
  );

  mainNav.classList.toggle("is-open", !isOpen);
};

/* Controla la apertura del menú mediante el botón hamburguesa. */
menuToggle.addEventListener("click", toggleMenu);

/* Cierra el menú después de seleccionar una sección. */
mainNav.querySelectorAll(".main-nav__link").forEach(link => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute(
      "aria-label",
      "Abrir menú de navegación"
    );
    mainNav.classList.remove("is-open");
  });
});

/* Cierra el menú cuando se pulsa la tecla Escape. */
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute(
      "aria-label",
      "Abrir menú de navegación"
    );
    mainNav.classList.remove("is-open");
  }
});


/* ==========================================================
   TABS
   ========================================================== */

const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');

/* Activa un panel y actualiza el estado accesible de las pestañas. */
function activateTab(event) {
  const targetTab = event.currentTarget;
  const targetPanelId = targetTab.getAttribute("aria-controls");

  /* Restablece todas las pestañas al estado inactivo. */
  tabs.forEach(tab => {
    tab.setAttribute("aria-selected", "false");
    tab.classList.remove("tab--active");
  });

  /* Oculta todos los paneles. */
  panels.forEach(panel => {
    panel.hidden = true;
  });

  /* Activa la pestaña seleccionada. */
  targetTab.setAttribute("aria-selected", "true");
  targetTab.classList.add("tab--active");

  /* Muestra el panel asociado. */
  const targetPanel = document.getElementById(targetPanelId);

  if (targetPanel) {
    targetPanel.hidden = false;
  }
}

/* Configura los eventos de clic y navegación mediante teclado. */
tabs.forEach(tab => {
  tab.addEventListener("click", activateTab);

  tab.addEventListener("keydown", event => {
    const currentIndex = Array.from(tabs).indexOf(event.currentTarget);
    let nextIndex = null;

    /* Permite navegar entre pestañas utilizando las flechas. */
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    }

    /* Cambia el foco y activa la nueva pestaña. */
    if (nextIndex !== null) {
      event.preventDefault();
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    }
  });
});


/* ==========================================================
   FORMULARIO Y MODAL
   ========================================================== */

const form = document.getElementById("registroForm");
const registrationModal = document.getElementById("registrationModal");
const modalClose = document.querySelector(".registration-modal__close");

const submitButton = form.querySelector(".button--submit");

/*
 * Guarda el contenido original del botón para poder restaurarlo
 * después de recibir la respuesta de n8n.
 */
const submitButtonDefaultContent = submitButton.innerHTML;

let modalTimeout;

/*
 * Controla que no se produzcan múltiples envíos mientras
 * n8n está procesando la solicitud.
 */
let registroEnProceso = false;


/* Gestiona el envío del formulario hacia n8n. */
form.addEventListener("submit", async event => {
  event.preventDefault();

  /*
   * Evita envíos repetidos mientras n8n procesa la solicitud.
   */
  if (registroEnProceso) {
    return;
  }

  /* Ejecuta la validación nativa del formulario. */
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  /*
   * ========================================================
   * ESTADO DE PROCESAMIENTO
   * ========================================================
   *
   * El botón se bloquea inmediatamente para evitar dobles
   * clics y comunica al usuario que el proceso está en curso.
   */

  registroEnProceso = true;

  submitButton.disabled = true;

  submitButton.setAttribute("aria-busy", "true");

  submitButton.classList.add("button--loading");

  submitButton.innerHTML = `
    <span class="button__spinner" aria-hidden="true"></span>
    <span>Espera un momento… procesando tu registro</span>
  `;


  /* Obtiene los datos actuales del formulario. */
  const nombre = document.getElementById("nombre").value.trim();

  const telefono = document.getElementById("telefono").value.trim();

  const placa = document
    .getElementById("placa")
    .value
    .trim()
    .toUpperCase();

  const tipoVehiculoSelect =
    document.getElementById("tipo_vehiculo");

  const tipoVehiculo =
    tipoVehiculoSelect.options[
      tipoVehiculoSelect.selectedIndex
    ].text;


  /* Construye el objeto con los nombres que espera n8n. */
  const datosRegistro = {
    "Nombre completo": nombre,
    "Teléfono": telefono,
    "Número de placa": placa,
    "Tipo de Vehículo": tipoVehiculo,
    "Aceptación de términos": [
      "Acepto participar en la promoción y sus condiciones."
    ]
  };


  try {
    /* Envía los datos mediante POST al Webhook de n8n. */
    const response = await fetch("/api/registro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datosRegistro)
    });


    /* Comprueba que n8n haya respondido correctamente. */
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }


    /* Obtiene la respuesta JSON generada por n8n. */
    const resultado = await response.json();


    /* Limpia el formulario después del registro. */
    form.reset();


    /*
     * ========================================================
     * RESTAURAR BOTÓN
     * ========================================================
     *
     * n8n ya respondió, por lo que el botón vuelve a su
     * apariencia y comportamiento originales.
     */

    registroEnProceso = false;

    submitButton.disabled = false;

    submitButton.removeAttribute("aria-busy");

    submitButton.classList.remove("button--loading");

    submitButton.innerHTML = submitButtonDefaultContent;


    /* Procesa la respuesta del cliente. */
    mostrarResultadoRegistro(resultado);

  } catch (error) {

    console.error("Error al enviar el registro:", error);


    /*
     * ========================================================
     * RESTAURAR BOTÓN EN CASO DE ERROR
     * ========================================================
     *
     * Permite al usuario intentar nuevamente.
     */

    registroEnProceso = false;

    submitButton.disabled = false;

    submitButton.removeAttribute("aria-busy");

    submitButton.classList.remove("button--loading");

    submitButton.innerHTML = submitButtonDefaultContent;


    alert(
      "No fue posible procesar el registro. Intenta nuevamente."
    );
  }
});


/* ==========================================================
   MOSTRAR RESULTADO DEL REGISTRO
   ========================================================== */

/* Muestra el modal según la respuesta recibida desde n8n. */
function mostrarResultadoRegistro(resultado) {

  const modalTitle =
    document.getElementById("registration-modal-title");

  const modalContent =
    registrationModal.querySelector(
      ".form-message__content span"
    );

  const reserveButton =
    registrationModal.querySelector(
      ".button--reserve"
    );


  /* Cliente nuevo registrado correctamente. */
  if (
    resultado.registro_exitoso === true &&
    resultado.cliente_creado === true
  ) {

    modalTitle.textContent = "¡Registro exitoso!";

    modalContent.textContent =
      "Tus datos han sido guardados. Ahora puedes apartar tu servicio directamente en el lavadero.";

    reserveButton.href =
      resultado.whatsapp_link ||
      "https://w.app/milavaderoco";

    reserveButton.textContent =
      "Reservar cupo";
  }


  /* Cliente que ya estaba registrado. */
  else if (resultado.cliente_existente === true) {

    modalTitle.textContent =
      "Ud ya está registrado";

    modalContent.textContent =
      resultado.detalle ||
      "Esta placa y teléfono ya están registrados.";

    reserveButton.href =
      "https://w.app/milavaderoco";

    reserveButton.textContent =
      "Reservar cupo";
  }


  /* Respuesta inesperada de n8n. */
  else {

    modalTitle.textContent =
      "No fue posible completar el registro";

    modalContent.textContent =
      resultado.detalle ||
      resultado.mensaje ||
      "Intenta nuevamente.";

    reserveButton.href =
      "https://w.app/milavaderoco";

    reserveButton.textContent =
      "Reservar cupo";
  }


  /* Abre el modal. */
  registrationModal.showModal();


  /* Reinicia el temporizador del modal. */
  clearTimeout(modalTimeout);

  modalTimeout = setTimeout(() => {
    registrationModal.close();
  }, 10000);
}


/* ==========================================================
   CERRAR MODAL
   ========================================================== */

/* Cierra el modal mediante el botón de cierre. */
modalClose.addEventListener("click", () => {
  clearTimeout(modalTimeout);
  registrationModal.close();
});


/* Permite cerrar el modal haciendo clic sobre el fondo exterior. */
registrationModal.addEventListener("click", event => {
  if (event.target === registrationModal) {
    clearTimeout(modalTimeout);
    registrationModal.close();
  }
});


/* ==========================================================
   REVEAL EFFECT
   ========================================================== */

const revealElements =
  document.querySelectorAll(".reveal");


/*
 * Detecta cuando cada sección entra en el área visible
 * de la pantalla.
 */
const revealObserver =
  new IntersectionObserver(entries => {

    entries.forEach(entry => {

      /*
       * Activa la animación una sola vez cuando
       * la sección es visible.
       */
      if (entry.isIntersecting) {

        entry.target.classList.add("is-visible");

        revealObserver.unobserve(entry.target);
      }
    });

  }, {
    threshold: 0.15
  });


/*
 * Registra todas las secciones que utilizan
 * el efecto reveal.
 */
revealElements.forEach(element => {
  revealObserver.observe(element);
});