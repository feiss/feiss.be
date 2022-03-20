/**********************""
 * Average Mask to Property v.1.0
 * Copyright 2007 Diego Fernandez Goberna
 * This script averages vertices of a selected mask, and copy that value to the selected property (usually, a vertex) at current time or at all mask keyframes
 *****************/

function main() {
	var oneframe = true;
	if (confirm("Process all keyframes?")) oneframe = false;

	var activeItem = app.project.activeItem;
	if (activeItem == null || !(activeItem instanceof CompItem)) return false;

	layer = activeItem.selectedLayers[0];
	if (layer.selectedProperties.length == 0) return false;
	mask = layer.selectedProperties[0];
	if (!(mask instanceof MaskPropertyGroup)) return false;


	var target = null;
	for (var i = 0; i < activeItem.selectedProperties.length; i++)
		if (activeItem.selectedProperties[i] instanceof Property)
			target = activeItem.selectedProperties[i];


	if (oneframe) {
		var time = app.project.activeItem.time;
		var shape = mask.maskShape.valueAtTime(time, true);
		target.setValueAtTime(time, getAverage(shape.vertices));
	}
	else {
		for (var f = 1; f <= mask.maskShape.numKeys; f++) {
			var shape = mask.maskShape.keyValue(f);
			var time = mask.maskShape.keyTime(f);
			target.setValueAtTime(time, getAverage(shape.vertices));
		}
	}

	return true;
}

function getAverage(verts) {
	var sumx = 0;
	var sumy = 0;
	for (var i = 0; i < verts.length; i++) {
		sumx += verts[i][0];
		sumy += verts[i][1];
	}
	sumx /= verts.length;
	sumy /= verts.length;
	return [sumx, sumy];
}

if (!main())
	alert('ERROR: Select one mask before running this script');
