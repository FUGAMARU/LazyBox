export const getNextResetUnixTimestamp = (targetHour: number): number => {
  const now = new Date()
  const targetDate =
    now.getHours() < targetHour ? now : new Date(now.getTime() + 24 * 60 * 60 * 1000)

  targetDate.setHours(targetHour, 0, 0, 0)

  return Math.floor(targetDate.getTime() / 1000)
}
