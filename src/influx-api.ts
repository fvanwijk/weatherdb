import {
  InfluxDB,
  Point,
  HttpError,
} from "@influxdata/influxdb-client-browser";
import { url, token, org } from "./env";

// Initialize InfluxDB
const influxdb = new InfluxDB({ url, token });

export const writeApi = influxdb.getWriteApi(org, "weather", "s");
export const queryApi = influxdb.getQueryApi(org);
