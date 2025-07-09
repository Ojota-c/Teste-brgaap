sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/ui/core/EventBus"
], function(Controller, JSONModel, Filter, FilterOperator, MessageToast, EventBus) {
  "use strict";

  return Controller.extend("walkthrough.controller.InvoiceList", {
    onInit: function() {
      const oModel = new JSONModel();
      this.getView().setModel(oModel, "invoice");
      
      // EventBus com tratamento de erro
      try {
        this._oEventBus = sap.ui.getCore().getEventBus();
      } catch (e) {
        console.error("Erro no EventBus:", e);
        this._oEventBus = new EventBus();
      }
      
      // Carregamento com fallback
      this._carregarDados(oModel);
      
      this._oEventBus.subscribe("invoice", "statusChanged", this._onStatusChanged.bind(this));
      this._oEventBus.subscribe("invoice", "syncWithDetail", this._sincronizarComDetalhe.bind(this));
    },

    _sincronizarComDetalhe: function(sChannel, sEvent, oData) {
      const oModel = this.getView().getModel("invoice");
      const oList = this.byId("invoiceList");
      
      if (oList && oData && oData.path) {
        try {
          oModel.setProperty(oData.path + "/completed", oData.newStatus);
          localStorage.setItem("invoiceMasterData", JSON.stringify(oModel.getData()));
          oList.getBinding("items").refresh();
          this._oEventBus.publish("invoice", "listUpdated", {
            path: oData.path,
            newStatus: oData.newStatus
          });
        } catch (e) {
          console.error("Erro na sincronização:", e);
        }
      }
    },

    _carregarDados: function(oModel) {
      try {
        const dadosSalvos = localStorage.getItem("invoiceData");
        if (dadosSalvos) {
          oModel.setData(JSON.parse(dadosSalvos));
          MessageToast.show("Dados locais carregados", { duration: 1000 });
          localStorage.setItem("invoiceMasterData", JSON.stringify(oModel.getData()));
          return;
        }
      } catch (e) {
        console.warn("Falha ao ler localStorage:", e);
      }
      
      oModel.loadData("https://jsonplaceholder.typicode.com/todos", null, false, "GET", false, true);
      oModel.attachRequestCompleted(() => {
        try {
          localStorage.setItem("invoiceData", JSON.stringify(oModel.getData()));
          localStorage.setItem("invoiceMasterData", JSON.stringify(oModel.getData()));
        } catch (e) {
          console.warn("Não foi possível salvar no localStorage:", e);
        }
        MessageToast.show("Dados da API carregados", { duration: 1000 });
      });
    },

    _onStatusChanged: function(sChannelId, sEventId, oData) {
      const oList = this.byId("invoiceList");
      if (oList) {
        try {
          const oModel = oList.getModel("invoice");
          oModel.setProperty(oData.path + "/completed", oData.newStatus);
          localStorage.setItem("invoiceData", JSON.stringify(oModel.getData()));
          localStorage.setItem("invoiceMasterData", JSON.stringify(oModel.getData()));
          oList.getBinding("items").refresh();
          this._oEventBus.publish("invoice", "listUpdated", {
            path: oData.path,
            newStatus: oData.newStatus
          });
        } catch (e) {
          console.error("Erro ao atualizar status:", e);
        }
      }
    },

    // MÉTODO ONSEARCH COMPLETO
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
        MessageToast.show("Erro ao filtrar", { duration: 1000 });
      }
    },

    // MÉTODO ONITEMPRESS COMPLETO
    onItemPress: function(oEvent) {
      const oItem = oEvent.getSource();
      const oContext = oItem.getBindingContext("invoice");
      const iIndex = oContext.getPath().split("/").pop();
      
      this.getOwnerComponent().getRouter().navTo("invoiceDetail", {
        id: iIndex
      });
    },
    
    onExit: function() {
      if (this._oEventBus) {
        this._oEventBus.unsubscribe("invoice", "statusChanged", this._onStatusChanged, this);
        this._oEventBus.unsubscribe("invoice", "syncWithDetail", this._sincronizarComDetalhe, this);
      }
    }
  });
});