export function formatDuration(seconds: number) {
  seconds = Math.floor(seconds);
  const minutes = Math.floor(seconds / 60);
  const secondRest = seconds % 60;

  const minuteString: string = minutes < 10 ? "0" + minutes : String(minutes);
  const secondString: string = secondRest < 10 ? "0" + secondRest : String(secondRest);

  return minuteString + ":" + secondString + " min";
}
