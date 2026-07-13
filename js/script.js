/* =============================================================
   Taller Palma — lógica del configurador
   =============================================================
   Este archivo controla:
     1. Los datos de telas y colores (FABRICS abajo).
     2. Los precios base (PRICES abajo).
     3. El cambio de pestaña Sofá cama / Cama.
     4. La actualización de la vista previa: fotos + overlay de color
        para el sofá, SVG para la cama.
     5. El precio total en pantalla.
     6. El mensaje de WhatsApp con el resumen de la selección.

   PARA AGREGAR/EDITAR COLORES O TELAS MÁS ADELANTE:
   Solo hay que modificar el objeto "FABRICS" más abajo. Cada tela
   tiene una lista de colores con { name, hex, image }. "hex" se usa
   para pintar la muestra, el overlay de color del sofá (fotos) y el
   relleno SVG de la cama.

   PARA EDITAR PRECIOS MÁS ADELANTE:
   Modifique el objeto "PRICES" más abajo. Los montos están en colones
   (CRC), como números simples sin puntos ni símbolos.
   ========================================================== */

(function () {
  "use strict";

  /* -----------------------------------------------------------
     1. DATOS DE TELAS Y COLORES
     Reemplace "hex" por su color real, o agregue "image" cuando
     tenga fotos de las telas. ~10 colores por tela (cafés y
     grises/oliva), tal como se pidió.
  ----------------------------------------------------------- */
  const FABRICS = {
    microfibra: [
      { name: "Café chocolate",   hex: "#4a3728", image: null },
      { name: "Café tostado",     hex: "#7a5637", image: null },
      { name: "Café miel",        hex: "#a97b4f", image: null },
      { name: "Beige arena",      hex: "#cbb18a", image: null },
      { name: "Camel",            hex: "#b98a55", image: null },
      { name: "Gris perla",       hex: "#b9b4ac", image: null },
      { name: "Gris carbón",      hex: "#5c5852", image: null },
      { name: "Gris pizarra",     hex: "#75797a", image: null },
      { name: "Oliva",            hex: "#6b7052", image: null },
      { name: "Verde musgo",      hex: "#59603f", image: null }
    ],
    microcuero: [
      { name: "Café expreso",     hex: "#3b2a1f", image: null },
      { name: "Café cognac",      hex: "#8a5a34", image: null },
      { name: "Café silla",       hex: "#6e4a30", image: null },
      { name: "Whisky",           hex: "#a06a3c", image: null },
      { name: "Arena",            hex: "#c9a876", image: null },
      { name: "Gris topo",        hex: "#83786a", image: null },
      { name: "Gris humo",        hex: "#6a6963", image: null },
      { name: "Gris oscuro",      hex: "#454440", image: null },
      { name: "Verde oliva",      hex: "#6a6b45", image: null },
      { name: "Verde militar",    hex: "#4f5636", image: null }
    ],
    cuero: [
      { name: "Negro",            hex: "#231f1c", image: null },
      { name: "Café habano",      hex: "#5a3a24", image: null },
      { name: "Café cognac",      hex: "#8a5024", image: null },
      { name: "Café silla vieja", hex: "#6b4226", image: null },
      { name: "Miel",             hex: "#a9713f", image: null },
      { name: "Arena claro",      hex: "#d1b48c", image: null },
      { name: "Gris grafito",     hex: "#4a4844", image: null },
      { name: "Gris ceniza",      hex: "#8b877e", image: null },
      { name: "Oliva oscuro",     hex: "#565a3d", image: null },
      { name: "Verde botella",    hex: "#3f4a34", image: null }
    ]
  };

  /* -----------------------------------------------------------
     2. PRECIOS (colones CRC). Edite estos números cuando cambien.
  ----------------------------------------------------------- */
  const PRICES = {
    sofa: 185000,
    cama: 165000
  };

  /* -----------------------------------------------------------
     3. ESTADO ACTUAL DE LA SELECCIÓN
  ----------------------------------------------------------- */
  const state = {
    product: "sofa", // "sofa" | "cama"
    sofaState: "cerrado", // "cerrado" | "media" | "completa"
    fabricType: "microfibra",
    colorIndex: 0
  };

  /* -----------------------------------------------------------
     4. REFERENCIAS AL DOM
  ----------------------------------------------------------- */
  const productTabs = document.getElementById("product-tabs");
  const sofaOnlyOptions = document.getElementById("sofa-only-options");
  const camaOnlyOptions = document.getElementById("cama-only-options");

  const stateOptions = document.getElementById("state-options");

  const fabricOptions = document.getElementById("fabric-options");
  const colorSwatchesContainer = document.getElementById("color-swatches");
  const colorNameLabel = document.getElementById("color-name-label");

  const previewLabel = document.getElementById("preview-label");
  const sofaPhoto = document.getElementById("sofa-photo");
  const bedPhoto = document.getElementById("bed-photo");
  const bedColorOverlay = document.getElementById("bed-color-overlay");
  const priceTotalLabel = document.getElementById("price-total");

  const whatsappConfiguratorBtn = document.getElementById("whatsapp-configurator-btn");
  const whatsappMainBtn = document.getElementById("whatsapp-main-btn");

  // Los tres "couch-wrap" de foto (cerrado / media extensión / cama completa),
  // uno visible a la vez según la posición elegida.
  const sofaStateGroups = {
    cerrado: document.getElementById("state-cerrado"),
    media: document.getElementById("state-media"),
    completa: document.getElementById("state-completa")
  };

  /* -----------------------------------------------------------
     5. NÚMERO DE WHATSAPP (reemplazar por el número real del taller)
     Formato: código de país + número, sin "+" ni espacios.
  ----------------------------------------------------------- */
  const WHATSAPP_NUMBER = "50686245630";

  /* -----------------------------------------------------------
     6. RENDER: pinta las muestras de color según la tela activa
     (compartido entre sofá y cama)
  ----------------------------------------------------------- */
  function renderColorSwatches() {
    const colors = FABRICS[state.fabricType];

    if (state.colorIndex >= colors.length) {
      state.colorIndex = 0;
    }

    colorSwatchesContainer.innerHTML = "";

    colors.forEach((color, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "color-swatch";
      btn.setAttribute("aria-label", color.name);
      btn.title = color.name;

      applyColorToSwatch(btn, color);

      if (index === state.colorIndex) {
        btn.classList.add("selected");
      }

      btn.addEventListener("click", function () {
        state.colorIndex = index;
        renderColorSwatches();
        updateActivePreview();
        updateWhatsappLinks();
      });

      colorSwatchesContainer.appendChild(btn);
    });

    colorNameLabel.textContent = colors[state.colorIndex].name;
  }

  // Pinta una muestra individual. Cuando haya fotos reales de tela,
  // cambiar esto para usar backgroundImage en vez de backgroundColor.
  function applyColorToSwatch(swatchEl, color) {
    if (color.image) {
      swatchEl.style.backgroundImage = "url('" + color.image + "')";
      swatchEl.style.backgroundColor = "";
    } else {
      swatchEl.style.backgroundColor = color.hex;
      swatchEl.style.backgroundImage = "";
    }
  }

  /* -----------------------------------------------------------
     7. CAMBIO DE PESTAÑA: Sofá cama / Cama
  ----------------------------------------------------------- */
  function setProduct(product) {
    state.product = product;

    // Botones de pestaña
    productTabs.querySelectorAll(".product-tab").forEach(function (tab) {
      const isActive = tab.dataset.product === product;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    // Mostrar la vista previa correspondiente (fotos del sofá o de la cama)
    sofaPhoto.style.display = product === "sofa" ? "" : "none";
    bedPhoto.style.display = product === "cama" ? "" : "none";

    // Mostrar solo las opciones del producto activo
    sofaOnlyOptions.style.display = product === "sofa" ? "" : "none";
    camaOnlyOptions.style.display = product === "cama" ? "" : "none";

    updatePreviewLabel();
    updateActivePreview();
    updatePriceTotal();
    updateWhatsappLinks();
  }

  function updatePreviewLabel() {
    previewLabel.textContent = state.product === "sofa" ? "Sofá cama" : "Cama";
  }

  /* -----------------------------------------------------------
     8. ACTUALIZA EL DIBUJO ACTIVO (sofá o cama) según el producto
  ----------------------------------------------------------- */
  function updateActivePreview() {
    if (state.product === "sofa") {
      updateSofaPreview();
    } else {
      updateBedPreview();
    }
  }

  // Aplica el color elegido al sofá: pinta ".color-overlay" de cada foto con
  // el color hex elegido. mix-blend-mode: color (definido en CSS) hace que
  // ese color tome el matiz elegido pero conserve la luz/sombra y textura
  // reales de la foto en escala de grises debajo.
  function updateSofaPreview() {
    const color = FABRICS[state.fabricType][state.colorIndex];

    Object.keys(sofaStateGroups).forEach(function (key) {
      const group = sofaStateGroups[key];
      if (!group) return;

      const isActive = key === state.sofaState;
      group.classList.toggle("is-active", isActive);

      const overlay = group.querySelector(".color-overlay");
      if (overlay) overlay.style.backgroundColor = color.hex;
    });
  }

  // Aplica el color elegido a la cama: misma técnica que el sofá (foto real +
  // ".color-overlay" con mix-blend-mode: color). La máscara de "#bed-color-overlay"
  // (definida en CSS) excluye el colchón, así que solo se tiñe la estructura tapizada.
  function updateBedPreview() {
    const color = FABRICS[state.fabricType][state.colorIndex];
    if (bedColorOverlay) bedColorOverlay.style.backgroundColor = color.hex;
  }

  /* -----------------------------------------------------------
     9. PRECIO TOTAL EN PANTALLA
  ----------------------------------------------------------- */
  function formatColones(amount) {
    return "₡" + amount.toLocaleString("es-CR");
  }

  function updatePriceTotal() {
    const basePrice = PRICES[state.product];
    priceTotalLabel.textContent = formatColones(basePrice);
  }

  /* -----------------------------------------------------------
     10. CONSTRUYE EL MENSAJE DE WHATSAPP CON LA SELECCIÓN ACTUAL
  ----------------------------------------------------------- */
  const SOFA_STATE_LABELS = {
    cerrado: "posición cerrado",
    media: "posición extendido",
    completa: "posición cama completa"
  };

  // Mensaje CON el detalle de la selección actual — solo para el botón
  // debajo del configurador. Solo incluye lo que aplica a cada producto
  // (p.ej. la cama no tiene "posición", eso es solo del sofá).
  function buildWhatsappMessage() {
    const color = FABRICS[state.fabricType][state.colorIndex];
    const fabricLabel = capitalize(state.fabricType);
    const basePrice = PRICES[state.product];

    const parts = [];

    if (state.product === "sofa") {
      parts.push("Sofá cama");
      parts.push(SOFA_STATE_LABELS[state.sofaState]);
      parts.push("tela " + fabricLabel);
      parts.push("color " + color.name);
    } else {
      parts.push("Cama tapizada");
      parts.push("tela " + fabricLabel);
      parts.push("color " + color.name);
    }

    parts.push("precio base " + formatColones(basePrice));

    return "Hola, me interesa un mueble con estas características: " + parts.join(", ") + ".";
  }

  // Mensaje genérico (SIN el detalle de la selección) — usado por los demás
  // botones/enlaces de WhatsApp del sitio (nav, sección de contacto, etc.),
  // que no están atados a lo que el usuario armó en el configurador.
  const WHATSAPP_GENERIC_MESSAGE = "Hola, busco más información de los muebles.";

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function buildWhatsappUrl(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }

  // Actualiza los botones de WhatsApp: el del configurador lleva el detalle
  // de la selección actual; los demás (ej. el de la sección de contacto)
  // llevan siempre el mismo mensaje genérico, sin importar el estado del
  // configurador.
  function updateWhatsappLinks() {
    if (whatsappConfiguratorBtn) {
      whatsappConfiguratorBtn.href = buildWhatsappUrl(buildWhatsappMessage());
    }
    if (whatsappMainBtn) {
      whatsappMainBtn.href = buildWhatsappUrl(WHATSAPP_GENERIC_MESSAGE);
    }
  }

  /* -----------------------------------------------------------
     11. EVENTOS
  ----------------------------------------------------------- */

  // Pestañas de producto
  productTabs.addEventListener("click", function (event) {
    const tab = event.target.closest(".product-tab");
    if (!tab) return;
    setProduct(tab.dataset.product);
  });

  // Estado del sofá: cerrado / media extensión / cama completa
  stateOptions.addEventListener("change", function (event) {
    if (event.target.name === "sofa-state") {
      state.sofaState = event.target.value;
      updateSofaPreview();
      updateWhatsappLinks();
    }
  });

  // Tipo de tela (compartido)
  fabricOptions.addEventListener("change", function (event) {
    if (event.target.name === "fabric") {
      state.fabricType = event.target.value;
      state.colorIndex = 0; // reinicia al primer color de la nueva tela
      renderColorSwatches();
      updateActivePreview();
      updateWhatsappLinks();
    }
  });

  /* -----------------------------------------------------------
     12. PLACEHOLDERS DE IMÁGENES
     Mientras no existan los archivos reales en /images, esto oculta
     el <img> roto y muestra la etiqueta con el nombre de archivo
     esperado (definida en data-placeholder-text). En cuanto se
     coloque la imagen real con ese mismo nombre, se muestra sola
     y el placeholder desaparece automáticamente.
  ----------------------------------------------------------- */
  function setupImagePlaceholders() {
    document.querySelectorAll(".img-placeholder").forEach(function (wrapper) {
      const img = wrapper.querySelector("img");
      if (!img) return;

      img.addEventListener("error", function () {
        wrapper.classList.add("img-missing");
      });

      if (img.complete && img.naturalWidth === 0) {
        wrapper.classList.add("img-missing");
      }
    });
  }

  /* -----------------------------------------------------------
     13. INICIALIZACIÓN
  ----------------------------------------------------------- */
  function init() {
    renderColorSwatches();
    setProduct(state.product);
    updateBedPreview(); // inicializa también la foto de cama aunque empiece oculta
    updatePriceTotal();
    updateWhatsappLinks();
    setupImagePlaceholders();
  }

  init();
})();
