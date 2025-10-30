const form = document.querySelector("form");
const responseMessage = document.getElementById("responseMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.querySelector("input[name='name']").value;
  const email = form.querySelector("input[name='email']").value;
  const message = form.querySelector("textarea[name='message']").value;

  responseMessage.textContent = "⏳ Sending...";
  responseMessage.className = "message sending";

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      responseMessage.textContent = "✅ Message sent successfully!";
      responseMessage.className = "message success";
      form.reset();
    } else {
      responseMessage.textContent = "❌ Server error. Please try again later.";
      responseMessage.className = "message error";
    }
  } catch (error) {
    responseMessage.textContent = "⚠️ Connection error. Please try again.";
    responseMessage.className = "message error";
  }
});