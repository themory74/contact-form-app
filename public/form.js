// form.js — final deluxe version (popup visual edition)

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

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value,
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

// popup control
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