---
layout: post
title: To simplicity... and beyond!
title_image: /img/buzz.png
published: false
---

&ldquo;Make everything as simple as possible, but not simpler.&rdquo;  
<span style="padding-left: 20px;">- Albert Einstein</span>

When I started Shapesmith, my vision was to create a simple, yet powerful 3D modelling application. Up to a few weeks ago my main focus was on creating a strong technical foundation that I could build on, and I'm quite pleased with the current architecture. Usability had been important, but not the top priority. This has changed.

My first attempt at simplifying geometry creation was illuminating, but unsatisfactory. The idea was to create a re-usable 3D cursor to move around 3D space to create radii, widths, moving the origin etc. This turned out to be a step in the right direction, but too complicated from a user's perspective.

It also became obvious that making it simple to design models requires the ability to move, rotate and resize objects with only a few mouse clicks and drags. This is something that other graphics and 3D modelling applications have as standard. And as Mr Potato Head would say:

<table style="padding-left: 20px"><tr><td><img src="/img/mrpotatohead.png"/>
</td><td style="padding: 20px;">
&ldquo;Hey, a laser! How come <span style="font-style: italic">you</span> don't have a laser, Woody?&rdquo;
</td></tr></table>

Moving, Rotating, Resizing
---------------------

Shapesmith now has simple translatation, rotation and scale operations. The interaction is based on [Inkscape](http://inkscape.org/), my favourite vector drawing application. When an object is selected, you can see the draggable arrows that you can use to scale, and the draggable box at the center to translate the object:

The scale arrows are used to scale:

When you click on a selected object <span style="font-style: italic">again</span>, the scale arrows are replaced with rotation arrows for the three major axes and the translation box:

You will notice that the dimensions are not rendered in the 3D space to make it easier to read no matter the viewpoint.

Mouse-only Geometry
-----------------

Using the lessons learnt from the new transformations (including better abstraction in the code using [backbone.js](http://documentcloud.github.com/backbone/)), I re-worked all the geometry creation as well with the aim of making it possible to create geometry only using the mouse. The concept of a re-usable 3D cursor has been abandoned in favour of geometry-specific interactions:

The Tree View is still fully functional, and can be used to edit nodes that are not top-level nodes, existing transforms etc. by double-clicking on the values. The Tree View is hidden by default but still available to advanced users:

What's next?
----------

In terms of usability, the next area I'm going to focus on is a dyanmic workplane. At the moment, the workplane is static and immovable







