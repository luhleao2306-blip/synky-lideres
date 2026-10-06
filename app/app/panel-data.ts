import type { OverviewData } from "./overview-dashboard";
import type { EnergyEntry, ThermometerTrack } from "./additional-experiences";

export type PanelCycle = OverviewData["mirrors"][number] & {
  selfScores: number[];
  teamScores: (number | null)[] | null;
  checkins: { createdAt: string; entryDate: string; note: string }[];
  checkinCount: number;
};
export type PanelData = Omit<OverviewData, "mirrors" | "energyEntries" | "thermometerTracks" | "communicationInvites"> & {
  mirrors: PanelCycle[];
  energyEntries: EnergyEntry[];
  thermometerTracks: ThermometerTrack[];
  communicationInvites?: { token: string; reference_id: string }[];
  mirrorInviteCount: number;
  thermometerRequestCount: number;
  decisionCount: number;
};
export type ActivityEvent = { at: string; kind: "experience" | "practice" };
export const shortDate = (value: string | Date) => new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
const dayKey = (value: Date) => value.getFullYear() + "-" + String(value.getMonth() + 1).padStart(2, "0") + "-" + String(value.getDate()).padStart(2, "0");
const days = (period: number, now: Date) => Array.from({ length: period }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - period + 1 + i));

export function activityEvents(data: PanelData): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const add = (at: string, kind: ActivityEvent["kind"]) => { if (Number.isFinite(new Date(at).getTime())) events.push({ at, kind }); };
  if (data.modules.mirror) data.mirrors.forEach(cycle => { add(cycle.createdAt, "experience"); cycle.checkins.forEach(entry => add(entry.entryDate + "T12:00:00", "practice")); });
  if (data.modules.decisions) data.runs.forEach(entry => add(entry.created_at, "experience"));
  if (data.modules.communication) data.pairs.forEach(entry => add(entry.createdAt, "experience"));
  if (data.modules.energy) data.energyEntries.forEach(entry => add(entry.entryDate + "T12:00:00", "practice"));
  if (data.modules.career) data.careerRuns.forEach(entry => add(entry.createdAt, "experience"));
  if (data.modules.thermometer) data.thermometerTracks.forEach(entry => add(entry.createdAt, "experience"));
  return events;
}

export function activityBuckets(events: ActivityEvent[], period: number, now = new Date()) {
  const calendar = days(period, now);
  const groups = new Map<string, { label: string; range: string; experiences: number; practices: number; dates: string[] }>();
  calendar.forEach((day, i) => {
    const key = period <= 30 ? String(Math.floor(i / 7)) : day.getFullYear() + "-" + day.getMonth();
    let group = groups.get(key);
    if (!group) { group = { label: period <= 30 ? shortDate(day) : day.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }), range: "", experiences: 0, practices: 0, dates: [] }; groups.set(key, group); }
    group.dates.push(dayKey(day));
    group.range = shortDate(group.dates[0] + "T12:00:00") + " a " + shortDate(day);
  });
  const groupsByDay = new Map([...groups.values()].flatMap(group => group.dates.map(day => [day, group] as const)));
  events.forEach(event => { const group = groupsByDay.get(dayKey(new Date(event.at))); if (group) { if (event.kind === "experience") group.experiences++; else group.practices++; } });
  return [...groups.values()];
}

export function energyDays(entries: EnergyEntry[], period: number, now = new Date()) {
  return days(period, now).map(day => {
    const date = dayKey(day);
    const values = entries.filter(entry => entry.entryDate === date && Number.isFinite(entry.energy) && entry.energy >= -2 && entry.energy <= 2);
    return { date, label: shortDate(day), count: values.length, average: values.length ? Math.round(values.reduce((sum, entry) => sum + entry.energy, 0) / values.length * 100) / 100 : null };
  });
}

// Only use aggregates already released by the server. Never infer a team score.
export function eligibleMirrors(cycles: PanelCycle[]) {
  return cycles.filter(cycle => cycle.status === "closed" && cycle.responseCount >= 5 && cycle.teamScores?.some(score => typeof score === "number" && Number.isFinite(score)));
}
export function thermometerRows(track: ThermometerTrack) {
  return track.rounds.filter(round => round.status === "closed" && round.responseCount >= 5 && round.scores?.some(score => typeof score === "number" && Number.isFinite(score))).map(round => {
    const row: Record<string, string | number | null> = { label: shortDate(round.closedAt || round.createdAt), date: round.closedAt || round.createdAt };
    track.dimensions.forEach((_, index) => { row["dimension" + index] = round.scores?.[index] ?? null; });
    return row;
  });
}
