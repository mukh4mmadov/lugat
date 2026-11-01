// YYYY-MM-DD in the learner's own time zone, so a study day ends at local midnight.
export function dailyKey(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
