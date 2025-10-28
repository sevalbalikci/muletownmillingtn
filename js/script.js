// Muletown Milling Website - JavaScript

// Handle logo loading
document.addEventListener("DOMContentLoaded", function () {
  const logo = document.getElementById("logo");

  // Check if logo image exists and show it
  if (logo) {
    logo.onerror = function () {
      // Hide logo if it doesn't exist
      this.style.display = "none";
    };

    logo.onload = function () {
      // Show logo when it loads
      this.classList.add("loaded");
    };

    // Try to load the logo
    if (logo.complete) {
      logo.classList.add("loaded");
    }
  }

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('.nav-link, .btn[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          const headerOffset = 80;
          const elementPosition = targetSection.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    });
  });

  // Add scroll event for header shadow
  let lastScroll = 0;
  const header = document.querySelector(".header");

  window.addEventListener("scroll", function () {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      header.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    } else {
      header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
    }

    lastScroll = currentScroll;
  });

  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe service cards and contact items for animation
  const animatedElements = document.querySelectorAll(
    ".service-card, .contact-item, .contact-cta, .about-content"
  );

  animatedElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(element);
  });
});

// Add year to footer dynamically
const footer = document.querySelector(".footer-text");
if (footer) {
  const currentYear = new Date().getFullYear();
  footer.innerHTML = footer.innerHTML.replace("2025", currentYear);
}

// ===== CONTACT FORM HANDLING =====

// File upload handling
const fileInput = document.getElementById("photos");
const fileUploadArea = document.querySelector(".file-upload-area");
const fileList = document.getElementById("fileList");
let selectedFiles = [];

if (fileInput && fileUploadArea) {
  // Click to upload
  fileUploadArea.addEventListener("click", () => {
    fileInput.click();
  });

  // Drag and drop
  fileUploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = "var(--color-primary)";
    fileUploadArea.style.backgroundColor = "rgba(190, 142, 96, 0.1)";
  });

  fileUploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = "rgba(190, 142, 96, 0.4)";
    fileUploadArea.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
  });

  fileUploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = "rgba(190, 142, 96, 0.4)";
    fileUploadArea.style.backgroundColor = "rgba(255, 255, 255, 0.05)";

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  });

  // File input change
  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  });
}

function handleFiles(files) {
  // Validate and filter files
  const validFiles = files.filter((file) => {
    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      showFormMessage("Please upload only image files.", "error");
      return false;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showFormMessage(`${file.name} is too large. Max size is 10MB.`, "error");
      return false;
    }

    return true;
  });

  // Limit to 5 files
  const totalFiles = selectedFiles.length + validFiles.length;
  if (totalFiles > 5) {
    showFormMessage("Maximum 5 photos allowed.", "error");
    return;
  }

  // Add to selected files
  selectedFiles = selectedFiles.concat(validFiles);

  // Update display
  updateFileList();
}

function updateFileList() {
  if (!fileList) return;

  fileList.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
            <span>📎 ${file.name} (${formatFileSize(file.size)})</span>
            <button type="button" class="file-remove" data-index="${index}" aria-label="Remove file">✕</button>
        `;
    fileList.appendChild(fileItem);
  });

  // Add remove listeners
  document.querySelectorAll(".file-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      selectedFiles.splice(index, 1);
      updateFileList();
    });
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Form submission handling
const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable submit button
    submitBtn.disabled = true;
    document.querySelector(".btn-text").style.display = "none";
    document.querySelector(".btn-loader").style.display = "inline";

    // Hide any previous messages
    formMessage.className = "form-message";
    formMessage.textContent = "";

    try {
      // Create FormData object
      const formData = new FormData(contactForm);

      // Add selected files
      selectedFiles.forEach((file, index) => {
        formData.append(`photo_${index}`, file);
      });

      // Submit form to Formspree or your backend
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        // Success
        showFormMessage(
          "Thank you! Your quote request has been sent. We'll contact you within 24 hours.",
          "success"
        );
        contactForm.reset();
        selectedFiles = [];
        updateFileList();
      } else {
        // Error from server
        const data = await response.json();
        throw new Error(data.error || "Failed to send form");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showFormMessage(
        "Sorry, there was an error sending your request. Please try emailing us directly at office@muletownmilling.com",
        "error"
      );
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      document.querySelector(".btn-text").style.display = "inline";
      document.querySelector(".btn-loader").style.display = "none";
    }
  });
}

function showFormMessage(message, type) {
  if (!formMessage) return;

  formMessage.className = `form-message ${type}`;
  formMessage.textContent = message;

  // Auto-hide error messages after 5 seconds
  if (type === "error") {
    setTimeout(() => {
      formMessage.className = "form-message";
      formMessage.textContent = "";
    }, 5000);
  }
}
