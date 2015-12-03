# Date Selector

The date selector allows the user to pick a date from a calendar. The date parameter usually corresponds to a day, unless the parsing and formating options state otherwise. The day will correspond to the start (or end) of the period defined by the precisions of the selector.

-----

 <br>
# Date Range Selector Options

## date
*{ String }*

Define the name of the dashboard parameter that should be used to bind to the date. The selector will still maintain an internal state for a given date parameter, even when the corresponding dashboard parameter is not specified by the user.

**Example**
>
	{
		dat: 'dateParam'
	}

The component will always call:

	component.dashboard.fireChange( dateParameterName , parameterValue )

<br>
## foldDirection
*{ 'left' | 'right' | 'bottom' }*

Controls the direction where the selector calendar should appear. All values that are not either *'left'* or *'right'* are considered to be *'bottom'*.

By default, the selector will determine the amount of available space, assuming that the popup will have the same width as the main component container itself. The priority order in the fold direction is as follows:

	left > right > bottom

<br>
## precision
*{ String }*

Controls the precision of the calendar, affecting the kinds of periods that can be chosen by the calendar, the format of the main display and limiting the date parameter (which always corresponds to a day) to the beggining or end of the precision period.

### Default Value
	
	day

<br>
## edge
*{ 'start' | 'end' }*

Controls if the date parameter corresponds to the start or the end of the configured precision period.

**Example**
>
With a selected date of *May, 2015* and a *month* precision, the date point corresponding to the date parameter will either be the first or the last day of the month.
The display will show:
>
**edge: 'start'**
>
	May (01, 2015)
>
**edge: 'end'**
>
	May (31, 2015)
	
	
### Default Value
	
	start


<br>
## dateFormat 
*{ Function | Object:(String|Function) }*

Controls the format of the dates shown in the selector main display. 

### Function 
	function ( date , precision )

*arguments*

- date *{Moment}* : date to format.
- precision *{String}*: selected precision.

*returns*

- date display *{String}* : string to display on the calendar prompts, indicating the date.

**Example**
>
	function formatter ( date , precision ){
		var format = ( precision === 'day' ) ? 'YYYY*MM*DD' : 'YYYY';
		return date.format( format );
	}
	
 
### Object 
The object keys correspond to precisions. The values will control the format for the corresponding precision, either using a String format or a Function format.

#### Object:String
Accepts format strings as used by Moment.js

**Example**
>
For date equal to *2015-03-01* the following formatting string will produce:
>
	MMM DD, YYYY -> Mar 01, 2015

#### Object:Function 
Similar to the global formatter function but without the precision argument.

	function ( date )

*arguments*

- date *{Moment}* : date to format.

*returns*

- date display *{String}* : string to display on the calendar prompts, indicating the date.

**Example**
>
	function formatter ( date ){
    	return date.format('YYYY/MM/DD');
	}
	
The String and Function formats can be me mixed in the same configuration object, for different precisions.

**Example**
>
	{
		'day': 'MMM DD, YYYY',
		'month': 'MMM, YYYY',
		'year': function ( date ){
			return "It was the glorious year of " + date.format('YYYY");
		}
	}
	
 
### Default Value
The component will use the default values for a a given precision, if the formatter is not defined in the configuration option. In the case of a global function formatter (with the precision argument), the formatter will always take precedence even over the default values, since it is expected that such function is able to handle all cases.

	{
		'day' : 'MMM DD, YYYY',
		'month': 'MMM [<span class="weak">](DD, YYYY)[</span>]',
		'week': '[Week] ww [<span class="weak">](MMM DD, YYYY)[</span>]',
		'isoWeek': '[Week] WW [<span class="weak">](MMM DD, YYYY)[</span>]',
		'quarter': '[Q]Q [<span class="weak">](MMM DD, YYYY)[</span>]',
		'year': 'YYYY [<span class="weak">](MMM DD)[</span>]'
	}

 
### Notes
 - String formats use the Moment.js formatting syntax, and so square brackets identify escaped sub-strings.
 - Formatted values will be included in html templates rendered using Mustache, as unescaped html.
 
 **Example**
> 
With a range format for year precision of:
> 
 	[<strong>Year:</strong> ]YYYY
> 
and a date in 2015, the following string is produced:
>
	<strong>Year:</strong> 2015
>	
which is rendered as:
>
<strong>Year:</strong> 2015

 <br>
## calendarFormat 
*{ Function | Object:(String|Function) }*

Controls the format of the dates displayed inside the calendar. 

### Function 
	function ( date , precision )

*arguments*

- date *{Moment}* : date to format.
- precision *{String}*: selected precision.

*returns*

- date display *{String}* : string to display on the calendar elements.

**Example**
>
	function formatter ( date , precision ){
		var format = ( precision === 'day' ) ? 'DD' : 'YYYY';
		return date.format( format );
	}
	
 
### Object 
The object keys correspond to precisions. The values will control the format for the corresponding precision, either using a String format or a Function format.

#### Object:String
Accepts format strings as used by Moment.js

**Example**
>
For date equal to *2015-03-01* the following formatting strings will produce:
>
	MMM -> Mar
	DD -> 03
	YYYY -> 2015

#### Object:Function 
Similar to the global formatter function but without the precision argument.

	function ( date )

*arguments*

- date *{Moment}* : date to format.

*returns*

- date display *{String}* : string to display on the calendar elements.

**Example**
>
	function formatter ( date ){
    	return date.format('DD');
	}
	
 
The String and Function formats can be me mixed in the same configuration object, for different precisions.

**Example**
>
	{
		'day': 'DD',
		'month': 'MMM',
		'year': function ( date ){
			return "Y:" + date.format('YYYY");
		}
	}
	
 
### Default Value
The component will use the default values for a a given precision, if the formatter is not defined in the configuration option. In the case of a global function formatter (with the precision argument), the formatter will always take precedence even over the default values, since it is expected that such function is able to handle all cases.

	{
		'day' : 'DD',
		'month': 'MMM',
		'week': function ( date ){
			var startMonth = date.startOf('week').format('MMM'),
				endMonth = date.endOf('week').format('MMM'),
				model = {
				 	week: date.format('[W]w'),
					range: ( startMonth == endMonth ) ? startMonth : startMonth + ' - ' + endMonth
				},
				template = '{{week}} <span class="weak">({{range}})</span>';
			return Mustache.render( template, model );
		},
		'isoWeek': function ( date ){
			var startMonth = date.startOf('isoWeek').format('MMM'),
				endMonth = date.endOf('isoWeek').format('MMM'),
				model = {
					week: date.format('[W]W'),
					range: ( startMonth == endMonth ) ? startMonth : startMonth + ' - ' + endMonth
				},
				template = '{{week}} <span class="weak">({{range}})</span>';
			return Mustache.render( template, model );
		},
		'quarter': '[Q]Q',
		'year': 'YYYY'
	}

 
### Notes
 - String formats use the Moment.js formatting syntax, and so square brackets identify escaped sub-strings.
 - Formatted values will be included in html templates rendered using Mustache, as unescaped html.
 
**Example**
> 
With a range format for year precision of:
> 
 	[<strong>Y:</strong> ]YYYY
> 
and a date in 2015, the following string is produced:
>
	<strong>Y:</strong> 2015
>	
which is rendered as:
>
<strong>Y:</strong> 2015

 <br>
## inputFormat 
*{ String | Function }*

Defines the format to be used to parse and format component date parameter between a custom format and a moment object. The parsing is also applied to max date and min date options, which are assumed to share the format of the date parameter.

### String 
String format as used by Moment.js. In this mode, the same string is used to parse and format the dates.

**Example**
>
>The following formatting strings should be used to parse (and format) the date parameter, corresponding to the same date:
>
	2015-03-01 -> YYYY-MM-DD
	2015/01/02 -> YYYY/DD/MM
	Mar 01, 2015 -> MMM DD, YYYY


### Function 
This mode is used when the date parameter are represented by a format which is not handled by Moment.js. In this case, we typically need a parsing function and a formatting function. The component assumes that is handled by the function passed to **inputFormat** and, to differentiate between the two cases, passes another argument to the function indicating whether it is a formatting call or not.
	
	function ( isFormattingCall , date )

*arguments*

- isFormattingCall *{Boolean}* : **true** is the date parameter is to be formatted, **false** if it should be parsed.
- date *{Moment}* : date to format/parse.

*returns*

- formatted/parsed date *{customFormat|Moment}* : the function should return a customFormat if *isFormattingCall* is **true**, or a Moment.js object if *isFormattingCall* is **false**.

**Example**
>
	function dateTransformer ( isFormattingCall , date ){
    	return isFormattingCall ? myFormatter(date) : myParser(date);
	}
>
	// with
>	
	function myParser( date ){ ... } //returns Moment object
	function myFormatter( date ){ ... } //returns String
	
 
### Default Value

	'YYYY-MM-DD'

 <br>
## max / min 
*{ customDateFormat | Function }*

Defines an upper/lower bound to the selectable date limits. The maximum/minimum value is either assumed to be supplied in the same format as the date parameter and parsed using the same parser, or supplied by a function. 
The maximum/minimum is used in the calendar to prevent the user from selecting dates above the upper/lower bound.


### customDateFormat
This is tipically a String but, if *inputFormat* is a custom function, this can be any other thing, as long as the output of the function, in parser mode, is a  Moment.js object

### Function

function customDateFormat ( now )

*arguments*

- now *{ Moment }* : a Moment.js object generated by calling.

		moment()

*returns*

- maximum/minimum value *{ Moment }* : this should a return a format that the component can understand, and so it needs to be a Moment.js object.

### Default Value

**max**

	function (){
		return moment();
	}
	
**min**

	function (){
		return moment().add(-20 , 'year');
	}

<br> 
## calendarStart / calendarEnd
*{ customDateFormat | Function }*

Defines an upper/lower bound to the visible calendar limits. The calendarStart/calendarEnd value is either assumed to be supplied in the same format as the date parameter and parsed using the same parser, or supplied by a function. 

The calendarStart/calendarEnd is used in the calendar to limit visible date points. **These properties only affect the list of years, since the others have a well defined number of points**. 
When no calendarStart/calendarEnd values are supplied, and none are defined as defaults, the component will revert to the min/max values, respectively.


### customDateFormat
This is tipically a String but, if *inputFormat* is a custom function, this can be any other thing, as long as the output of the function, in parser mode, is a  Moment.js object

### Function

	function customDateFormat ( now )

*arguments*

- now *{ Moment }* : a Moment.js object generated by calling.

		moment()

*returns*

- calendarStart/calendarEnd value *{ Moment }* : this should a return a format that the component can understand, and so it needs to be a Moment.js object.

	
 
### Default Value

Both properties have undefined default values, so that the component's default behavior is to revert to min/max.

----

<br>
# Date Range Selector Defaults API

Setting and getting default selector values can be done using a class method. 

*Getting*

	DateRangeSelectorComponent.getDefaults( defaultOptionName )
	
*Setting*

	DateRangeSelectorComponent.setDefaults( 'defaultOptionName' , newDefaults )
The getters and setters are functions of the Date Range Selector Component constructor.

-----

<br>
# Date Range Selector Localization

Selector localization can refer to customizing selector formats and labels for a give locale or configuring date related things like the days of the week or month names.

## Formats & Labels

Configuring formats and labels globally, to all the selectors in a solution, is achieved by using the class methods for setting and getting defaults, as described previously.

Another option is to use the localized formats that Moment.js accepts and control those formats directly by configuring moment, which is reverts to the second aspect of localization in the selector.


## Moment.js localization
The component relies heavily on Moment.js for all the date operations, and so it will take advantage of the localization capabilities of the library. 

**Example (from Moment.js)**

Changing locale to portuguese and setting some uncommon short names for weekdays.

	moment.locale('pt', {
		weekdaysShort : ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
	});

Most of these definitions will be available with Moment.js localization files and, if those are included, configuration will mostly require:

	moment.locale('pt');

