export function convertRange(
  value: number,
  sourceRange: [number, number],
  targetRange: [number, number],
) {
  return (
    ((value - sourceRange[0]) * (targetRange[1] - targetRange[0])) /
      (sourceRange[1] - sourceRange[0]) +
    targetRange[0]
  );
}
