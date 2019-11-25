//@ts-nocheck
sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "br/com/idxtec/commons/ErrorHandler"
], 

function(BaseController, MessageBox, ErrorHandler ) {
  "use strict";

  return BaseController.extend("Usuarios.controller.FormEdit", {

    onInit: function (){
      const oRouter = this.getRouter();
      oRouter.getRoute("Edit").attachMatched( this._routerMatch , this );

      this._oErrorHandler = new ErrorHandler(this);
    },

    onExit: function(){
      this._oErrorHandler.destroy();
    },

    _routerMatch: function(oEvent){
      const oView = this.getView();
      const id = oEvent.getParameter("arguments").id;
      
      oView.setBusy(true);
      
      oView.bindElement({
    	  path: "/Usuarios(" + id + ")",
    	  events: {
          dataReceived: function(oEvent){
              oView.setBusy(false);
            }
          }
      }); 
    },
    
    cancel: function(oEvent){
      const oView = this.getView();
      const oModel = this.getModel();

    	if (oModel.hasPendingChanges()){
        oModel.resetChanges();
    	}
      
    	oView.unbindElement();
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

