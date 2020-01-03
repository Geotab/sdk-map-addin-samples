geotab.addin.pageService = (elt, service) => {
    elt.innerHTML = `
            <div class="addin">
            <fieldset>
                <div class="addin_row">
                    <label for="addin_page">New page: </label>
                    <input type="text" class="addin_field" id="addin_page">
                </div>
                <div class="addin_row">
                    <label for="addin_state_key">State key: </label>
                    <input class="addin_field" id="addin_state_key" type="text">
                </div>
                <div class="addin_row">
                    <label for="addin_state_value">State value: </label>
                    <input type="text" class="addin_field" id="addin_state_value">
                </div>
                <div class="addin_row">
                    <button id="addin_get">Get current state</button>
                    <button id="addin_set">Set new state</button>
                </div>
                <div class="addin_row">
                    <div id="state_log"></div>
                </div>
            </fieldset>
        </div>`

    let page = elt.querySelector("#addin_page");
    let save = elt.querySelector("#addin_set");
    let get = elt.querySelector("#addin_get");
    let key = elt.querySelector("#addin_state_key");
    let value = elt.querySelector("#addin_state_value");
    let log = elt.querySelector("#state_log");

    let logPageState = state => {
        let div = document.createElement("div");
        div.classList.add("addin_url_state");

        div.textContent = JSON.stringify(state);
        log.appendChild(div);
    };

    // Here we subscribe to all page state changes that happens
    service.page.attach("stateChange", logPageState);

    get.addEventListener("click", () => {
        // if we need to get a state of current page, we should call 'get' method
        service.page.get().then(logPageState);
    }, false);

    save.addEventListener("click", () => {
        // if we need to change a page, we should call 'go' method with some page state
        if (page.value) {
            let state = {};
            if (key.value && value.value) {
                state[key.value] = value.value;
            }

            service.page.go(page.value, state)
        } else if (key.value) {
            // if we need to change only a state of current page, we should call 'set' method
            service.page.set(key.value, value.value);
        }
    }, false);
};