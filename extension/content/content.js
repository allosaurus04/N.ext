// DOM scraping using NEW DASHBOARD UI
const domain = window.location.origin;
const current_page = window.location.pathname;
let MaxDeadlines = 6;
let LookAheadDays = 30;
let DisableUI = false;

function checkDashboardReady() {
  if (current_page !== "/" && current_page !== "") return;

  const callback = (mutationList) => {
    for (const mutation of mutationList) {
      if (
        mutation.type === "childList" &&
        mutation.target === document.querySelector("#DashboardCard_Container")
      ) {
        chrome.storage.local.get("isEnabledDeadline", (result) => {
          if (result.isEnabledDeadline) {
            getDeadlines();
          }
        });
      }
    }
  };

  var config = { attributes: true, childList: true, characterData: true, subtree: true}

  const observer = new MutationObserver(callback);
  observer.observe(document.querySelector("html"), config);
}

if (domain.includes("canvas")) {
  console.log("Running N.ext");
  checkDashboardReady();
}

// console check before getDeadlines function 
// fetch('/api/v1/planner/items?per_page=10')
//   .then(r => r.json())
//   .then(console.log)

// connect back to popup user preferences
function getDeadlines() {
    chrome.storage.local.get( ["MaxDeadlines", "LookAheadDays", "DisableUI"], 
        function (result) {
            MaxDeadlines = result.MaxDeadlines;
            LookAheadDays = result.LookAheadDays;
            DisableUI = result.DisableUI;

            const futureDate = new Date(Date.now() + LookAheadDays * 86400000);
            async function fetchDeadlines() {
                const response = await fetch(
                    `/api/v1/planner/items?end_date=${futureDate.toISOString()}&per_page=${MaxDeadlines}`
                );
                const data = await response.json();
                const uncompletedTasks = data.filter(
                    task => task.submissions === false || !task.submissions?.submitted
                );
                injectTasks(uncompletedTasks);
            }
            fetchDeadlines().catch(e => console.error("Error fetching deadlines", e));
        }

    );
}

const URGENCY = {
  overdue: "#fc07be", // red
  soon:    "#EC2F2F", //<1 day
  near:    "#be7420", //<3 days
  ok:      "#2A9028", 
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function makeEl(tag, className, parent, text = "") {
  const el = document.createElement(tag);
  if (className) el.classList.add(className);
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

  const mins  = Math.floor(msLeft / 60_000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  const color = days < 1 ? URGENCY.soon : days < 3 ? URGENCY.near : URGENCY.ok;
  const tail  = ` • ${shortDate(date)}`;
  const plural = (n) => (n === 1 ? "" : "s");

  if (months>= 1) return { label: `In ${months} month${plural(months)}${tail}`, color} ;
  if (days>= 1) return { label: `In ${days} day${plural(days)}${tail}`, color};
  if (hours>= 1) return { label: `In ${hours} hour${plural(hours)}${tail}`, color} ;
  if (mins>= 1) return { label: `In ${mins} min${plural(mins)}${tail}`, color};
  return { label: `In ${Math.floor(msLeft / 1000)} sec${tail}`, color};
}

function alreadyInjected() {
  return (
    document.querySelector(".ic-DashboardCard") && document.querySelector(".container")
  );
}

function getCourseId(card) {
  const href = card.querySelector(".ic-DashboardCard__link")?.getAttribute("href");
  const match = href?.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function injectTasks(data) {
  if (alreadyInjected()) return;

  try {
    document.querySelectorAll(".ic-DashboardCard").forEach((card) => {
      const courseId = getCourseId(card);
      if (courseId === null) return;

      const btn = document.createElement("button");
      btn.className = "download-btn";
      btn.innerHTML = `<img class="download-btn-img" src="${chrome.runtime.getURL("assets/download.png")}">`;
      card.querySelector(".ic-DashboardCard__header_image").appendChild(btn);

      const container = makeEl("div", "container", card);
      const header = makeEl("div", "header-container", container);

      const tasks = data.filter(
        (t) =>
          t.course_id === courseId &&
          (t.plannable_type === "assignment" || t.plannable_type === "quiz")
      );

      let count = 0;
      for (const task of tasks) {
        if (count >= MaxDeadlines) break;

        const deadline = describeDeadline(task.plannable_date);
        if (!deadline) continue;
        count++;

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
      }

      makeEl("h3", "card-header", header, `Deadlines (${count})`);

      if (count === 0) {
        const row = makeEl("div", "deadline-container", container);
        row.style.fontSize = "13px";
        makeEl("p", "deadline-empty", row, "Have a break, have a kit-kat.");
      }
    });
  } catch (e) {
    console.log(e);
  }
}

// TODO: js for filedownloader. how to connect, download png
