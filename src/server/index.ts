import express from "express";
import si, { mem } from "systeminformation";
import os from "os"
import { Ditto, Register, Logger } from "@dittolive/ditto";

const PORT = process.env.PORT || 9080;
const app = express();

// setup Ditto
const ditto = new Ditto({
  type: "onlinePlayground",
  token: '26aba87c-25bd-45c8-b46a-eb2f58a695b7',
  appID: 'c420d141-9c4d-4a52-8770-03bf02d43330'
});

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

await ditto.store.collection('readings').findAll().subscribe()

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
