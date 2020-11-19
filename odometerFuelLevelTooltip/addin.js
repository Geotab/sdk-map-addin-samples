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
                                id: "DiagnosticStateOfChargeId"
                            },
                            fromDate: hoverTimestamp,
                            observeActiveState: true,
                        }
                    }]
                ]).then(results => {
                    let rawOdo = results[0][0] ? results[0][0].data : null;

                    let odometerValue = null;

                    if (rawOdo) {
                        odometerValue = isUIMetric ? `${Math.round(rawOdo / 1000)} km` : `${Math.round(rawOdo / 1609.344)} mi`;
                    }

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
                }
                return null;
            }
            return null;
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
        let tooltipInformation = [];

        if (odometerValue) {
            tooltipInformation.push(`Odometer value: ${odometerValue}`);
        }

        if (fuelLevelValue) {
            tooltipInformation.push(`Fuel level: ${fuelLevelValue}%`);
        }

        if (stateOfChargeValue) {
            tooltipInformation.push(`Battery charge level: ${stateOfChargeValue}%`);
        }

        if (tooltipInformation.length > 0) {
            service.tooltip.show({
                icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMiAyQzYuNDc3MzUgMiAyIDYuNDc3MzUgMiAxMkMyIDE3LjUyMjYgNi40NzczNSAyMiAxMiAyMkMxNy41MjI2IDIyIDIyIDE3LjUyMjYgMjIgMTJDMjIgNi40NzczNSAxNy41MjI2IDIgMTIgMlpNMCAxMkMwIDUuMzcyNzggNS4zNzI3OCAwIDEyIDBDMTguNjI3MiAwIDI0IDUuMzcyNzggMjQgMTJDMjQgMTguNjI3MiAxOC42MjcyIDI0IDEyIDI0QzUuMzcyNzggMjQgMCAxOC42MjcyIDAgMTJaIiBmaWxsPSIjMjAyMzI4Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTAuNzVDMTEuNzI0MyAxMC43NSAxMS41IDEwLjk3NDMgMTEuNSAxMS4yNUMxMS41IDExLjUyNTcgMTEuNzI0MyAxMS43NSAxMiAxMS43NUMxMi4yNzU3IDExLjc1IDEyLjUgMTEuNTI1NyAxMi41IDExLjI1QzEyLjUgMTAuOTc0MyAxMi4yNzU3IDEwLjc1IDEyIDEwLjc1Wk05LjUgMTEuMjVDOS41IDkuODY5NzEgMTAuNjE5NyA4Ljc1IDEyIDguNzVDMTMuMzgwMyA4Ljc1IDE0LjUgOS44Njk3MSAxNC41IDExLjI1QzE0LjUgMTIuNjMwMyAxMy4zODAzIDEzLjc1IDEyIDEzLjc1QzEwLjYxOTcgMTMuNzUgOS41IDEyLjYzMDMgOS41IDExLjI1WiIgZmlsbD0iIzIwMjMyOCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTkgMTYuNzVDOC43MjQyOSAxNi43NSA4LjUgMTYuOTc0MyA4LjUgMTcuMjVDOC41IDE3LjUyNTcgOC43MjQyOSAxNy43NSA5IDE3Ljc1SDE1QzE1LjI3NTcgMTcuNzUgMTUuNSAxNy41MjU3IDE1LjUgMTcuMjVDMTUuNSAxNi45NzQzIDE1LjI3NTcgMTYuNzUgMTUgMTYuNzVIOVpNNi41IDE3LjI1QzYuNSAxNS44Njk3IDcuNjE5NzIgMTQuNzUgOSAxNC43NUgxNUMxNi4zODAzIDE0Ljc1IDE3LjUgMTUuODY5NyAxNy41IDE3LjI1QzE3LjUgMTguNjMwMyAxNi4zODAzIDE5Ljc1IDE1IDE5Ljc1SDlDNy42MTk3MiAxOS43NSA2LjUgMTguNjMwMyA2LjUgMTcuMjVaIiBmaWxsPSIjMjAyMzI4Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC44MzU4NiAzLjA2MDM0QzkuMzU0ODIgMi44NzE0IDkuOTI4NjkgMy4xMzg5MiAxMC4xMTc2IDMuNjU3ODhMMTAuNjMwNiA1LjA2Njg4QzEwLjgxOTYgNS41ODU4NCAxMC41NTIxIDYuMTU5NzEgMTAuMDMzMSA2LjM0ODY2QzkuNTE0MTQgNi41Mzc2IDguOTQwMjcgNi4yNzAwOCA4Ljc1MTMyIDUuNzUxMTJMOC4yMzgzMiA0LjM0MjEyQzguMDQ5MzcgMy44MjMxNiA4LjMxNjkgMy4yNDkyOSA4LjgzNTg2IDMuMDYwMzRaIiBmaWxsPSIjMjAyMzI4Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNC4xMzM5OCA2Ljk5OTk5QzQuNDEwMTMgNi41MjE3IDUuMDIxNzIgNi4zNTc4MyA1LjUwMDAxIDYuNjMzOThMNi43OTkwMSA3LjM4Mzk4QzcuMjc3MyA3LjY2MDEzIDcuNDQxMTcgOC4yNzE3MiA3LjE2NTAyIDguNzUwMDFDNi44ODg4NyA5LjIyODMgNi4yNzcyOCA5LjM5MjE3IDUuNzk4OTkgOS4xMTYwMkw0LjQ5OTk5IDguMzY2MDJDNC4wMjE3IDguMDg5ODcgMy44NTc4MyA3LjQ3ODI4IDQuMTMzOTggNi45OTk5OVoiIGZpbGw9IiMyMDIzMjgiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik02LjQ2Mjc2IDEyLjU3NjFDNi41NTg4MSAxMy4xMiA2LjE5NTc3IDEzLjYzODcgNS42NTE5IDEzLjczNDhMNC4xNzM5IDEzLjk5NThDMy42MzAwMyAxNC4wOTE4IDMuMTExMjggMTMuNzI4OCAzLjAxNTI0IDEzLjE4NDlDMi45MTkxOSAxMi42NDEgMy4yODIyMyAxMi4xMjIzIDMuODI2MSAxMi4wMjYyTDUuMzA0MSAxMS43NjUyQzUuODQ3OTcgMTEuNjY5MiA2LjM2NjcyIDEyLjAzMjIgNi40NjI3NiAxMi41NzYxWiIgZmlsbD0iIzIwMjMyOCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1LjE2NDEgMy4wNjAzNEMxNS42ODMgMy4yNDkyOSAxNS45NTA2IDMuODIzMTYgMTUuNzYxNiA0LjM0MjEyTDE1LjI0ODYgNS43NTExMkMxNS4wNTk3IDYuMjcwMDggMTQuNDg1OCA2LjUzNzYgMTMuOTY2OCA2LjM0ODY2QzEzLjQ0NzkgNi4xNTk3MSAxMy4xODA0IDUuNTg1ODQgMTMuMzY5MyA1LjA2Njg4TDEzLjg4MjMgMy42NTc4OEMxNC4wNzEyIDMuMTM4OTIgMTQuNjQ1MSAyLjg3MTQgMTUuMTY0MSAzLjA2MDM0WiIgZmlsbD0iIzIwMjMyOCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE5LjY4MjYgNi40NTIyNUMxOS45ODUyIDYuOTE0MzIgMTkuODU1OCA3LjUzNDEzIDE5LjM5MzcgNy44MzY2NEwxNC4wNDc3IDExLjMzNjZDMTMuNTg1NyAxMS42MzkyIDEyLjk2NTkgMTEuNTA5OCAxMi42NjM0IDExLjA0NzdDMTIuMzYwOCAxMC41ODU3IDEyLjQ5MDIgOS45NjU4NyAxMi45NTIzIDkuNjYzMzZMMTguMjk4MyA2LjE2MzM2QzE4Ljc2MDMgNS44NjA4NCAxOS4zODAxIDUuOTkwMTkgMTkuNjgyNiA2LjQ1MjI1WiIgZmlsbD0iIzIwMjMyOCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE3LjUxNTIgMTIuNTc2MUMxNy42MTEzIDEyLjAzMjIgMTguMTMgMTEuNjY5MiAxOC42NzM5IDExLjc2NTJMMjAuMTUxOSAxMi4wMjYyQzIwLjY5NTggMTIuMTIyMyAyMS4wNTg4IDEyLjY0MSAyMC45NjI4IDEzLjE4NDlDMjAuODY2NyAxMy43Mjg4IDIwLjM0OCAxNC4wOTE4IDE5LjgwNDEgMTMuOTk1OEwxOC4zMjYxIDEzLjczNDhDMTcuNzgyMiAxMy42Mzg3IDE3LjQxOTIgMTMuMTIgMTcuNTE1MiAxMi41NzYxWiIgZmlsbD0iIzIwMjMyOCIvPgo8L3N2Zz4K",
                main: " ",
                secondary: tooltipInformation
            }, 2);
        }
    }
};