# Vehicle Info Map Add-in

_This tool is not intended for use by U.S. Federal Government customers or otherwise in the FedRamp environment._

# About

This sample add-in displays various Vehicle Information in the Map Add-in panel, on the Maps and/or Trips History pages of MyGeotab. The information displayed is as follows:
1) VIN
2) Make/Model
3) Driver name
4) Odometer
5) Engine hours
6) Fuel economy
7) Engine speed
8) Coolant temperature
9) Ambient temperature
10) Vehicle Faults (Last 30 Days)
11) Vehicle Maintenance Reminders

# Installation

To install, download this as a zip folder, then drag and drop it as a new Add-in within the System Settings page of MyGeotab:
Administration > System > System Settings > Add-Ins > New Add-in > drag and drop zip file.

addin.html and addin.css are the HTML and stylesheets, respectively.
addin.js initializes dictionaries and defines behaviour when a device on the map is clicked. When a device is clicked, getData() executes, making multiCalls and manipulating the data.
calls.js contains multiCall and global variable definitions.
methods.js defines utility and data manipulation functions. These functions take the result of multiCalls (see call.js) and perform desired arithmetic/tasks. Note: the only API
calls not defined in calls.js are in the getDiagnosticName() function.

For more information/details please contact integrations@geotab.com.
