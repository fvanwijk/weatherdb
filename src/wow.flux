from(bucket: "wow")
  |> range(start: 2020-01-01, stop: 2022-01-01)
  |> filter(fn: (r) => r["_measurement"] == "observation")
  |> filter(fn: (r) => r["_field"] == "DryBulbTemperature_Celsius")
  |> drop(columns: ["ExternalId", "Id"])
  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
  |> yield(name: "mean")
  