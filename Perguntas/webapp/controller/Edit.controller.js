//@ts-nocheck
sap.ui.define([
    "br/com/idxtec/commons/BaseController",
    "br/com/idxtec/commons/ErrorHandler",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (BaseController, ErrorHandler, MessageBox, JSONModel) {

    return BaseController.extend("Perguntas.controller.Edit", {

        onInit: function () {
            const oView = this.getView();
            const oRouter = this.getRouter();

            oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());

            oRouter.getRoute("Edit").attachMatched(this.routerMatch, this);

            this._ErrorHandler = new ErrorHandler(this);
        },

        onExit: function () {
            this._ErrorHandler.destroy();
        },

        routerMatch: function (oEvent) {
            const oView = this.getView();

            let id = oEvent.getParameter("arguments").id;
            oView.bindElement(`/Perguntas(${id})`);

            let oViewModel = new JSONModel({
                titulo: "Editar Pergunta",
                codigoEdit: false
            });

            oView.setModel(oViewModel, "view");
        },

        cancel: function () {
            const oModel = this.getModel();
            if (oModel.hasPendingChanges()) {
                oModel.resetChanges();
            }
            this.onNavBack();
        },

        save: async function () {
            const oModel = this.getModel();
            try {
                await oModel.submitBatch("updGroup");
                if (!oModel.hasPendingChanges()) {
                    MessageBox.success("Dados gravados.", {
                        onClose: () => {
                            oModel.refresh();
                            this.onNavBack();
                        }
                    });
                }
            } catch (oError) {
                MessageBox.error(oError.message);
            }
        }

    });

});
