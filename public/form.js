const form = document.getElementById("contactForm");
const responseText = document.getElementById("response");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent page refresh

  const formData = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value,
  };

  responseText.textContent = "⏳ Sending...";
  responseText.style.color = "#ffb301";

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    console.log("📬 Response:", data);

    if (res.ok && data.success) {
      responseText.textContent = "✅ Message sent successfully!";
      responseText.style.color = "#00ff88";
      form.reset();
    } else {
      responseText.textContent = "❌ Failed to send message.";
      responseText.style.color = "#ff4d4d";
    }
  } catch (err) {
    console.error("⚠️ Error:", err);
    responseText.textContent = "⚠️ Network or server error.";
    responseText.style.color = "#ff4d4d";
  }
});