geotab.addin.map = (elt, service) => {
    elt.innerHTML = `
            <div class="addin">
            <fieldset>
                <div class="addin_row">
                    <span>Zoom:</span>
                </div>
                <div class="addin_row">
                    <button id="addin_zoom_in">+</button>
                    <button id="addin_zoom_out">-</button>
                </div>
                <div class="addin_row">
                    <button id="addin_zoom_save">Save view</button>
                </div>
                <div class="addin_row">
                    <span>Views:</span>
                </div>
                <div class="addin_row">
                    <div id="view_list" class="addin_view_list addin_col">

                    </div>
                </div>
            </fieldset>
        </div>`

    let zin = elt.querySelector("#addin_zoom_in");
    let zout = elt.querySelector("#addin_zoom_out");
    let save = elt.querySelector("#addin_zoom_save");
    let list = elt.querySelector("#view_list");

    zout.addEventListener("click", () => {
        service.map.getZoom().then(zoom => {
            service.map.setZoom(zoom - 1);
        });
    }, false);

    zin.addEventListener("click", () => {
        service.map.getZoom().then(zoom => {
            service.map.setZoom(zoom + 1);
        });
    }, false);

    save.addEventListener("click", () => {
        Promise.all([
            service.map.getBounds(),
            service.map.getZoom()
        ]).then(([ bounds, zoom ]) => {
            let button = document.createElement("button");
            button.addEventListener("click", () => {
                service.map.setBounds(bounds);
            }, false);
            button.textContent = `Zoom: ${ zoom },
                NE (
                    lat: ${ bounds.ne.lat }
                    lng: ${ bounds.ne.lng }
                ),
                SW (
                    lat: ${ bounds.sw.lat }
                    lng: ${ bounds.sw.lng }
                )`;

            list.appendChild(button);
        });
    }, false);

    service.map.attach("change", () => { console.log("change"); });
    service.map.attach("changed", () => { console.log("changed"); });
};