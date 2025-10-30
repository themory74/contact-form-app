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
    const response = await fetch("https://contact-form-app-84vz.onrender.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log("✅ Message sent successfully!");
      responseMessage.textContent = "✅ Message sent successfully!";
      responseMessage.className = "message success";
      form.reset();
    } else {
      console.error("❌ Server response:", data);
      responseMessage.textContent = "❌ Failed to send. Please try again later.";
      responseMessage.className = "message error";
    }
  } catch (error) {
    console.error("⚠️ Connection error:", error);
    responseMessage.textContent = "⚠️ Connection error. Try again.";
    responseMessage.className = "message error";
  }
});