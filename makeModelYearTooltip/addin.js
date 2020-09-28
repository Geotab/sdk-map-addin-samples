geotab.addin.request = (elt, service) => {
    service.localStorage.set("deviceInfo", {});
    service.localStorage.set("vinInfo", {});
    service.events.attach("over", async function(data) {
        let mmy;
        if (data.type === "device") {
            let deviceObj = await grabDevice(data.entity.id).catch(function() {
                service.tooltip.show({
                    main: "Device Information Not Available"
                }, 2);
            });
            if (deviceObj.vehicleIdentificationNumber) {
                let mmy = await decodeVin(deviceObj.vehicleIdentificationNumber).catch(function() {
                    service.tooltip.show({
                        main: "VIN Information Not Available"
                    }, 2);
                });
                service.tooltip.show({
                    main: mmy
                }, 2);
            } else {
                service.tooltip.show({
                    main: "Device VIN Not Available"
                }, 2);
            }
        }
    });
    
    let grabDevice = function(deviceId) {
        return new Promise(function(resolve, reject) {
            let temp;
            service.localStorage.get("deviceInfo").then(function(deviceCache) {
                if (deviceCache[deviceId]) {
                    resolve(deviceCache[deviceId]);
                } else {
                    service.api.call("Get", {"typeName": "Device",
                        "search": {
                            "id": deviceId
                        }
                    }).then(function(result) {
                        temp = deviceCache;
                        temp[deviceId] = result[0];
                        service.localStorage.set("deviceInfo", JSON.stringify(temp));
                        resolve(result[0]);
                    }, function(error) {
                        reject(error);
                    });
                }
            });
        });
    };
    
    let decodeVin = function(vin) {
        return new Promise(function(resolve, reject) {
            let temp;
            service.localStorage.get("vinInfo").then(function(vinCache) {
                if (vinCache[vin]) {
                    resolve(vinCache[vin]);
                } else {
                    temp = vinCache;
                    service.api.call("DecodeVins", {
                        "vins": [
                            vin
                        ]
                    }).then(function(result) {
                        let make = result[0].make || "";
                        let model = result[0].model || "";
                        let year = result[0].year || "";
                        let decodeOutput;
                        if (make == "" && model == "" && year == "") {
                            decodeOutput = "Failed To Decode Vin";
                        } else {
                            decodeOutput = make + " " + model + " (" + year + ")";
                        };
                        temp[vin] = decodeOutput;
                        service.localStorage.set("vinInfo", JSON.stringify(temp));
                        resolve(decodeOutput);
                    }, function(error) {
                        reject(error);
                    });
                }
            });				    
        })
    }
};