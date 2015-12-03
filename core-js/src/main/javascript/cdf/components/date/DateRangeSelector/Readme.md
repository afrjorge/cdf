# Date Range Selector

The date range selector allows the user to pick a range, either from a list of predefined ranges or a custom one, which is defined by 4 parameters:

- **start:** the start date of the range. It usually corresponds to a day, unless the parsing/formating specifications state otherwise.
- **end:** the end date of the range. It usually corresponds to a day, unless the parsing/formating specifications state otherwise.
- **precision:** the precision represents how the range was selected, in terms of time period precision. When changing precisions, the selector will always normalize the start and end values so that they are coherent with the selected precision – for a monthly precision, the start date will always be the start of a month and the end date will always be the end of a month.
- **granularity:** the granularity parameter allows the user to pick, how the data should be aggregated, in other components. Changing this parameter has no influence on the **start**, **end** or **precision** parameters, but the list of available granularities is affected by all 3. The main idea of the granularity parameter is to make it easy for other components to doing things like representing all the days in a range of 10 years.

----

<br>
# Date Range Selector Options

## start / end / precision / granularity
*{ String }*

Define the name of the dashboard parameter that should be used to bind to each of the 4 range parameters. The selector will still maintain an internal state for a given range parameter, even when the corresponding dashboard parameter is not specified by the user.

**Example**
>
	{
		start: 'startDateParam',
		end: 'endDateParam',
		precision: 'precisionParam',
		granularity: 'granularityParam'
	}

The component will always call:

	component.dashboard.setParameter( parameterName , parameterValue )
	
on all parameters but one, on which will do:

	component.dashboard.fireChange( parameterName , parameterValue )
	
meaning that only the change in one of the parameters will ever be notified to the dashboard. To decide which parameter is going to be used for *fireChange*, the component checks for the last defined and non-empty parameter name from a list given by:
	
	component.getInputParameters()

which can be set, for each component, using:

	component.setInputParameters( parametersIncreasingPriorityArray )

**Example**
> If we have:
> 
	> component.getInputParameters();
	  [ 'granularity' , 'precision' , 'start' , 'end' ]
> it means that, if defined, the component will always trigger *fireChange* for the **end** parameter. If the **end** parameter name is not defined, it will try **start**, and so on...
>
> Doing:
> 
	> component.setInputParameters( [ 'granularity' , 'precision' , 'end' , 'start' ] );
> changes the parameter priority, so that **start** is the first parameter to be considered.

<br>
## inputParameters (defaults Only)
*{ Array:String }*

Defines the default parameter priority for all the components, in case it is not specified per instance, using *component.setInputParameters*. The order of the parameters in the array goes from lower to higher priority.

### Default Value

	[ 'granularity' , 'precision' , 'start' , 'end' ]

<br>
## actionsOnTop
*{ Boolean }*

Defines whether the Apply/Cancel buttons should appear on the top (*true*) or bottom (*false*) of the selector.

###Default Value

	false
	
<br>
## foldDirection
*{ 'left' | 'right' | 'bottom' }*

Controls the direction where the customRange mode popups should appear. All values that are not either *'left'* or *'right'* are considered to be *'bottom'*.

By default, the selector will determine the amount of available space, assuming that the popups will have the same width as the main component container itself. The priority order in the fold direction is as follows:

	left > right > bottom


<br>
## rangeFormat 
*{ Function | Object:(String|Function) }*

Controls the format of the range displayed in the selector main container. 

### Function 
	function ( start , end , precision )

*arguments*

- start *{Moment}* : selected start date.
- end *{Moment}*: selected end date.
- precision *{String}*: selected precision.

*returns*

- range display *{String}* : string to display on the selector indicating the range.

**Example**
>
This custom formatter formats the range, with daily precisions, differently. For all the other precisions, it formats the range as if it had a year precision.
>
	function formatter ( start , end , precision ){
		function formatDay ( date ){
			return date.format('YYYY*MM*DD');
		}
		function formatYear ( date ){
			return date.format('YYYY');
		}
		function formatRange( startDisplay , endDisplay ){
			return startDisplay + ' to ' + endDisplay;
		}
>		
		var dateFormatter = ( precision === 'day' ) ? formatDay : formatYear;
		return formatRange( dateFormatter(start) , dateFormatter(end) );
	}
	


### Object 
The object keys correspond to precisions. The values will control the format for the corresponding precision, either using a String format or a Function format.
Additionally, the reserved key *_separator* is used to specify the string to be used to separate the start and end dates in the display (only relevant for the Object:String format).

#### Object:String
Accepts format strings as used by Moment.js, which format both the start and end dates in the range.
TODO: Add link to Moment.js format.
Brackets are used to indentify a part of the string that is only to be displayed, in the start value, if the formatted string is different for start and end.

**Example**
>
For start date equal to *2015-03-01* and end date equal to *2015-03-05*, and a separator with the string *" to "*, the following formatting strings will produce:
>
*Without brackets*
>
	MMM DD, YYYY -> Mar 01, 2015 to Mar 03, 2015
>	
*With brackets*
>
	MMM DD{, YYYY} -> Mar 01 to Mar 03, 2015
>	
*With brackets and starting year: 2014*
>	
	MMM DD{, YYYY} -> Mar 01, 2014 to Mar 03, 2015


#### Object:Function 
Similar to the global formatter function but without the precision argument.

	function ( start , end )

*arguments*

- start *{Moment}* : selected start date.
- end *{Moment}*: selected end date.

*returns*

- range display *{String}* : string to display on the selector indicating the range.

**Example**
>
	function formatter ( start , end ){
		function formatDay ( date ){
     		return date.format('YYYY*MM*DD');
    	}
    	return formatDay(start) + ' to ' + formatDay(end);
	}
	
The String and Function formats can be me mixed in the same configuration object, for different precisions.

**Example**
>
	{
		'day': 'MMM DD{, YYYY}',
		'month': 'MMM{, YYYY}',
		'year': function ( start , end ){
			return "Still going strong since " + start.format('YYYY') + ' up until ' + end.format('YYYY");
		}
	}
	

### Default Value
The component will use the default values for a a given precision, if the formatter is not defined in the configuration option. In the case of a global function formatter (with the precision argument), the formatter will always take precedence even over the default values, since it is expected that such function is able to handle all cases.

	{
		'day': 'MMM DD{, YYYY}',
		'week': '[Week] ww{, YYYY}',
		'isoWeek': '[Week] ww{, YYYY}',
		'month': 'MMM{, YYYY}',
		'quarter': '[Q]Q{, YYYY}',
		'year': 'YYYY'
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
and a range going from 2010 to 2015, the following string is produced:
>
	<strong>Year:</strong> 2010 to <strong>Year:</strong> 2015
>	
which is rendered as:
>
<strong>Year:</strong> 2010 to <strong>Year:</strong> 2015

<br>
## dateFormat 
*{ Function | Object:(String|Function) }*

Controls the format of the dates displayed in the custom range dropdown. 

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

Defines the format to be used to parse and format component date parameters between a custom format and a moment object. The parsing is also applied to max date and min date options, which are assumed to share the format of the date parameters.

### String 
String format as used by Moment.js. In this mode, the same string is used to parse and format the dates.

**Example**
>
>The following formatting strings should be used to parse (and format) the date parameters, corresponding to the same date:
>
	2015-03-01 -> YYYY-MM-DD
	2015/01/02 -> YYYY/DD/MM
	Mar 01, 2015 -> MMM DD, YYYY


### Function 
This mode is used when the date parameters are represented by a format which is not handled by Moment.js. In this case, we typically need a parsing function and a formatting function. The component assumes that is handled by the function passed to **inputFormat** and, to differentiate between the two cases, passes another argument to the function indicating whether it is a formatting call or not.
	
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

Defines an upper/lower bound to the selectable range limits. The maximum/minimum value is either assumed to be supplied in the same format as the date parameters and parsed using the same parser, or supplied by a function.
The maximum/minimum is used in the calendars to prevent the user from selecting dates above the upper/lower bound, as well as in the range definition, activelly limiting the range to fit inside the limits.


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

Defines an upper/lower bound to the visible calendar limits. The calendarStart/calendarEnd value is either assumed to be supplied in the same format as the date parameters and parsed using the same parser, or supplied by a function.

The calendarStart/calendarEnd is used in the calendars to limit visible date points. **These properties only affect the list of years, since the others have a well defined number of points**. 
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


<br>
## labels 
*{ Object:String }*

Defines all the static labels on the component. See *Default Value* for the list of controllable labels.

### Default Value

	{
		cancelButton: 'Cancel',
		applyButton: 'Apply',
		intervals: 'Intervals:',
		customRange: 'Custom Range',
		selectedPeriod: 'Selected Period:',
		startDate: 'Start Date:',
		endDate: 'End Date:',
		granularity: 'Granularity:'
	}

<br>
## granularities 
*{ String | Array:( String | Object ) }*

Defines the granularities available in the granularities selector, when the *customRange* mode is active. Each granularity is represented, internally, by a model with 2 attributes: a *label* and a *value* (or id).

	{
		label: String ,
		value: String 
	}

These objects can either be defined by the user or picked from a pool of predefined ones (see defaults only configuration options **granularityPresets**). 

Controls the format of the range displayed in the selector main container. 

### String 

In string format, the option is parsed as a csv and the case reduces to the *Array:String* case.

**Example**

	day,week,year
	

### Array 
The array elements correspond to granularity specifications. Each of the elements can be of the *String* and *Object* types.

#### Array:String
Accepts strings that will be used to find the granularity parameters in the map defined by the **granularityPresets** options, which is only configurable as a default. Any string that does not correspond to a key in the map will be discarded.

**Example**
>
	[ 'day' , 'week' , 'year' ]

#### Array:Object
Expects the objects to defined a value and a label, or, if only a value is defined, the selector takes the value as a key and complements it with information from **granularityPresets**.

**Example**
>
	[ 
		{ value: 'week' , label: 'Aggregate by Week' },
		{ value: 'year' , label: 'Aggregate by Year' }
	]
	
As mentioned, *String* and *Object* elements can be mixed and complemented from the information in **granularityPresets**. 

**Example**
>
With a granularities specification of:
>	
	[ 
		'day',
		{ value: 'week' , label: 'Aggregate by Week' },
		{ value: 'year' },
		'12days'
	]
>	
the selector will normalize it to the following array:
>
	[ 
		{ value: 'day'  , label: 'Day' },
		{ value: 'week' , label: 'Aggregate by Week' },
		{ value: 'year' , label: 'Year' }
	]
Note that *'12days'* was simply removed because there was no such key in the **granularityPresets** map (see **granularityPresets** documentation for the list of default presets).

### Default Value

	[ 'day' , 'week' , 'month' , 'quarter' , 'year' ]


### Notes
 - The list of granularities is also used to validate the granularity range parameter, meaning that the date range selector will only pick a granularity value that is part of the list.

<br>
## granularityPresets (defaults only)
*{ Object:Object }*

Defines the granularity presets that a user can already take advantage of when configuring a selector. 

### Default Value

	{
		"day":     {
			label: "Day" ,
			value: "day"
		},
		"week":    {
			label: "Week" ,
			value: "week"
		},
		"month":   {
			label: "Month" ,
			value: "month"
		},
		"quarter": {
			label: "Quarter" ,
			value: "quarter"
			},
		"year":    {
			label: "Year" ,
			value: "year"
		}
	}

**Example**
>
Besides adding custom granularities, these *defaults only* options are handy to set up all the selectors on a given implementation. We can change all the labels for granularities, for all selectors in an app, by setting the defaults:
>
	{
		"day":     {
			label: "Aggregate by Day" ,
			value: "day"
		},
		"week":    {
			label: "Aggregate by Week" ,
			value: "week"
		},
		"month":   {
			label: "Aggregate by Month" ,
			value: "month"
		},
		"quarter": {
			label: "Aggregate by Quarter" ,
			value: "quarter"
			},
		"year":    {
			label: "Aggregate by Year" ,
			value: "year"
		}
	}
	
<br>
## granularityValidator
*{ Number | Function }*

This option allows the user to control the available granularities based on the currently selected range and precisions.

### Function
	function ( granularity , start , end , precision )

*arguments*

- granularity *{String}* : value of the granularity being validated.
- start *{Moment}*: selected start date, as a Moment.js object.
- end *{Moment}*: selected end date, as a Moment.js object.
- precision *{String}*: selected precision.

*returns*

- Boolean value indicating the tested granularity is valid *{Boolean}* .

**Example**
>
This function accepts all granularities that are not *'day'* and filters out *'day'* if the range is greater than 40 days:
>
	function granularityValidator ( granularity , start , end , precision ){
		return ( granularity != 'day' ) || start.diff(end) < 40;
	}
	
### Number
This format acts as predefined granularities filters that will probably be enough for the majority of users. It works by filtering out a granularity if the range size is bigger than the supplied value, *in the precision that corresponds to the tested granularity*.

**Example**
>
With a configuration of *20*, the validator will be given by the following function:
>
	function granularityValidator ( grain , start , end ){
		var diff = end.diff( start , grain );
		return ( diff >= 0 ) && ( diff <= 20 );
	}

Note that *grain* is passed to the *.diff* method, and that's where we are assuming the granularities correspond to precisions, as accepted by Moment.js methods. This configuration mode will not work if used with a **granularities** configuration option including custom granularities, since they do not map directly to precision values as accepted by Moment.js.

###Default Value

	20

<br>
## selectors 
*{ String | Array:( String | Object ) }*

Defines the modes available in the selector dropdown . Each selector is represented, internally, by a model with at least 1 mandatory attribute, a *value*, and a optional one, a *type*.

	{
		value: String ,
		type: String | Function 
	}

There are two type presets: **predefined** and **custom**, corresponding to a fixed date range or the custom range mode of the selector. When the *type* property is a string, the selector will try to match it with one of these types. When no *type* is specified, the selector assumes the **predefined**.

##### Type: 'predefined'
In the predefined type, there are two additional properties that matter:
	
	{
		label: String ,
		getRange: Function 
	}
With the first one controlling what will show on the selection mode display, and the other the function that will be used to generate the associated range. We have:
	
	function getRange ( start , end , precision )
	
with

*arguments*

- start *{ Moment }* : the selected range start.
- end *{ Moment }* : the selected range end.
- precision *{ Moment }* : the selected precision.

*returns*

- range *{ Object }* : this should return an object with all the possible properties to change in the new range.

**Example**
>
	function getRange () {
		return {
			start: moment().startOf('month'), 
			end: moment(), 
			precision:'day' 
		};
	}

This *getRange* function acts on the *start*, *end* and *precision* range parameters, but it could also affect the *granularity*.

##### Type: 'custom'
The type *custom* instantiates a custom range selector at that position. This selector needs not additional properties, since the labels will be taken from the global **labels** option. Still, it can also include:

	{
		labels: Object:String
	}

which will take precedence over the labels defined in the global **labels** selector option.

##### Type: Function
This is a very advanced mode, with the selector expecting a javascript constructor extending the **BaseBlock** class, that can be anything. Not recomended for everyday use.


### String 

In string format, the option is parsed as a csv and the case reduces to the *Array:String* case.

**Example**
>
	ytd,last7d,mtd
	

### Array 
The array elements correspond to precision specifications. Each of the elements can be of the *String* and *Object* types.

#### Array:String
Accepts strings that will be used to find the selector parameters in the map defined by the **selectorPresets** options, which is only configurable as a default. Any string that does not correspond to a key in the map will be discarded.

**Example**
>
	[ 'ytd' , 'last7d' , 'mtd' ]

#### Array:Object
Expects the objects to define a number of properties as previously explained. If only a value is defined, the selector takes the value as a key and complements it with information from **selectorPresets**.

**Example**
>
	[ 
		{ 
			value: 'ytd' 
		},
		{ 
			value: 'myRange' , 
			label:'My Range' , 
			getRange: function(){ 
				return { 
					start: moment().add(1,'day') , 
					end: moment().add(10,'day') 
				};
			}
		},
		{ 
			value:'custom2' , 
			type:'custom' , 
			labels:{
				customRange: 'New Custom Range!'
			} 
		}
	]
	
As mentioned, *String* and *Object* elements can be mixed and complemented from the information in **selectorPresets**. 

**Example**
>
With a selectors specification of:
>	
	[ 
		'ytd',
		{ 
			value: 'myRange' , 
			label:'My Range' , 
			getRange: function(){ 
				return { 
					start: moment().add(1,'day') , 
					end: moment().add(10,'day') 
				};
			}
		},
		{ 
			value:'custom'
		}
	]
>	
the selector will normalize it to the following array:
>
	[ 
		{ 
			value: 'ytd' , 
			type: 'predefined,
			label:'Year to Date' , 
			getRange: function(){ 
				return { 
					start: moment().startOf('year'), 
					end: moment(), 
					precision:'day' 
				};
			}
		},
		{ 
			value: 'myRange' ,
			type: 'predefined,
			label:'My Range' , 
			getRange: function(){ 
				return { 
					start: moment().add(1,'day') , 
					end: moment().add(10,'day') 
				};
			}
		},
		{ 
			value: 'custom' , 
			type: 'custom'
		}
	]

(see **selectorPresets** documentation for the list of default presets).

### Default Value

	[ 'mtd' , 'last7d' , 'custom' ]
	

<br>
## selectorPresets (defaults only)
*{ Object:Object }*

Defines the selector (modes) presets that a user can already take advantage of when configuring the date range selector. 

### Default Value

	{
		'mtd': {
			value: 'mtd',
			type: 'predefined',
			label: 'Month to Date',
			getRange: function () {
				return {start: moment().startOf('month'), end: moment(), precision:'day' };
			}
		},
		'last7d': {
			value: 'last7d',
			type: 'predefined',
			label: 'Last 7 Days',
			getRange: function () {
				return {start: moment().add(-7, 'days'), end: moment(), precision:'day' };
			}
		},
		'ytd': {
			value: 'ytd',
			type: 'predefined',
			label: 'Year to Date',
			getRange: function () {
				return {start: moment().startOf('year'), end: moment(), precision:'day' };
			}
		},
		'custom': {
			type: 'custom',
			value: 'custom'
		}
	}

These default presets are useful to extend every data range selector on a given solution with modes that can be than easily used by the user, when configuring a particular selector.

**Example**
>
	{
		'mtd': {
			value: 'mtd',
			type: 'predefined',
			label: 'Month to Date',
			getRange: function () {
				return {start: moment().startOf('month'), end: moment(), precision:'day' };
			}
		},
		'last7d': {
			value: 'last7d',
			type: 'predefined',
			label: 'Last 7 Days',
			getRange: function () {
				return {start: moment().add(-7, 'days'), end: moment(), precision:'day' };
			}
		},
		'last10d': {
			value: 'last10d',
			type: 'predefined',
			label: 'Last 10 Days',
			getRange: function () {
				return {start: moment().add(-10, 'days'), end: moment(), precision:'day' };
			}
		},
		'last30d': {
			value: 'last30d',
			type: 'predefined',
			label: 'Last 30 Days',
			getRange: function () {
				return {start: moment().add(-30, 'days'), end: moment(), precision:'day' };
			}
		},
		'ytd': {
			value: 'ytd',
			type: 'predefined',
			label: 'Year to Date',
			getRange: function () {
				return {start: moment().startOf('year'), end: moment(), precision:'day' };
			}
		},
		'custom': {
			type: 'custom',
			value: 'custom'
		}
	}
	
	
<br>
## precisions 
*{ String | Array:( String | Object ) }*

Defines the precisions available when the *customRange* mode is active. Each precision is represented, internally, by a model with 2 attributes: a *label* and a *value* (or id).

	{
		label: String ,
		value: String 
	}

These objects can either be defined by the user or picked from a pool of predefined ones (see defaults only configuration options **precisionPresets**). 

Controls the format of the range displayed in the selector main container. 

### String 

In string format, the option is parsed as a csv and the case reduces to the *Array:String* case.

**Example**
>
	day,week,year
	

### Array 
The array elements correspond to precision specifications. Each of the elements can be of the *String* and *Object* types.

#### Array:String
Accepts strings that will be used to find the precision parameters in the map defined by the **precisionPresets** options, which is only configurable as a default. Any string that does not correspond to a key in the map will be discarded.

**Example**
>
	[ 'day' , 'week' , 'year' ]

#### Array:Object
Expects the objects to define a value and a label, or, if only a value is defined, the selector takes the value as a key and complements it with information from **precisionsPresets**.

**Example**
>
	[ 
		{ value: 'week' , label: 'Week' },
		{ value: 'year' , label: 'Year' }
	]
	
As mentioned, *String* and *Object* elements can be mixed and complemented from the information in **precisionPresets**. 

**Example**
>
With a precisions specification of:
>	
	[ 
		'day',
		{ value: 'week' , label: 'Weekly Precision' },
		{ value: 'year' },
		'14days'
	]
>	
the selector will normalize it to the following array:
>
	[ 
		{ value: 'day'  , label: 'Day' },
		{ value: 'week' , label: 'Weekly Precision' },
		{ value: 'year' , label: 'Year' }
	]
Note that *'14days'* was simply removed because there was no such key in the **precisionPresets** map (see **precisionPresets** documentation for the list of default presets).

### Default Value

	[ 'day' , 'week' , 'month' , 'quarter' , 'year' ]
	

### Notes
 - The list of precisions is also used to validate the precision range parameter, meaning that the date range selector will only pick a precisions value that is part of the list.

<br>
## precisionPresets (defaults only)
*{ Object:Object }*

Defines the precisions presets that a user can already take advantage of when configuring a selector. 

### Default Value

	{
		"day":     {
			label: "Day" ,
			value: "day"
		},
		"week":    {
			label: "Week" ,
			value: "week"
		},
		"isoWeek":    {
			label: "Week" ,
			value: "isoWeek"
		},		
		"month":   {
			label: "Month" ,
			value: "month"
		},
		"quarter": {
			label: "Quarter" ,
			value: "quarter"
			},
		"year":    {
			label: "Year" ,
			value: "year"
		}
	}

**Example**
>
Besides adding custom precisions, these *defaults only* options are handy to set up all the selectors on a given implementation. We can change all the labels for precisions, for all selectors in an app, by setting the defaults:
>
	{
		"day":     {
			label: "Precision: Day" ,
			value: "day"
		},
		"week":    {
			label: "Precision: Week" ,
			value: "week"
		},
		"isoWeek":    {
			label: "Precision: Week" ,
			value: "isoWeek"
		},
		"month":   {
			label: "Precision: Month" ,
			value: "month"
		},
		"quarter": {
			label: "Precision: Quarter" ,
			value: "quarter"
			},
		"year":    {
			label: "Precision: Year" ,
			value: "year"
		}
	}

<br>
## includeCustomRange
*{ Boolean }*

This option controls if a custom range mode is added to the selectors list. Not that custom range modes can always be added directly to the selectors list (see **selectors** options), but by setting this option a user can easily add one without having to use the more complex notation for the **selectors** option.

A typical quick configuration including several predefined modes and a custom mode could be something like:

**Example**
>
	{
		includeCustomRange: true,
		selectors: 'last7d,last14d,mtd,ytd'
	}
	
which includes 4 different predefined range modes (with parameters taken from the presets) and a custom range, in oposition to using only the selectors property, which would be a bit more convoluted.

**Example**
>
	{
		selectors: [
			'last7d',
			'last14d',
			'mtd',
			'ytd',
			{
				value: 'custom',
				type: 'custom'
			}
		]
	}
	
Note that we needed the object notation to configure the custom mode since the selector will default to 'predefined' when there is no type property in the configuration.

------

<br>
# Date Range Selector Defaults API

Setting and getting default selector values can be done using a class method. 

*Getting*

	DateRangeSelectorComponent.getDefaults( defaultOptionName )
	
*Setting*

	DateRangeSelectorComponent.setDefaults( 'defaultOptionName' , newDefaults )
The getters and setters are functions of the Date Range Selector Component constructor.

------

<br>
# Date Range Selector Localization

Selector localization can refer to customizing selector formats and labels for a give locale or configuring date related things like the days of the week or month names.

## Formats & Labels

Configuring formats and labels globally, to all the selectors in a solution, is achieved by using the class methods for setting and getting defaults, as described previously.

**Example 1**
>
> Setting the granularity labels for all selectors to portuguese can be achieved by doing:
>
	DateRangeSelectorComponent.setDefaults('granularityPresets',{
		"day":     {
			label: "Dia" ,
			value: "day"
		},
		"week":    {
			label: "Semana" ,
			value: "week"
		},
		"month":   {
			label: "Mês" ,
			value: "month"
		},
		"quarter": {
			label: "Trimestre" ,
			value: "quarter"
			},
		"year":    {
			label: "Ano" ,
			value: "year"
		}
	})

**Example 2**
>
> Setting some of the title labels of the selector to french can be achieved by doing:
>
	DateRangeSelectorComponent.setDefaults('labels',{
		cancelButton: 'Annuler',
		applyButton: 'Appliquer',
		intervals: 'Intervalles:'
	});

Formats could be changed in the same way, by updating the defaults for all the component instances. Another option is to use the localized formats that Moment.js accepts and control those formats directly by configuring moment, which is reverts to the second aspect of localization in the selector.

## Moment.js localization
The component relies heavily on Moment.js for all the date operations, and so it will take advantage of the localization capabilities of the library. 

**Example (from Moment.js)**

Changing locale to portuguese and setting some uncommon short names for weekdays.

	moment.locale('pt', {
		weekdaysShort : ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
	});

Most of these definitions will be available with Moment.js localization files and, if those are included, configuration will mostly require:

	moment.locale('pt');

