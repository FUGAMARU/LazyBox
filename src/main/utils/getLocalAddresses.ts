import os from "os"

// https://qiita.com/_shimizu/items/b38d1459abf8436f7f1f
export const getLocalAddresses = (): string[] => {
  const ipList: string[] = []
  const interfaces = os.networkInterfaces()

  for (const dev in interfaces) {
    interfaces[dev]?.forEach(details => {
      if (!details.internal && details.family === "IPv4") {
        ipList.push(details.address)
      }
    })
  }
  return ipList
}
