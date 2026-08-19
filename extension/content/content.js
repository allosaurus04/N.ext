const domain = window.location.origin;
const current_page = window.location.pathname;
const DOWNLOAD_ICON = `
<svg class="download-btn-img" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
  <circle cx="16" cy="16" r="16" fill="#1A0F14"/>
  <path d="M16 8v11m0 0l-4.5-4.5M16 19l4.5-4.5" fill="none" stroke="#fff"
        stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10 22h12" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

// Canvas has renamed this element before; try newest first.
const HEADER_SELECTORS = [
  ".ic-DashboardCard__header",
  ".ic-DashboardCard__header_hero",
  ".ic-DashboardCard__header_content",
];

let MaxDeadlines = 6;
let LookAheadDays = 30;
let currentTasks = [];
let justCompleted = false;
let isFetching = false;
// eslint-disable-next-line no-unused-vars
let DisableUI = false;

function checkDashboardReady() {
  if (current_page !== "/" && current_page !== "") return;
  console.log("N.ext: observer attaching");

  const callback = () => {
    if (!document.querySelector(".ic-DashboardCard")) return;
    if (alreadyInjected() || isFetching) return;

    chrome.storage.sync.get({ isEnabledDeadline: true }, (result) => {
      if (result.isEnabledDeadline) getDeadlines();
    });
  };

  const config = { attributes: true, childList: true, characterData: true, subtree: true };
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, config);
}

if (domain.includes("canvas")) {
  console.log("Running N.ext");
  checkDashboardReady();
}

function checkCompletions(tasks, ignored, done) {
  const currentIds = tasks.map(t => t.plannable_id);
  chrome.storage.local.get({ lastSeenTasks: [] }, ({ lastSeenTasks }) => {
    justCompleted = lastSeenTasks.some(
      id => !currentIds.includes(id) && !ignored.has(id)
    );
    chrome.storage.local.set({ lastSeenTasks: currentIds }, done);
  });
}

function getDeadlines() {
  isFetching = true;

  chrome.storage.sync.get(
    { MaxDeadlines: 6, LookAheadDays: 30, DisableUI: false, ignoredTasks: [] },
    function (result) {
      MaxDeadlines = result.MaxDeadlines;
      LookAheadDays = result.LookAheadDays;
      DisableUI = result.DisableUI;
      const ignored = new Set(result.ignoredTasks);

      const futureDate = new Date(Date.now() + LookAheadDays * 86400000);

      // per_page is a GLOBAL cap on planner items, not per course.
      // MaxDeadlines is applied per card in renderDeadlines().
      async function fetchDeadlines() {
        const response = await fetch(
          `/api/v1/planner/items?end_date=${futureDate.toISOString()}&per_page=100`
        );
        if (!response.ok) throw new Error(`Planner API ${response.status}`);

        const data = await response.json();
        console.log("N.ext: planner items received:", data.length);

        const uncompletedTasks = data.filter(task =>
          (task.plannable_type === "assignment" || task.plannable_type === "quiz") &&
          (task.submissions === false || !task.submissions?.submitted) &&
          !ignored.has(task.plannable_id)
        );
        console.log(
          "N.ext: after filtering:", uncompletedTasks.length,
          "| ignored ids:", [...ignored]
        );

        currentTasks = uncompletedTasks;
        injectTasks(uncompletedTasks);

        checkCompletions(uncompletedTasks, ignored, () => {
          if (justCompleted) {
            refreshLinusMood();
            setTimeout(() => {
              justCompleted = false;
              refreshLinusMood();
            }, 8000);
          }
        });
      }

      fetchDeadlines()
        .catch((e) => console.error("N.ext: error fetching deadlines", e))
        .finally(() => { isFetching = false; });
    }
  );
}
const URGENCY = {
  overdue: "#fc07be",
  soon:    "#EC2F2F", //<1 day
  near:    "#be7420", //<3 days
  ok:      "#2A9028",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function makeEl(tag, className, parent, text = "") {
  const el = document.createElement(tag);
  if (className) el.classList.add(...className.split(" "));
  if (text) el.textContent = text;
  parent.appendChild(el);
  return el;
}

function shortDate(date) {
  const d = new Date(date);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function describeDeadline(date) {
  const msLeft = new Date(date).getTime() - Date.now();

  if (msLeft <= 0) return { label: "OVERDUE", color: URGENCY.overdue };
  if (msLeft > LookAheadDays * 86_400_000) return null;

  const mins   = Math.floor(msLeft / 60_000);
  const hours  = Math.floor(mins / 60);
  const days   = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  const color  = days < 1 ? URGENCY.soon : days < 3 ? URGENCY.near : URGENCY.ok;
  const tail   = ` • ${shortDate(date)}`;
  const plural = (n) => (n === 1 ? "" : "s");

  if (months >= 1) return { label: `In ${months} month${plural(months)}${tail}`, color };
  if (days   >= 1) return { label: `In ${days} day${plural(days)}${tail}`, color };
  if (hours  >= 1) return { label: `In ${hours} hour${plural(hours)}${tail}`, color };
  if (mins   >= 1) return { label: `In ${mins} min${plural(mins)}${tail}`, color };
  return { label: `In ${Math.floor(msLeft / 1000)} sec${tail}`, color };
}

// Scoped to our own class so Canvas's generic .container can't block injection.
function alreadyInjected() {
  return document.querySelector(".ic-DashboardCard .next-container") !== null;
}

function getCourseId(card) {
  const href = card.querySelector(".ic-DashboardCard__link")?.getAttribute("href");
  const match = href?.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function injectDownloadButton(card, courseId) {
  if (card.querySelector(".download-btn")) return;

  const header = HEADER_SELECTORS.map((s) => card.querySelector(s)).find(Boolean);
  if (!header) {
    console.warn("N.ext: no card header found for course", courseId);
    return;
  }

  const btn = document.createElement("button");
  btn.dataset.courseId = courseId;
  btn.className = "download-btn";
  btn.setAttribute("aria-label", "Download course files");
  btn.innerHTML = DOWNLOAD_ICON;
  header.appendChild(btn);
}

function getTasksForCourse(data, courseId) {
  return data.filter(
    (t) =>
      t.course_id === courseId &&
      (t.plannable_type === "assignment" || t.plannable_type === "quiz")
  );
}

function renderDeadlineRow(container, task, deadline) {
  const row = makeEl("div", "deadline-container", container);
  const title = task.plannable.title;

  const name = makeEl(
    "a",
    "deadline-text",
    row,
    title.length > 14 ? title.slice(0, 14) + "..." : title
  );
  name.href = task.html_url;
  name.title = title;
  name.style.fontSize = "13px";

  const countdown = makeEl("div", "deadline-countdown", row, deadline.label);
  countdown.style.fontSize = "13px";
  countdown.style.color = deadline.color;

  const dismiss = makeEl("button", "deadline-dismiss", row, "×");
  dismiss.dataset.plannableId = task.plannable_id;
  dismiss.title = "Ignore this deadline";
}

function renderEmptyState(container) {
  if (container.querySelector(".deadline-empty")) return;
  const row = makeEl("div", "deadline-container next-empty-row", container);
  row.style.fontSize = "13px";
  makeEl("p", "deadline-empty", row, "Have a break, have a kit-kat.");
}

function renderDeadlines(card, tasks) {
  const container = makeEl("div", "container next-container", card);
  const header = makeEl("div", "header-container", container);

  let count = 0;
  for (const task of tasks) {
    if (count >= MaxDeadlines) break;

    const deadline = describeDeadline(task.plannable_date);
    if (!deadline) continue;
    count++;

    renderDeadlineRow(container, task, deadline);
  }

  makeEl("h3", "card-header", header, `Deadlines (${count})`);

  if (count === 0) renderEmptyState(container);
}

function injectTasks(data) {
  document.querySelectorAll(".ic-DashboardCard").forEach((card) => {
    if (card.querySelector(".next-container")) return;

    const courseId = getCourseId(card);
    if (courseId === null) return;

    try {
      injectDownloadButton(card, courseId);
    } catch (e) {
      console.warn("N.ext: download button failed", e);
    }

    try {
      renderDeadlines(card, getTasksForCourse(data, courseId));
    } catch (e) {
      console.error("N.ext: deadline render failed", e);
    }
  });

  refreshLinusMood();
}

function refreshLinusMood() {
  const hasOverdue = currentTasks.some(t => {
    if (!t.plannable_date) return false;
    const due = new Date(t.plannable_date).getTime();
    return !Number.isNaN(due) && due <= Date.now();
  });
  updateLinusMood(currentTasks.length, hasOverdue, justCompleted);
}

document.addEventListener("click", (event) => {
  const btn = event.target.closest(".deadline-dismiss");
  if (!btn) return;
  event.preventDefault();
  event.stopPropagation();

  const id = Number(btn.dataset.plannableId);
  const row = btn.closest(".deadline-container");
  const container = btn.closest(".next-container");
  if (!row || !container) return;

  chrome.storage.sync.get({ ignoredTasks: [] }, ({ ignoredTasks }) => {
    if (!ignoredTasks.includes(id)) ignoredTasks.push(id);

    chrome.storage.sync.set({ ignoredTasks }, () => {
      currentTasks = currentTasks.filter((t) => t.plannable_id !== id);
      row.remove();

      const remaining = container.querySelectorAll(".deadline-dismiss").length;
      const headerEl = container.querySelector(".card-header");
      if (headerEl) headerEl.textContent = `Deadlines (${remaining})`;
      if (remaining === 0) renderEmptyState(container);

      refreshLinusMood();
    });
  });
});

function applyTheme(on) {
  document.documentElement.classList.toggle("next-nus-theme", on);
}
chrome.storage.sync.get({ DisableUI: false }, ({ DisableUI }) => applyTheme(DisableUI));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.DisableUI) applyTheme(changes.DisableUI.newValue);
});