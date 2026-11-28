export function replayRange(exam, number) {
  const timeline = exam.audioTimeline;
  const content = exam.content?.[number];
  if (!timeline?.[number]) return null;
  const first = content && content.instruction.includes("물음에 답하십시오") ? content.group[0] : number;
  const source = timeline[first] || timeline[number];
  return { start: source.start, end: source.speechEnd };
}
