// Recalculate all aggregates except for the data from today
import "date"
import "timezone"

option location = timezone.location(name: "Europe/Amsterdam")

dropColumns = (tables=<-) =>
    tables
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

forField = (tables=<-, fieldName) =>
    tables
        |> filter(fn: (r) => r._field == fieldName)
        |> dropColumns()

aggregateMax = (tables=<-) =>
    tables
        |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
        |> truncateTimeColumn(unit: 1d)
        |> set(key: "_measurement", value: "max")
        |> to(bucket: "aggregates", org: "Home")

aggregateMin = (tables=<-) =>
    tables
        |> aggregateWindow(every: 1d, fn: min, createEmpty: false)
        |> truncateTimeColumn(unit: 1d)
        |> set(key: "_measurement", value: "min")
        |> to(bucket: "aggregates", org: "Home")

observations =
    from(bucket: "weather")
        // We want all data because this script is to recalculate all aggregates
        // The Influx Task only calculates for the current day (every 5 minutes)
        |> range(start: -4y)
        |> filter(fn: (r) => r._measurement == "observation")

// Temp out
tempOut = observations |>forField(fieldName: "temperatureOut")
tempOut
    |> aggregateMax()
    |> yield(name: "tempOutMax")
tempOutMin = tempOut |> aggregateMin()

// Temp in
tempIn = observations |> forField(fieldName: "temperatureIn")
tempInMax = tempIn |> aggregateMax()
tempInMin = tempIn |> aggregateMin()

// Pressure
bar = observations |> forField(fieldName: "bar")
barMax = bar |> aggregateMax()
barMin = bar |> aggregateMin()


// Humidity in
humIn = observations |> forField(fieldName: "humIn")
humInMax = humIn |> aggregateMax()
humInMin = humIn |> aggregateMin()

// Humidity out
humOut = observations |> forField(fieldName: "humOut")
humOutMax = humOut |> aggregateMax()
humOutMin = humOut |> aggregateMin()

// Chill
chill = observations |> forField(fieldName: "chill")
chillMax = chill |> aggregateMax()
chillMin = chill |> aggregateMin()

// Dew
dew = observations |> forField(fieldName: "dew")
dewMax = dew |> aggregateMax()
dewMin = dew |> aggregateMin()

// Heat
heat = observations |> forField(fieldName: "heat")
heatMax = heat |> aggregateMax()
heatMin = heat |> aggregateMin()

// Gust speed
gustSpeed = observations |> forField(fieldName: "gustSpeed")
gustSpeedMax = gustSpeed |> aggregateMax()
gustSpeedMin = gustSpeed |> aggregateMin()

// Wind speed
windSpeed = observations |> forField(fieldName: "windSpeed")
windSpeedMax = windSpeed |> aggregateMax()
windSpeedMin = windSpeed |> aggregateMin()