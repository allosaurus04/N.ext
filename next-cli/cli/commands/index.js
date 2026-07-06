//presentation of deadlines and files in the CLI

const { createClient } = require('./core/api');
const { getDeadlines } = require('./deadlines');

const BASE_URL = 'https://canvas.nus.edu.sg/api/v1';

async function main() {
  const [command] = process.argv.slice(2);

  const token = process.env.CANVAS_TOKEN;
  if (!token) {
    console.error('No CANVAS_TOKEN');
    process.exit(1);
  }

  const client = createClient({ baseUrl: BASE_URL, token });

  switch (command) {
    case 'deadlines': {
      const deadlines = await getDeadlines(client, {LookAheadDays = 30});
      printDeadlines(deadlines);
      break;
    }
    case 'files': {
        const files = await downloadCourseFiles(client); // TODO
        printFiles(files);
        break;
    };
    default:
      console.log('Usage: next <command>');
      console.log('');
      console.log('Commands:');
      console.log('  deadlines   Show upcoming uncompleted deadlines');
  }
}

function printDeadlines(deadlines) {
  if (deadlines.length === 0) {
    console.log('No upcoming deadlines. Have a break, have a kit-kat.');
    return;
  }

  for (const d of deadlines) {
    console.log(`${daysLeft(d.due)}  ${d.title}  [${d.course}]`);
  }
}
// connection between index.js and deadlines.js : getDeadlines() returns an array of objects shaped like { due, title, course }

function daysLeft(due) {
  const msLeft = due.getTime() - Date.now();
  if (msLeft <= 0) return 'OVERDUE';
 
  const days = Math.floor(msLeft / 86_400_000);
  if (days >= 1) return `in ${days}d`.padEnd(7);
 
  const hours = Math.floor(msLeft / 3_600_000);
  return `in ${hours}h`.padEnd(7);
}
 

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});