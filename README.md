# Stimulus Datepicker

This is a tiny (1.8kB gzipped) Stimulus controller which converts ISO8601 dates (YYYY-MM-DD) from the server to/from dates typed by the user, according to the format you specify.

Your server produces an ISO8601 date; your user interacts with it in the format you specify; and your form sends it in ISO8601 format back to the server.

Dates are handled without reference to timezones or daylight savings.


## Installation

Rails 7 importmaps:

```
bin/importmap pin stimulus-datepicker
```

Other:

```
yarn add stimulus-datepicker
```


## Usage

Register the datepicker controller with your Stimulus application:

```diff
  import { Application } from '@hotwired/stimulus'
+ import { Datepicker } from 'stimulus-datepicker'

  const application = Application.start()
+ application.register('datepicker', Datepicker)
```

To use the datepicker, wrap your date input with a controller div.

```html
<div data-controller="datepicker" data-datepicker-format-value="...">
  <input data-datepicker-target="input" type="text" name="foobar" value="2022-03-23"/>
</div>
```

Use the `data-datepicker-format-value` to specify the way the date should appear to the user.  You can use the following formatting directives:

| Directive | Meaning |
|--|--|
| %d | Day of the month, zero-padded (01..31) |
| %-d | Day of the month, no padding (1..31) |
| %m | Month of the year, zero-padded (01..12) |
| %-m | Month of the year, no padding (1..12) |
| %B | The full month name in the browser's locale (January) |
| %b | The abbreviated month name in the browser's locale (Jan) |
| %Y | Full year, four digits (2022) |
| %y | Year in 21st Century, two digits (22) |

The `data-datepicker-format-value` is optional and defaults to ISO8601 (`%Y-%m-%d`).

The date input:

- must have `data-datepicker-target="input"`;
- should have `type="text"`, not `type="date"`, to avoid conflicting with built-in browser functionality;
- must have a `name`;
- its `value` must be a YYYY-MM-DD date string.


## Intellectual Propery

This package is copyright Andrew Stewart.

This package is available as open source under the terms of the MIT licence.
