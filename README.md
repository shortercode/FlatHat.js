# FlatHat.js
Fairly powerful 2D scene based renderer for canvas 2D. Fully functional but not currently in development and could do with some more love... and documentation. Will likely be revisited again at some point. 

## classes

#### Renderer

Renders a given object and camera to a canvas element.

#### Object

Used to collect Polygons for rendering

#### Camera

Camera that denotes viewport size, scale and position 

#### Polygon

Polygon to be drawn by the renderer

#### Animator

Special timer class that fires a callback on each frame.
An argument is passed to the callback with a tween value of 0 - 1 based on a specified duration and timing function.

#### Clock

Timing utility that keeps track on time deltas.
Includes static functions for setting intervals/ timeouts (wrapped with classes for more readable cancellation).
