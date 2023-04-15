import React, { useEffect, useState } from "react";
import { queryApi } from "./influx-api";

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

const InfluxDb = () => {
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
    <>
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
    </>
  );
};

export default InfluxDb;
