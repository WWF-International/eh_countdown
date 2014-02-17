ehcountdown = {}

ehcountdown.Digit = function(startValue, duration, basez) {
    this.value = String(startValue);

    if(typeof basez == "undefined") {
	this.basez = 0;
    } else {
	this.basez = basez;
    }
    if(typeof duration == "undefined") {
	this.animationSpeed = "fast";
    } else {
	this.animationSpeed = duration;
    }

    this.addTo = function(parent) {
	var ret = jQuery('<div class="ehcountdown_digit"></div>');
	this.parentDiv = parent;
	parent.append(ret);

	ret.append(this.createBlockTopDiv());
	ret.append(this.createBlockBottomDiv());
	ret.append(this.createGapDiv());
	this.topDiv = ret;
	return ret;
    }


    this.changeValue = function(newValue, complete) {
	// don't do anything if newValue is same as old value
	if(String(newValue) == this.value) {
	    if(typeof complete == "function") complete();
	    return;
	}
	// save the new value
	this.value = String(newValue);

	// create animation to display it
	var flaps = this.createFlaps();

	// now change the value of the top block, as it is covered by
	// the flap and will be slowly revealed as the flap is
	// removed.
	this.changeBlockNumber(this.blockTopDiv.first(), this.value);
	// also change the bottom flap which is currently hidden but
	// will soon be revealed.
	this.changeBlockNumber(flaps.bottom.first(), this.value);

	// this are the callbacks that implement the animation, and a
	// list of variables that need to be shared with those
	// functions ('this' will have a different value there).
	var changeBlockNumber = this.changeBlockNumber;
	var bottomBlock = this.blockBottomDiv;
	var value = this.value;
	var animationSpeed = this.animationSpeed;

	var anim = [
	    function(next) {
		// drop down the top flap
		flaps.top.slideUp(animationSpeed);
		// and once all animations are completed dequeue the
		// next effect
		flaps.top.promise().done(next);
	    },
	    function(next) {
		// delete the top flap
		flaps.top.remove();
		flaps.bottom.slideDown(animationSpeed);
		flaps.bottom.promise().done(next);
	    },
	    function(next) {
		// change the bottom block to the new number
		changeBlockNumber(bottomBlock.first(), value);
		// delete the bottom flap
		flaps.bottom.remove();
		next();
	    },
	    function(next) {
		// last stage, call the callback if provided
		if(typeof complete == "function") complete();
		next();
	    }
	];

	// queue the animation, using the topDiv as a convenient queue
	this.topDiv.queue(anim);
    }

    this.getValue = function() {
	return this.value;
    }

    this.getWidth = function() {
	return this.topDiv.width();
    }

    this.getHeight = function() {
	return this.topDiv.height();
    }

    /**
     *
     ***  Create the HTML elements that form this digit.
     */
    this.addDigitToDiv = function(parentdiv) {
	// the digit div
	var ret = jQuery('<div class="ehcountdown_digit_number"></div>');

	ret.html(String(this.value));
	parentdiv.append(ret);
	return ret;
    }

    this.createBlockDiv = function() {
	var ret = jQuery('<div class="ehcountdown_digit_block"></div>').
	    add('<div class="ehcountdown_digit_block_deco"></div>');

	ret.first().css("z-index",String(this.basez + 10) + 5);
	ret.last().css("z-index",String(this.basez + 10));

	/* add number */
	this.addDigitToDiv(ret.first());
	return ret;
    }

    this.createBlockTopDiv = function() {
	var ret = this.createBlockDiv();
	ret.first().addClass("ehcountdown_digit_blockTop");
	ret.last(0).addClass("ehcountdown_digit_blockTop_deco");
	this.blockTopDiv = ret;
	return ret;
    }

    this.createBlockBottomDiv = function() {
	var ret = this.createBlockDiv();
	ret.first(0).addClass("ehcountdown_digit_blockBottom");
	ret.last(0).addClass("ehcountdown_digit_blockBottom_deco");
	this.blockBottomDiv = ret;
	return ret;
    }

    this.createGapDiv = function() {
	var ret = jQuery('<div class="ehcountdown_digit_gap"></div>');
	ret.css("z-index",String(this.basez + 5000));
	this.gapDiv = ret;
	return ret;
    }

    this.changeBlockNumber = function(blockDiv, newNumber) {
	blockDiv.children(".ehcountdown_digit_number").html(String(newNumber));
    }

    // the flaps will fall up and down to hide and reveal the
    // next/previous numbers. There is a top flap that falls down from
    // the top to the middle, and a bottom flap that falls from the
    // middle to the bottom.

    this.createFlaps = function() {
	ret = new Object();

	ret.top = this.blockTopDiv.clone();

	ret.top.addClass("ehcountdown_digit_flap");
	ret.top.addClass("ehcountdown_digit_flapTop");

	// bottom flap starts off hidden and will scroll down
	ret.bottom = this.blockBottomDiv.clone();
	ret.bottom.addClass("ehcountdown_digit_flap");
	ret.bottom.addClass("ehcountdown_digit_flapBottom");
	ret.bottom.css("display","none");

	// bring the flap elements to the front
	ret.top.add(ret.bottom).each(function(index, Element) {
	    var z = Number(jQuery(this).css("z-index"));
	    jQuery(this).css("z-index", String(z + 500));
	});

	// add them right next to the blocks they cover
	this.blockTopDiv.last().after(ret.top);
	this.blockBottomDiv.last().after(ret.bottom);

	return ret;
    }
}

/**
 * a count consists of a group of digits, and will represent a string
 * of digits in that visual.
 */

ehcountdown.DigitGroup = function(options) {
    var defaultOptions = {
	"numDigits" : 1,
	"caption" : null,
	"startValue" : "0",
	"animationSpeed" : "fast"
    };

    if(typeof options == "undefined") {
	this.options = defaultOptions;
    } else {
	this.options = options;
    }

    if(typeof this.options.numDigits == "undefined") {
	this.options.numDigits = defaultOptions.numDigits;
    }
    if(typeof this.options.caption == "undefined") {
	this.options.caption = defaultOptions.caption;
    }
    if(typeof this.options.startValue != "string") {
	this.options.startValue = defaultOptions.startValue;
    }
    if(typeof this.options.animationSpeed == "undefined") {
	this.options.animationSpeed = defaultOptions.animationSpeed;
    }

    // zero-pads new value if it doesn't have enough digits, ignores
    // extra digits
    this.normaliseValue = function(newValue) {
    	while(newValue.length < this.options.numDigits) {
    	    newValue = "0" + newValue;
    	}
	return newValue.substring(0,options.numDigits);
    }

    this.options.startValue = this.normaliseValue(this.options.startValue);

    this.addTo = function(parent) {
	var ret = jQuery('<div class="ehcountdown_counter"></div>');
	this.topDiv = ret;
	
	parent.append(ret);
	ret.append(this.createCaptionDiv());
	this.createDigits(this.topDiv);

	return ret;
    }

    this.createCaptionDiv = function() {
	if(this.options.caption == null) {
	    this.captionDiv = false;
	    return null;
	} else {
	    var ret = jQuery('<div class="ehcountdown_counter_caption"></div>');
	    ret.html(this.options.caption);
	    this.captionDiv = ret;
	    return ret;
	}
    }

    /* creates an array of digit divs */
    this.createDigits = function(parent) {
 	this.digits = [];

	var ret = jQuery('<div class="ehcountdown_counter_digits"></div>');
	parent.append(ret);

 	var i;
 	for(i = 0; i < this.options.numDigits; i++) {
	    this.digits[i] = new ehcountdown.Digit(this.options.startValue[i],
						   this.options.animationSpeed);
	    this.digits[i].addTo(ret);
	    this.digits[i].topDiv.addClass("ehcountdown_digit" + String(i+1));
	}
	return ret;
    }

    this.changeValue = function(newValue) {
	newValue = this.normaliseValue(newValue);
    	for(var digit = 0; digit < this.options.numDigits; digit++) {
    	    this.digits[digit].changeValue(newValue[digit]);
	}
    }
}

/*
 * Object for storing two dates, and easily getting various data about
 * the difference between them.
*/
ehcountdown.DateDifference = function(targetDate, options) {
    // in ms
    this.SECLEN  = 1000;
    this.MINLEN  = this.SECLEN * 60;
    this.HOURLEN = this.MINLEN * 60;
    this.DAYLEN  = this.HOURLEN * 24;
    this.WEEKLEN = this.DAYLEN * 7;


    this.options = options;

    this.targetDate = targetDate;

    this.counts = { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

    this.fieldIsSet = function(field) {
	if(typeof this.options[field] == "undefined") {
	    return false;
	} else if(typeof this.options[field] == "boolean") {
	    return this.options[field];
	} else {
	    // not undefined, and not false boolean, so treat as true
	    return true;
	}
    }

    this.getField = function(field) {
	return this.counts[field];
    }

    // returns the length of the smallest field that's enabled
    this.getUpdateFreq = function() {
	if(this.fieldIsSet("seconds")) {
	    return this.SECLEN;
	} else if(this.fieldIsSet("minutes")) {
	    return this.MINLEN;
	} else if(this.fieldIsSet("hours")) {
	    return this.HOURLEN;
	} else if(this.fieldIsSet("days")) {
	    return this.DAYLEN;
	} else if(this.fieldIsSet("weeks")) {
	    return this.WEEKLEN;
	}
    }

    this.updateCounts = function(fromDate) {
	
	var counts = {};
	if(typeof fromDate != "object") fromDate = new Date();

	var difference = this.targetDate.getTime() - fromDate.getTime();

	// if the target date has already passed, zero everything
	if(difference <= 0) {
	    counts.weeks   = 0;
	    counts.days    = 0;
	    counts.hours   = 0;
	    counts.minutes = 0;
	    counts.seconds = 0;

	    this.counts = counts;
	    return this.counts;
	}

	if(this.fieldIsSet("weeks")) {
	    counts.weeks = Math.floor(difference / this.WEEKLEN);
	    difference = difference % this.WEEKLEN;
	}

	if(this.fieldIsSet("days")) {
	    counts.days = Math.floor(difference / this.DAYLEN);
	    difference = difference % this.DAYLEN;
	}

	if(this.fieldIsSet("hours")) {
	    counts.hours = Math.floor(difference / this.HOURLEN);
	    difference = difference % this.HOURLEN;
	}

	if(this.fieldIsSet("minutes")) {
	    counts.minutes = Math.floor(difference / this.MINLEN);
	    difference = difference % this.MINLEN;
	}

	if(this.fieldIsSet("seconds")) {
	    counts.seconds = Math.floor(difference / this.SECLEN);
	    difference = difference % this.SECLEN;
	}

	this.counts = counts;
	return this.counts;
    }

    // initialise the count with the current time
    this.updateCounts();

}

ehcountdown.Countdown = function(targetDate, fields, duration) {
    this.dateDiff = new ehcountdown.DateDifference(targetDate, fields);
    this.fields = {};
    this.timeoutID = null;

    /* create a div for each field; css will handle how it should
     * look, where it should be etc */
    this.dateDiff.updateCounts();
    for(var key in fields) {
	// initalise object for this key
	this.fields[key] = {};
	if(typeof fields[key] == "boolean") {
	    if(fields[key] == false) {
		// false, just delete it and move on
		delete fields[key];
		continue;
	    }
	    // create new div
	    this.fields[key].div = 
		jQuery('<div class="ehcountdown_field ehcountdown_field_' 
		       + key + '"></div>');
	} else {
	    this.fields[key].div = fields[key];
	}
	// add the digit
	this.fields[key].digit = new ehcountdown.Digit(this.dateDiff.getField(key),
						       duration, 0);
	this.fields[key].digit.addTo(this.fields[key].div);
    }
    
    this.updateFreq = this.dateDiff.getUpdateFreq();

    /* not required if you've passed in pre-created elements to hold
     * the counter */
    this.addTo = function(parentElem) {
	for(var key in this.fields) {
	    parentElem.append(this.fields[key].div);
	}
    }

    /* recalculates based on current time (or passed in time) and
     * updates the contents of the fields */
    this.updateFields = function(newDate, complete) {
     	if(typeof newDate == "undefined") {
 	    newDate = new Date(); // now
 	}
	this.dateDiff.updateCounts(newDate);
	var numWaiting = 0;

	for(var key in this.fields) { numWaiting++; };
	// change each field, call callback on the last one (numWaiting < 1);
	for(var key in this.fields) {
 	    this.fields[key].digit.changeValue(this.dateDiff.getField(key),
					       function() {
						   if((--numWaiting < 1) &&
						      typeof complete == "function")
						       complete();
					       });
 	}
    }

    // initalise the autoUpdate
    this.start = function() {
	var counter = this;
	function updateTick() {
	    /* save start time here, and then we will use it later on
	     * to take off the time passed from the next update
	     * time */
	    var starttime = new Date();
	    counter.updateFields(starttime, function() {
		var timepassed = (new Date()).getTime() - starttime.getTime();
		var nexttime = 0;
		if(timepassed < counter.updateFreq)
		    nexttime = counter.updateFreq - timepassed;
		counter.timeoutID = setTimeout(updateTick, nexttime);
	    });
	}
	updateTick();
    }

    // stop the autoupdate
    this.stop = function() {
	if(this.timeoutID != null) {
	    clearTimeout(this.timeoutID);
	    this.timeoutID = null;
	}
    }

    this.toggle = function() {
	if(this.timeoutID == null)
	    this.start();
	else
	    this.stop();
    }
}

ehcountdown.EarthHourCountdown = function(seconds, animationSpeed) {
    this.targetDate = new Date(2014, 2, 29, 20, 30);
    this.fieldDivs = jQuery(); // empty jquery object
    this.digitDivs = {};
    this.animationSpeed = typeof animationSpeed == "undefined" ? "fast" : animationSpeed;

    this.captions = {days: "DAYS", hours: "HOURS", minutes: "MINS", seconds: "SECS" };

    this.addTo = function(div) {
	this.parentDiv = div;

	this.createFieldDiv("days");
	this.createFieldDiv("hours");
	this.createFieldDiv("minutes");
	if(typeof seconds == "boolean" && seconds == true)
	    this.createFieldDiv("seconds");

	this.parentDiv.append(this.fieldDivs);

	this.ec = new ehcountdown.Countdown(this.targetDate, this.digitDivs,
					    this.animationSpeed);

    }

   this.createFieldDiv = function(fieldName) {
	var ret = jQuery("<div class='ehcountdown_field ehcountdown_field_" +
			 fieldName + "'></div>");
	var digitDiv = jQuery("<div class='ehcountdown_field_digit'></div>");
	var captionDiv = jQuery("<div class='ehcountdown_field_caption'>" +
				this.captions[fieldName] + "</div>");
	this.digitDivs[fieldName] = digitDiv;
	ret.append(digitDiv);
	ret.append(captionDiv);
	this.fieldDivs = this.fieldDivs.add(ret);
	return ret;
    }

    this.start = function() {
	return this.ec.start();
    }

    this.stop = function() {
	return this.ec.stop();
    }

    this.stop = function() {
	return this.ec.toggle();
    }

}
