sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "br/com/idxtec/commons/ErrorHandler", 
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "br/com/idxtec/commons/helpers/Fornecedor2HelpDialog",
  "br/com/idxtec/commons/helpers/Secao2HelpDialog"
], 

function(BaseController, MessageBox, ErrorHandler, Filter, FilterOperator, 
		 Fornecedor2HelpDialog, Secao2HelpDialog) {
  "use strict";

  return BaseController.extend("Produtos.controller.FormOverview", {

    onInit: function (){
      var oView = this.getView();
      oView.setBusyIndicatorDelay(0);
      
      var oRouter = this.getRouter();
      oRouter.getRoute("Overview").attachMatched( this._routerMatch , this );

      this._oErrorHandler = new ErrorHandler(this);
    },
    
    
    onExit: function(){
      this._oErrorHandler.destroy();
    },

    
    _routerMatch: function(oEvent){
      var oView = this.getView();
      var id = oEvent.getParameter("arguments").id;
      
      oView.bindElement({
    	  path: "/Produtos(" + id + ")",
    	  events: {
    		  dataReceived: function(oEvent){
    			  var oInput = oView.byId("Fornecedor");
    			  oInput.fireSuggest({
     				 suggestValue: oView.getBindingContext().getProperty("Fornecedor")
     			  });
    			  
    			  var oInputSecao = oView.byId("secao");
    			  oInputSecao.fireSuggest({
      				 suggestValue: oView.getBindingContext().getProperty("Secao")
      			  });
    			  
    			  var oTable = oView.byId("table");
    			  oTable.bindRows({
    				  path: "/SaldoEstoque",
    				  filters: [
    					  new Filter("Codigo", FilterOperator.EQ, oView.getBindingContext().getProperty("Codigo"))
    				  ]
    			  });
    		  }
    	  }
      });
    },
    
   
    goBack: function(oEvent){
    	var oView = this.getView();
    	oView.unbindElement();
    	this.onNavBack();
    },

    
    
    handleSearchFornecedor: function(oEvent){
    	var sId = oEvent.getSource().getId();
        var oView = this.getView();
        
        Fornecedor2HelpDialog.handleValueHelp( oView, sId);
    },
    
    
    handleSearchSecao: function(oEvent){
    	var sId = oEvent.getSource().getId();
        var oView = this.getView();
        
        Secao2HelpDialog.handleValueHelp( oView, sId);
    },
    
    handleSuggestFornecedor:  function(oEvent) {
    	var sTerm = oEvent.getParameter("suggestValue");
    	
		if (sTerm){
			var oFilterCodigo = new Filter("Codigo", FilterOperator.EQ, sTerm)
			var oFilterNome = new Filter("RazaoSocial", FilterOperator.StartsWith, sTerm)
			
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
    
    handleSuggestSecao:  function(oEvent) {
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

