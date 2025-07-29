// script.js

// ---------- Event Registration Button (used in event.html) ----------
document.addEventListener("DOMContentLoaded", function () {
  const regForm = document.getElementById("registration-form");
  const regMsg = document.getElementById("message");

  if (regForm) {
    regForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Example: capture data (later you'll send to backend)
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;

      // Simulate success message
      regMsg.style.display = "block";
      regMsg.innerText = `Thank you ${name}, you're registered!`;

      // Reset form
      regForm.reset();
    });
  }

  // ---------- Club Event Proposal Form ----------
  const eventForm = document.getElementById("event-form");
  const proposalMsg = document.getElementById("proposal-msg");

  if (eventForm) {
    eventForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Collect input data
      const title = document.getElementById("title").value;
      const club = document.getElementById("club").value;
      const date = document.getElementById("date").value;

      // Simulate success message
      proposalMsg.style.display = "block";
      proposalMsg.innerText = `Event "${title}" submitted by ${club} for ${date}`;

      // Reset form
      eventForm.reset();
    });
  }

  // ---------- Admin Action Buttons (Approve/Reject) ----------
  const approveButtons = document.querySelectorAll(".btn-success");
  const rejectButtons = document.querySelectorAll(".btn-danger");

  approveButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      alert("✅ Event Approved!");
      btn.parentElement.parentElement.remove(); // Remove row
    });
  });

  rejectButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      alert("❌ Event Rejected!");
      btn.parentElement.parentElement.remove(); // Remove row
    });
  });

  // ---------- Certificate Page Download Button ----------
  const downloadBtn = document.getElementById("download-btn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      window.print(); // Simple print/download
    });
  }
});

// ---------- Login Form Handler (for login.html) ----------

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  console.log("loginForm element:", loginForm);

  if (!loginForm) return;   // nothing to do on other pages

  console.log("🔍 login.js ready on login.html");

  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    console.log("🌀 login submit fired");

    // grab inputs (make sure your form fields use these IDs)
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log({ email, password });

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",   // if you need cookies
        body: JSON.stringify({ email, password })
      });
      console.log("Status:", res.status);

      const data = await res.json();
      console.log("Response body:", data);

      if (res.ok) {
        // Redirect or show success
        window.location.href = "/dashboard.html";
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  });
});
