geotab.addin.request = (elt, service) => {
    elt.innerHTML = `
        <div class="addin">
            <fieldset>
                <div class="addin_row">
                    <label for="addin_type">Type: </label>
                    <select id="addin_type">
                        <option value="rect">Rect</option>
                        <option value="circle">Circle</option>
                        <option value="text">Text</option>
                        <option value="path">Path</option>
                    </select>
                </div>
                <div class="addin_row">
                    <label for="addin_coords">Coordinates: </label>
                    <input type="text" class="addin_field" id="addin_coords">
                </div>
                <div class="addin_row">
                    <label for="addin_fill">Fill: </label>
                    <input type="text" class="addin_field" id="addin_fill">
                </div>
                <div class="addin_row">
                    <label for="addin_stroke">Stroke: </label>
                    <input type="text" class="addin_field" id="addin_stroke">
                </div>
                <div class="addin_row">
                    <button class="addin_field" id="addin_create">Draw</button>
                </div>
            </fieldset>
            <fieldset>
                <div class="addin_row">
                    <span>Draw pre-set shapes on the map: </span>
                </div>
                <div class="addin_col">
                    <button id="canada">Canada</button>
                    <button id="australia">Australia</button>
                    <button id="russia">Rectangular in Russia</button>
                    <button id="mexico">Text in Mexico</button>
                    <button id="circle-ca">Circle in CA</button>
                    <button id="japan-url">Marker in Japan (URL)</button>
                    <button id="japan-buffer-array">Marker in Japan (BufferArray)</button>
                </div>
            </fieldset>
        </div>`

        let button = elt.querySelector("#addin_create");
        let type = elt.querySelector("#addin_type");
        let coords = elt.querySelector("#addin_coords");
        let fill = elt.querySelector("#addin_fill");
        let stroke = elt.querySelector("#addin_stroke");

        button.addEventListener("click", () => {
            let points = coords.value.split(",").map(p => +p);
            switch (type.value) {
                case "rect":
                    if (points.length >= 4) {
                        service.canvas.rect({ x: points[0], y: points[1] }, points[2], points[3], 5, 20)
                            .change({ fill: fill.value, stroke: stroke.value })
                            .attach("click", () => {
                                console.log("Clicked on rect");
                            });
                    }
                break;
                case "circle":
                    if (points.length >= 3) {
                        service.canvas.circle({ x: points[0], y: points[1] }, points[2], 20)
                            .change({ fill: fill.value, stroke: stroke.value })
                            .attach("click", () => {
                                console.log("Clicked on circle");
                            });
                    }
                break;
                case "text":
                    if (points.length >= 2) {
                        service.canvas.text({ x: points[0], y: points[1] }, "Text from addin", 20)
                            .change({ fill: fill.value, stroke: stroke.value })
                            .attach("click", () => {
                                console.log("Clicked on text");
                            });
                    }
                break;
                case "path":
                    let ps = points.reduce((akk, point) => {
                        let last = akk[akk.length - 1];
                        if (last.length >= 2) {
                            akk.push([point])
                        } else {
                            last.push(point);
                        }

                        return akk;
                    }, [[]]);

                    let coords = [
                        { type: "M", points: ps[0] },
                        ...ps.slice(1).map(p => ({ type: "l", points: p })),
                        { type: "Z" }
                    ];

                    service.canvas.path(coords, 20)
                        .change({ fill: fill.value, stroke: stroke.value })
                        .attach("click", () => {
                            console.log("Clicked on path");
                        });
                break;
            }
        }, false);

        const colors = ["#1300BD", "#909C00", "#8600BF", "#006C8E", "#6F9696", "#318E00", "#BF8E3A", "#009662", "#6C72A1", "#BD00BF"];
        let randomColorPick = (arrOfColors) => arrOfColors[Math.floor(Math.random() * arrOfColors.length)];
        const drawShape = (name, shape) => {
            let first = shape[0];
            let coords = [
                // first point we need to move pen to this point
                {
                    type: "M",
                    points: [{ lat: first[1], lng: first[0] }]
                },
                // after we start drawing lines from point to point
                ...shape.map(([lng, lat]) => ({ type: "L", points: [{ lat, lng }] })),
                // this shape should be closed (you can leave it unclosed)
                {
                    type: "Z"
                }
            ];

            return service.canvas.path(coords, 100)
                .change({
                    "fill": randomColorPick(colors),
                    "stroke": randomColorPick(colors),
                    "stroke-width": 5,
                    "fill-opacity": 0.5
                })
                .attach("click", () => { console.log(`${ name } Clicked`); })
                .attach("over", e => {
                    // show simple tooltip on over
                    service.tooltip.showAt(e, {
                        main: `This is ${ name } shape`,
                        secondary: [`Coordinates X=${ e.x } and Y=${ e.y }`]
                    }, 1);

                    console.log(`Over ${ name }`);
                })
                .attach("out", () => {
                    // hide tooltip
                    service.tooltip.hide();

                    console.log(`Out of ${ name }`);
                });
        }

        let canadaShape;
        elt.querySelector("#canada").addEventListener("click", () => {
            canadaShape && canadaShape.remove();

            let shape = [
                [-127.17773437499999, 48.922499263758255],
                [-94.833984375, 49.26780455063753],
                [-88.59374999999999, 48.3416461723746],
                [-82.08984375, 45.27488643704891],
                [-82.6171875, 42.293564192170095],
                [-82.6171875, 41.64007838467894],
                [-79.013671875, 42.87596410238256],
                [-79.453125, 43.83452678223682],
                [-74.970703125, 45.02695045318546],
                [-71.015625, 45.398449976304086],
                [-69.345703125, 47.45780853075031],
                [-67.67578124999999, 47.15984001304432],
                [-66.97265625, 44.653024159812],
                [-66.796875, 42.22851735620852],
                [-56.51367187499999, 44.902577996288876],
                [-50.44921875, 45.27488643704891],
                [-49.130859375, 49.66762782262194],
                [-55.01953125, 56.17002298293205],
                [-62.40234375, 60.71619779357714],
                [-58.88671875, 66.79190947341796],
                [-72.24609375, 75.45307133006602],
                [-75.76171875, 77.23507365492469],
                [-60.29296874999999, 82.44876405595812],
                [-67.5, 83.67694304841554],
                [-85.60546875, 83.42021497175465],
                [-103.88671875, 80.47406532116933],
                [-113.203125, 78.73350050778467],
                [-117.59765625, 78.02557363284087],
                [-122.51953124999999, 76.76054111175671],
                [-127.44140625, 74.86788912917916],
                [-127.61718749999999, 70.78690984117928],
                [-136.40625, 69.90011762668541],
                [-140.80078125, 70.31873847853124],
                [-141.328125, 59.80063426102869],
                [-139.04296875, 60.28340847828243],
                [-137.5927734375, 59.17592824927136],
                [-137.4169921875, 58.97266715450153],
                [-135.52734375, 59.77852198502987],
                [-132.71484375, 57.844750992891],
                [-131.66015625, 56.58369172128337],
                [-130.078125, 56.04749958329888],
                [-130.517578125, 54.7246201949245],
                [-132.275390625, 54.482804559582554],
                [-133.43994140625, 54.39335222384589],
                [-132.8466796875, 52.38901106223458],
                [-131.33056640625, 51.41291212935532],
                [-127.17773437499999, 48.922499263758255]
              ];

              canadaShape = drawShape("Canada", shape);
        }, false);

        let ausShape;
        elt.querySelector("#australia").addEventListener("click", () => {
            ausShape && ausShape.remove();

            let shape = [
                [126.65039062499999, -13.62463343823614],
                [113.5546875, -21.861498734372553],
                [114.5654296875, -34.37971258046219],
                [117.1142578125, -35.7465122599185],
                [130.5615234375, -31.91486750327621],
                [140.80078125, -38.8225909761771],
                [150.5126953125, -38.99357205820945],
                [154.7314453125, -24.846565348219734],
                [142.822265625, -10.746969318459989],
                [132.01171875, -10.703791711680724],
                [126.65039062499999, -13.62463343823614]
              ];

              ausShape = drawShape("Australia", shape);
        }, false);

        let russiaRect;
        elt.querySelector("#russia").addEventListener("click", () => {
            russiaRect && russiaRect.remove();
          
            russiaRect = service.canvas.rect({ lat: 65.29346780107583, lng: 79.365234375 }, 200, 30, 3, 100)
                .change({
                    "fill": "#000",
                    "stroke-width": 0,
                    "fill-opacity": 0.5
                })
                .attach("click", () => { console.log(`Russia Clicked`); })
                .attach("over", () => { console.log(`Over Russia`); })
                .attach("out", () => { console.log(`Out of Russia`); });
        }, false);

        let textInMexico;
        elt.querySelector("#mexico").addEventListener("click", () => {
            textInMexico && textInMexico.remove();
          
            textInMexico = service.canvas.text({ lat: 23.5628, lng: -102.5696 }, "Hello from Mexico", 30)
                .change({
                    "fill": randomColorPick(colors),
                    "font-size": Math.floor(Math.random() * 20 + 10)
                })
                .attach("click", () => { console.log(`Mexico Clicked`); })
                .attach("over", () => { console.log(`Over Mexico`); })
                .attach("out", () => { console.log(`Out of Mexico`); });
        }, false);

        let circleInCA;
        elt.querySelector("#circle-ca").addEventListener("click", () => {
            circleInCA && circleInCA.remove();
          
            circleInCA = service.canvas.circle({ lat: 37.810629, lng: -122.41154 }, 50, 40)
                .change({
                    "fill": randomColorPick(colors),
                    "fill-opacity": 0.4,
                    "r": 10
                })
                .attach("click", () => { console.log(`circleInCA Clicked`); })
                .attach("over", () => { console.log(`circleInCA over`); })
                .attach("out", () => { console.log(`circleInCA out`); })
        }, false);

        let imageMarkerInJapanUrl;
        elt.querySelector("#japan-url").addEventListener("click", () => {
            imageMarkerInJapanUrl && imageMarkerInJapanUrl.remove();
            imageMarkerInJapanUrl = service.canvas.marker({ lat: 35.6682234, lng: 139.6708286 }, 40, 40, "https://www.geotab.com/wp-content/themes/geotab-template/images/headers/corporate-profile-icon.svg", 30)
                .change({
                    "dx": -20,
                    "dy": -20
                })
                .attach("click", () => { console.log(`Japan Clicked`); })
                .attach("over", () => { console.log(`Over Japan`); })
                .attach("out", () => { console.log(`Out of Japan`); });
        }, false);

        let image = fetch("/images/email_lightbulb_icon.png").then(a => a.arrayBuffer());
        let imageMarkerInJapanArrayBuffer;
        elt.querySelector("#japan-buffer-array").addEventListener("click", () => {
            imageMarkerInJapanArrayBuffer && imageMarkerInJapanArrayBuffer.remove();

            image.then(buffer => {
                imageMarkerInJapanArrayBuffer = service.canvas.marker({ lat: 39.5595148, lng: 142.1110338 }, 40, 40, buffer, 30)
                    .change({
                        "dx": 20,
                        "dy": 0
                    })
                    .attach("click", () => { console.log(`Japan array buffer Clicked`); })
                    .attach("over", () => { console.log(`Over array buffer Japan`); })
                    .attach("out", () => { console.log(`Out of array buffer Japan`); });
            });
        }, false);
};