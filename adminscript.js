const adminList = document.getElementById("adminList");
const searchInput = document.getElementById("searchInput");
const sortBtn = document.getElementById("sortBtn");
const sortMenu = document.getElementById("sortMenu");

const detailPopup = document.getElementById("detailPopup");
const closeDetail = document.getElementById("closeDetail");
const detailImg = document.getElementById("detailImg");
const detailStatus = document.getElementById("detailStatus");
const detailDate = document.getElementById("detailDate");
const detailLocation = document.getElementById("detailLocation");
const detailFacility = document.getElementById("detailFacility");
const detailDesc = document.getElementById("detailDesc");

let currentReports = JSON.parse(localStorage.getItem("reports")) || [];

function saveReports() {
  localStorage.setItem("reports", JSON.stringify(currentReports));
}

function normalizeStatus(status) {
  if (status === "Issued") return "Reported";
  return status || "Reported";
}

function renderReports(reportsToShow = currentReports) {
  adminList.innerHTML = "";

  if (reportsToShow.length === 0) {
    adminList.innerHTML = `<p class="no-data">No reports found.</p>`;
    return;
  }

  reportsToShow.forEach((report) => {
    const realIndex = currentReports.indexOf(report);
    const row = document.createElement("div");
    row.className = "report-row";

    row.innerHTML = `
      <span>${report.area || "-"}</span>
      <span>${report.facility || "-"}</span>

      <div class="status-wrapper">
        <button class="status-btn" data-index="${realIndex}">
          ${normalizeStatus(report.status)}
        </button>

        <div class="status-menu">
          <div class="status-option" data-status="Reported" data-index="${realIndex}">Reported</div>
          <div class="status-option" data-status="In-Progress" data-index="${realIndex}">In-Progress</div>
          <div class="status-option" data-status="Fixed" data-index="${realIndex}">Fixed</div>
        </div>
      </div>

      <button class="view-detail" data-index="${realIndex}">
        View details
      </button>
    `;

    adminList.appendChild(row);
  });
}

adminList.addEventListener("click", (e) => {
    if (e.target.classList.contains("status-btn")) {
        const wrapper = e.target.closest(".status-wrapper");
        const menu = wrapper.querySelector(".status-menu");
        const rect = e.target.getBoundingClientRect();

        document.querySelectorAll(".status-menu").forEach(m => {
            if (m !== menu) m.style.display = "none";
        });

        menu.style.left = `${rect.left - 12}px`;
        menu.style.top = `${rect.bottom + 4}px`;

        menu.style.display = menu.style.display === "block" ? "none" : "block";
    }

  if (e.target.classList.contains("status-option")) {
    const index = e.target.dataset.index;
    const newStatus = e.target.dataset.status;

    currentReports[index].status = newStatus;
    saveReports();
    renderReports();
  }

  if (e.target.classList.contains("view-detail")) {
    const index = e.target.dataset.index;
    const report = currentReports[index];

    detailImg.src = report.image || "";
    detailStatus.textContent = `Status: ${normalizeStatus(report.status)}`;
    detailDate.textContent = `Date: ${report.date || "-"}`;
    detailLocation.textContent = `Location: ${report.area || "-"}`;
    detailFacility.textContent = `Facility: ${report.facility || "-"}`;
    detailDesc.textContent = report.description || "No description";

    detailPopup.classList.remove("hidden");
  }
});

closeDetail.addEventListener("click", () => {
  detailPopup.classList.add("hidden");
});

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();

  const filtered = currentReports.filter(report => {
    return `
      ${report.area}
      ${report.facility}
      ${normalizeStatus(report.status)}
      ${report.date}
      ${report.description}
    `.toLowerCase().includes(keyword);
  });

  renderReports(filtered);
});

sortBtn.addEventListener("click", () => {
  sortMenu.style.display = sortMenu.style.display === "block" ? "none" : "block";
});

document.querySelectorAll(".sort-item").forEach(item => {
  item.addEventListener("click", () => {
    const sortType = item.dataset.sort;

    currentReports = JSON.parse(localStorage.getItem("reports")) || [];

    if (sortType === "latest") {
      currentReports.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (sortType === "oldest") {
      currentReports.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (["19th", "7th", "6th", "LG"].includes(sortType)) {
      const filtered = currentReports.filter(report => report.area?.startsWith(sortType));
      renderReports(filtered);
      sortMenu.style.display = "none";
      return;
    }

    renderReports();
    sortMenu.style.display = "none";
  });
});

window.addEventListener("click", (e) => {
  if (!e.target.closest(".status-wrapper")) {
    document.querySelectorAll(".status-menu").forEach(menu => {
      menu.style.display = "none";
    });
  }

  if (!e.target.closest(".sort-wrapper")) {
    sortMenu.style.display = "none";
  }
});

renderReports();
