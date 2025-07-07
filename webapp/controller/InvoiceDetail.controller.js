sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";
    return Controller.extend("walkthrough.controller.InvoiceDetail", {
        onInit: function() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("invoiceDetail").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function(oEvent) {
            var sPath = decodeURIComponent(oEvent.getParameter("arguments").invoicePath);
            this.getView().bindElement({
                path: sPath,
                model: "invoice"
            });
        }
    });
});