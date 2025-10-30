const form = document.getElementById("contactForm");
const responseMessage = document.getElementById("responseMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.querySelector("input[name='name']").value;
  const email = form.querySelector("input[name='email']").value;
  const message = form.querySelector("textarea[name='message']").value;

  responseMessage.textContent = "⏳ Sending...";
  responseMessage.style.color = "#ffb301";

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await res.json();
    console.log("📥 Server response:", data);

    if (res.ok && data.success) {
      responseMessage.textContent = "✅ Message sent successfully!";
      responseMessage.style.color = "#00ff88";
      form.reset();
    } else {
      responseMessage.textContent = "❌ Failed to send. Try again.";
      responseMessage.style.color = "#ff4d4d";
    }
  } catch (error) {
    console.error("⚠️ Connection error:", error);
    responseMessage.textContent = "⚠️ Server not responding. Try again.";
    responseMessage.style.color = "#ff4d4d";
  }
});