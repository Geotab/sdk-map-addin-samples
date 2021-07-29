// This file holds all global variable definitions + functions that define multicalls

var goFaultList,
  eventRuleList,
  sessionUser,
  currVehicle,
  driverId,
  excludedFaultsArray,
  resultArr,
  resultArr2;
var toggleState = 0; // Keeps track of toggleSwitch state in fault section

class reminder {
  constructor(id, odo, engHr, date) {
    this.id = id;
    this.odometer = odo;
    this.engineHours = engHr;
    this.eventDate = date;
    this.rule = "";
  }
}

// Gets initial information for dictionaries (dependent on sessionUser's group)
// 0 --- Device, 1 --- Users, 2 --- GoFault Diagostics, 3 --- EventRules
function defineMulticallInit(group) {
  return (multiCallInit = [
    [
      "Get",
      {
        typeName: "Diagnostic",
        search: {
          diagnosticType: "GoFault",
        },
      },
    ],
    [
      "Get",
      {
        typeName: "EventRule",
      },
    ],
  ]);
}

// MULTICALL RESULTS ARRAY:
// 0 -- DeviceStatusInfo, 1 -- Status Data: CoolantTemp, 2 -- StatusData: EngineSpeed
// 3 -- Status Data: AmbientTemp, 4 -- Status Data: Adj Eng Hours, 5 -- StatusData: Adj Odometer
// 6 -- Status Data: Current Fuel Level, 7 -- DutyStatusLog, 8 -- Status Data: OdoId TODAY
// 9 -- Status Data: OdoId 30DaysAgo, 10 -- Status Data: Total Fuel TODAY, 11 -- Status Data: Total Fuel 30DaysAgo
// 12 -- Device: Name, Vin, 13 -- GetRoadMaxSpeed: SpeedLimit, 14 -- FaultData, 15 -- DiagnosticStateOfCharge
function defineMulticall1(vehicleId) {
  var today = new Date();
  var priorDate = new Date(new Date().setDate(today.getDate() - 30));
  return [
    [
      "Get",
      {
        typeName: "DeviceStatusInfo",
        search: {
          deviceSearch: {
            Id: vehicleId,
          },
        },
      },
    ],
    [
      "Get",
      {
        typeName: "StatusData",
        search: {
          deviceSearch: {
            Id: vehicleId,
          },
          diagnosticSearch: {
            id: "DiagnosticEngineCoolantTemperatureId",
          },
          fromDate: today,
          toDate: today,
        },
      },
    ],
    [
      "Get",
      {
        typeName: "StatusData",
        search: {
          deviceSearch: {
            Id: vehicleId,
          },
          diagnosticSearch: {
            id: "DiagnosticEngineSpeedId",
          },
          fromDate: today,
          toDate: today,
        },
      },
    ],
    [
      "Get",
      {
        typeName: "StatusData",
        search: {
          deviceSearch: {
            Id: vehicleId,
          },
          diagnosticSearch: {
            id: "DiagnosticOutsideTemperatureId",
          },
          fromDate: today,
          toDate: today,
        },
      },
    ],
    [
      "Get",
      {
        typeName: "StatusData",
        search: {
          deviceSearch: {
            Id: vehicleId,
          },
          diagnosticSearch: {
            id: "DiagnosticEngineHoursAdjustmentId",
          },
          fromDate: today,
          toDate: today,
        },
      },
    ],
    [
      "Get",
      {
        typeName: "StatusData",
        search: {
          deviceSearch: {
            Id: vehicleId,
          },
          diagnosticSearch: {
            id: "DiagnosticOdometerAdjustmentId",
          },
          fromDate: today,
          toDate: today,
        },
      },
    ],
    [
      "Get",
      {
        typeName: "StatusData",
        search: {
          deviceSearch: {
            Id: vehicleId,
          },
          diagnosticSearch: {
            id: "DiagnosticFuelLevelId",
          },
          fromDate: today,
          toDate: today,
        },
      },
    ],
    [
      "Get",
      {
        typeName: "DutyStatusLog",
        search: {
          deviceSearch: {
            id: vehicleId,
          },
          fromDate: today,
          includeBoundaryLogs: true,
          statuses: ["D", "ON", "OFF", "SB", "YM", "PC", "WT"],
        },
      },
    ],
    [
      "Get",
      {
        typeName: "StatusData",
        search: {
          deviceSearch: {
            id: vehicleId,
          },
          diagnosticSearch: {
            id: "DiagnosticOdometerId",
          },
          fromDate: today,
          toDate: today,
        },
      },
    ],
    [
      "Get",
      {
        typeName: "StatusData",
        search: {
          deviceSearch: {
            id: vehicleId,
          },
          diagnosticSearch: {
            id: "DiagnosticOdometerId",
          },
          fromDate: priorDate,
          toDate: priorDate,
        },
      },
    ],
    [
      "Get",
      {
        typeName: "StatusData",
        search: {
          deviceSearch: {
            id: vehicleId,
          },
          diagnosticSearch: {
            id: "DiagnosticDeviceTotalFuelId",
          },
          fromDate: today,
          toDate: today,
        },
      },
    ],
    [
      "Get",
      {
        typeName: "StatusData",
        search: {
          deviceSearch: {
            id: vehicleId,
          },
          diagnosticSearch: {
            id: "DiagnosticDeviceTotalFuelId",
          },
          fromDate: priorDate,
          toDate: priorDate,
        },
      },
    ],
    [
      "Get",
      {
        typeName: "Device",
        search: {
          id: vehicleId,
        },
      },
    ],
    [
      "GetRoadMaxSpeeds",
      {
        deviceSearch: {
          id: vehicleId,
        },
        fromDate: today,
        toDate: today,
      },
    ],
    [
      "Get",
      {
        typeName: "FaultData",
        resultsLimit: 50000,
        search: {
          deviceSearch: {
            id: vehicleId,
          },
          fromDate: priorDate,
          toDate: today,
        },
      },
    ],
    [
      "Get",
      {
        typeName: "StatusData",
        search: {
          deviceSearch: {
            Id: vehicleId,
          },
          diagnosticSearch: {
            id: "DiagnosticStateOfChargeId",
          },
          observeActiveState: true,
          fromDate: new Date(),
        },
      },
    ],
  ];
}

// MULTICALL2 RESULTS ARRAY:
// 0 --- GetAddresses, 1 --- EventOccurrence (Maintenance Reminders), 2 --- DecodeVins
// 3 --- User: Driver of vehicle
function defineMulticall2(vehicleId, prevResult) {
  var today = new Date();
  var priorDate = new Date(new Date().setDate(today.getDate() - 30));
  return [
    [
      "GetAddresses",
      {
        coordinates: [
          { x: prevResult[0][0].longitude, y: prevResult[0][0].latitude },
        ],
      },
    ],
    [
      "Get",
      {
        typeName: "EventOccurrence",
        resultsLimit: 50000,
        search: {
          deviceSearch: {
            id: vehicleId,
          },
        },
      },
    ],
    [
      "DecodeVins",
      {
        vins: [prevResult[12][0].vehicleIdentificationNumber],
      },
    ],
    [
      "Get",
      {
        typeName: "User",
        resultsLimit: 1,
        search: {
          id: prevResult[0][0].driver.id,
        },
      },
    ],
  ];
}
