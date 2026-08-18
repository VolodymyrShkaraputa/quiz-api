export type TrialSlot = {
  tutorId: string;
  timeStart: string;
  timeEnd: string;
  slotId?: string;
};

export function getLessonEndTime(timeStart: string): string {
  const end = new Date(timeStart);
  end.setMinutes(end.getMinutes() + 29);
  return end.toISOString();
}

export function isValidFutureSlot(timeStart: string): boolean {
  const start = new Date(timeStart).getTime();
  return Number.isFinite(start) && start > Date.now();
}
