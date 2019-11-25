//@ts-nocheck
sap.ui.define([
    "br/com/idxtec/commons/BaseController",
    "br/com/idxtec/commons/ErrorHandler",
    "br/com/idxtec/commons/helpers/RelatorioHelpDialog" ,
    "../services/api",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (BaseController, ErrorHandler, RelatorioHelpDialog, api, MessageBox, JSONModel) {

    return BaseController.extend("Perguntas.controller.Add", {

        onInit: function () {
            const oView = this.getView();
            const oRouter = this.getRouter();

            oView.addStyleClass( this.getOwnerComponent().getContentDensityClass() );

            oRouter.getRoute("Add").attachMatched( this.routerMatch, this);

            this._ErrorHandler = new ErrorHandler(this);
        },


        pesquisaRelatorio: async function(oEvent){
            const oView = this.getView();
            const oInput = oEvent.getSource();
            
            try {
                let sCodigo = await RelatorioHelpDialog.handleValueHelp(oView);   
                oInput.setValue(sCodigo);

                let sOrdem = await api.proximaOrdem(this, sCodigo);

                this.byId("ordem").setValue(sOrdem);
                this.byId("descricao").focus();
            } catch (error) {
                MessageBox.error(error.message);
            }
            
        },

        onExit: function(){
            this._ErrorHandler.destroy();
        },

        routerMatch: function (oEvent) {
            const oModel = this.getModel();
            const oView = this.getView();
            const oBinding = oModel.bindList("/Perguntas");
            const oContext = oBinding.create({
                Obrigatorio: "N",
                Inativo: "N"
            });

            oView.setBindingContext(oContext);

            let oViewModel = new JSONModel({
                titulo: "Incluir Pergunta",
                codigoEdit: true
            });

            oView.setModel(oViewModel, "view");
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
