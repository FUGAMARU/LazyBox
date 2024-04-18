export const printColoredText = (
  backgroundColor: "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white",
  text: string
): void => {
  const backgroundColors: { [key: string]: string } = {
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m"
  }
  const reset = "\x1b[0m"
  const bgCode = backgroundColors[backgroundColor]

  console.log(`\n${bgCode}%s${reset}`, text)
}
