import { HttpError, Point } from "@influxdata/influxdb-client-browser";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  limit,
  query,
  getDocs,
  startAt,
  orderBy,
} from "firebase/firestore";
import React, { useState } from "react";
import { getWriteApi } from "./influx-api";

const firebaseConfig = {
  apiKey: "AIzaSyCP8oWKwX6YiA9LXPnWmnnObOlNhz4OmB8",
  authDomain: "wifilogger-api.firebaseapp.com",
  databaseURL: "https://wifilogger-api.firebaseio.com",
  projectId: "wifilogger-api",
  storageBucket: "wifilogger-api.appspot.com",
  messagingSenderId: "442272046235",
  appId: "1:442272046235:web:2052d15bbb9dfd2be4ba3e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const writeApi = getWriteApi("weather");

const useMigrate = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Migrate data from Firestore to InfluxDB
  const migrateData = async () => {
    setIsLoading(true);

    const observations = collection(db, "observations");
    const points: Point[] = [];

    const snap = await getDocs(
      query(observations, orderBy("utctime"), startAt(1605343501), limit(10000))
    );
    let i = 0;
    console.log(`Getting ${snap.size} documents`);
    snap.forEach((doc) => {
      const d = doc.data();

      if (!i || i === snap.size - 1) {
        console.log(i ? "end" : "start", d, d.utctime);
      }
      i++;

      let point = new Point("observation")
        .tag("ip", d.ip)
        .tag("latitude", (+d.conlati / 10).toFixed(4))
        .tag("longitude", (+d.conlongi / 10).toFixed(4))
        .tag("macAddress", d.mac)
        .tag("ssid", d.ssid)
        .tag("stationName", d.stnname)
        .tag("version", d.ver)
        .tag("wifiLoggerVersion", d.wflver)
        .timestamp(new Date(d.utctime * 1000));

      if (d.winddir) {
        point = point.intField("windDir", d.winddir);
      }
      if (d.windspd) {
        point = point.floatField("windSpeed", d.windspd);
      }
      if (d.bar) {
        point = point.floatField("bar", d.bar);
      }
      if (d.dew) {
        point = point.floatField("dew", d.dew);
      }
      if (d.humout) {
        point = point.floatField("humOut", d.humout);
      }
      if (d.tempout) {
        point = point.floatField("temperatureOut", d.tempout);
      }
      if (d.gust) {
        point = point.floatField("gustSpeed", d.gust);
      }
      if (d.humin) {
        point = point.floatField("humIn", d.humin);
      }
      if (d.tempin) {
        point = point.floatField("temperatureIn", d.tempin);
      }
      if (d.gustdir) {
        // TODO: convert to intField
        point = point.intField("gustDir", d.gustdir);
      }
      if (d.windavg2) {
        point = point.floatField("windAverage2", d.windavg2);
      }
      if (d.windavg10) {
        point = point.floatField("windAverage10", d.windavg10);
      }
      if (d.storm) {
        point = point.floatField("storm", d.storm);
      }
      if (d.rain15) {
        point = point.floatField("rain15", d.rain15);
      }
      if (d.rain1h) {
        point = point.floatField("rain1h", d.rain1h);
      }
      if (d.rain24) {
        point = point.floatField("rain24", d.rain24);
      }
      if (d.raind) {
        point = point.floatField("raind", d.raind);
      }
      if (d.rainmon) {
        point = point.floatField("rainmon", d.rainmon);
      }
      if (d.rainr) {
        point = point.floatField("rainr", d.rainr);
      }
      if (d.rainyear) {
        point = point.floatField("rainyear", d.rainyear);
      }
      if (d.heat) {
        point = point.intField("heat", d.heat);
      }
      if (d.chill) {
        point = point.intField("chill", d.chill);
      }
      if (d.uptime) {
        point = point.intField("uptime", d.uptime);
      }
      points.push(point);
    });

    try {
      writeApi.writePoints(points);
      writeApi.close().then(() => {
        console.log("FINISHED Writing");
        setIsLoading(false);
      });
    } catch (e) {
      console.error(e);
      if (e instanceof HttpError && e.statusCode === 401) {
        console.log("Run ./onboarding.js to setup a new InfluxDB database.");
      }
      console.log("\nFinished ERROR", e);
      setIsLoading(false);
    }
  };

  return { isLoading, migrateData };
};

const Firestore = () => {
  const { isLoading, migrateData } = useMigrate();

  return (
    <>
      <h2>Import from Firestore</h2>
      <button disabled={isLoading} onClick={() => migrateData()}>
        Import
      </button>
    </>
  );
};

export default Firestore;
