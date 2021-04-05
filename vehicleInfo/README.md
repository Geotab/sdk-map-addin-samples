Vehicle Info map add-in.

This tool is not intended for use by U.S. Federal Government customers or otherwise in the FedRamp environment.

To install, download this as a zip folder, then drag and drop it as new Add-in within MyGeotab.
System Settings > Add-Ins > New Add-in > drag and drop zip file.
Enable Feature Preview within your User Settings in MyGeotab.

addin.html and addin.css are the HTML and stylesheets, respectively.

addin.js - Initializes dictionaries and defines behaviour when a device on the map is clicked. When a device is clicked, getData() executes, making multiCalls and manipulating the data.

calls.js - Contains multiCall and global variable definitions.

methods.js - Defines all utility and data manipulation functions. These functions take the result of multiCalls (see call.js) and perform desired arithmetic/tasks. Note: the only API
calls not defined in calls.js are in the getDiagnosticName() function.

For more information/details please contact integrations@geotab.com.
