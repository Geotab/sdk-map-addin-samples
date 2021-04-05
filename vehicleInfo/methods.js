// This file contains methods that use data returned from api calls

//----------------------------------UTILITY METHODS-------------------------------------------------
// Search, write, convert, etc.
//--------------------------------------------------------------------------------------------------

// Called once a datapoint in retrieved, writes it to html element in proper units
function writeData(val, units, divId) {
  if (isNaN(val)) {
    document.getElementById(divId).innerText = val + units;
  } else {
    val !== -1 && val !== ""
      ? (document.getElementById(divId).innerText = Units(units, val))
      : (document.getElementById(divId).innerText = "No Data");
  }
}

// Used by writeData to retrieve proper value/units based on user settings
function Units(unitType, value) {
  var val;
  switch (unitType) {
    case "%":
      val = Math.round(value) + "%";
      break;
    case "time":
      val = Math.round(value / 3600) + " hr";
      break;
    case "speed":
      sessionUser.isMetric
        ? (val = Math.round(value) + " Km/h") //returns km/h
        : (val = Math.round(value * 0.621371) + " mph"); //returns mph
      break;
    case "temp":
      sessionUser.isMetric
        ? (val = Math.round(value) + "°C") //returns celcius
        : (val = Math.round((value * 9) / 5 + 32) + "°F"); //returns farenheit
      break;
    case "distance":
      sessionUser.isMetric
        ? (val = Math.round(value / 1000) + " Km") //returns km from m
        : (val = Math.round((value / 1000) * 0.621371) + " mi"); //returns miles from m
      break;
    default:
      val = value + unitType;
  }
  return val;
}

// Converts 0.00:00:00 timestamp to hours
function timeInHours(stamp) {
  var p;
  var time = []; // [days, hours, minutes, seconds]
  if (stamp.includes(":")) {
    p = stamp.split(":");
    time[2] = parseInt(p[1]);
    time[3] = parseInt(p[2]);
    if (p[0].includes(".")) {
      time[0] = parseInt(p[0].split(".")[0]);
      time[1] = parseInt(p[0].split(".")[1]);
    } else {
      time[0] = 0;
      time[1] = parseInt(p[0]);
    }
  }
  var seconds = time[0] * 86400 + time[1] * 3600 + time[2] * 60 + time[3];
  return Math.round(seconds / 3600);
}

function htmlEscape(myStr){
  return String(myStr || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Used by getMaintenanceReminders to write results to html elements
function writeReminder(arr) {
  document.getElementById("vechInfoAddin_reminderSection").innerText = "";
  document.getElementById("vechInfoAddin_reminderSection").style.paddingTop =
    "0px";
  if (arr === "") {
    document.getElementById("vechInfoAddin_reminderSection").innerText = "";
  } else if (arr.length === 0) {
    document.getElementById("vechInfoAddin_reminderSection").style.paddingTop =
      "5px";
    document.getElementById("vechInfoAddin_reminderSection").innerText =
      "No Reminders Set";
  } else {
    for (var i = 0; i < arr.length; i++) {
      var newNode, span;
      var firstFlag = 0;
      var overdueFlag = 0;
      var vals = [arr[i].due.days, arr[i].due.km, arr[i].due.hr];

      for (var j = 0; j < 3; j++) {
        if (vals[j] !== null && vals[j].includes("-")) {
          vals[j] = vals[j].replace("-", "");
          overdueFlag = 1;
          if (firstFlag === 0) {
            span = vals[j];
            firstFlag = 1;
          } else {
            span = span + ", " + vals[j];
          }
        }
        if (j === 2) {
          span = span + " overdue";
        }
      }
      if (firstFlag === 0) {
        span = "in ";
        for (var k = 0; k < 3; k++) {
          if (vals[k] !== null && firstFlag === 0) {
            span = span + vals[k];
            firstFlag = 1;
          } else if (vals[k] !== null && firstFlag === 1) {
            span = span + ", " + vals[k];
          }
        }
      }

      newNode =
        "<div class='vechInfoAddin_dataRow'>" +
        arr[i].name +
        "<div class='vechInfoAddin_right'>" +
        span +
        "</div> </div>";

      if (overdueFlag) {
        newNode =
          "<div class='vechInfoAddin_dataRow'>" +
          arr[i].name +
          "<div class='vechInfoAddin_right vechInfoAddin_overdueReminder'>" +
          span +
          "</div></div>";
      }

      document
        .getElementById("vechInfoAddin_reminderSection")
        .insertAdjacentHTML("beforeend", htmlEscape(newNode));
    }
  }
}

// Promise - Conducts multicall, returns result
var getDataMultiCall = function (callArr) {
  return service.api.multiCall(callArr);
};

// Called when a multiCall fails (rejected promise)l
function errorFunction() {
  document.getElementById("vechInfoAddin_dataSection").style.display = "none";
  document.getElementById("vechInfoAddin_name").innerText =
    "Error occurred retrieving data from myGeotab server. Please try again.";
}

//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------

//-------------------------------Data Manipulation Methods------------------------------------------
// Takes multicall result and manipulates for desired use
//--------------------------------------------------------------------------------------------------

// gets driver name or id and current device status
function getDeviceStatusInfo(result) {
  var colour;
  writeData(result.speed, "speed", "vechInfoAddin_currSpeed");
  if (result.isDeviceCommunicating) {
    writeData("Active", "", "vechInfoAddin_deviceActivity");
    colour = "#18b534";
  } else {
    writeData("Inactive", "", "vechInfoAddin_deviceActivity");
    colour = "#d41515";
  }
  document.getElementById("vechInfoAddin_deviceActivity").style.color = colour;
  document.getElementById(
    "vechInfoAddin_deviceActivity"
  ).style.borderColor = colour;
  document.getElementById("vechInfoAddin_deviceActivity").style.display =
    "block";
}

// Basic engine measurements --> multiCall result 1 --> 6
function getStatusData(resultArr) {
  var coolTemp = -1,
    RPM = -1,
    ambTemp = -1,
    enghr = -1,
    odo = -1;
  if (resultArr[1].length !== 0) coolTemp = resultArr[1][0].data;
  if (resultArr[2].length !== 0) RPM = resultArr[2][0].data;
  if (resultArr[3].length !== 0) ambTemp = resultArr[3][0].data;
  if (resultArr[4].length !== 0) enghr = resultArr[4][0].data;
  if (resultArr[5].length !== 0) odo = resultArr[5][0].data;
  writeData(coolTemp, "temp", "vechInfoAddin_coolantTemp");
  writeData(RPM, " RPM", "vechInfoAddin_engineSpeed");
  writeData(ambTemp, "temp", "vechInfoAddin_ambientTemp");
  writeData(enghr, "time", "vechInfoAddin_engineHours");
  writeData(odo, "distance", "vechInfoAddin_odometer");
}

// Gets vehicle charge (EV, PHEV, HEV)
function getFuelAndCharge(resultArr) {
  var charge = -1,
    fuelLvl = -1;
  if (resultArr[6].length !== 0) fuelLvl = resultArr[6][0].data;
  if (resultArr[15].length !== 0) charge = resultArr[15][0].data;
  writeData(fuelLvl, "%", "vechInfoAddin_fuel");
  writeData(charge, "%", "vechInfoAddin_charge");
  document.getElementById("vehicleInfoAddin_speedDiv").className =
    "vechInfoAddin_block vechInfoAddin_col-50";

  // ICE, no charge data
  if (charge === -1) {
    document.getElementById("vechInfoAddin_chargeDiv").style.display = "none";
    document.getElementById("vechInfoAddin_fuelDiv").style.display = "block";
    document.getElementById("vechInfoAddin_fuelDiv").className =
      "vechInfoAddin_block vechInfoAddin_col-50";
  }
  // EV, charge data, no fuel data
  else if (charge !== -1 && fuelLvl === -1) {
    document.getElementById("vechInfoAddin_fuelDiv").style.display = "none";
    document.getElementById("vechInfoAddin_chargeDiv").style.display = "block";
    document.getElementById("vechInfoAddin_chargeDiv").className =
      "vechInfoAddin_block vechInfoAddin_col-50";
  }
  // HEV, PHEV, charge and fuel data
  else {
    document.getElementById("vechInfoAddin_fuelDiv").style.display = "block";
    document.getElementById("vechInfoAddin_chargeDiv").style.display = "block";
    document.getElementById("vehicleInfoAddin_speedDiv").className =
      "vechInfoAddin_block vechInfoAddin_col-33";
    document.getElementById("vechInfoAddin_fuelDiv").className =
      "vechInfoAddin_block vechInfoAddin_col-33";
    document.getElementById("vechInfoAddin_chargeDiv").className =
      "vechInfoAddin_block vechInfoAddin_col-33";
  }
}

function getFuelEconomy(resultArr, fuelEconomyUnit) {
  var odoArrToday = resultArr[8];
  var odoArrPast = resultArr[9];
  var fuelArrToday = resultArr[10];
  var fuelArrPast = resultArr[11];
  if (
    odoArrToday.length > 0 &&
    odoArrPast.length > 0 &&
    fuelArrToday.length > 0 &&
    fuelArrPast.length > 0
  ) {
    // Find distance travels and fueled used over last 30 days
    var distLast30Days = (odoArrToday[0].data - odoArrPast[0].data) / 1000; //in km
    var fuelLast30Days = fuelArrToday[0].data - fuelArrPast[0].data; //in litres
    var fuelEconomy = Math.round((distLast30Days / fuelLast30Days) * 100) / 100;
    // Determine what units to display fuel economy in
    var fuelEconUnits;
    if (fuelEconomyUnit === "KmPerLiter") {
      fuelEconUnits = " Km/L";
    } else if (fuelEconomyUnit === "LitersPer100Km") {
      fuelEconomy = Math.round((1 / fuelEconomy) * 10000) / 100;
      fuelEconUnits = " L/100Km";
    } else if (fuelEconomyUnit === "MPGUS") {
      fuelEconomy = Math.round(fuelEconomy * 2.35215 * 100) / 100;
      fuelEconUnits = " MPG (US)";
    } else {
      fuelEconomy = Math.round(fuelEconomy * 2.82481 * 100) / 100;
      fuelEconUnits = " MPG (Imp)";
    }
    writeData(fuelEconomy, fuelEconUnits, "vechInfoAddin_fuelEcon");
  } else {
    writeData("No Data", "", "vechInfoAddin_fuelEcon");
  }
}

// Used by getDutyStatus to load duty status info to add-in iframe
function setDutyStatusVal(className, status) {
  document.getElementById("vechInfoAddin_dutyStatus").className =
    "vechInfoAddin_hos-status-button " + className;
  document.getElementById("vechInfoAddin_dutyStatus").innerText = status;
}

// Reads ELD data and creates element on page if driver has DutyStatus
function getDutyStatus(result) {
  if (result.length !== 0) {
    var status = result[result.length - 1].status;
    document.getElementById("vechInfoAddin_ELD").style.display = "block";
  }
  if (status === "ON") setDutyStatusVal("vechInfoAddin_on", status);
  else if (status === "D") setDutyStatusVal("vechInfoAddin_d", status);
  else if (status === "SB") setDutyStatusVal("vechInfoAddin_sb", status);
  else if (status === "OFF") setDutyStatusVal("vechInfoAddin_off", status);
  else if (status === "YM") setDutyStatusVal("", status);
  else if (status === "PC") setDutyStatusVal("", status);
  else if (status === "WT") setDutyStatusVal("", status);
  else {
    status = -1;
    document.getElementById("vechInfoAddin_ELD").style.display = "none";
  }
}

function getSpeedLimit(result) {
  var speedLimit;
  if (result.length !== 0) {
    speedLimit = "(Limit: " + Units("speed", result[result.length - 1].v) + ")";
  }
  if (result.length === 0 || result[result.length - 1].v === -1) {
    speedLimit = "(No Speed Limit Data)";
  }
  writeData(speedLimit, "", "vechInfoAddin_speedLimit");
}

function getAddress(address) {
  writeData(address[0].formattedAddress, "", "vechInfoAddin_location");
}

function getMaintenanceReminders(event, currOdo, currEngHr) {
  var returnArr = [];
  var reminderArr = [];
  var reFlag = 0,
    index = 0;
  if (event.length === 0) {
    writeReminder(returnArr);
  }
  // Record most recent occurrence of each event, store in reminderArr
  else {
    writeReminder("");
    var odoVal = Math.round(currOdo / 1000);
    var engHrVal = Math.round(currEngHr / 3600);

    for (var i = 0; i < event.length; i++) {
      if (event[i].active === true) {
        for (var j = 0; j < reminderArr.length; j++) {
          if (event[i].eventRule.id === reminderArr[j].id) {
            reFlag = 1;
            var d1 = new Date(event[i].eventDate);
            var d2 = new Date(reminderArr[j].eventDate);
            if (d1.getTime() > d2.getTime()) {
              reminderArr[j] = new reminder(
                event[i].eventRule.id,
                parseInt(event[i].adjustedOdometer, 16) / 1000,
                event[i].adjustedEngineHours,
                event[i].eventDate
              );
            }
          }
        }
        if (reFlag === 0) {
          reminderArr[index] = new reminder(
            event[i].eventRule.id,
            parseInt(event[i].adjustedOdometer, 16) / 1000,
            event[i].adjustedEngineHours,
            event[i].eventDate
          );
          index++;
        }
        reFlag = 0;
      }
    }

    for (var k = 0; k < reminderArr.length; k++) {
      for (var m = 0; m < eventRuleList.length; m++) {
        if (reminderArr[k].id === eventRuleList[m].id)
          reminderArr[k].rule = eventRuleList[m];
      }

      var reminderObj = {
        name: reminderArr[k].rule.name,
        due: { days: null, km: null, hr: null },
      };

      // Check if reminder is dependant on 'months', 'km', 'engineHours' or a combination,
      // Compare value since last event to current vehicle data, determining if reminder is upcoming or past due
      //-----------------------------------------------------------------------------------
      if ("months" in reminderArr[k].rule) {
        var date = new Date(reminderArr[k].eventDate);
        var today = new Date();
        date.setMonth(date.getMonth() + reminderArr[k].rule.months);
        var eventTime = Math.round(
          (date.getTime() - today.getTime()) / 86400000
        );
        eventTime === 1 || eventTime === -1
          ? (eventTime = eventTime + " day")
          : (eventTime = eventTime + " days");
        reminderObj.due.days = eventTime;
      }
      //-----------------------------------------------------------------------------------
      if ("kilometers" in reminderArr[k].rule) {
        var odo =
          reminderArr[k].odometer + reminderArr[k].rule.kilometers - odoVal;
        sessionUser.isMetric
          ? (odo = Math.round(odo) + " Km")
          : (odo = Math.round(odo * 0.621371) + " mi");
        reminderObj.due.km = odo;
      }
      //-----------------------------------------------------------------------------------
      if ("engineHours" in reminderArr[k].rule) {
        var engHours =
          timeInHours(reminderArr[k].engineHours) +
          timeInHours(reminderArr[k].rule.engineHours) -
          engHrVal;
        reminderObj.due.hr = engHours + " hr";
      }
      returnArr.push(reminderObj);
      //-----------------------------------------------------------------------------------
    }
    writeReminder(returnArr);
  }
}

// Name, vin, make, model, year
function getGeneralVehicleData(deviceStatusInfo, DecodeVin) {
  var makemodelyear;
  if (DecodeVin[0].error !== "InvalidVinError") {
    makemodelyear =
      DecodeVin[0].make + " " + DecodeVin[0].model + " " + DecodeVin[0].year;
  } else makemodelyear = "No Data";

  writeData(deviceStatusInfo[0].name, "", "vechInfoAddin_name");
  writeData(
    deviceStatusInfo[0].vehicleIdentificationNumber,
    "",
    "vechInfoAddin_vin"
  );
  writeData(makemodelyear, "", "vechInfoAddin_makeModel");
}

function getDriver(deviceStatus, userArr) {
  if (deviceStatus[0].driver === "UnknownDriverId") {
    writeData("Unknown Driver", "", "vechInfoAddin_driver");
  } else {
    var driver = userArr[0];
    driver = driver.firstName + " " + driver.lastName;
    if (driver === " " || driver === "Unknown Driver") {
      driver = "Driver ID: " + result.driver.id;
    }
    writeData(driver, "", "vechInfoAddin_driver");
  }
}

//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------

//Searches local storage for diagnostic name. If present, loads the data. Else, makes api call to
//retrieve the name, and then stores it in local storage.
function getDiagnosticName(diagList) {
  return new Promise(function (resolve) {
    var newNames = [];
    service.localStorage.get("faultInfo").then(function (val) {
      //figure out which diagnostic names have already been found
      if (val.length !== 0) {
        var existFlag = 0;
        for (var i = 0; i < diagList.length; i++) {
          for (var k = 0; k < val.length; k++) {
            if (val[k].id === diagList[i].id) existFlag = 1;
          }
          if (existFlag === 0) newNames.push(diagList[i]);
          existFlag = 0;
        }
      } else newNames = diagList;

      //constructing the multiCall to get diagnostic names
      var call = [];
      for (var j = 0; j < newNames.length; j++) {
        call[j] = [
          "Get",
          {
            typeName: "Diagnostic",
            search: {
              id: newNames[j].id,
            },
          },
        ];
      }

      // multiCall to get name of new diagnostics, store name is localStorage
      service.api.multiCall(call).then(function (result) {
        for (var i = 0; i < result.length; i++) {
          newNames[i].name = result[i][0].name;
          val.push(newNames[i]);
        }
        service.localStorage.set("faultInfo", val);
        resolve(val);
      });
    });
  });
}

// Uses fault data returned from main multicall. Counts occurrences of each fault, orders from most to fewest.
// Calls getDiagnosticName() to find name associated with fault ID, writes to element.
async function getFaults(faults, GoFaultArr) {
  var faultList = [];
  var goFlag,
    index = 0;
  //---Takes fault data and sorts it by ID and number of occurrences---
  for (var i = 0; i < faults.length; i++) {
    //
    goFlag = 0;
    for (var j = 0; j < GoFaultArr.length; j++) {
      if (faults[i].diagnostic.id === GoFaultArr[j].id) {
        goFlag = 1;
      }
    }
    if (goFlag === 0) {
      //
      var existFlag = 0;
      for (var k = 0; k < faultList.length; k++) {
        if (faults[i].diagnostic.id === faultList[k].id) {
          faultList[k].count++;
          existFlag = 1;
        }
      }
      if (existFlag !== 1) {
        faultList[index] = {
          id: faults[i].diagnostic.id,
          name: "",
          count: 1,
        };
        index++;
      }
    }
  }
  //----------------------------------------------------------------

  //Sorting the faultList
  for (var a = 0; a < faultList.length; a++) {
    for (var b = 0; b < faultList.length - 1; b++) {
      var temp;
      if (faultList[b].count < faultList[b + 1].count) {
        temp = faultList[b + 1];
        faultList[b + 1] = faultList[b];
        faultList[b] = temp;
      }
    }
  }

  document.getElementById("vechInfoAddin_faultSection").innerText = "";
  //----------------------------------------------------------------

  if (faultList.length === 0) {
    document.getElementById("vechInfoAddin_faultSection").style.paddingTop =
      "5px";
    document.getElementById("vechInfoAddin_faultSection").innerText =
      "No Recent Faults";
  } else {
    //match ID to diagnostic name (checking localStorage), write to HTML element
    var storedDiagnostics = await getDiagnosticName(faultList);
    for (var c = 0; c < faultList.length; c++) {
      for (var d = 0; d < storedDiagnostics.length; d++) {
        if (faultList[c].id === storedDiagnostics[d].id) {
          faultList[c].name = storedDiagnostics[d].name;
        }
      }
      var newNode =
        '<div class="vechInfoAddin_dataRow">' +
        faultList[c].name +
        "<div class=vechInfoAddin_right> x" +
        faultList[c].count +
        "</div></div>";
      document.getElementById("vechInfoAddin_faultSection").style.paddingTop =
        "0px";
      document
        .getElementById("vechInfoAddin_faultSection")
        .insertAdjacentHTML("beforeend", htmlEscape(newNode));
    }
  }
}