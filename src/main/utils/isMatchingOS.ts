export const isMatchingOS = (os: "windows" | "macos" | "linux") => {
  const platform = process.platform
  switch (os) {
    case "windows":
      return platform === "win32"
    case "macos":
      return platform === "darwin"
    case "linux":
      return platform === "linux"
  }
}
