geotab.addin.request = (elt, service) => {
    // code for add-in

    var currUser;
    var isUIMetric;
    service.api.getSession().then(sessionInfo => {
        console.log("SESSION:", sessionInfo);
        currUser = sessionInfo.userName;

        service.api.call("Get", {
            typeName: "User",
            search: {
                name: currUser
            }
        }).then(user => {
            console.log("USER", user);
            isUIMetric = user[0].isMetric;
        });
    });

    // Subscribe to any mouseover events
    service.events.attach('over', data => {
        console.log(data);
        console.log("Type: ", data.type);
        if (data.type == "trip") {
            var tripId = data.entity.id;
            var deviceId = data.entity.device.id;
            var hoverTimestamp = data.entity.dateTime;
            console.log(tripId, deviceId, hoverTimestamp);

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
                }]
            ]).then(results => {
                let rawOdo = results[0][0].data;

                var odometerValue = isUIMetric ? `${Math.round(rawOdo / 1000)} km` : `${Math.round(rawOdo / 1609.344)} mi`;
                var fuelLevelValue = results[1][0].data.toFixed(2);
                console.log(odometerValue, fuelLevelValue);

                service.tooltip.show({
                    icon: "https://www.svgimages.com/svg-image/s5/odometer-half-256x256.png",
                    main: " ",
                    secondary: [`Odometer value: ${odometerValue}`, `Fuel level: ${fuelLevelValue}%`]
                }, 2);
            });

        }
    });
};