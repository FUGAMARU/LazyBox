export const ensureNickname = (
  nickname: string | undefined,
  target: "myself" | "otherUser"
): string => {
  if (nickname !== undefined) return nickname

  if (target === "myself") return "あなた"
  return "(ニックネーム未設定)"
}
