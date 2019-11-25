sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "br/com/idxtec/commons/ErrorHandler"
], 

function(BaseController, MessageBox, ErrorHandler) {
  "use strict";

  return BaseController.extend("Funcionarios.controller.FormEdit", {

    onInit: function (){
      var oView = this.getView();
      oView.setBusyIndicatorDelay(0);
      
      var oRouter = this.getRouter();
      oRouter.getRoute("Edit").attachMatched( this._routerMatch , this );

      this._oErrorHandler = new ErrorHandler(this);
    },

    onExit: function(){
      this._oErrorHandler.destroy();
    },

    _routerMatch: function(oEvent){
      var oView = this.getView();
      var id = oEvent.getParameter("arguments").id;
      oView.bindElement(`/Funcionarios(${id})`); 
    },
    
   
    cancel: function(oEvent){
    	var oView = this.getView();
    	if (this.getModel().hasPendingChanges()){
    		this.getModel().resetChanges();
    	}
      
    	oView.unbindElement();
    	this.onNavBack();
    },

    save: function(){
      var that = this;
      var oView = this.getView();
      var oModel = oView.getModel();

      function resetBusy(){
        oView.setBusy(false);
        if ( !oModel.hasPendingChanges() ){
          MessageBox.success("Dados gravados.",{
            onClose: function(oAction){
              if (oAction == "OK"){
            	  oModel.refresh();
            	  that.onNavBack();
              }
            }
          });
        }
      }

      oView.setBusy(true);
      oView.getModel().submitBatch("updGroup").then(resetBusy, resetBusy);
    }

  });

});

