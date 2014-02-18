EH Countdown
============

This is the countdown clock widget that is used on the UK's [Earth Hour
page](http://earthhour.wwf.org.uk/get-involved).

Is is implemented in Javascript and styled with CSS.

The Javascript library contains a generic countdown widget that can be used to
countdown to any date, and an Earthhour-specific widget that contains the date
and time of earthhour. This date and time is displayed within the visitors local
timezone (as the browser defines it).

Dependencies
============

The only dependency for this widget is [jQuery](http://jquery.com).

Usage
=====

The widget consists of two main components:

* `ehcountdown.js`: contains the Javascript code that implements the widget and
  its dynamic features
* `ehcountdown.css`: the default CSS styling (which is what we have used on the
  UK site, minus the WWF font, which isn't always available and therefore not
  used by default).

To install the widget itself, first make sure these components are available
(and of course feel free to modify the styling first for your needs), using
something like this in the header (skip the jQuery line if you already have
jQuery on your site):

	<link rel="stylesheet" type="text/css" href="ehcountdown.css">
	<script type="text/javascript" src="http://code.jquery.com/jquery-2.1.0.js"></script>
	<script type="text/javascript" src="ehcountdown.js"></script>

You should then create an HTML element in your page which will house the
countdown clock, e.g:

	<div id="ehclock_test"></div>

Then, within the JS of your page, initialise the widget object, tell it to add
itself to the above HTML element by passing it a jQuery selector, and then tell
it to start counting:

	$(function() {
		var clock = new ehcountdown.EarthHourCountdown();
		clock.addTo($("#ehclock_test"));
		clock.start();
	})

There are two arguments you can pass to the `EarthHourCountdown()` constructor
above. The first, is either `true` or `false` (default is `false`) and will
configure whether the widget should show and countdown seconds.

The second argument is the animation speed which, if provided, will be passed
directly to the jQuery [effects
methods](http://api.jquery.com/category/effects/) that this widget is built on.
The default is `"fast"`. From the jQuery docs:

> "Durations are given in milliseconds; higher values indicate slower
> animations, not faster ones. The strings 'fast' and 'slow' can be supplied to
> indicate durations of 200 and 600 milliseconds, respectively. If any other
> string is supplied, or if the duration parameter is omitted, the default
> duration of 400 milliseconds is used."

Example
=======

As well as the core components, this repo contains a simple demonstration of the
widget in the file `test.html` and related components.
