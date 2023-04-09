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
import { useEffect, useState } from "react";
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
const influxdb = new InfluxDB({ url, token });
const writeApi = influxdb.getWriteApi(org, bucket, "s");
const queryApi = influxdb.getQueryApi(org);

const timeFormatter = Intl.DateTimeFormat("nl-NL", {
  dateStyle: "long",
  timeStyle: "short",
}).format;

const temperatureFormatter = Intl.NumberFormat("nl-NL", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const formatCelcius = (value: number) =>
  `${temperatureFormatter.format(((value - 32) * 5) / 9)} ˚C`;

const fluxQuery = `from(bucket: "aggregates")
|> range(start: -1mo)
|> filter(fn: (r) => r["_measurement"] == "max")
|> filter(fn: (r) => r["_field"] == "temperatureOut")
|> yield(name: "max")`;

const useMigrate = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Migrate data from Firestore to InfluxDB
  const migrateData = async () => {
    setIsLoading(true);

    const observations = collection(db, "observations");
    const points: Point[] = [];

    const snap = await getDocs(query(observations, limit(2000)));
    console.log(`Found ${snap.size} documents`);
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
      points.push(point);
    });

    writeApi.writePoints(points);

    try {
      writeApi.close().then(() => {
        console.log("FINISHED Writing");
        setIsLoading(false);
      });
    } catch (e) {
      console.error(e);
      if (e instanceof HttpError && e.statusCode === 401) {
        console.log("Run ./onboarding.js to setup a new InfluxDB database.");
      }
      console.log("\nFinished ERROR");
      setIsLoading(false);
    }
  };

  return { isLoading, migrateData };
};

function App() {
  const { isLoading, migrateData } = useMigrate();

  const [data, setData] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    let allData: Record<string, any>[] = [];
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const rowData = tableMeta.toObject(row);
        allData = [...allData, rowData];
      },
      error(e) {},
      complete() {
        setData(allData.reverse());
      },
    });
  }, []);

  return (
    <div>
      <h1>InfluxDB</h1>
      <h2>Import from Firestore</h2>
      <button disabled={isLoading} onClick={() => migrateData()}>
        Import
      </button>
      <h2>Max daily temperatures last month</h2>
      {data && (
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Temperature</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row._time}>
                <td>{timeFormatter(new Date(row._time))}</td>
                <td>{formatCelcius(row._value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
