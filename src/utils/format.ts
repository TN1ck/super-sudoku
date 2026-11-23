export function formatDuration(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const secondRest = safeSeconds % 60;

  const minuteString = minutes < 10 ? `0${minutes}` : String(minutes);
  const secondString = secondRest < 10 ? `0${secondRest}` : String(secondRest);

  return `${minuteString}:${secondString} min`;
}
