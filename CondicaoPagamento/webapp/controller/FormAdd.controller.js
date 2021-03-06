//@ts-nocheck
sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "br/com/idxtec/commons/ErrorHandler"
], 

function(BaseController, MessageBox, ErrorHanlder) {
  "use strict";

  return BaseController.extend("CondicaoPagamento.controller.FormAdd", {

    onInit: function (){
      const oRouter = this.getRouter();
      
      oRouter.getRoute("Add").attachMatched( this._routerMatch , this );

      this._oErrorHandler = new ErrorHanlder(this);
    },


    onExit: function(){
      this._oErrorHandler.destroy();
    },

    
    _routerMatch: function(oEvent){
    	const oView = this.getView();
    	const oModel = this.getModel();
    	const oBinding = oModel.bindList("/CondicaoPagamento");
      const oContext = oBinding.create({
        Codigo: "",
        Descricao: "",
        Intervalo: 30,
        Parcelas: 1,
        ComEntrada: "N"
      });

    	oView.setBindingContext(oContext);
    },
    
    cancel: function(oEvent){
      const oModel = this.getModel();
      
      if (oModel.hasPendingChanges()){
    		oModel.resetChanges();
    	}
    	
    	this.onNavBack();
    },

    save: async function(){
    	const oModel = this.getModel();
      const oView = this.getView();
      
      try {
        
        oView.setBusy(true);

        if( await this._submitBatch() ) {
          
          oModel.refresh();

          MessageBox.success(
            "Dados gravados.", {
              onClose: function(sAction){
                this.onNavBack();
              }.bind(this)
            });
        }
        
      } catch (oError) {
        MessageBox.error(oError.message);
      } finally {
        oView.setBusy(false);
      }

    },
    
   
    _submitBatch: function() {
      const oModel = this.getModel();
      
      return new Promise(function(resolve){
        oModel.submitBatch("updGroup").then(
          function(){
            resolve(!oModel.hasPendingChanges());
          });
      });

    }


  });

});
