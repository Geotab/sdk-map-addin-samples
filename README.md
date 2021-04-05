# Examples of map add-ins

This project contains a few simple examples of add-ins that can be opened in the right-side panel of the Maps or Trips History pages of MyGeotab. Each add-in uses one or more Geotab Map API services.

1) **events** - shows how to subscribe to different events from map `services.events`;
2) **tooltip** - shows to show additional information in map tooltips or show your own tooltip `services.tooltip`;
3) **action** - shows how to add a custom button in different map action list `services.actionList`;
4) **localStorage** - shows how to set/get/remove items from local storage `services.localStorage`;
5) **request** - shows how to request Geotab data from server `services.api`;
6) **page** - shows how to change page state and handle state changes that happens on the page `services.page`;
7) **mapElements** - shows how to draw different elements on the map and catch events from them `services.canvas`;
8) **map** - shows how to control map view and catch events from it `services.map`;
9) **html** - shows how use html file as a amin file for map add-in.
10) **makeModelYearTooltip** - shows how to display additional information retrieved using the SDK in the tooltip;
11) **odometerFuelLevelTooltip** - shows how to display additional information (i.e. StatusData) retrieved using the SDK in the tooltip and using session storage `services.events`, `services.tooltip`, `services.api`;
12) **vehicleInfo** - shows how to use the MyGeotab APIs and Map events to display current vehicle information when the user clicks on a vehicle on the map.

To try it:

1) Create `.zip` archive from a folder (for Mac and Linux users it can be done with one command: `zip -r addin.zip {{addinFolder}}`)
2) Add it as usual add-in on the system settings page.

If you want to try it on tripsHistory page, change the page name in `configuration.json` file: from `"page": "map"` to `"page": "tripsHistory"`.

If you want to build all the add-ins to test them, run the `./build.sh` command and get any `zip` file from the `./dist` folder.
