geotab.addin.request = (elt, service) => {
    elt.innerHTML = `
            <div class="addin">
            <fieldset>
                    <div class="addin_row">
                        <label for="addin_name">Device name: </label>
                        <input type="text" class="addin_field" id="addin_name">
                    </div>
                    <div class="addin_row">
                        <button id="addin_get">Find</button>
                    </div>
                    <div class="addin_row">
                        <img id="deviceLocation">
                    </div>
            </fieldset>
        </div>`

    let name = elt.querySelector("#addin_name");
    let get = elt.querySelector("#addin_get");
    let showDevice = function(deviceId) {
        // request DeviceStatusInfo by device id
        service.api.call("Get", {
            typeName: "DeviceStatusInfo",
            search: {
                deviceSearch: { id: deviceId }
            }
        }).then(function(statuses) {
            if (statuses[0]) {
                var status = statuses[0],
                    locationUrl = "https://tyler-demo.herokuapp.com/?greyscale=False&lat=" + status.latitude + "&lon="  + status.longitude +  "&zoom=16&width=400&height=400";

                document.getElementById("deviceLocation").setAttribute("src", locationUrl);
            } else {
                console.log("Device location can't be found!");
            }
        });
    };

    get.addEventListener("click", function() {

        // request devices by name
        service.api.call("Get", {
            "typeName": "Device",
            search: {
                name: "%" + name.value + "%"
            }
        }).then(function(devices) {
            if (devices[0]) {
                showDevice(devices[0].id);
            } else {
                console.log("Device not found!");
            }
        });
    }, false);
};