import { TodoistApi } from "@doist/todoist-api-typescript";
import ical from "node-ical";

const projectName = "Vorlesungen";

const api = new TodoistApi(process.env.TODOIST_API_TOKEN!);

const projects = await api.getProjects();
const project = projects.find(
  (project) =>
    project.name.toLowerCase() ===
    process.env.PROJECT_NAME!.toLowerCase().trim()
);

if (!project) {
  throw new Error(`Project ${projectName} not found`);
}

const iCalUrl = process.env.ICAL_URL!;

const ICS = await fetch(iCalUrl).then((res) => res.text());

const events = ical.sync.parseICS(ICS);

for (const event of Object.values(events) as any) {
  if (event.start) {
    if (new Date(event.start).getTime() > Date.now()) {
      // if event is in the future
      continue;
    }

    if (!isThisWeek(event.start)) {
      // if event is not this week
      continue;
    }

    const dueDay = new Date(event.start);
    dueDay.setHours(12, 0, 0, 0);

    const task = await api.addTask({
      projectId: project.id,
      content: event.summary + ` (${getNiceTime(dueDay)})`,
      //   description: Object.entries(event)
      //     .map(([key, value]) => `${key}: ${value}`)
      //     .join("\n"),
      dueDate: dueDay.toISOString().split("T")[0],
    });
  }
}

function getNiceTime(date: Date) {
  return `${date.getDay()}.${date.getMonth()}`;
}

function isThisWeek(date: Date) {
  const today = new Date();
  const todayWeek = getWeek(today);
  const dateWeek = getWeek(date);
  return todayWeek === dateWeek;
}

function getWeek(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
