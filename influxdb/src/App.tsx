import "./App.css";

import {
  InfluxDB,
  Point,
  HttpError,
} from "@influxdata/influxdb-client-browser";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  limit,
  query,
  getDocs,
} from "firebase/firestore";
import { useEffect } from "react";
import { url, token, org, bucket } from "./env";

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

// Initialize InfluxDB
const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, "s");

const migrateData = () => {
  const observations = collection(db, "observations");

  getDocs(query(observations, limit(1000))).then((snap) =>
    snap.forEach((doc) => {
      const d = doc.data();
      const point = new Point("observation")
        .tag("latitude", d.conlati)
        .tag("longitude", d.conlongi)
        .floatField("bar", d.bar)
        .floatField("dew", d.dew)
        .floatField("humOut", d.humout)
        .floatField("temperatureOut", d.tempout)
        .floatField("gustDir", d.gustdir)
        .floatField("gustSpeed", d.gust)
        .floatField("windDir", d.winddir)
        .floatField("windSpeed", d.windspd)
        .timestamp(new Date(d.utctime * 1000));
      writeApi.writePoint(point);

      try {
        writeApi.close().then(() => {
          console.log("FINISHED Writing");
        });
      } catch (e) {
        console.error(e);
        if (e instanceof HttpError && e.statusCode === 401) {
          console.log("Run ./onboarding.js to setup a new InfluxDB database.");
        }
        console.log("\nFinished ERROR");
      }
    })
  );
};

function App() {
  return (
    <div>
      <h1>InfluxDB</h1>
      <button onClick={() => migrateData()}>Migrate</button>
    </div>
  );
}

export default App;
