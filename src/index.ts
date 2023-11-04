import { TodoistApi } from "@doist/todoist-api-typescript";
import { getAllStreams } from "./live";
import { Database } from "bun:sqlite";
import { Cron } from "croner";

const projectName = process.env.PROJECT_NAME;

const api = new TodoistApi(process.env.TODOIST_API_KEY!);

const project = (await api.getProjects()).find(
  (project) =>
    project.name.toLowerCase() ===
    process.env.PROJECT_NAME!.toLowerCase().trim()
)!;

if (!project) {
  throw new Error(`Project ${projectName} not found`);
}
const sectionId = process.env.SECTION_NAME
  ? (await api.getSections()).find(
      (s) =>
        s.name.toLowerCase() === process.env.SECTION_NAME?.toLowerCase() &&
        s.projectId === project.id
    )?.id
  : null;
if (process.env.SECTION_NAME && !sectionId) {
  throw new Error(`Section ${process.env.SECTION_NAME} not found`);
}

const db = new Database("data/todoist.db", {
  create: true,
});

db.query(
  `CREATE TABLE IF NOT EXISTS streams (
    id TEXT PRIMARY KEY
    );`
).run();

function getNiceTime(date: Date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

const startFrom = process.env.START_FROM_DATE
  ? new Date(process.env.START_FROM_DATE).getTime()
  : -Infinity;

async function sync() {
  console.log("Getting streams...");
  const streams = await getAllStreams();

  // filter out streams that are already in the database
  console.log("Filtering streams...");
  const newStreams = streams.filter(
    (stream) =>
      !db.query(`SELECT * FROM streams WHERE id = ?`).all(stream.id).length &&
      stream.start.getTime() > startFrom
  );

  console.log("Adding", newStreams.length, "streams...");
  const promises = newStreams.map((stream) => {
    return (async () => {
      const dueDate = new Date(stream.start);
      dueDate.setHours(12, 0, 0, 0);

      await api.addTask({
        projectId: project.id,
        content: `${stream.slug.toUpperCase()} - ${getNiceTime(dueDate)}`,
        description: stream.url,
        dueDate: dueDate.toISOString().split("T")[0],
        sectionId: sectionId ?? undefined,
      });

      console.log("Added", stream.id);

      db.query(`INSERT INTO streams VALUES (?)`).run(stream.id);
    })();
  });

  await Promise.all(promises);
  console.log("Done");
}

async function run() {
  console.log("Running...", new Date().toISOString());
  await sync();
  console.log(
    `Next run in ${new Date(
      Cron(process.env.CRON!).nextRun()!.getTime() - Date.now()
    ).getMinutes()} minutes`
  );
}

await run();

Cron(process.env.CRON!, run);
