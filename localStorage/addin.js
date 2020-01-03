geotab.addin.hello = (elt, service) => {
    elt.innerHTML = `
            <div class="addin">
            <fieldset>
                    <div class="addin_row">
                        <label for="addin_key">Key: </label>
                        <input type="text" class="addin_field" id="addin_key">
                    </div>
                    <div class="addin_row">
                        <label for="addin_value">Value: </label>
                        <input type="text" class="addin_field" id="addin_value">
                    </div>
                    <div class="addin_row">
                        <button id="addin_get">Get</button>
                        <button id="addin_set">Save</button>
                        <button id="addin_reset">Reset</button>
                    </div>
            </fieldset>
        </div>`

    let save = elt.querySelector("#addin_set");
    let get = elt.querySelector("#addin_get");
    let reset = elt.querySelector("#addin_reset");
    let key = elt.querySelector("#addin_key");
    let value = elt.querySelector("#addin_value");

    get.addEventListener("click", () => {
        // get value from local storage
        service.localStorage.get(key.value)
            .then(val => console.log(JSON.stringify(val)));
    }, false);

    save.addEventListener("click", () => {
        // set value to local storage
        service.localStorage.set(key.value, { value: value.value })
            .then(() => console.log("Done"));
    }, false);

    reset.addEventListener("click", () => {
        // remove value from local storage
        service.localStorage.remove(key.value)
            .then(() => console.log("Done"));
    }, false);
};