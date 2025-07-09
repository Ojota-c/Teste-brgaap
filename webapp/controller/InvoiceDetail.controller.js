sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/EventBus"
], function(Controller, MessageToast, EventBus) {
  "use strict";

  return Controller.extend("walkthrough.controller.InvoiceDetail", {
    onInit: function() {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("invoiceDetail").attachPatternMatched(this._onObjectMatched, this);
      
      this._oEventBus = sap.ui.getCore().getEventBus();
      this._oEventBus.subscribe("invoice", "listUpdated", this._atualizarFromList.bind(this));
      
      // Modelo temporário para cache
      this._oTempModel = new sap.ui.model.json.JSONModel();
      this.getView().setModel(this._oTempModel, "tempModel");
    },

    _onObjectMatched: function(oEvent) {
      const iIndex = oEvent.getParameter("arguments").id;
      const oView = this.getView();
      
      // Carrega cache persistente
      try {
        const savedData = localStorage.getItem("invoiceMasterData");
        if (savedData) {
          this._oTempModel.setData(JSON.parse(savedData));
        }
      } catch (e) {
        console.warn("Erro ao carregar cache:", e);
      }
      
      oView.unbindElement();
      oView.bindElement({
        path: `/${iIndex}`,
        model: "invoice"
      });
    },

    _atualizarFromList: function(sChannel, sEvent, oData) {
      const oView = this.getView();
      const oContext = oView.getBindingContext("invoice");
      
      if (oContext && oData.path === oContext.getPath()) {
        this._atualizarUI(oData.newStatus);
      }
    },

    onToggleStatus: function(oEvent) {
      const oView = this.getView();
      const oModel = oView.getModel("invoice");
      const oContext = oView.getBindingContext("invoice");
      
      if (!oContext) {
        MessageToast.show("Erro: Item não carregado", { duration: 1000 });
        return;
      }

      const bNewStatus = !oContext.getProperty("completed");
      
      // Atualiza modelo principal
      oModel.setProperty(oContext.getPath() + "/completed", bNewStatus);
      
      // Atualiza cache local
      try {
        const path = oContext.getPath();
        const id = path.split("/").pop();
        const tempData = this._oTempModel.getData() || {};
        
        tempData[id] = tempData[id] || oContext.getObject();
        tempData[id].completed = bNewStatus;
        
        localStorage.setItem("invoiceMasterData", JSON.stringify(tempData));
      } catch (e) {
        console.warn("Erro ao atualizar cache:", e);
      }
      
      // Dispara eventos
      this._oEventBus.publish("invoice", "statusChanged", {
        path: oContext.getPath(),
        newStatus: bNewStatus
      });
      
      this._oEventBus.publish("invoice", "syncWithDetail", {
        path: oContext.getPath(),
        newStatus: bNewStatus
      });
      
      this._atualizarUI(bNewStatus);
      MessageToast.show("Status atualizado", { duration: 1000 });
    },

    _atualizarUI: function(bStatus) {
      const oView = this.getView();
      const oButton = oView.byId("toggleButton");
      const oStatus = oView.byId("statusControl");
      
      if (oButton) oButton.setText(bStatus ? "Marcar como Pendente" : "Marcar como Concluído");
      if (oStatus) {
        oStatus.setText(bStatus ? "Concluído" : "Pendente");
        oStatus.setState(bStatus ? "Success" : "Warning");
      }
    },

    onNavBack: function() {
      this.getOwnerComponent().getRouter().navTo("invoiceList");
    },
    
    onExit: function() {
      if (this._oEventBus) {
        this._oEventBus.unsubscribe("invoice", "listUpdated", this._atualizarFromList, this);
      }
    }
  });
});