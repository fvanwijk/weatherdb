// Recalculate all aggregates except for the data from today
import "date"
import "timezone"

option location = timezone.location(name: "Europe/Amsterdam")

observations =
    from(bucket: "weather")
        |> range(start: -10y)
        // We want all data because this script is to recalculate all aggregates
        // The Influx Task only calculates for the current day (every 5 minutes)
        |> filter(fn: (r) => r._measurement == "observation")
        |> drop(
            columns: [
                "host",
                "ip",
                "latitude",
                "longitude",
                "macAddress",
                "stationName",
                "ssid",
                "url",
                "version",
                "wifiLoggerVersion",
            ],
        )

// Temp out
tempOut =
    observations
        |> filter(fn: (r) => r._field == "temperatureOut")

tempOut
    |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "max")
    |> to(bucket: "aggregates", org: "Home")
tempOut
    |> aggregateWindow(every: 1d, fn: min, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "min")
    |> to(bucket: "aggregates", org: "Home")

// Temp in
tempIn =
    observations
        |> filter(fn: (r) => r._field == "temperatureIn")

tempIn
    |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "max")
    |> to(bucket: "aggregates", org: "Home")
tempIn
    |> aggregateWindow(every: 1d, fn: min, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "min")
    |> to(bucket: "aggregates", org: "Home")

// Pressure
pressure =
    observations
        |> filter(fn: (r) => r._field == "bar")

pressure
    |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "max")
    |> to(bucket: "aggregates", org: "Home")
pressure
    |> aggregateWindow(every: 1d, fn: min, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "min")
    |> to(bucket: "aggregates", org: "Home")

// Humidity in
humIn =
    observations
        |> filter(fn: (r) => r._field == "humIn")

humIn
    |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "max")
    |> to(bucket: "aggregates", org: "Home")
humIn
    |> aggregateWindow(every: 1d, fn: min, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "min")
    |> to(bucket: "aggregates", org: "Home")

// Humidity out
humOut =
    observations
        |> filter(fn: (r) => r._field == "humOut")

humOut
    |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "max")
    |> to(bucket: "aggregates", org: "Home")
humOut
    |> aggregateWindow(every: 1d, fn: min, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "min")
    |> to(bucket: "aggregates", org: "Home")

// Chill
chill =
    observations
        |> filter(fn: (r) => r._field == "chill")

chill
    |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "max")
    |> to(bucket: "aggregates", org: "Home")
chill
    |> aggregateWindow(every: 1d, fn: min, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "min")
    |> to(bucket: "aggregates", org: "Home")

// Dew
dew =
    observations
        |> filter(fn: (r) => r._field == "dew")

dew
    |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "max")
    |> to(bucket: "aggregates", org: "Home")
dew
    |> aggregateWindow(every: 1d, fn: min, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "min")
    |> to(bucket: "aggregates", org: "Home")

// Heat
heat =
    observations
        |> filter(fn: (r) => r._field == "heat")

heat
    |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "max")
    |> to(bucket: "aggregates", org: "Home")
heat
    |> aggregateWindow(every: 1d, fn: min, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "min")
    |> to(bucket: "aggregates", org: "Home")

// Gust speed
gustSpeed =
    observations
        |> filter(fn: (r) => r._field == "gustSpeed")

gustSpeed
    |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "max")
    |> to(bucket: "aggregates", org: "Home")
gustSpeed
    |> aggregateWindow(every: 1d, fn: min, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "min")
    |> to(bucket: "aggregates", org: "Home")

// Wind speed
windSpeed =
    observations
        |> filter(fn: (r) => r._field == "windSpeed")

windSpeed
    |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "max")
    |> to(bucket: "aggregates", org: "Home")
windSpeed
    |> aggregateWindow(every: 1d, fn: min, createEmpty: false)
    |> truncateTimeColumn(unit: 1d)
    |> set(key: "_measurement", value: "min")
    |> to(bucket: "aggregates", org: "Home")