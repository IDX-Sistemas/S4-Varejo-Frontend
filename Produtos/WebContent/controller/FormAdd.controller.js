sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "br/com/idxtec/commons/ErrorHandler",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "br/com/idxtec/commons/helpers/Marca2HelpDialog",
  "br/com/idxtec/commons/helpers/Tipo2HelpDialog",
  "br/com/idxtec/commons/helpers/Fornecedor2HelpDialog",
  "br/com/idxtec/commons/helpers/Secao2HelpDialog"
], 

function(BaseController, MessageBox, ErrorHanlder, JSONModel, Filter, FilterOperator, 
		 Marca2HelpDialog, Tipo2HelpDialog, Fornecedor2HelpDialog, Secao2HelpDialog) {
  "use strict";

  return BaseController.extend("Produtos.controller.FormAdd", {

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
    	
    	var oBinding = oModel.bindList("/Produtos");
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
    	
    	/**
    	 * ajusta valores iniciais
    	 */
    	oContext.setProperty("ValorVista", 0);
    	oContext.setProperty("ValorCusto", 0);
    	oContext.setProperty("ConsumoMedio", 0);
    	oContext.setProperty("CustoMedio", 0);
    	oContext.setProperty("VendaMes", 0);
    	oContext.setProperty("CompraMes", 0);
    	oContext.setProperty("TransferenciaMes", 0);
    	oView.setBindingContext(oContext);
    	
    	/**
    	 * inicializa modelo auxilizar
    	 */
    	var json = new JSONModel();
    	json.setProperty("/Marca", "");
    	json.setProperty("/Tipo", "");
    	json.setProperty("/Referencia", "");
    	
    	oView.setModel(json, "model");
    	
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
    	
    	var oContext = oView.getBindingContext();
    	
    	this._setCodigo(oContext);
    	
    	function resetBusy(){
    		oView.setBusy(false)
        }
    	
    	oView.setBusy(true);
    	oModel.submitBatch("updGroup").then(resetBusy, resetBusy);
    },
    
    /**
     * consolida codigo do produto
     */
    _setCodigo: function(oContext){
    	var json = this.getView().getModel("model");
    	
    	// TO DO
    	// VALIDAR MARCA, TIPO
    	// VERIFICAR SE CODIGO EXISTE
    	// COMPLETAR REFERENCIA COM ZEROS A ESQUERDA
    	var sMarca = json.getProperty("/Marca");
    	var sTipo = json.getProperty("/Tipo");
    	var sReferencia = json.getProperty("/Referencia");
    	
    	var sCodigo = `${sMarca} ${sTipo} ${sReferencia}`;
    	
    	oContext.setProperty("Codigo", sCodigo);
    },
    
    
    handleSearchMarca: function(oEvent){
    	var sId = oEvent.getSource().getId();
        var oView = this.getView();
        
        Marca2HelpDialog.handleValueHelp( oView, sId);
    },
    
    
    handleSearchTipo: function(oEvent){
    	var sId = oEvent.getSource().getId();
        var oView = this.getView();
        
        Tipo2HelpDialog.handleValueHelp( oView, sId);
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
    
    
    handleSuggestMarca:  function(oEvent) {
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
    
    handleSuggestTipo:  function(oEvent) {
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
		
    }
   
    
  });

});
