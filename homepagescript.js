document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Elements ---
    const backBtn = document.getElementById('backBtn');
    const logoLink = document.getElementById('logoLink');

    // Go back to homepage
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'homepage.html';
        });
    }

    // Logo click goes to About Us
    if (logoLink) {
        logoLink.addEventListener('click', () => {
            window.location.href = 'aboutus.html';
        });
    }
});

// --- Existing Homepage Functions ---
function toggleSort() {
    const menu = document.getElementById('sortMenu');
    if (menu) menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

function globalSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    
    // 1. Target the main containers (Fixed and Reported sections)
    const sections = document.querySelectorAll('.fixed-facility-section, .progress-section');

    sections.forEach(section => {
        // Find all cards or content items within this section
        const cards = section.querySelectorAll('.searchable-card, .fixed-card-content, .status-row');
        let sectionHasMatch = false;

        // 2. Check every card inside the section
        cards.forEach(card => {
            // We check the innerText of the card/content to see if it matches the query
            const text = card.innerText.toLowerCase();
            if (text.includes(q)) {
                card.style.display = ""; // Restore original display (flex/block)
                sectionHasMatch = true;
            } else {
                card.style.display = "none";
            }
        });

        // 3. SPECIAL CHECK: If the search matches section titles or pills outside cards
        // This ensures "Fixed" or "SL" works even if it's just a label
        const sectionTitleText = section.querySelector('.section-title').innerText.toLowerCase();
        if (sectionTitleText.includes(q)) {
            sectionHasMatch = true;
            // If the title matches, show all cards in this section
            cards.forEach(card => card.style.display = "");
        }

        // 4. Hide/Show the entire section border and container
        if (sectionHasMatch) {
            section.style.display = "block";
        } else {
            section.style.display = "none";
        }
    });
}

function globalSort(crit) {
  const containers = [
    document.getElementById("fixedContainer"),
    document.getElementById("issuedContainer")
  ];

  containers.forEach(cont => {
    if (!cont) return;

    const cards = Array.from(
      cont.querySelectorAll(".report-card, .fixed-card-content")
    );

    cards.forEach(card => {
      card.style.display = "";
    });

    if (crit === "latest" || crit === "recent") {
      cards.sort((a, b) => {
        const dateA = new Date(a.dataset.date || "2000-01-01");
        const dateB = new Date(b.dataset.date || "2000-01-01");

        return crit === "latest" ? dateB - dateA : dateA - dateB;
      });

      cards.forEach(card => cont.appendChild(card));
    } else {
      const target = crit.toLowerCase();

      cards.forEach(card => {
        const floor = (card.dataset.floor || "").toLowerCase();

        if (floor.includes(target)) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    }
  });

  const menu = document.getElementById("sortMenu");
  if (menu) menu.style.display = "none";
}

function scrollSection(id, direction) {

  const container = document.getElementById(id);

  if (!container) return;

  const cards = Array.from(
    container.querySelectorAll(".fixed-card-content")
  );

  if (cards.length === 0) return;

  const containerCenter =
    container.scrollLeft + container.clientWidth / 2;

  let currentIndex = 0;
  let closestDistance = Infinity;

  cards.forEach((card, index) => {

    const cardCenter =
      card.offsetLeft + card.offsetWidth / 2;

    const distance =
      Math.abs(cardCenter - containerCenter);

    if (distance < closestDistance) {

      closestDistance = distance;

      currentIndex = index;
    }
  });

  let nextIndex = currentIndex + direction;

  if (nextIndex >= cards.length) nextIndex = 0;

  if (nextIndex < 0) nextIndex = cards.length - 1;

  const targetLeft =
    cards[nextIndex].offsetLeft -
    container.clientWidth / 2 +
    cards[nextIndex].offsetWidth / 2;

  container.scrollTo({
    left: targetLeft,
    behavior: "smooth"
  });
}

// Global click handler for dropdowns
window.onclick = (e) => {
    const menu = document.getElementById('sortMenu');
    if (menu && !e.target.closest('.sort-wrapper') && !e.target.closest('.btn-action')) {
        menu.style.display = 'none';
    }
}

function loadReportsToHomepage() {

  const issuedContainer = document.getElementById("issuedContainer");
  const fixedContainer = document.getElementById("fixedContainer");

  if (!issuedContainer || !fixedContainer) return;

  const reports = JSON.parse(localStorage.getItem("reports")) || [];

  // =========================
  // CLEAR CONTAINERS
  // =========================
  issuedContainer.innerHTML = "";
  fixedContainer.innerHTML = "";

  // =========================
  // FIXED REPORTS
  // =========================
  const fixedReports = reports.filter(report => report.status === "Fixed");

  fixedReports.forEach(report => {

    const fixedCard = document.createElement("div");

        fixedCard.classList.add("fixed-card-content");

        fixedCard.dataset.date = report.date;

        fixedCard.dataset.floor = report.area
        ? report.area.split(" - ")[0]
        : "";

fixedCard.innerHTML = `
  <div class="image-overlay-wrapper">
    ${
      report.image
      ? `<img src="${report.image}" class="fixed-photo">`
      : `<div class="no-image">No image</div>`
    }

    <div class="status-overlay">
      <span class="status-pill">${report.area}</span>
      <span class="status-pill">${report.facility}</span>
      <span class="status-pill">Fixed</span>
    </div>
  </div>
`;

    fixedContainer.appendChild(fixedCard);
  });

  // =========================
  // ACTIVE REPORTS
  // =========================
  const activeReports = reports.filter(
    report => report.status !== "Fixed"
  );

  activeReports.forEach(report => {

    const card = document.createElement("div");

    card.classList.add("report-card", "searchable-card");

    card.dataset.date = report.date;

    card.dataset.floor = report.area
      ? report.area.split(" - ")[0]
      : "";

    card.innerHTML = `
      <div class="date-box">${report.date || "-"}</div>

      <div class="img-box">
        ${
          report.image
          ? `<img src="${report.image}">`
          : `<div class="no-image">No image</div>`
        }

        <span class="report-status">${report.status}</span>
      </div>

      <div class="info-box">
        (${report.area || "-"}), (${report.facility || "-"})
      </div>
    `;

    issuedContainer.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadReportsToHomepage);
