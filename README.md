# Spacetraders Web Client #

## What is Spacetraders? ##

Watch the video below!

[![Watch the video](recording_screenshot.png)](https://www.loom.com/share/f5b22f5249d94d138151f11e9d584cbe?sid=44653714-19b5-4b2f-95d0-357cef6e16f0)

## How is it built? ##

The client uses Next.js, Konva (HTML Canvas), TailwindCSS, and DaisyUI. All data for systems, waypoints, and ships that is fetched from the Spacetraders API is cached in IndexedDB for quick retrieval.


## Install ##

**Mac Instructions**

`git clone git@github.com:jeremyrader/spacetraders-web-client.git`

`cd spacetraders-web-client`

`brew install pkg-config cairo pango libpng jpeg giflib librsvg`

`yarn install`

`yarn start`

