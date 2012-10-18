define([], function() {

    var counter = 0;

    var GeomNode = function(options) {
        var options = options || {};

        this.id = ++counter; 
        this.parameters = options.parameters || {};
        this.editing = false;

    }

    var GeometryGraph = function() {

        _.extend(this, Backbone.Events);
        this.vertices = [];

    }

    GeometryGraph.prototype.addVertex = function(vertex) {
        this.vertices.push(vertex);
        this.trigger('vertexAdded', vertex);
    }

    GeometryGraph.prototype.createPoint = function() {
        var vertex = new GeomNode({parameters: {x: 0, y: 0, z:0}});
        this.addVertex(vertex);
    }

    return new GeometryGraph();

});