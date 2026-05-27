(function () {
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const stepNav = document.querySelector(".step-nav");
  const pills = Array.from(document.querySelectorAll(".step-pill"));
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const btnSubmit = document.getElementById("btnSubmit");
  const formShell = document.querySelector(".form-shell");
  const hasWizard = Boolean(stepNav && pills.length && btnNext && btnSubmit);

  let currentIndex = 0;

  function isMobile() {
    return window.innerWidth <= 720;
  }

  function scrollToFormStart() {
    if (!isMobile() || !formShell) return;

    const top = formShell.getBoundingClientRect().top + window.scrollY - 12;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  }

  function showSection(index, shouldScroll) {
    if (!sections.length || !hasWizard) return;

    currentIndex = Math.max(0, Math.min(index, sections.length - 1));

    sections.forEach((section, sectionIndex) => {
      section.classList.toggle("active", sectionIndex === currentIndex);
    });

    pills.forEach((pill, pillIndex) => {
      pill.classList.toggle("active", pillIndex === currentIndex);
    });

    if (btnPrev) {
      btnPrev.style.display = currentIndex === 0 ? "none" : "inline-flex";
    }

    if (btnNext) {
      btnNext.style.display = currentIndex === sections.length - 1 ? "none" : "inline-flex";
    }

    if (btnSubmit) {
      btnSubmit.style.display = currentIndex === sections.length - 1 ? "inline-flex" : "none";
    }

    const activePill = pills[currentIndex];

    if (activePill) {
      activePill.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }

    if (shouldScroll) {
      scrollToFormStart();
    }
  }

  function validateCurrentSection() {
    const section = sections[currentIndex];

    if (!section) return true;

    const fields = Array.from(section.querySelectorAll("input, select"));

    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus({ preventScroll: false });
        return false;
      }
    }

    return true;
  }

  if (hasWizard) {
    pills.forEach((pill, index) => {
      pill.addEventListener("click", () => {
        showSection(index, true);
      });
    });

    btnPrev.addEventListener("click", () => {
      showSection(currentIndex - 1, true);
    });

    btnNext.addEventListener("click", () => {
      if (validateCurrentSection()) {
        showSection(currentIndex + 1, true);
      }
    });

    showSection(0, false);
  } else {
    sections.forEach((section) => section.classList.add("active"));
    if (btnPrev) btnPrev.style.display = "none";
    if (btnNext) btnNext.style.display = "none";
    if (btnSubmit) btnSubmit.style.display = "inline-flex";
  }

  function onlyNumbers(value) {
    return value.replace(/\D/g, "");
  }

  function maskCNPJ(value) {
    return onlyNumbers(value)
      .slice(0, 14)
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  function maskCPF(value) {
    return onlyNumbers(value)
      .slice(0, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  function maskCEP(value) {
    return onlyNumbers(value)
      .slice(0, 8)
      .replace(/^(\d{5})(\d)/, "$1-$2");
  }

  function maskPhone(value) {
    const digits = onlyNumbers(value).slice(0, 11);

    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }

  const maskMap = {
    cnpj: maskCNPJ,
    cpf: maskCPF,
    cep: maskCEP,
    phone: maskPhone,
  };

  document.querySelectorAll("[data-mask]").forEach((input) => {
    const maskName = input.dataset.mask;
    const formatter = maskMap[maskName];

    if (!formatter) return;

    input.addEventListener("input", () => {
      input.value = formatter(input.value);
    });

    input.value = formatter(input.value || "");
  });

  document.querySelectorAll('.upload-card input[type="file"]').forEach((input) => {
    input.addEventListener("change", () => {
      const card = input.closest(".upload-card");
      const label = card ? card.querySelector("[data-file-name]") : null;

      if (!label) return;

      label.textContent =
        input.files && input.files[0]
          ? input.files[0].name
          : "Nenhum arquivo selecionado";
    });
  });

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text || "");

      if (button) {
        const originalText = button.textContent;
        button.textContent = "Copiado!";
        button.classList.add("copied");

        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("copied");
        }, 1200);
      }
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text || "";
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      if (button) {
        button.textContent = "Copiado!";
        button.classList.add("copied");
      }
    }
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => {
      copyText(button.dataset.copy || "", button);
    });
  });

  document.querySelectorAll("[data-print-report]").forEach((button) => {
    button.addEventListener("click", () => {
      window.print();
    });
  });

  document.querySelectorAll("[data-confirm-delete]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const company = form.dataset.company || "este cadastro";
      const confirmed = window.confirm(
        `Tem certeza que deseja deletar ${company}? Essa ação remove o envio do painel e tenta excluir os anexos do Cloudflare R2/local.`
      );

      if (!confirmed) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  });

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const button = event.submitter || form.querySelector('button[type="submit"]');

      if (!button) return;

      button.disabled = true;
      button.dataset.originalText = button.textContent;

      if (form.classList.contains("export-form")) {
        button.textContent = "Processando...";
      } else if (form.hasAttribute("data-confirm-delete")) {
        button.textContent = "Deletando...";
      } else {
        button.textContent = "Enviando...";
      }

      if (form.classList.contains("export-form")) {
        setTimeout(() => {
          button.disabled = false;
          button.textContent = button.dataset.originalText || "Baixar XLSX";
        }, 1600);
      }
    });
  });
})();
