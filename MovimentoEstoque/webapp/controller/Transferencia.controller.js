sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "br/com/idxtec/commons/ErrorHandler",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "br/com/idxtec/commons/helpers/Lojas2HelpDialog",
  "br/com/idxtec/commons/helpers/ProdutoHelpDialog"
], 

function(BaseController, MessageBox, ErrorHanlder, Filter, FilterOperator, Lojas2HelpDialog, ProdutoHelpDialog) {
  "use strict";

  return BaseController.extend("MovimentoEstoque.controller.Transferencia", {

    onInit: function (){
      var oView = this.getView();
      oView.setBusyIndicatorDelay(0);
      
      var oRouter = this.getRouter();
      oRouter.getRoute("Transferencia").attachMatched( this._routerMatch , this );

      this._oErrorHandler = new ErrorHanlder(this);
    },


    onExit: function(){
      this._oErrorHandler.destroy();
    },

    
    _routerMatch: function(oEvent){
    	var that = this;
    	var oView = this.getView();
    	var oModel = this.getModel();
    	
    	var oBinding = oModel.bindList("/MovimentoEstoque");
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
    	
    	oContext.setProperty("CodigoTransferencia", "04");
    	oContext.setProperty("QuantidadeAtual", 0);
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
    
    handleSearchProduto: function(oEvent){
        var sId = oEvent.getSource().getId();
    	var oView = this.getView();
 
        ProdutoHelpDialog.handleValueHelp( oView, sId);
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
    
    handleSuggestProduto:  function(oEvent) {
    	var sTerm = oEvent.getParameter("suggestValue");
    	
		if (sTerm){
			var oFilterCodigo = new Filter("Codigo", FilterOperator.EQ, sTerm)
			var oFilterNome = new Filter("Descricao", FilterOperator.StartsWith, sTerm)
			
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
