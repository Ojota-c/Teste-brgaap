sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast"
], function(Controller, JSONModel, Filter, FilterOperator, MessageToast) {
  "use strict";

  return Controller.extend("walkthrough.controller.InvoiceList", {
    onInit: function() {
      const oModel = new JSONModel();
      this.getView().setModel(oModel, "invoice");
      
      oModel.loadData("https://jsonplaceholder.typicode.com/todos", null, false, "GET", false, true);
      
      oModel.attachRequestCompleted(() => {
        MessageToast.show("Dados carregados");
      });
    },

    onSearch: function(oEvent) {
      try {
        const sQuery = oEvent.getSource().getValue().toLowerCase().trim();
        const oList = this.byId("invoiceList");
        const oBinding = oList.getBinding("items");
        const aFilters = [];
        
        if (!sQuery) {
          oBinding.filter([]);
          return;
        }

        if (!isNaN(sQuery)) {
          aFilters.push(new Filter({
            path: "id",
            operator: FilterOperator.EQ,
            value1: parseInt(sQuery)
          }));
        } 
        else if (sQuery.includes("comp")) {
          aFilters.push(new Filter({
            path: "completed",
            operator: FilterOperator.EQ,
            value1: true
          }));
        } 
        else if (sQuery.includes("pend")) {
          aFilters.push(new Filter({
            path: "completed",
            operator: FilterOperator.EQ,
            value1: false
          }));
        } 
        else {
          aFilters.push(new Filter({
            path: "title",
            operator: FilterOperator.Contains,
            value1: sQuery
          }));
        }

        oBinding.filter(aFilters);
      } catch (oError) {
        MessageToast.show("Erro ao filtrar");
      }
    },

    onItemPress: function(oEvent) {
      const oItem = oEvent.getSource();
      const oContext = oItem.getBindingContext("invoice");
      const iIndex = oContext.getPath().split("/").pop();
      
      this.getOwnerComponent().getRouter().navTo("invoiceDetail", {
        id: iIndex
      });
    }
  });
});