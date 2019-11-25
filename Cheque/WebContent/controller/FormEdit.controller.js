sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "br/com/idxtec/commons/ErrorHandler",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "br/com/idxtec/commons/helpers/Lojas2HelpDialog",
  "br/com/idxtec/commons/helpers/Cliente2HelpDialog"
], 

function(BaseController, MessageBox, ErrorHandler, Filter, FilterOperator,  Lojas2HelpDialog, Cliente2HelpDialog) {
  "use strict";

  return BaseController.extend("Cheques.controller.FormEdit", {

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
      
      oView.bindElement({
    	  path: "/Cheques(" + id + ")",
    	  events:{
    		  dataReceived: function(oEvent){
    			  
    			var oContext = oView.getBindingContext();
    			var oInputLoja = oView.byId("Loja");
    			var oInputCliente = oView.byId("Cliente");
  			
    			oInputLoja.fireSuggest({
  					suggestValue: oContext.getProperty("Loja")
  				});
  				
    			oInputCliente.fireSuggest({
  					suggestValue: oContext.getProperty("Cliente")
  				});
  				
    		  }
    	  }
      });
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

