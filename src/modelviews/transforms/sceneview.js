define([
    'backbone',
    'calculations',
    'settings',
    'scene',
    'scenevieweventgenerator',
    'geometrygraphsingleton',
  ], function(
    Backbone, 
    calc,
    settings,
    sceneModel,
    sceneViewEventGenerator,
    geometryGraph) {

  var SceneView = Backbone.View.extend({

    initialize: function() {
      this.scene = sceneModel.view.scene;
      this.initialTranslation = calc.objToVector(this.model.vertex.transforms.translate || {x:0,y:0,z:0}, geometryGraph, THREE.Vector3);
      this.updateCameraScale();
      this.render();
      sceneModel.view.on('cameraMoved', this.cameraMoved, this);
      sceneModel.view.on('cameraMoveStopped', this.cameraMoveStopped, this);
      this.on('dragStarted', this.dragStarted, this);
      this.on('dragEnded', this.dragEnded, this);
      this.on('drag', this.drag, this);
      this.on('mouseenter', this.mouseenter, this);
      this.on('mouseleave', this.mouseleave, this);
    },

    remove: function() {
      this.scene.remove(this.sceneObject);
      sceneViewEventGenerator.deregister(this);
      sceneModel.view.updateScene = true;
      sceneModel.view.off('cameraMoved', this.cameraMoved, this);
      sceneModel.view.off('cameraMoveStopped', this.cameraMoveStopped, this);
      this.off('dragStarted', this.dragStarted, this);
      this.off('dragEnded', this.dragEnded, this);
      this.off('drag', this.drag, this);
      this.off('mouseenter', this.mouseenter, this);
      this.off('mouseleave', this.mouseleave, this);
    },

    render: function() {
      this.clear();
    },

    clear: function() {
      if (this.sceneObject) {
        this.scene.remove(this.sceneObject);
        sceneViewEventGenerator.deregister(this);
      }
      this.sceneObject = new THREE.Object3D();
      this.hiddenSelectionObject = new THREE.Object3D();
      this.scene.add(this.sceneObject);
      sceneViewEventGenerator.register(this);
      sceneModel.view.updateScene = true;
    },

    isClickable: function() {
      return false;
    },

    isDraggable: function() {
      return !this.dragging;
    },

    cameraMoved: function() {
      this.updateCameraScale();
      sceneModel.view.updateScene = true;
    },

    updateCameraScale: function() {
      var camera = sceneModel.view.camera;
      var cameraDistance = camera.position.length();
      var newScale = cameraDistance/150;
      this.cameraScale = new THREE.Vector3(newScale, newScale, newScale);
    },


  });

  return SceneView;

});