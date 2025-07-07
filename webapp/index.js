sap.ui.define([
	"sap/ui/core/ComponentContainer"
], (ComponentContainer) => {
	"use strict";

	new ComponentContainer({
		name: "walkthrough",
		settings : {
			id : "walkthrough"
		},
		async: true
	}).placeAt("content");
});