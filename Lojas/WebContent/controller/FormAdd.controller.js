sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "br/com/idxtec/commons/ErrorHandler"
], 

function(BaseController, MessageBox, ErrorHanlder) {
  "use strict";

  return BaseController.extend("br.com.idxtec.Lojas.controller.FormAdd", {

    onInit: function (){
      var oView = this.getView();
      oView.setBusyIndicatorDelay(0);
      
      var oRouter = this.getRouter();
      oRouter.getRoute("Add").attachMatched( this._routerMatch , this );

      this._oErrorHandler = new ErrorHanlder(this);
    },


    onExit: function(){
      this._oErrorHandler.destroy();
    },

    
    _routerMatch: function(oEvent){
    	var that = this;
    	var oView = this.getView();
    	var oModel = this.getModel();
    	
    	var oBinding = oModel.bindList("/Lojas");
    	var oContext = oBinding.create();
    	oContext.created().then(
    	    function(){
                oBinding.refresh();
                MessageBox.success("Dados gravados.",{
                    onClose: function(oAction){
                        if (oAction == "OK"){
                    	    oModel.refresh();
                        	that.onNavBack();
                        }
                    }
                })
            }
        );
    	
    	oView.setBindingContext(oContext);
    },
    
    cancel: function(oEvent){
    	if (this.getModel().hasPendingChanges()){
    		this.getModel().resetChanges();
    	}
    	
    	this.onNavBack();
    },

    save: function(){
    	var oModel = this.getModel();
    	var oView = this.getView();
    	
    	function resetBusy(){
    		oView.setBusy(false)
        }
    	
    	oView.setBusy(true);
    	oModel.submitBatch("updGroup").then(resetBusy, resetBusy);
    }

  });

});
