geotab.addin.request = (elt, service) => {
    // code for add-in

    let isUIMetric;
    service.api.getSession().then(sessionInfo => {
        service.api.call("Get", {
            typeName: "User",
            search: {
                name: sessionInfo.userName
            }
        }).then(user => {
            isUIMetric = user[0].isMetric;
        });
    });

    // Subscribe to any mouseover events
    service.events.attach('over', data => {
        if (data.type == "trip" || data.type == "device") {
            let deviceId = data.type == "trip" ? data.entity.device.id : data.entity.id;
            let hoverTimestamp = data.type == "trip" ? data.entity.dateTime : new Date().toISOString();

            let sessionData = grabSessionData(deviceId, hoverTimestamp);

            if (!sessionData) {
                service.api.multiCall([
                    ["Get", {
                        typeName: "StatusData",
                        search: {
                            deviceSearch: {
                                id: deviceId
                            },
                            diagnosticSearch: {
                                id: "DiagnosticOdometerId"
                            },
                            fromDate: hoverTimestamp,
                            toDate: hoverTimestamp
                        }
                    }],
                    ["Get", {
                        typeName: "StatusData",
                        search: {
                            deviceSearch: {
                                id: deviceId
                            },
                            diagnosticSearch: {
                                id: "DiagnosticFuelLevelId"
                            },
                            fromDate: hoverTimestamp,
                            toDate: hoverTimestamp
                        }
                    }],
                    ["Get", {
                        typeName: "StatusData",
                        search: {
                            deviceSearch: {
                                id: deviceId
                            },
                            diagnosticSearch: {
                                id: "atlKz5GniuEOmiSk76mlTdg"
                            },
                            fromDate: hoverTimestamp,
                            observeActiveState: true,
                        }
                    }]
                ]).then(results => {
                    let rawOdo = results[0][0].data;

                    let odometerValue = isUIMetric ? `${Math.round(rawOdo / 1000)} km` : `${Math.round(rawOdo / 1609.344)} mi`;
                    let fuelLevelValue = results[1][0] ? results[1][0].data.toFixed(2) : null;

                    let stateOfChargeValue = results[2][0] ? results[2][0].data.toFixed(2) : null;

                    if (data.type !== "device") {
                        addSessionData(deviceId, hoverTimestamp, rawOdo, fuelLevelValue, stateOfChargeValue);
                    }
                    
                    setTooltip(odometerValue, fuelLevelValue, stateOfChargeValue);
                });
            } else {
                let odometerValue = isUIMetric ? `${Math.round(sessionData.rawOdometer / 1000)} km` : `${Math.round(sessionData.rawOdometer / 1609.344)} mi`;
                setTooltip(odometerValue, sessionData.fuelPercentage, sessionData.evChargePercentage);
            }
        }
    });

    // Look for cache in sessionStorage & retrieve if found
    let grabSessionData = function (deviceId, time) {
        let scrubbedTime = new Date(time).setMilliseconds(0)
        scrubbedTime = new Date(scrubbedTime).toISOString();
        let cache = JSON.parse(sessionStorage.getItem('odo_fuel_cache'));
        if (cache) {
            if (Object.keys(cache).length > 0) {
                if (cache[deviceId]) {
                    return cache[deviceId][scrubbedTime] ? cache[deviceId][scrubbedTime] : null;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } else {
            sessionStorage.setItem('odo_fuel_cache', JSON.stringify({}));
            return null;
        }
    };

    // Add data to the cache in sesionStorage
    let addSessionData = function (deviceId, time, odo, fuel, stateOfChargeValue) {
        let scrubbedTime = new Date(time).setMilliseconds(0)
        scrubbedTime = new Date(scrubbedTime).toISOString();
        let newData = {
            'rawOdometer': odo,
            'fuelPercentage': fuel,
            'evChargePercentage': stateOfChargeValue
        };
        
        let cache = JSON.parse(sessionStorage.getItem('odo_fuel_cache'));
        if (!cache[deviceId]) {
            cache[deviceId] = {};
        }
        cache[deviceId][scrubbedTime] = newData;
        sessionStorage.setItem('odo_fuel_cache', JSON.stringify(cache));
    };

    // Add information to the tooltip
    let setTooltip = function (odometerValue, fuelLevelValue, stateOfChargeValue) {
        let tooltipInformation = [`Odometer value: ${odometerValue}`];

        if (fuelLevelValue) {
            tooltipInformation.push(`Fuel level: ${fuelLevelValue}%`);
        }

        if (stateOfChargeValue) {
            tooltipInformation.push(`Battery charge level: ${stateOfChargeValue}%`);
        }

        service.tooltip.show({
            icon: "https://www.svgimages.com/svg-image/s5/odometer-half-256x256.png",
            main: " ",
            secondary: tooltipInformation
        }, 2);
    }
};