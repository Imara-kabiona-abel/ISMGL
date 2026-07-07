// ==========================================================================
// ISMGL Goma — script.js
// ==========================================================================

// ---- Année du footer -----------------------------------------------------
document.getElementById("year").textContent = new Date().getFullYear();

// ---- Menu mobile ----------------------------------------------------------
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.getElementById("mainNav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Ferme le menu quand on clique un lien (utile en mobile)
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ---- Chiffres clés animés --------------------------------------------------
//
// ⚠️ Les valeurs comptées viennent des attributs data-target dans index.html
// (section id="chiffres"). Ce sont des chiffres d'EXEMPLE. Remplacez-les par
// les vrais totaux (étudiants formés, enseignants, ouvrages publiés) avant
// la mise en ligne — un chiffre invérifiable qui circule publiquement peut
// se retourner contre la crédibilité de l'institut si quelqu'un le conteste.
//
const counters = document.querySelectorAll("[data-counter]");

function animateCounter(el) {
  const target = el.hasAttribute("data-target-since")
    ? new Date().getFullYear() - parseInt(el.getAttribute("data-target-since"), 10)
    : parseInt(el.getAttribute("data-target"), 10);

  if (Number.isNaN(target)) return;

  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target).toLocaleString("fr-FR");
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toLocaleString("fr-FR");
    }
  }
  requestAnimationFrame(tick);
}

if (counters.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => observer.observe(el));
}

// ---- Galerie -> lightbox ----------------------------------------------------
const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(item) {
  const img = item.querySelector("img");
  lightboxImage.src = img.src;
  lightboxImage.alt = img.alt;
  lightboxCaption.textContent = item.getAttribute("data-caption") || "";
  lightbox.hidden = false;
  lightboxClose.focus();
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = "";
  document.body.style.overflow = "";
}

galleryItems.forEach((item) => {
  item.addEventListener("click", () => openLightbox(item));
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}
if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
});

// ---- Formulaire de contact -> envoi d'email via EmailJS -------------------
//
// ATTENTION — configuration requise avant mise en ligne :
// 1. Créez un compte gratuit sur https://www.emailjs.com (200 emails/mois offerts)
// 2. Ajoutez un "Email Service" relié à imaraabel2@gmail.com (Service ID)
// 3. Créez un "Email Template" avec les variables {{nom}}, {{email}}, {{filiere}}, {{message}}
// 4. Récupérez votre Public Key dans Account > General
// 5. Remplacez les 3 valeurs ci-dessous
//
const EMAILJS_CONFIG = {
  publicKey: "REMPLACER_PAR_VOTRE_PUBLIC_KEY",
  serviceId: "REMPLACER_PAR_VOTRE_SERVICE_ID",
  templateId: "REMPLACER_PAR_VOTRE_TEMPLATE_ID",
};

const DESTINATION_EMAIL = "imaraabel2@gmail.com";

if (window.emailjs && EMAILJS_CONFIG.publicKey.indexOf("REMPLACER") === -1) {
  emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
}

const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const formNote = document.querySelector("[data-form-note]");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const isConfigured = EMAILJS_CONFIG.publicKey.indexOf("REMPLACER") === -1;

    if (!isConfigured) {
      formNote.textContent =
        "Le formulaire n'est pas encore relié au service d'envoi (voir script.js). En attendant, contactez-nous directement à " +
        DESTINATION_EMAIL + " ou sur WhatsApp.";
      formNote.classList.add("is-error");
      return;
    }

    const data = new FormData(form);
    const templateParams = {
      nom: data.get("nom"),
      email: data.get("email"),
      filiere: data.get("filiere"),
      message: data.get("message"),
      to_email: DESTINATION_EMAIL,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours…";
    formNote.classList.remove("is-error", "is-success");

    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );
      form.reset();
      formNote.textContent = "Message envoyé. Le secrétariat académique vous répondra rapidement.";
      formNote.classList.add("is-success");
    } catch (err) {
      console.error("Erreur d'envoi EmailJS :", err);
      formNote.textContent =
        "L'envoi a échoué. Merci de réessayer, ou d'écrire directement à " + DESTINATION_EMAIL + ".";
      formNote.classList.add("is-error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Envoyer la demande";
    }
  });
}
