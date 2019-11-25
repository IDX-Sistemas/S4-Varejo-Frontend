//@ts-nocheck
sap.ui.define([
    "br/com/idxtec/commons/BaseController",
    "br/com/idxtec/commons/ErrorHandler",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "../service/api"
], function (BaseController, ErrorHandler, MessageBox, JSONModel, api) {

    return BaseController.extend("Relatorios.controller.Add", {

        onInit: function () {
            const oView = this.getView();
            const oRouter = this.getRouter();

            oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());

            oRouter.getRoute("Add").attachMatched(this.routerMatch, this);

            this._ErrorHandler = new ErrorHandler(this);
        },

        onExit: function () {
            this._ErrorHandler.destroy();
        },

        routerMatch: async function (oEvent) {
            const oModel = this.getModel();
            const oView = this.getView();
            const oBinding = oModel.bindList("/Relatorios");

            try {
                let sCodigo = await api.buscaProximoCodigo(oModel);
                const oContext = oBinding.create({
                    Codigo: sCodigo
                });

                oView.setBindingContext(oContext);
    
                let oViewModel = new JSONModel({
                    titulo: "Incluir Relatorio",
                    codigoEdit: false
                });
    
                oView.setModel(oViewModel, "view");

            } catch (oError) {
                MessageBox.error(oError.message);
            }

        },

        cancel:  function () {
            const oModel = this.getModel();
            if ( oModel.hasPendingChanges() ){
                oModel.resetChanges();
            }
            this.onNavBack();
        },

        save: async function() {
            const oModel = this.getModel();
            try {
                await oModel.submitBatch("updGroup");
                if ( !oModel.hasPendingChanges() ){
                    MessageBox.success("Dados gravados.",{
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
