# Stimulus Datepicker

This is a Stimulus-powered datepicker which:

- localises and parses dates in the input field according to the strftime directives you configure;
- presents a calendar closely adhering to the [WAI-ARIA date picker dialog](https://www.w3.org/TR/wai-aria-practices/examples/dialog-modal/datepicker-dialog.html) design pattern;
- sends the date back to the server in ISO8601 format (YYYY-MM-DD).

Please see the [demo page](https://airblade.github.io/stimulus-datepicker/) for a few simple examples.

Your server produces an ISO8601 date; your user interacts with it in the format you configured and/or via the popup calendar; the form sends the date back to the server in ISO format.

Month and day names are generated in the user's locale.  Button titles and ARIA labels are customisable, e.g. for localisation.

Dates are local; no timezones or daylight savings are involved.

You can easily adjust the calendar's appearance via CSS custom properties or just overriding the CSS classes.

Size: JS 3.6kB minified and gzipped, CSS 2.7kB gzipped.

<img src="https://github.com/airblade/stimulus-datepicker/raw/main/screenshot.png" width="296px">


## Installation

The project contains JavaScript and CSS.  If you only use importmaps, i.e. you don't use jsbundling-rails or cssbundling-rails, first install the JavaScript:

```
bin/importmap pin stimulus-datepicker
```

And then add a link to the stylesheet to your view:

```
<link rel="stylesheet" href="https://unpkg.com/stimulus-datepicker@1.0.5/css/datepicker.css" data-turbo-track="reload">
```

If you use jsbundling-rails or cssbundling-rails, follow their instructions for installing packages.

Then register the datepicker controller with your Stimulus application:

```diff
  // app/javascript/controllers/application.js

  import { Application } from '@hotwired/stimulus'
+ import { Datepicker } from 'stimulus-datepicker'

  const application = Application.start()
+ application.register('datepicker', Datepicker)
```

## Usage

To use the datepicker, wrap your input field with a controller div.

```html
<div data-controller="datepicker">
  <input data-datepicker-target="input" type="text" name="foobar" value="2022-03-23"/>
  <span data-datepicker-target="toggle">calendar</span>
</div>
```

Your calendar icon or equivalent must have the data attribute `data-datepicker-target="toggle"`.

The input field:

- must have the data attribute `data-datepicker-target="input"`;
- should have `type="text"`, not `type="date"`, to avoid conflicting with built-in browser functionality;
- must have a `name`;
- its `value`, if given, must be a YYYY-MM-DD date string.


## Configuration

You can configure your datepicker with the following attributes.  Declare them on your controller as `data-datepicker-[name]-value`.

| Name | Default | Description |
|--|--|--|
| `format` | `"%Y-%m-%d"` | Format for the date in the input field (see below). |
| `first-day-of-week` | `1` | First day of the week in the calendar (Sunday is `0`). |
| `day-name-length` | `2` | Length of the abbreviated day names in the calendar, e.g. "Mo". |
| `allow-weekends` | `"true"` | Whether weekends are selectable. |
| `month-jump` | `"dayOfMonth"` | When jumping to the previous/next month, whether to go to the same day of the month (`"dayOfMonth"`) or the same day of the week (`"dayOfWeek"`). |
| `min` | `""` | The earliest choosable date (YYYY-MM-DD). |
| `max` | `""` | The latest choosable date (YYYY-MM-DD). |
| `underflow-message` | `""` | Client-side form validation message when the selected date is earlier than the `min` date.  `%s` is replaced with the formatted min date.  E.g. `"Date must be %s or later."` |
| `overflow-message` | `""` | Client-side form validation message when the selected date is later than the `max` date.  `%s` is replaced with the formatted max date.  E.g. `"Date must be %s or earlier."` |
| `disallow` | `[]` | Dates which cannot be selected.  E.g. `["2022-12-25", "2023-01-01"]` |
| `text` | <pre>{<br>  underflow:     "",<br>  overflow:      "",<br>  previousMonth: "Previous month",<br>  nextMonth:     "Next month",<br>  today:         "Today",<br>  chooseDate:    "Choose Date",<br>  changeDate:    "Change Date"<br>}</pre> | User-facing text.  The value object is merged into the defaults.<br><ul><li>_underflow_:  client-side form validation message when the selected date is earlier than the `min` date.  `%s` is replaced with the formatted min date.  E.g. `"Date must be %s or later."`</li><li>_overflow_: client-side form validation message when the selected date is later than the `max` date.  `%s` is replaced with the formatted max date.  E.g. `"Date must be %s or earlier."`</li><li>_previousMonth_, _nextMonth_, _today_: button titles and ARIA labels</li><li>_chooseDate_, _changeDate_: ARIA labels</li></ul>  |
| `locales` | ["default"] | Force locale of month & day names. Recommended usage `['de-DE', 'default']` which switches the calendar to German language if it is supported in the user browser. If not it'll fallback to the browser language.  <br> See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString#using_locales for more info. |

You can use the following strftime directives in `data-datepicker-format-value`:

| Directive | Meaning |
|--|--|
| `%d` | Day of the month, zero-padded (01..31) |
| `%-d` | Day of the month, no padding (1..31) |
| `%m` | Month of the year, zero-padded (01..12) |
| `%-m` | Month of the year, no padding (1..12) |
| `%B` | The full month name in the browser's locale (January) |
| `%b` | The abbreviated month name in the browser's locale (Jan) |
| `%Y` | Full year, four digits (2022) |
| `%y` | Year in 21st Century, two digits (22) |


## Keyboard support

The datepicker is fully navigable by keyboard.  In addition to the WAI-ARIA keys, you can also use Vim-style movement keys.

### Toggle target (your calendar icon)

| Key | Result |
|--|--|
| <kbd>Space</kbd>, <kbd>Enter</kbd> | <ul><li>Open the datepicker dialog.</li><li>Move focus to selected date, i.e. the date displayed in the input text field.  If no date has been selected, focus on the current date.</li></ul> |

### Datepicker dialog (the calendar)

| Key | Result |
|--|--|
| <kbd>Escape</kbd> | Close the dialog and return focus to the toggle target. |
| <kbd>Tab</kbd> | <ul><li>Move focus to next element in the dialog's tab sequence.</li><li>The dialog "traps" focus so if focus is on the last item, move focus to the first.</ul> |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | <ul><li>Move focus to previous element in the dialog's tab sequence.</li><li>The dialog "traps" focus so if focus is on the first item, move focus to the last.</ul> |

### Previous-month / today / next-month Buttons

| Key | Result |
|--|--|
| <kbd>Space</kbd>, <kbd>Enter</kbd> | Change the month displayed in the calendar grid. |

### Date grid

| Key | Result |
|--|--|
| <kbd>Space</kbd>, <kbd>Enter</kbd> | Select the date, close the dialog, move focus to the toggle target. |
| <kbd>Up Arrow</kbd>, <kbd>k</kbd> | Move focus to the same day of the previous week. |
| <kbd>Down Arrow</kbd>, <kbd>j</kbd> | Move focus to the same day of the next week. |
| <kbd>Right Arrow</kbd>, <kbd>l</kbd> | Move focus to the next day. |
| <kbd>Left Arrow</kbd>, <kbd>h</kbd> | Move focus to the previous day. |
| <kbd>Home</kbd>, <kbd>^</kbd>, <kbd>0</kbd> | Move focus to the first day of the current week. |
| <kbd>End</kbd>, <kbd>$</kbd> | Move focus to the last day of the current week. |
| <kbd>Page Up</kbd>, <kbd>b</kbd> | Change the grid of dates to the previous month and focus on the corresponding<sup>*</sup> date one month earlier. |
| <kbd>Shift</kbd> + <kbd>Page Up</kbd>, <kbd>B</kbd> | Change the grid of dates to the previous year and focus on the same date one year earlier. |
| <kbd>Page Down</kbd>, <kbd>w</kbd> | Change the grid of dates to the next month and focus on the corresponding<sup>*</sup> date one month later. |
| <kbd>Shift</kbd> + <kbd>Page Down</kbd>, <kbd>W</kbd> | Change the grid of dates to the next year and focus on the same date one year later. |

<sup>*</sup> The corresponding date in the adjacent month depends on `data-datepicker-month-jump-value`:

- `"dayOfMonth"`: the corresponding date is the same date, e.g. 7th;
- `"dayOfWeek"`: the corresponding date is the same day of the week, four weeks earlier/later.


## CSS

You can alter the appearance of the calendar by setting these custom properties, or of course by just overriding the CSS classes.

| Property | Default | Description |
|--|--|--|
| `--sdp-selected` | `#005fcc` | Background colour of selected date; colour of date focus ring. |
| `--sdp-selected-invert` | `#ffffff` | Colour of selected date. |
| `--sdp-prev-month` | `#888888` | Colour of dates in the previous month. |
| `--sdp-next-month` | `#888888` | Colour of dates in the next month. |
| `--sdp-disabled` | `#1010104d` | Colour of disabled dates; background color of selected date when disabled. |
| `--sdp-disabled-invert` | `#ffffff` | Colour of selected date when disabled. |
| `--sdp-background` | `#ffffff` | Background colour. |
| `--sdp-border` | `#dddddd` | Border colour. |
| `--sdp-shadow` | `0deg 0% 50%` | Box shadow colour (hsl). |
| `--sdp-icon` | `#4a4a4acc` | Colour of the icons, e.g. previous-month button. |
| `--sdp-nav-button-background` | `#f5f5f5` | Background colour of the navigation buttons. |
| `--sdp-nav-button-background-hover` | `#eeeeee` | Background colour on hover of the navigation buttons. |
| `--sdp-days-of-week` | `#4a4a4a` | Colour of the days of the week. |


## Intellectual Property

This package is copyright Andrew Stewart.

This package is available as open source under the terms of the MIT licence.
