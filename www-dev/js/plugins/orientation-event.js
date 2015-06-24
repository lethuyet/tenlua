// Detect whether device supports orientationchange event, otherwise fall back to
// the resize event.
var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
