document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const responseMessage = document.getElementById("responseMessage");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      // Show loading status
      responseMessage.textContent = "⏳ Sending message...";
      responseMessage.style.color = "#00bfff";
  
      // Collect form data
      const formData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        message: document.getElementById("message").value.trim(),
      };
  
      try {
        // Local testing URL — change to your Render URL later
        const res = await fetch("http://localhost:3000/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
  
        if (res.ok) {
          responseMessage.textContent = "✅ Message sent successfully!";
          responseMessage.style.color = "#00ff88";
          form.reset();
        } else {
          const errorData = await res.json().catch(() => ({}));
          responseMessage.textContent =
            "❌ Server error. " + (errorData.error || "Please try again later.");
          responseMessage.style.color = "red";
        }
      } catch (err) {
        console.error("Error:", err);
        responseMessage.textContent =
          "⚠️ Connection error. Check your backend or network.";
        responseMessage.style.color = "red";
      }
    });
  });