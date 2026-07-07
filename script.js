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
