geotab.addin.request = (elt, service) => {

    // modal
    document.getElementById('addinDisclaimerModal').style.display = "block";

    document.getElementById('addinCloseModal').addEventListener('click', function () {
        document.getElementById('addinDisclaimerModal').style.display = "none"        
    });

    //defining variables
    let range = elt.querySelector("#addin_slider");
    let button = elt.querySelector("#addin_create");
    let interval;
    let coordsParents = [];
    let devices = [];
    let vehiclenames = [];
    let groups = [];

    //_________________STAGE 1: Toggling the slider and retrieving date range__________________

    //SLIDER: Pulls the Range (# of hours) from the trip history slider and sets the date range to be displayed 
    function livedate() {
        let outputToDate = elt.querySelector("#ToDate");
        outputToDate.innerHTML = new Date();

        let output = elt.querySelector("#demo");
        let outputFromDate = elt.querySelector("#FromDate");
        let text = elt.querySelector("#text");
        text.innerHTML = "minutes of travel history";

        outputFromDate.innerHTML = new Date(new Date() - range.value * 60000)
        range.oninput = function () {
            output.innerHTML = this.value;
        }
    }

    //SLIDER: Adds "To Date" and "From Date" once the slider is moved
    function clickslider() {
        let to = elt.querySelector("#To");
        to.innerHTML = "To Date"
        let from = elt.querySelector("#From");
        from.innerHTML = "From Date"

    }

    //SLIDER: Just displays initial start-up text asking the user to toggle the slider
    let t = elt.querySelector("#text");
    t.innerHTML = "Drag the slider to view up to 10 hours of live trip history";

    //SLIDER( MAIN): Slider click event that starts the process. Acting as the Main.
    range.addEventListener("click", () => {
        clearInterval(interval); // stops TripHistorySlider and clears map of all trails
        livedate();
        clickslider();
        intervaltime = setInterval(livedate, 1000);
        AllDetails();
        interval = setInterval(TripHistorySlider, 15000); //refreshes the TripHistorySlider every 15 seconds, to keep up with moving vehicles

    }, false);

    //_________________________________________________________________________________________


    //_________________STAGE 2: Pulling all device data__________________

    //Runs Device Get call on entire database
    var getDevices = function () {
        return service.api.call("Get", {
            "typeName": "Device"
        }).then(function (result) {
            return result;
        })
    }

    //pulls device data (Groups, VehicleNames) for ALL devices on database
    var getDetailsAll = function (devicelist, result) {


        let vehiclenames = [];
        let groups = [];
        let devices = [];

        if (devicelist === 0) {

            console.log("All vehicles selected on map: pushing devices")

            for (let i = 0; i < result.length; i++) {
                let smallgroups = [];
                devices.push(result[i].id)
                vehiclenames.push(result[i].name)
                for (let x = 0; x < result[i].groups.length; x++) {

                    smallgroups.push(result[i].groups[x].id)
                }
                groups.push(smallgroups)
            }
            let obj = [devices, vehiclenames, groups]
            return obj;
        }

        else {

            console.log("Select vehicles selected on map: pushing devices")
            for (let j = 0; j < devicelist.length; j++) {
                for (let i = 0; i < result.length; i++) {
                    if (devicelist[j] == result[i].id) {
                        let smallgroups = [];
                        vehiclenames.push(result[i].name)
                        for (let x = 0; x < result[i].groups.length; x++) {
                            smallgroups.push(result[i].groups[x].id)
                        }
                        groups.push(smallgroups)
                    }
                }
            }
            let obj = [devicelist, vehiclenames, groups]
            return obj;
        }

    }

    //Gets device list from map URL
    var getPageURL = function () {
        return service.page.get().then(function (n) {
            console.log(JSON.stringify(n))
            return n;
        })

    }

    //Pulls device details depending on whether URL contains device Ids or "All".
    var deviceDetails = async function (n) {

        let result = await getDevices();

        //If the all vehicles were selected on the Map and the URL returned "All", instead of individual device Ids
        if (n.liveVehicleIds == "all") {

            console.log(JSON.stringify(result))
            let devicedetails = await getDetailsAll(0, result)
            console.log(JSON.stringify(devicedetails))
            devices = devicedetails[0]
            vehiclenames = devicedetails[1];
            groups = devicedetails[2];

            console.log(JSON.stringify("(within TripHistorySlider) devices pulled from get call: "))
            console.log(JSON.stringify(devices))
            console.log(JSON.stringify(vehiclenames))
            console.log(JSON.stringify(groups))
        }
        //If the URL returned device Ids
        else {

            devices = n.liveVehicleIds;
            console.log(JSON.stringify(result))
            let devicedetails = await getDetailsAll(devices, result)
            console.log(JSON.stringify(devicedetails))
            vehiclenames = devicedetails[1];
            groups = devicedetails[2];

            console.log(JSON.stringify("(within TripHistorySlider) devices pulled from URL: "))
            console.log(JSON.stringify(n.liveVehicleIds))
            console.log(JSON.stringify(vehiclenames))
            console.log(JSON.stringify(groups))
        }
        console.log("Finished Running function getDeviceIds()")
        return [devices, vehiclenames, groups] // returns device list, vehiclenames list and groups list
    };



    //Pulls all device details (list of devices displayed on map, vehiclenames, groups)
    var AllDetails = async function () {
        let n = await getPageURL(); // Pulls device list from URL 
        let devicedetails = await deviceDetails(n) //Returns Device details for above device list (Vehiclenames, groups)
        devices = devicedetails[0]
        vehiclenames = devicedetails[1]
        groups = devicedetails[2]

        await TripHistorySlider(); //Runs after getting all device details 
    }

    //___________________________________________________________________



    //Clear Trip History Button
    button.addEventListener("click", () => {
        console.log("button pressed")
        clearInterval(interval);
        service.canvas.clear();

    }, false);



    //_________________STAGE 3: Using Device List to run LogRecord GetFeed and then drawing on map__________________

    //Takes result from GetFeed and draws a path and tooltips on the map.
    function GeneratePath(result, i, coordsParents, vehiclenames, groups) {
        let d = i;
        let date1 = [];
        let Time = [];
        let Speed = [];
        let path = [];
        for (let i = 0; i < result.length; i++) {
            let x = result[i].latitude;
            let y = result[i].longitude;
            let speed = result[i].speed;
            let datetime = result[i].dateTime.split("T");
            let date = datetime[0];
            let time = datetime[1];

            path.push([y, x]);
            date1.push(date);
            Time.push(time);
            Speed.push(speed);
        }

        //addPoints(path,Speed,Date1,Time); //Generates hidden circles with tooltips

        let first = path[0]; //latitude
        let second = path[1]; //longitude
        //console.log(first)
        let coords = [
            // first point we need to move pen to this point
            {

                type: "M",
                points: [{ lat: first[1], lng: first[0] }]
            },
            // after we start drawing lines from point to point
            ...path.map(c => ({ type: "L", points: [{ lat: c[1], lng: c[0] }] }))
            // this shape should be closed (you can leave it unclosed)

        ];

        coordsParents.push(coords);


        let colors = ["#1300BD", "#909C00", "#8600BF", "#006C8E", "#6F9696", "#318E00", "#BF8E3A", "#009662", "#6C72A1", "#BD00BF",
            "#1300BD", "#909C00", "#8600BF", "#006C8E", "#6F9696", "#318E00", "#BF8E3A", "#009662", "#6C72A1", "#BD00BF",
            "#1300BD", "#909C00", "#8600BF", "#006C8E", "#6F9696", "#318E00", "#BF8E3A", "#009662", "#6C72A1", "#BD00BF",
            "#1300BD", "#909C00", "#8600BF", "#006C8E", "#6F9696", "#318E00", "#BF8E3A", "#009662", "#6C72A1", "#BD00BF",
            "#1300BD", "#909C00", "#8600BF", "#006C8E", "#6F9696", "#318E00", "#BF8E3A", "#009662", "#6C72A1", "#BD00BF",
            "#1300BD", "#909C00", "#8600BF", "#006C8E", "#6F9696", "#318E00", "#BF8E3A", "#009662", "#6C72A1", "#BD00BF",
            "#1300BD", "#909C00", "#8600BF", "#006C8E", "#6F9696", "#318E00", "#BF8E3A", "#009662", "#6C72A1", "#BD00BF",
            "#1300BD", "#909C00", "#8600BF", "#006C8E", "#6F9696", "#318E00", "#BF8E3A", "#009662", "#6C72A1", "#BD00BF",
            "#1300BD", "#909C00", "#8600BF", "#006C8E", "#6F9696", "#318E00", "#BF8E3A", "#009662", "#6C72A1", "#BD00BF",
            "#1300BD", "#909C00", "#8600BF", "#006C8E", "#6F9696", "#318E00", "#BF8E3A", "#009662", "#6C72A1", "#BD00BF"];
        console.log("printing coords")
        console.log(coords)

        service.canvas.path(coords, 20)
            .change({ "fill": "none", "fill-opacity": 1, "stroke": colors[d], "stroke-width": 5 })
            .attach("over", a => {
                console.log("generating path for device id: " + devices[i]);
                console.log(a);
                console.log(a.x);
                console.log(a.y);
                console.log(groups);
                console.log(groups.toString());

                for (i = 0; i < path.length; i++) {
                    service.tooltip.showAt({ lat: path[i][1], lng: path[i][0] }, {


                        main: vehiclenames,
                        //main: devices[i], 
                        secondary: ["Driving " + Speed[i] + "km/s on " + date1[i] + " at " + Time[i]],
                        //secondary: ["Driving 56km/s on 01/09/2020 at 1:34:15 PM" ],
                        additional: ["Groups: " + groups.toString()]
                    }, +1)
                }

            }).attach("out", () => {

                service.tooltip.hide()
            });
        console.log("generated path")
        return coordsParents;
    }

    //GetFeed call to pull log record. 1 call made every 15 seconds.
    async function TripHistorySlider() {
        console.log("Running function TripHistorySlider()")
        let output = elt.querySelector("#demo");
        output.innerHTML = range.value;

        let outputFromDate = elt.querySelector("#FromDate");
        console.log("test")
        let outputToDate = elt.querySelector("#ToDate");

        console.log(new Date(new Date() - range.value * 60000))
        console.log(new Date())

        range.oninput = function () {
            output.innerHTML = this.value;
            outputFromDate.innerHTML = new Date(new Date() - this.value * 60000)
            outputToDate.innerHTML = new Date();
        }



        service.canvas.clear();
        service.api.call("GetFeed", {
            "typeName": "LogRecord",
            //"fromVersion": lastVersions,
            //"resultsLimit":3600,
            "search": {
                "fromDate": new Date(new Date() - range.value * 60000),
                //"toDate": new Date(),
            }
        }).then(function (result) {
            console.log("API call made");
            console.log(result.data.length);
            console.log(vehiclenames)
            for (let x = 0; x < devices.length; x++) {
                let resultnew = [];
                for (let i = 0; i < result.data.length; i++) {
                    if (result.data[i].device.id == devices[x]) {
                        resultnew.push(result.data[i]);
                    }
                }

                if (resultnew.length > 0) {

                    coordsParents = GeneratePath(resultnew, x, coordsParents, vehiclenames[x], groups[x])
                }

            }
        }
        )
    }

    //______________________________________________________________________________________________________________

};