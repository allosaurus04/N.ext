//get deadlines same logic as content.js (fetch, filter, transform)

async function fetchPlannerItems(client, lookAheadDays) {
  const endDate = new Date(Date.now() + lookAheadDays * 86400000);
  return client.paginate('/planner/items', {
    end_date: endDate.toISOString(),
    per_page: 50,
  });
}

function filterUncompleted(items) {
  return items.filter(
    (item) =>
      (item.plannable_type === 'assignment' || item.plannable_type === 'quiz') &&
      !item.submissions?.submitted //same as content.js
  );
}

function toDeadline(item) {
  return {
    course: item.context_name ?? '',
    title: item.plannable.title,
    due: new Date(item.plannable_date),
    url: item.html_url ?? '',
  };
} // {due, title, course}


async function getDeadlines(client, { lookAheadDays = 30 } = {}) {
  const items = await fetchPlannerItems(client, lookAheadDays);
  return filterUncompleted(items)
    .map(toDeadline)
    .sort((a, b) => a.due - b.due);
}

module.exports = {getDeadlines, fetchPlannerItems, filterUncompleted, toDeadline};