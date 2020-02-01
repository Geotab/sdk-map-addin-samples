geotab.addin.request = (elt, service) => {
    // code for add-in

    var currUser;
    var isUIMetric;
    service.api.getSession().then(sessionInfo => {
        // console.log("SESSION:", sessionInfo);
        currUser = sessionInfo.userName;

        service.api.call("Get", {
            typeName: "User",
            search: {
                name: currUser
            }
        }).then(user => {
            // console.log("USER", user);
            isUIMetric = user[0].isMetric;
        });
    });

    // Subscribe to any mouseover events
    service.events.attach('over', data => {
        // console.log(data);
        // console.log("Type: ", data.type);
        if (data.type == "trip" || data.type == "device") {
            var tripId = data.entity.id;
            var deviceId = data.type == "trip" ? data.entity.device.id : data.entity.id;
            var hoverTimestamp = data.type == "trip" ? data.entity.dateTime : new Date().toISOString();
            // console.log(tripId, deviceId, hoverTimestamp);

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
                }],
                ["Get", {
                    typeName: "StatusData",
                    search: {
                        deviceSearch: {
                            id: deviceId
                        },
                        diagnosticSearch: {
                            id: "DiagnosticElectricVehicleChargingStateId"
                        },
                        fromDate: hoverTimestamp,
                        observeActiveState: true,
                    }
                }]
            ]).then(results => {
                let rawOdo = results[0][0].data;

                var odometerValue = isUIMetric ? `${Math.round(rawOdo / 1000)} km` : `${Math.round(rawOdo / 1609.344)} mi`;
                var fuelLevelValue = results[1][0] ? results[1][0].data.toFixed(2) : null;
                // console.log(odometerValue, fuelLevelValue);

                var stateOfChargeValue = results[2][0] ? results[2][0].data.toFixed(2) : null;
                var chargingStateValue = results[3][results[3].length - 1] ? results[3][results[3].length - 1].data : null;

                var tooltipInformation = [`Odometer value: ${odometerValue}`];

                var mainInfo = " ";

                if (fuelLevelValue) {
                    tooltipInformation.push(`Fuel level: ${fuelLevelValue}%`);
                }

                if (stateOfChargeValue) {
                    tooltipInformation.push(`Battery charge level: ${stateOfChargeValue}%`);
                }

                if (chargingStateValue) {
                    tooltipInformation.push(`Currently charging? ${chargingStateValue}`);
                }

                if (stateOfChargeValue && chargingStateValue && fuelLevelValue) {
                    mainInfo = "PHEV";
                } else if (stateOfChargeValue && fuelLevelValue && !chargingStateValue) {
                    mainInfo = "HEV";
                } else if (stateOfChargeValue && chargingStateValue && !fuelLevelValue) {
                    mainInfo = "BEV";
                } else if (!stateOfChargeValue && !chargingStateValue && fuelLevelValue) {
                    mainInfo = "ICE";
                }

                service.tooltip.show({
                    icon: "https://www.svgimages.com/svg-image/s5/odometer-half-256x256.png",
                    main: mainInfo,
                    secondary: tooltipInformation
                }, 2);
            });

        }
    });
};