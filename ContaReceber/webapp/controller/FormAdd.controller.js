sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "br/com/idxtec/commons/ErrorHandler",
  "sap/ui/model/json/JSONModel",
  "ContaReceber/model/ContaReceber",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "br/com/idxtec/commons/helpers/Lojas2HelpDialog",
  "br/com/idxtec/commons/helpers/Cliente2HelpDialog"
], 

function(BaseController, MessageBox, ErrorHanlder, JSONModel, ContaReceber, Filter, FilterOperator,
		 Lojas2HelpDialog, Cliente2HelpDialog) {
  "use strict";

  return BaseController.extend("ContaReceber.controller.FormAdd", {

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
    	
    	var oBinding = oModel.bindList("/ContaReceber");
    	var oContext = oBinding.create( new ContaReceber() );
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
    },
    
   
    handleSearchLoja: function(oEvent){
    	var sId = oEvent.getSource().getId();
        var oView = this.getView();
        
        Lojas2HelpDialog.handleValueHelp( oView, sId);
    },
    
    
    handleSearchCliente: function(oEvent){
    	var sId = oEvent.getSource().getId();
        var oView = this.getView();
 
        Cliente2HelpDialog.handleValueHelp( oView, sId);
    },
    
    
    handleSuggestLoja: function(oEvent) {
    	var sTerm = oEvent.getParameter("suggestValue");
    	
		if (sTerm){
			var oFilterCodigo = new Filter("Codigo", FilterOperator.EQ, sTerm)
			var oFilterNome = new Filter("Nome", FilterOperator.StartsWith, sTerm)
			
			var oFilters = new Filter({
				filters:[
					oFilterCodigo, 
					oFilterNome
				],
				and: false
			});
			
			oEvent.getSource().getBinding("suggestionItems").filter(oFilters);
		} 
		
    },
    
    handleSuggestCliente:  function(oEvent) {
    	var sTerm = oEvent.getParameter("suggestValue");
    	
		if (sTerm){
			var oFilterCodigo = new Filter("Codigo", FilterOperator.EQ, sTerm)
			var oFilterNome = new Filter("Nome", FilterOperator.StartsWith, sTerm)
			
			var oFilters = new Filter({
				filters:[
					oFilterCodigo, 
					oFilterNome
				],
				and: false
			});
			
			oEvent.getSource().getBinding("suggestionItems").filter(oFilters);
		} 
		
    }

  });

});
