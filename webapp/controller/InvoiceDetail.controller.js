sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function(Controller, MessageToast) {
    "use strict";

    return Controller.extend("walkthrough.controller.InvoiceDetail", {
        onInit: function() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("invoiceDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function(oEvent) {
            const iIndex = oEvent.getParameter("arguments").id;
            const oView = this.getView();
            
            // 1. Limpa binding anterior
            oView.unbindElement();
            
            // 2. Faz binding com refresh forçado
            oView.bindElement({
                path: `/${iIndex}`,
                model: "invoice",
                parameters: {
                    $$updateGroupId: "detailGroup",
                    $$patchWithoutSideEffects: true
                }
            });
        },

        onToggleStatus: function(oEvent) {
            const oView = this.getView();
            const oModel = oView.getModel("invoice");
            const oContext = oView.getBindingContext("invoice");
            
            if (!oContext) {
                MessageToast.show("Erro: Item não carregado");
                return;
            }

            // 1. Pega o estado ATUAL do modelo
            const bCurrentStatus = oContext.getProperty("completed");
            
            // 2. Inverte o status
            const bNewStatus = !bCurrentStatus;
            
            // 3. Atualiza o modelo LOCALMENTE
            oModel.setProperty(oContext.getPath() + "/completed", bNewStatus);
            
            // 4. Atualização VISUAL IMEDIATA
            oModel.refresh(true); // Força atualização
            
            // 5. Atualiza o Switch manualmente (garantia)
            oEvent.getSource().setState(bNewStatus);
            
            // 6. Feedback visual
            MessageToast.show(`Status atualizado para: ${bNewStatus ? "CONCLUÍDO" : "PENDENTE"}`);
        },

        onNavBack: function() {
            this.getOwnerComponent().getRouter().navTo("invoiceList");
        }
    });
});