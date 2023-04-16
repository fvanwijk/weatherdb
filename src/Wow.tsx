import { HttpError, Point } from "@influxdata/influxdb-client-browser";
import React, { useState } from "react";
import { getWriteApi } from "./influx-api";

export interface MetOfficeObservation {
  SiteId: string;
  ReportStartDateTime: string;
  ReportEndDateTime: string;
  ObservationType: number;
  SubmissionType: string;
  CollectionName: number;
  SoftwareType: string;
  WindDirection: number;
  WindGustDirection: number;
  WindGust_MilePerHour: number;
  WindGust_MetrePerSecond: number;
  WindSpeed_MilePerHour: number;
  WindSpeed_MetrePerSecond: number;
  RelativeHumidity: number;
  DewPointTemperature_Fahrenheit: number;
  DewPointTemperature_Celsius: number;
  RainfallAmount_Inch: number;
  RainfallAmount_Millimetre: number;
  DryBulbTemperature_Fahrenheit: number;
  DryBulbTemperature_Celsius: number;
  MeanSeaLevelPressure_InchOfMercury: number;
  MeanSeaLevelPressure_Hectopascal: number;
  RainfallRate_InchPerHour: number;
  RainfallRate_MillimetrePerHour: number;
  IsPublic: boolean;
  IsOfficial: boolean;
  IsDcnn: boolean;
  Longitude: number;
  Latitude: number;
  Height: number;
  Id: string;
  LocalReportEndDateTime: string;
  ExternalSiteId: number;
  CreatedDateTime: string;
  Version: number;
  IsLatestVersion: boolean;
  ExternalId: number;
}

const Wow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [from, setFrom] = useState("2020-01-10T00:00");
  const [to, setTo] = useState("2020-01-10T23:59");

  const migrate = async () => {
    const writeApi = getWriteApi("wow");
    setIsLoading(true);

    const res: MetOfficeObservation[] = await fetch(
      `/api/observations/bysite?start_time=${new Date(
        from
      ).toJSON()}&end_time=${new Date(
        to
      ).toJSON()}&site_id=afe6baff-b92c-ea11-8454-0003ff599bc1`,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": "072641561f4d46d58f65f36975a880fb",
        },
      }
    ).then((x) => {
      if (!x.ok) {
        throw x;
      }

      return x.json();
    });

    const dateFields: (keyof MetOfficeObservation)[] = [
      "CreatedDateTime",
      "LocalReportEndDateTime",
      "ReportEndDateTime",
    ];
    const intFields: (keyof MetOfficeObservation)[] = [
      "WindDirection",
      "WindGustDirection",
    ];
    const floatFields: (keyof MetOfficeObservation)[] = [
      "DewPointTemperature_Celsius",
      "DewPointTemperature_Fahrenheit",
      "DryBulbTemperature_Celsius",
      "DryBulbTemperature_Fahrenheit",
      "Height",
      "Latitude",
      "Longitude",
      "MeanSeaLevelPressure_Hectopascal",
      "MeanSeaLevelPressure_InchOfMercury",
      "RainfallAmount_Inch",
      "RainfallAmount_Millimetre",
      "RainfallRate_InchPerHour",
      "RainfallRate_MillimetrePerHour",
      "RelativeHumidity",
      "WindGust_MetrePerSecond",
      "WindGust_MilePerHour",
      "WindSpeed_MetrePerSecond",
      "WindSpeed_MilePerHour",
    ];
    const booleanFields: (keyof MetOfficeObservation)[] = [
      "IsDcnn",
      "IsLatestVersion",
      "IsOfficial",
      "IsPublic",
    ];
    const tagFields: (keyof MetOfficeObservation)[] = [
      "CollectionName",
      "ExternalId",
      "ExternalSiteId",
      "Id",
      "ObservationType",
      "SiteId",
      "SoftwareType",
      "SubmissionType",
      "Version",
    ];

    const points = res.map((d) => {
      let point = new Point("observation").timestamp(
        new Date(d.ReportStartDateTime)
      );

      floatFields.forEach((field) => {
        if (d[field] !== undefined) {
          point = point.floatField(field, d[field]);
        }
      });
      intFields.forEach((field) => {
        if (d[field] !== undefined) {
          point = point.intField(field, d[field]);
        }
      });
      dateFields.forEach((field) => {
        if (d[field] !== undefined) {
          point = point.intField(field, +new Date(d[field] as string));
        }
      });
      booleanFields.forEach((field) => {
        if (d[field] !== undefined) {
          point = point.booleanField(field, d[field]);
        }
      });
      tagFields.forEach((field) => {
        if (d[field] !== undefined) {
          point = point.tag(field, d[field] as string);
        }
      });

      return point;
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

  return (
    <>
      <h2>Import from WOW</h2>

      <div className="form-fields">
        <div className="form-field">
          <label>
            From
            <input
              type="datetime-local"
              onChange={(e) => {
                setFrom(e.target.value);
              }}
              value={from}
            />
          </label>
          <button className="small" onClick={() => setTo(from)}>
            Set as to
          </button>
        </div>
        <div className="form-field">
          <label>
            To
            <input
              type="datetime-local"
              onChange={(e) => {
                setTo(e.target.value);
              }}
              value={to}
            />
          </label>
          <button className="small" onClick={() => setFrom(to)}>
            Set as from
          </button>
        </div>
      </div>

      <button disabled={isLoading} onClick={() => migrate()}>
        Import
      </button>
    </>
  );
};

export default Wow;
