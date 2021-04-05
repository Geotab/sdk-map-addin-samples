// This file initializes the add-in, creates dictionaries and defines on-click behaviour

//Retrieve sessionUser, goFault Dictionary and reminder rule dictionary
var initFunction = function () {
  return new Promise(function (resolve) {
    service.api.getSession().then(function (session) {
      service.api
        .call("Get", {
          typeName: "User",
          search: {
            name: session.userName,
          },
        })
        .then(function (result) {
          sessionUser = result[0];
          service.api.multiCall(defineMulticallInit()).then(
            function (result) {
              goFaultList = result[0];
              eventRuleList = result[1];
              resolve();
            },
            function () {
              errorFunction();
              reject();
            }
          );
        });
    });
  });
};

// Retrieves vehicle specific data once a device has been clicked
let clickDevice = (event, data) => {
  if (event === "click" && data.type === "device") {
    currVehicle = data.entity.id;
    getData(); // gets vehicle data and writes it to page
  } else return;
};

// Keeps track of toggle switch state in fault section of add-in, shows appropriate list of faults
function changeToggleState() {
  toggleState = !toggleState;
  toggleState
    ? (excludedFaultsArray = goFaultList)
    : (excludedFaultsArray = []);
  getFaults(resultArr[14], excludedFaultsArray);
}

// Initalize dictionaries, define "click" behaviour
async function initialize() {
  await initFunction();
  service.localStorage.set("faultInfo", []);
  service.events.attach("click", (e) => {
    clickDevice("click", e);
  });
}

// Called when a device is clicked on the map --> gathers data, writes to html elements
async function getData() {
  // Two main multicalls, second is dependent on results of first - see calls.js for more info
  resultArr = await getDataMultiCall(defineMulticall1(currVehicle));
  resultArr2 = await getDataMultiCall(defineMulticall2(currVehicle, resultArr));

  //Check if error occurred retreiving data (rejected promise).
  if (!(Array.isArray(resultArr) && Array.isArray(resultArr2))) {
    errorFunction();
    return;
  }

  toggleState
    ? (excludedFaultsArray = goFaultList)
    : (excludedFaultsArray = []);

  //Below functions manipulate results of above multicalls
  getDeviceStatusInfo(resultArr[0][0]); // Driver name/id, device status
  getStatusData(resultArr); // Odo, Eng Hours, RPM, Coolant Temp, Amb Temp, fuel lvl
  getFuelEconomy(resultArr, sessionUser.fuelEconomyUnit); // Fuel Economy last 30 days
  getDutyStatus(resultArr[7]); // ELD duty status
  getSpeedLimit(resultArr[13]); // Speed limit at given trip coordinates
  getAddress(resultArr2[0]); // Address of current coordinates
  getFaults(resultArr[14], excludedFaultsArray); // All faults over last 30 days
  getMaintenanceReminders(
    resultArr2[1],
    resultArr[5][0].data,
    resultArr[4][0].data
  ); // Upcoming and overdue reminders
  getGeneralVehicleData(resultArr[12], resultArr2[2]); // Name, vin, makeModelYear
  getDriver(resultArr[0], resultArr2[3]); // Current driver assigned to vehicle
  getFuelAndCharge(resultArr); //Gets fuel lvl and generic state of charge for vehicle
  //------------------------------------------------------
  document.getElementById("vechInfoAddin_dataSection").style.display = "block"; //if first run, this section is hidden, display after getting data
}

// Define HTML element and service for the addin
geotab.addin.request = (element, service) => {
  window.service = service;
  initialize();
};
