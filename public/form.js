// form.js — True Prime Digital Edition (includes phone field + popup visual)

const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const popup = document.getElementById("popup");
const popupContent = document.getElementById("popupContent");
const popupTitle = document.getElementById("popupTitle");
const popupText = document.getElementById("popupText");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Sending...";
  submitBtn.style.opacity = "0.7";

  // ✅ Include phone field
  const formData = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(), // new
    message: document.getElementById("message").value.trim(),
  };

  try {
    const response = await fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      showPopup("Success!", "Your message has been sent successfully.", true);
      form.reset();
    } else {
      showPopup("Error", "Something went wrong. Please try again.", false);
    }
  } catch (error) {
    console.error("Error:", error);
    showPopup("Network Error", "Unable to connect. Please try again later.", false);
  }

  submitBtn.disabled = false;
  submitBtn.textContent = originalText;
  submitBtn.style.opacity = "1";
});

// ✅ Popup Control
function showPopup(title, text, success = true) {
  popupTitle.textContent = title;
  popupText.textContent = text;

  popupContent.classList.remove("success", "error");
  popupContent.classList.add(success ? "success" : "error");

  popup.classList.add("active");

  setTimeout(() => {
    popup.classList.remove("active");
  }, 3000);
}