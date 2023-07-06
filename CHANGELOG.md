# CHANGELOG


## Unreleased


## v1.0.5 (6 July 2023)

* Only dispatch change event if value changed. (#23)


## v1.0.4 (28 March 2023)

* Move dispatch of change event to after input date. (#21)


## v1.0.3 (15 March 2023)

* Fix weekday off-by-one in different timezone. (#20)


## v1.0.2 (7 March 2023)

* Fix edge case using month dropdown. (#17)


## v1.0.1 (1 June 2022)

* Do not use private class methods.
* Use annotated git tags for releases.
* Move conditional month logic into model.
* Refactor some controller internals.


## v1.0.0 (25 May 2022)

* Move all colours into CSS custom properties.
* Allow configuration of text.
* Move dropdown arrows a little higher.


## v0.0.9 (23 May 2022)

* Fix click handling on nested elements in day grid.
* Rename `jump` value to `monthJump`.
* Make internal model functions private.
* Add some helper functions.
* Refactor model.
* Extract iso date model.


## v0.0.8 (16 May 2022)

* Support disallowing dates.
* Add CSS class for weekends.
* Support making weekends unselectable.
* Improve visual indication of dates outside min/max range.
* Allow dates outside min/max range to be focused.


## v0.0.7 (12 May 2022)

* Allow any 4-digit year.
* Add opt-in client-side validation of min, max dates.
* Support min and max dates.
* Improve alignment of day buttons on mobile.


## v0.0.6 (10 May 2022)

* Make dropdown arrows clickable.
* Fix color of selects and current-month days in iOS Safari.
* Auto-size selects to selected option.
* Add hover to navigation buttons.
* Use SVG for navigation buttons.


## v0.0.5 (6 May 2022)

* Trigger change event on input target when date picked.
* Fix adding of keydown handler to non-button toggle target.


## v0.0.4 (5 May 2022)

* Size arrows in em rather than px.
* Improve dates' hover and focus styles.
* Improve navigation buttons' appearance.
* Make select appearance on Safari consistent with Chrome and Firefox.


## v0.0.3 (3 May 2022)

* Fix select background on Firefox.
* Ensure navigation buttons' content is centered.
* Ensure calendar renders over other elements.
* Scope tests to datepicker.
* Prevent form submission when date clicked.
* Fix attribute selector.
* Make box shadow more prominent.
* Fix type of arguments in isValidDate() call.


## v0.0.2 (28 April 2022)

* Calendar component.


## v0.0.1 (25 March 2022)

* Localised text input for dates.
