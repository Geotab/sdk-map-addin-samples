geotab.addin.request = (elt, service) => {
    elt.innerHTML = `
            <div class="addin">
            <fieldset>
                    <div class="addin_row">
                        <label for="addin_type">Type: </label>
                        <select id="addin_type">
                            <option value="zone">Zone</option>
                            <option value="device">Device</option>
                            <option value="route">Route</option>
                            <option value="all">Everywhere</option>
                        </select>
                    </div>
                    <div class="addin_row">
                        <label for="addin_name">Title: </label>
                        <input type="text" class="addin_field" id="addin_name">
                    </div>
                    <div class="addin_row">
                        <label for="addin_sequence">Sequence: </label>
                        <input type="text" class="addin_field" id="addin_sequence">
                    </div>
                    <div class="addin_row">
                        <label for="addin_text">Text 1: </label>
                        <input type="text" class="addin_field" id="addin_text">
                    </div>
                    <div class="addin_row">
                        <label for="addin_text_2">Text 2: </label>
                        <input type="text" class="addin_field" id="addin_text_2">
                    </div>
            </fieldset>
        </div>`

        let type = elt.querySelector("#addin_type");
        let title = elt.querySelector("#addin_name");
        let sequence = elt.querySelector("#addin_sequence");
        let text1 = elt.querySelector("#addin_text");
        let text2 = elt.querySelector("#addin_text_2");

        type.addEventListener("change", () => {
            if (type.value === "all") {
                // show tooltips everywhere on the map
                title.value && service.events.attach("move", data => {
                    service.tooltip.showAt({ x: data.x, y: data.y }, {
                        main: title.value,
                        secondary: text1.value.split("|"),
                        additional: text2.value.split("|")
                    }, +sequence.value);
                });
            } else {
                service.tooltip.hide();
                service.events.detach("move");
            }
        }, false);

        // attach to every over event
        service.events.attach("over", data => {

            // filter all over events to the type that you need. For example device.
            if (data.type === type.value && title.value) {

                // show additional information in tooltip for this type of entity: as in example in tooltip for devices
                service.tooltip.show({
                    main: title.value,
                    secondary: text1.value.split("|"),
                    additional: text2.value.split("|")
                }, +sequence.value)
            }
        });
};