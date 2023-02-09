import express from "express";
import si, { mem } from "systeminformation";
import os from "os"
import { Ditto, Register, Logger } from "@dittolive/ditto";

const PORT = process.env.PORT || 9080;
const app = express();

// setup Ditto
const ditto = new Ditto({
  type: "onlinePlayground",
  token: 'deb66bbb-f1b4-46df-9a6b-0b89b81b5b46',
  appID: '31a28b44-d46e-45ad-a266-ce32f4a7abc2'
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

ditto.store.collection('readings').findAll().observeLocal((docs) => {
  console.log(`hostnames that I see ${docs.map(d => d.id).join(', ')}`)
})

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
