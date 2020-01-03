geotab.addin.request = (elt, service) => {
    let name = elt.querySelector("#device_name");
    let driver = elt.querySelector("#device_driver");
    let speed = elt.querySelector("#device_speed");
    let exceptions = elt.querySelector("#device_exceptions");

    service.actionList.attachMenu("vehicleMenu", (_, rest) => {
        console.log(rest);

        return Promise.resolve([{
            title: "Show devices status info",
            clickEvent: "ShowDeviceInfo",
            data: rest.device
        }]);
    });

    service.actionList.attach("ShowDeviceInfo", ({ id }) => {
        Promise.all([
            service.api.call("Get", { typeName: "Device", search: { id } }),
            service.api.call("Get", { typeName: "DeviceStatusInfo", search: { deviceSearch: { id } } })
        ]).then(([[device], [dsi]]) => {
            name.textContent = device.name;
            speed.textContent = dsi.speed + " km/h";

            return Promise.all([
                dsi.driver.id
                    ? service.api.call("Get", { typeName: "User", search: { id: dsi.driver.id } }).then(([user]) => user.name)
                    : Promise.resolve("Unknown driver")
            ]).then(([name]) => {
                driver.textContent = name;
            });
        });
    });
};