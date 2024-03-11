import os from "os"
import ip from "ip"

// https://qiita.com/niusounds/items/712770e79888f4235637
export const getBroadcastAddresses = (): string[] => {
  const networkInterfaces = os.networkInterfaces()
  const results: string[] = []

  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName]?.forEach(networkInterface => {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if ("IPv4" !== networkInterface.family || networkInterface.internal !== false) return

      const broadcastAddress = ip.or(networkInterface.address, ip.not(networkInterface.netmask))
      results.push(broadcastAddress)
    })
  })

  return results
}
