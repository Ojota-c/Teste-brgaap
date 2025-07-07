sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("walkthrough.controller.InvoiceList", {
        onInit: function() {
            var oList = this.byId("invoiceList");
            oList.attachEventOnce("updateFinished", function() {
                var oBinding = oList.getBinding("items");
                if (oBinding) {
                    var oFilter = new Filter("completed", FilterOperator.EQ, true);
                    oBinding.filter([oFilter]);
                }
            });
        },

        onSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            var oList = this.byId("invoiceList");
            var aFilters = [
                new Filter("completed", FilterOperator.EQ, true)
            ];
            if (sQuery) {
                aFilters.push(new Filter("title", FilterOperator.Contains, sQuery));
            }
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters);
        },

        onItemPress: function(oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oCtx = oItem.getBindingContext("invoice");
            var sPath = oCtx.getPath();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("invoiceDetail", {
                invoicePath: encodeURIComponent(sPath)
            });
        }
    });
});