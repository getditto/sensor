import express from "express";
import si, { mem } from "systeminformation";
import os from "os"
import { Ditto, Register, Logger } from "@dittolive/ditto";

const PORT = process.env.PORT || 9080;
const app = express();

// setup Ditto
const ditto = new Ditto({
  type: "offlinePlayground",
  appID: '5e5a4055-ad8b-4123-923d-6e025d572def'
});

ditto.setOfflineOnlyLicenseToken('o2d1c2VyX2lkZURpdHRvZmV4cGlyeXgYMjAyMy0xMC0wMVQwNjo1OTo1OS45OTlaaXNpZ25hdHVyZXhYam5JYXU4WlBiV0VBZUdLR2VYZ0N2YVJxSFQ5dzdwMnFMQTRPV0UxUDEwRDd3ZkxSUE1JNXpMNDNSU01LTVNpeGNRMElnN1B2WDUzeUI5TW51VWozVVE9PQ==')

// Chris Boross said: Here is the Linux + Node.js workaround Tom gave me for BT-LE on the Pi
ditto
  .updateTransportConfig((transportConfig) => {
    transportConfig.setAllPeerToPeerEnabled(true)
  })

try {
  ditto.startSync()  
} catch(err) {
  console.log(`Error starting Ditto`, err)
}

let readings: { createdOn: string, memoryPercentage: number, cpuTemperature: number}[] = []

setInterval(async () => {
  try {
    const hostname = os.hostname()
    const cpuTemperature = (await si.cpuTemperature()).main
    const memory = await si.mem()
    const memoryPercentage = memory.used / memory.total
    const createdOn = new Date().toISOString()
    
    readings.push({
      createdOn,
      memoryPercentage,
      cpuTemperature
    })
    
    if (readings.length > 30) {
      // remove if there are more,
      readings = readings.slice(-30);
    }
    
    if (readings.length == 30) {
      await ditto.store.collection('readings').upsert({
        _id: hostname,
        readings: new Register(readings)
      })
    }
  } catch (error) {
    console.log(`Error polling system information`, error)
  }
}, 500);

app.get("/", (req, res) => {
  res.json({ hello: "world2" });
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
