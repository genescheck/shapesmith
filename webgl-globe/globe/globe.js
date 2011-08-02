/**
 * dat.globe Javascript WebGL Globe Toolkit
 * http://dataarts.github.com/dat.globe
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var DAT = DAT || {};

DAT.Globe = function(container, colorFn) {

    var camera, scene, renderer, w, h;
    var mesh, point;

    var overRenderer;

    var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
    var elevation = 0;
    var azimuth = Math.PI/4;

    target = { azimuth: Math.PI/4, elevation: Math.PI*3/8 };
    targetOnDown = { azimuth: target.azimuth, elevation: target.elevation };

    var distance = 1000, distanceTarget = 400;


    function init() {

	container.style.color = '#fff';
	container.style.font = '13px/20px Arial, sans-serif';

	var shader, uniforms, material;
	w = container.offsetWidth || window.innerWidth;
	h = container.offsetHeight || window.innerHeight;

	camera = new THREE.Camera(30, w / h, 1, 10000);
	camera.up.x = 0;
	camera.up.y = 0;
	camera.up.z = 1;
	
	vector = new THREE.Vector3();
	scene = new THREE.Scene();

	addGrid();

	/*var geometry = new THREE.Sphere(2.5, 20, 20);
	var material = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
	var mesh = new THREE.Mesh(geometry, material);
	mesh.matrixAutoUpdate = false;
	scene.addObject(mesh);

	geometry = new THREE.Cube(2, 1, 0.5);
	material = new THREE.MeshLambertMaterial({ color: 0x00FF00, opacity: 0.5 });
	mesh = new THREE.Mesh(geometry, material);
	mesh.matrixAutoUpdate = false;
	scene.addObject(mesh);*/

	var light = new THREE.PointLight(0xFFFF00);
	light.position.set(-1000, 1000, 1000);
	scene.addLight(light);

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.autoClear = false;
	renderer.setClearColorHex(0x080808, 0.0);
	renderer.setSize(w, h);

	renderer.domElement.style.position = 'absolute';

	container.appendChild(renderer.domElement);

	container.addEventListener('mousedown', onMouseDown, false);
	container.addEventListener('mousewheel', onMouseWheel, false);
	document.addEventListener('keydown', onDocumentKeyDown, false);
	window.addEventListener('resize', onWindowResize, false);
	container.addEventListener('mouseover', function() {
	    overRenderer = true;
	}, false);
	container.addEventListener('mouseout', function() {
	    overRenderer = false;
	}, false);
    }


    function onMouseDown(event) {
	event.preventDefault();

	container.addEventListener('mousemove', onMouseMove, false);
	container.addEventListener('mouseup', onMouseUp, false);
	container.addEventListener('mouseout', onMouseOut, false);

	mouseOnDown.x = - event.clientX;
	mouseOnDown.y = event.clientY;

	targetOnDown.azimuth = target.azimuth;
	targetOnDown.elevation = target.elevation;

	container.style.cursor = 'move';
    }
    
    function onMouseMove(event) {
	mouse.x = - event.clientX;
	mouse.y = event.clientY;

	var zoomDamp = distance/100;

	target.azimuth = targetOnDown.azimuth + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
	target.elevation = targetOnDown.elevation - (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

	target.elevation = target.elevation > Math.PI ? Math.PI : target.elevation;
	target.elevation = target.elevation < 0 ? 0 : target.elevation;
    }

    function onMouseUp(event) {
	container.removeEventListener('mousemove', onMouseMove, false);
	container.removeEventListener('mouseup', onMouseUp, false);
	container.removeEventListener('mouseout', onMouseOut, false);
	container.style.cursor = 'auto';
    }

    function onMouseOut(event) {
	container.removeEventListener('mousemove', onMouseMove, false);
	container.removeEventListener('mouseup', onMouseUp, false);
	container.removeEventListener('mouseout', onMouseOut, false);
    }

    function onMouseWheel(event) {
	event.preventDefault();
	if (overRenderer) {
	    zoom(event.wheelDeltaY * 0.05);
	}
	return false;
    }

    function onDocumentKeyDown(event) {
	switch (event.keyCode) {
	case 38:
            zoom(100);
            event.preventDefault();
            break;
	case 40:
            zoom(-100);
            event.preventDefault();
            break;
	}
    }

    function onWindowResize(event) {
	console.log('resize');
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function zoom(delta) {
	distanceTarget -= delta;
	distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
	distanceTarget = distanceTarget < 30 ? 30 : distanceTarget;
    }

    function animate() {
	requestAnimationFrame(animate);
	render();
    }


    function render() {
	zoom(0);

	azimuth += (target.azimuth - azimuth) * 0.2;
	elevation += (target.elevation - elevation) * 0.3;
	distance += (distanceTarget - distance) * 0.3;

	camera.position.x = distance * Math.sin(elevation) * Math.cos(azimuth);
	camera.position.y = distance * Math.sin(elevation) * Math.sin(azimuth);
	camera.position.z = distance * Math.cos(elevation);

	renderer.clear();
	renderer.render(scene, camera);
    }
    
    var insideX = [-50,50];
    var insideY = [-50,50];
    var gridExtents = 100;
    var majorTick = 10;

    function addGrid() {

	addAxes();
	addMainGrid();
	for(var x = -gridExtents; x <= gridExtents; ++x) {
	    for(var y = -gridExtents; y <= gridExtents; ++y) {
		var inside = ((x >= insideX[0]) && (x <= insideX[1]) &&
			      (y >= insideY[0]) && (y <= insideY[1]));
		if ((x % majorTick == 0) && (y % majorTick == 0) &&
		    (x != 0) && (y != 0) &&
		    !inside) {
		    addFadingGridTile(x,y);
		}
	    }
	}

    }
    
    function addAxes() {

	axes = [new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry()];
	axes[0].vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0, 0)));
	axes[0].vertices.push(new THREE.Vertex(new THREE.Vector3(500, 0, 0)));

	axes[1].vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0, 0)));
	axes[1].vertices.push(new THREE.Vertex(new THREE.Vector3(0, 500, 0)));

	axes[2].vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0, 0)));
	axes[2].vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0, 500)));

	axes[3].vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0, 0)));
	axes[3].vertices.push(new THREE.Vertex(new THREE.Vector3(-gridExtents, 0, 0)));

	axes[4].vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0, 0)));
	axes[4].vertices.push(new THREE.Vertex(new THREE.Vector3(0, -gridExtents, 0)));

	scene.addObject(new THREE.Line(axes[0], new THREE.LineBasicMaterial({ color: 0x0000ff, opacity: 0.5 }))); //  X
	scene.addObject(new THREE.Line(axes[1], new THREE.LineBasicMaterial({ color: 0x00ff00, opacity: 0.5 }))); //  Y
	scene.addObject(new THREE.Line(axes[2], new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 0.5 }))); //  Z
	scene.addObject(new THREE.Line(axes[3], new THREE.LineBasicMaterial({ color: 0x0000ff, opacity: 0.2 }))); // -X
	scene.addObject(new THREE.Line(axes[4], new THREE.LineBasicMaterial({ color: 0x00ff00, opacity: 0.2 }))); // -X
    }

    var majorGridLineGeometry = new THREE.Geometry();
    majorGridLineGeometry.vertices.push(new THREE.Vertex(new THREE.Vector3(insideX[0], 0, 0)));
    majorGridLineGeometry.vertices.push(new THREE.Vertex(new THREE.Vector3(insideX[1], 0, 0)));

    var minorGridLineGeometry = new THREE.Geometry();
    minorGridLineGeometry.vertices.push(new THREE.Vertex(new THREE.Vector3(insideX[0], 0, 0)));
    minorGridLineGeometry.vertices.push(new THREE.Vertex(new THREE.Vector3(insideX[1], 0, 0)));

    var majorMaterialInside = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5 });
    var minorMaterialInside = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.05 });

    function addMainGrid() {


	for (var x = insideX[0]; x <= insideX[1]; ++x) {
	    if (x != 0) {
		var material = (x % 10 == 0) ? majorMaterialInside : minorMaterialInside;
		var geometry = (y % 10 == 0) ? majorGridLineGeometry : minorGridLineGeometry;
		var line = new THREE.Line(geometry, material);
		line.position.x = x;
		line.rotation.z = 90 * Math.PI / 180;
		scene.addObject(line);

	    }
	}

	for (var y = insideY[0]; y <= insideY[1]; ++y) {
	    if (y != 0) {
		var material = (y % 10 == 0) ? majorMaterialInside : minorMaterialInside;
		var geometry = (y % 10 == 0) ? majorGridLineGeometry : minorGridLineGeometry;
		var line = new THREE.Line(geometry, material);
		line.position.y = y;
		scene.addObject(line);
	    }
	}
    }
    
    var fadingGridLineGeometry = new THREE.Geometry();
    fadingGridLineGeometry.vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0, 0)));
    fadingGridLineGeometry.vertices.push(new THREE.Vertex(new THREE.Vector3(majorTick, 0, 0)));
    
    function addFadingGridTile(x,y) {
	
	var r = Math.sqrt(x*x + y*y);
	var opacity = (r == 0) ? 1.0 : 1.0/(r*0.9);
	var material = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: opacity });

	var line = new THREE.Line(fadingGridLineGeometry, material);
	line.position.x = x > 0 ? (x-majorTick) : x;
	line.position.y = y;
	scene.addObject(line);
	
	var line = new THREE.Line(fadingGridLineGeometry, material);
	line.position.x = x;
	line.position.y = y > 0 ? (y-majorTick) : y;
	line.rotation.z = 90 * Math.PI / 180;
	scene.addObject(line);

    }
    
    init();
    this.animate = animate;
    this.renderer = renderer;
    this.scene = scene;

    return this;

};
