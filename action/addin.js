geotab.addin.request = (elt, service) => {
    elt.innerHTML = `
            <div class="addin">
            <fieldset>
                    <div class="addin_row">
                        <label for="addin_type">Type: </label>
                        <select id="addin_type">
                            <option value="zoneMenu">Zone</option>
                            <option value="vehicleMenu">Device</option>
                            <option value="routeMenu">Route</option>
                            <option value="mapMenu">Map</option>
                            <option value="historyTripsMenu">History trip</option>
                        </select>
                    </div>
                    <div class="addin_row">
                        <label for="addin_name">Title: </label>
                        <input type="text" class="addin_field" id="addin_name">
                    </div>
                    <div class="addin_row">
                        <label for="addin_text">Index: </label>
                        <input type="number" class="addin_field" id="addin_index" value="1">
                    </div>
                    <div class="addin_row">
                        <label for="addin_text">Data: </label>
                        <input type="text" class="addin_field" id="addin_text">
                    </div>
            </fieldset>
        </div>`

        let type = elt.querySelector("#addin_type");
        let title = elt.querySelector("#addin_name");
        let index = elt.querySelector("#addin_index");
        let text = elt.querySelector("#addin_text");

        let attach = () => {

            // actionList attaches to some map popup menus: zone, route, device, map etc.
            // callback will be called if MyGeotab is about to show particular menu
            service.actionList.attachMenu(type.value, (...rest) => {
                console.log(rest);

                // if you want to add new buttons to this menu, just return array of them
                // if you don't want to show something, just return an empty array
                return title.value ? Promise.resolve([{
                    title: title.value, // title of the new button
                    clickEvent: "Clicked", // event the will be fired when user clicks on button
                    zIndex: +index.value, // zInxed for button in menu, to control where it should be places
                    data: { data: text.value || "" } // some data that you need when user clicks on button
                }]) : [];
            });
        }

        let prev = type.value
        attach();
        type.addEventListener("change", () => {
            service.actionList.detachMenu(prev);
            prev = type.value;
            attach();
        }, false);

        // subscribe to events when new button is clicked by user
        service.actionList.attach("Clicked", data => {
            // data here is something that you pass with "data" property in new button options
            console.log(JSON.stringify(data));
        });
};