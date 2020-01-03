geotab.addin.request = (elt, service) => {
    let template = (event, data) => {
        var div = document.createElement("DIV");
        div.innerHTML = `<strong>Event:</strong> ${ event }, <strong>data</strong>: ${ JSON.stringify(data) }`;
        elt.appendChild(div);
    }

    // subscribe to any mouseover events. Will be fired when user pointer over: device, zone, route.
    // e parameter looks like: {"type":"zone","entity":{"id":"b3C3F"}}
    service.events.attach('over', (e) => { template('over', e); });

    // subscribe to any mouseout events. Will be fired when user pointer out of: device, zone, route.
    // e parameter looks like: {"type":"device","entity":{"id":"b2"}}
    service.events.attach('out', (e) => { template('out', e); });

    // subscribe to any click events. Will be fired when user clicks on: device, zone, route, map.
    // e parameter looks like: {"type":"zone","entity":{"id":"b3C3F"}}
    service.events.attach('click', (e) => { template('click', e); });

    // subscribe to any move events over map.
    // e parameter looks like: {"x":485,"y":205}
    service.events.attach('move', (e) => { template('move', e); });
};