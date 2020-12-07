
class clsDatepicker {
    constructor(options) {
        // Validation
        if (!options || typeof options === undefined) {
            throw "Error: Datepicker.js options object must be defined, with at least options.containerElement.";
        }
        if (options.containerElement === undefined || !options.containerElement) {
            throw "Error: you must assign a container element in the Datepicker.js options object!";
        }

        // options
        this.options = options;
        this.containerElement = options.containerElement; // HTML element that will hold the datepicker
        this.moment = moment(moment(), "DD MM YYY h:mm:ss", true); // default date for calendar to initialize on
        this.timePicker = this.options.timePicker ? this.options.timePicker : true; // include time picker inputs
        this.presetMenu = this.options.presetMenu ? this.options.presetMenu : true; // include presets such as "this week, next week, etc."
        this.autoClose = this.options.autoClose ? this.options.autoClose : false; // whether or not the datepicker autocloses when selection is complete
        this.singleDate = this.options.singleDate ? this.options.singleDate : false; // whether the datepicker allows single date choice, or date range
        // methods
        this.drawCalendar = this.drawCalendar.bind(this);
        this.setDate = this.setDate.bind(this);
        this.nextMonth = this.nextMonth.bind(this);
        this.lastMonth = this.lastMonth.bind(this);
        this.highlightDates = this.highlightDates.bind(this);
        this.dates = [];
		this.timeElements = {};
		this.times = [];
        this.drawCalendar();
        // test logs
        // console.log(this.startOfMonth, this.endOfMonth);
        // console.log(this.moment.daysInMonth());
    }

    drawCalendar() {
        // we need to first set the first and last of the month in the state
        this.firstDayOfMonth = this.moment.startOf('month').format("dddd");
        this.lastDayOfMonth = this.moment.startOf('month').format("dddd");
        // then set our callback methods so they have the proper context
        let callbackNextMonth = this.nextMonth;
        let callbackLastMonth = this.lastMonth;
        let callbackSetDate = this.setDate;
        // Calendar UI
        let calendar = document.createElement('div');
        // add day headers (mon, tues, wed, etc.)
        let monthHeader = document.createElement('div');
        monthHeader.setAttribute('style', 'grid-column-start: 2; grid-column-end: 7;')
        let monthText = document.createTextNode(this.moment._locale._months[this.moment.month()] + " - " + this.moment.format("YYYY"));
        // left/right arrows for adjusting month
        let leftArrow = document.createElement('div');
        leftArrow.classList.add("leftArrow");
        leftArrow.innerHTML = "&#8672;";
        leftArrow.addEventListener('click', callbackLastMonth.bind(this));
        let rightArrow = document.createElement('div');
        rightArrow.classList.add("rightArrow");
        rightArrow.innerHTML = "&#8674;"
        rightArrow.addEventListener('click', callbackNextMonth.bind(this));
        // month text eg. "November - 2020"
        monthHeader.appendChild(monthText);
        monthHeader.classList.add('monthHeader')
        calendar.classList.add('grid-container');
        // add all the UI elements to the calendar
        calendar.appendChild(leftArrow);
        calendar.appendChild(monthHeader);
        calendar.appendChild(rightArrow);
        //add day header elements: "mon, tues, wed etc."
        this.moment._locale._weekdaysShort.forEach(function (day) {
            let dayHeader = document.createElement('div');
            dayHeader.classList.add(day);
            dayHeader.classList.add('dayHeader');
            dayHeader.innerHTML = " " + day + " ";
            calendar.appendChild(dayHeader);
        });
        // add day elements (day cells) to calendar
        let daysInMonth = Array.from(Array(this.moment.daysInMonth()).keys());
        daysInMonth.forEach(function (day) {
            let dayCell = document.createElement('div');
            dayCell.classList.add("day-" + (parseInt(day) + 1));
            dayCell.classList.add("day");
            dayCell.innerHTML = parseInt(day) + 1;
            let dateString = moment(this.moment.format("MM") + "/" + parseInt(day + 1) + "/" + this.moment.format("YYYY")).format("MM/DD/YYYY hh:mm:ss a");
            dayCell.value = dateString;
            dayCell.addEventListener('click', callbackSetDate.bind(this, dayCell));
            calendar.appendChild(dayCell);
        }.bind(this));
        // set the first of the month to be positioned on calendar based on day of week
        let firstDayElement = calendar.querySelector('.day-1');
        let monthStartPos = 'grid-column-start: ' + (this.moment._locale._weekdays.indexOf(this.firstDayOfMonth) + 1) + ';';
        // console.log(monthStartPos, firstDayElement);
        firstDayElement.setAttribute('style', monthStartPos);
        // Footer elements, contains start/end dates selected
        let startDateElement = document.createElement('div');

        if (!this.singleDate) {
            startDateElement.setAttribute('style', 'grid-column-start: 1; grid-column-end: 4;')
            startDateElement.classList.add('startDateElement')
            calendar.appendChild(startDateElement);
            let endDateElement = document.createElement('div');
            endDateElement.classList.add('endDateElement');
            endDateElement.setAttribute('style', 'grid-column-start: 4; grid-column-end: 8;');
            calendar.appendChild(endDateElement);
            // set calendar start/end dates in the UI
            if (this.dates[0]) {
                startDateElement.innerHTML = "Start Date: " + this.dates[0];
            } else {
                startDateElement.innerHTML = "Start Date: ";
            }
            if (this.dates[1]) {
                endDateElement.innerHTML = "Start Date: " + this.dates[1];
            } else {
                endDateElement.innerHTML = "End Date: ";
            }
        } else {
            if (this.dates[0]) {
                startDateElement.innerHTML = "Date: " + this.dates[0];
            } else {
                startDateElement.innerHTML = "Date: ";
            }
            startDateElement.setAttribute('style', 'grid-column-start: 1; grid-column-end: 8;')
            startDateElement.classList.add('startDateElement')
            calendar.appendChild(startDateElement);
        }
		
		//!this.singleDate
		if(this.timePicker) {
			this.times.push("");this.times.push("");
			
		    let startTimeElement = document.createElement('div');
		    startTimeElement.classList.add("startTimeElement");
		    startTimeElement.style.gridColumnStart = 1;
		    startTimeElement.style.gridColumnEnd = 4;
		    
		    let startHour = document.createElement("div"); 
		    startHour.classList.add("hour");
		    startHour.innerHTML = "<input type='number' value='12' />";
		    startHour.style.gridColumn = "1 / span 2"; //2
			
			let startHourValueEl = startHour.querySelector("input");
			startHourValueEl.setAttribute("ReadOnly", "true");
			startHourValueEl.classList.add("ReadOnly");
			this.timeElements.startHourValueEl = startHourValueEl;
		    
		    let startHourUpDown = document.createElement("span"); 
		    startHourUpDown.classList.add("TimeUpDown");
		    startHourUpDown.innerHTML = "<div>&#9650;</div><div>&#9660;</div>";
			
			// Up
			startHourUpDown.querySelectorAll("div")[0].onclick = function() {
				let newVal = parseInt(startHourValueEl.value) + 1;
				if(newVal > 12) {
					newVal = 1;
				}else if(newVal < 1) {
					newVal = 12;
				}
				startHourValueEl.value = newVal;
				this.setTime();
			}.bind(this);
			// Down
			startHourUpDown.querySelectorAll("div")[1].onclick = function() {
				let newVal = parseInt(startHourValueEl.value) - 1;
				if(newVal > 12) {
					newVal = 1;
				}else if(newVal < 1) {
					newVal = 12;
				}
				startHourValueEl.value = newVal;
				this.setTime();
			}.bind(this);
			
		    startHour.appendChild(startHourUpDown);
		    
		    startTimeElement.appendChild(startHour);
		    /***************************************************/
		    
		    let timeColon = document.createElement("div"); 
		    timeColon.innerHTML = ":";
		    timeColon.classList.add("timeColon");
		    timeColon.style.gridColumn = "3 / span 1"; //3
		    startTimeElement.appendChild(timeColon);
		    /***************************************************/
		    
		    let startMinute = document.createElement("div"); 
		    startMinute.classList.add("minute");
		    startMinute.innerHTML = "<input type='number' value='00' />";
		    startMinute.style.gridColumn = "4 / span 2"; //6
			
			let startMinuteValueEl = startMinute.querySelector("input");
			startMinuteValueEl.setAttribute("ReadOnly", "true");
			startMinuteValueEl.classList.add("ReadOnly");
			this.timeElements.startMinuteValueEl = startMinuteValueEl;
		    
		    let startMinuteUpDown = document.createElement("span"); 
		    startMinuteUpDown.classList.add("TimeUpDown");
		    startMinuteUpDown.innerHTML = "<div>&#9650;</div><div>&#9660;</div>";
			
			// Up
			startMinuteUpDown.querySelectorAll("div")[0].onclick = function() {				
				let newVal = parseInt(startMinuteValueEl.value) + 1;
				if(newVal > 59) {
					newVal = 0;
				}else if(newVal < 0) {
					newVal = 59;
				}
				startMinuteValueEl.value = newVal;
				if(startMinuteValueEl.value.length < 2) {
				    startMinuteValueEl.value = "0" + startMinuteValueEl.value;
				}
				this.setTime();
			}.bind(this);
			// Down
			startMinuteUpDown.querySelectorAll("div")[1].onclick = function() {
				let newVal = parseInt(startMinuteValueEl.value) - 1;
				if(newVal > 59) {
					newVal = 0;
				}else if(newVal < 0) {
					newVal = 59;
				}
				startMinuteValueEl.value = newVal;
				if(startMinuteValueEl.value.length < 2) {
				    startMinuteValueEl.value = "0" + startMinuteValueEl.value;
				}
				this.setTime();
			}.bind(this);
			
		    startMinute.appendChild(startMinuteUpDown);
		    
		    startTimeElement.appendChild(startMinute);
		    /***************************************************/
		    
		    let startampm = document.createElement("div"); 
		    startampm.classList.add("ampm");
		    startampm.innerHTML = "";
		    startampm.style.gridColumn = "6 / span 1"; //7
			this.timeElements.startampm = startampm;
		    
		    let startam = document.createElement("div"); 
		    startam.classList.add("am");
		    startam.innerHTML = "AM";
			startam.onclick = function () {
				startam.setAttribute("SELECTED", "true");
				startpm.removeAttribute("SELECTED");
				this.setTime();
			}.bind(this);
		    startampm.appendChild(startam);
			
		    let startpm = document.createElement("div"); 
		    startpm.classList.add("pm");
		    startpm.innerHTML = "PM";
			startpm.setAttribute("SELECTED", "true");
			startpm.onclick = function () {
				startpm.setAttribute("SELECTED", "true");
				startam.removeAttribute("SELECTED");
				this.setTime();
			}.bind(this);
			
		    startampm.appendChild(startpm);
		    startTimeElement.appendChild(startampm);
		    /***************************************************/
			calendar.appendChild(startTimeElement);
			
			if (!this.singleDate){
			    let endTimeElement = document.createElement('div');
		        endTimeElement.classList.add("endTimeElement");
		        endTimeElement.style.gridColumnStart = 4;
		        endTimeElement.style.gridColumnEnd = 8;
		    
		        let endHour = document.createElement("div"); 
		        endHour.classList.add("hour");
		        endHour.innerHTML = "<input type='number' value='01' />";
		        endHour.style.gridColumn = "1 / span 2"; //2
				
				let endHourValueEl = endHour.querySelector("input");
				endHourValueEl.setAttribute("ReadOnly", "true");
				endHourValueEl.classList.add("ReadOnly");
				this.timeElements.endHourValueEl = endHourValueEl;
		    
		        let endHourUpDown = document.createElement("span"); 
		        endHourUpDown.classList.add("TimeUpDown");
		        endHourUpDown.innerHTML = "<div>&#9650;</div><div>&#9660;</div>";
				
				// Up
				endHourUpDown.querySelectorAll("div")[0].onclick = function() {
					let newVal = parseInt(endHourValueEl.value) + 1;
				    if(newVal > 12) {
					    newVal = 1;
				    }else if(newVal < 1) {
					    newVal = 12;
				    }
				    endHourValueEl.value = newVal;
					this.setTime();
				}.bind(this);
				// Down
				endHourUpDown.querySelectorAll("div")[1].onclick = function() {
					let newVal = parseInt(endHourValueEl.value) - 1;
				    if(newVal > 12) {
					    newVal = 1;
				    }else if(newVal < 1) {
					    newVal = 12;
				    }
				    endHourValueEl.value = newVal;
					this.setTime();
				}.bind(this);
				
		        endHour.appendChild(endHourUpDown);
		        endTimeElement.appendChild(endHour);
		        /***************************************************/
		        
		        let timeColon = document.createElement("div"); 
		        timeColon.innerHTML = ":";
		        timeColon.classList.add("timeColon");
		        timeColon.style.gridColumn = "3 / span 1"; //3
		        endTimeElement.appendChild(timeColon);
		        /***************************************************/
		        
		        let endMinute = document.createElement("div"); 
		        endMinute.classList.add("minute");
		        endMinute.innerHTML = "<input type='number' value='00' />";
		        endMinute.style.gridColumn = "4 / span 2"; //6
				
				let endMinuteValueEl = endMinute.querySelector("input");
				endMinuteValueEl.setAttribute("ReadOnly", "true");
				endMinuteValueEl.classList.add("ReadOnly");
				this.timeElements.endMinuteValueEl = endMinuteValueEl;
		        
		        let endMinuteUpDown = document.createElement("span"); 
		        endMinuteUpDown.classList.add("TimeUpDown");
		        endMinuteUpDown.innerHTML = "<div>&#9650;</div><div>&#9660;</div>";
				
				// Up
				endMinuteUpDown.querySelectorAll("div")[0].onclick = function() {
					let newVal = parseInt(endMinuteValueEl.value) + 1;
				    if(newVal > 59) {
					    newVal = 0;
				    }else if(newVal < 0) {
					    newVal = 59;
				    }
				    endMinuteValueEl.value = newVal;
				    if(endMinuteValueEl.value.length < 2) {
				        endMinuteValueEl.value = "0" + endMinuteValueEl.value;
				    }
					this.setTime();
				}.bind(this);
				// Down
				endMinuteUpDown.querySelectorAll("div")[1].onclick = function() {
				    let newVal = parseInt(endMinuteValueEl.value) - 1;
				    if(newVal > 59) {
					    newVal = 0;
				    }else if(newVal < 0) {
					    newVal = 59;
				    }
				    endMinuteValueEl.value = newVal;
				    if(endMinuteValueEl.value.length < 2) {
				        endMinuteValueEl.value = "0" + endMinuteValueEl.value;
				    }
					this.setTime();
				}.bind(this);
		        endMinute.appendChild(endMinuteUpDown);		        
		        endTimeElement.appendChild(endMinute);
		        /***************************************************/
		        
		        let endampm = document.createElement("div"); 
		        endampm.classList.add("ampm");
		        endampm.innerHTML = "";
		        endampm.style.gridColumn = "6 / span 1"; //7
				this.timeElements.endampm = endampm;
		        
		        let endam = document.createElement("div"); 
		        endam.classList.add("am");
		        endam.innerHTML = "AM";
				endam.onclick = function () {
					endam.setAttribute("SELECTED", "true");
					endpm.removeAttribute("SELECTED");
					this.setTime();
				}.bind(this);
		        endampm.appendChild(endam);
				
		        let endpm = document.createElement("div"); 
		        endpm.classList.add("pm");
		        endpm.innerHTML = "PM";
				endpm.setAttribute("SELECTED", "true");
				endpm.onclick = function () {
					endpm.setAttribute("SELECTED", "true");
					endam.removeAttribute("SELECTED");
					this.setTime();
				}.bind(this);
				
		        endampm.appendChild(endpm);
		        endTimeElement.appendChild(endampm);
				
		        /***************************************************/
				calendar.appendChild(endTimeElement);
			}
			this.setTime();
		}
		
        // Finally, add calendar element to the containerElement assigned during initialization
        this.containerElement.appendChild(calendar);
    }
	setTime() {
		/*
		Elements in timeElements object
		this.timeElements.startHourValueEl
		this.timeElements.startMinuteValueEl
		this.timeElements.startampm
		this.timeElements.endHourValueEl
		this.timeElements.endMinuteValueEl
		this.timeElements.endampm
		*/
		
		this.times[0] = this.timeElements.startHourValueEl.value + ":" + this.timeElements.startMinuteValueEl.value + ":00 " + this.timeElements.startampm.querySelectorAll('[selected="true"]')[0].innerHTML;
		if (!this.singleDate){
			this.times[1] = this.timeElements.endHourValueEl.value + ":" + this.timeElements.endMinuteValueEl.value + ":00 " + this.timeElements.endampm.querySelectorAll('[selected="true"]')[0].innerHTML;
		}
		//console.log(this.times);
	}
    // helper method to set start/end date on each calendar day click
    setDate(dayCell) {
        // set the start/end date in both the UI and the class's state
        if (!this.singleDate) {
            if (this.dates.length === 2 || !this.dates.length) {
                this.dates = [];
                this.dates[0] = dayCell.value;
                this.containerElement.querySelector('.startDateElement').innerHTML = "Start Date: " + dayCell.value;
                this.containerElement.querySelector('.endDateElement').innerHTML = "End Date: ";
            } else {
                if (moment(this.dates[0]) > moment(dayCell.value)) {
                    this.dates[1] = this.dates[0];
                    this.dates[0] = dayCell.value;
                    this.containerElement.querySelector('.startDateElement').innerHTML = "Start Date: " + this.dates[0];
                    this.containerElement.querySelector('.endDateElement').innerHTML = "End Date: " + this.dates[1];
                } else {
                    this.dates[1] = dayCell.value;
                    this.containerElement.querySelector('.endDateElement').innerHTML = "End Date: " + dayCell.value;
                }
            }
        } else {
            this.dates = [];
            this.dates[0] = dayCell.value;
            this.containerElement.querySelector('.startDateElement').innerHTML = "Date: " + this.dates[0];
        }
        this.highlightDates();
    }
    // advances the calendar by one month
    nextMonth() {
        this.containerElement.innerHTML = "";
        this.moment.add(1, 'months');
        this.drawCalendar();
        // draw highlighting if there are any dates selected:
        this.highlightDates();
    }
    // moves the calendar back one month
    lastMonth() {
        this.containerElement.innerHTML = "";
        this.moment.add(-1, 'months');
        this.drawCalendar();
        // draw highlighting if there are any dates selected:
        this.highlightDates();
    }
    // sets highlighted dates on calendar UI
    highlightDates() {
        // reset or set the UI selected cell styling
        let days = this.containerElement.querySelectorAll('.day');
        days.forEach(function (day) {
            if (day.classList.contains('active')) {
                day.classList.remove('active');
            }
            if (day.classList.contains('highlighted')) {
                day.classList.remove("highlighted");
            }
        });
        // adds calendar day highlighted styling
        if (this.dates.length > 0 && this.dates.length === 2) {
            days.forEach(function (day) {
                let indexDate = moment(day.value);
                let firstDate = moment(this.dates[0]);
                let secondDate = moment(this.dates[1]);
                if ((firstDate - indexDate) === 0) {
                    day.classList.add('active');
                }
                if ((secondDate - indexDate) === 0) {
                    day.classList.add('active');
                }
                if (indexDate > firstDate && indexDate < secondDate) {
                    day.classList.add("highlighted");
                }
            }.bind(this));
        }
        // add 'active' class to currently clicked date if there is one.
        if (this.dates.length === 1) {
            days.forEach(function (day) {
                let indexDate = moment(day.value);
                let firstDate = moment(this.dates[0]);
                if ((firstDate - indexDate) === 0) {
                    day.classList.add('active');
                }
            }.bind(this));
        }
    }
}
