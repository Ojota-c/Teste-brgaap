sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function(UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("walkthrough.Component", {
    metadata: {
      manifest: "json"
    },

    init: function() {
  UIComponent.prototype.init.apply(this, arguments);
  
  // Certifique-se de que o router é inicializado
  this.getRouter().initialize();
}
  });
});