//@ts-nocheck
sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "br/com/idxtec/commons/ErrorHandler",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "br/com/idxtec/commons/helpers/Lojas2HelpDialog",
  "br/com/idxtec/commons/helpers/Fornecedor2HelpDialog",
  "br/com/idxtec/commons/helpers/Produto2HelpDialog",
  "DocumentoEntrada/model/formatter",
  "br/com/idxtec/commons/helpers/CondicaoPagamentoHelpDialog"
], 

function(BaseController, MessageBox, ErrorHanlder, Filter, FilterOperator, 
		 Lojas2HelpDialog, Fornecedor2HelpDialog, Produto2HelpDialog, formatter,
		 CondicaoPagamentoHelpDialog ) {
  "use strict";

  return BaseController.extend("DocumentoEntrada.controller.FormView.controller", {

	formatter: formatter,

    onInit: function (){
    	var oRouter
    	
      	oRouter = this.getRouter();
        oRouter.getRoute("View").attachMatched( this._routerMatch , this );
        
      	this._oErrorHandler = new ErrorHanlder(this);
    },

    
    onExit: function(){
      this._oErrorHandler.destroy();
      
      this.byId("tableItems").unbindRows();
    },
    

    handleSearchLoja: function(oEvent){
        var sId = oEvent.getSource().getId();
    	var oView = this.getView();
        
        Lojas2HelpDialog.handleValueHelp( oView, sId);
    },
    
    handleSearchFornecedor: function(oEvent){
    	var sId = oEvent.getSource().getId();
        var oView = this.getView();
        
        Fornecedor2HelpDialog.handleValueHelp( oView, sId);
    },
    
    handleSearchProduto: function(oEvent){
        var sId = oEvent.getSource().getId();
    	var oView = this.getView();
 
        Produto2HelpDialog.handleValueHelp( oView, sId);
    },
	
	
	handleSearchCondicaoPagamento: async function(oEvent){
		const oInput = oEvent.getSource();
		
		try {
			
			const sCodigo = await CondicaoPagamentoHelpDialog.handleValueHelp( this.getView() );
		
			if (sCodigo){
				oInput.setValue(sCodigo);
			}

		} catch (oError) {
			MessageBox.error(oError.message);
		}
		
	},	


    _routerMatch: function(oEvent){
    	var that = this,
    		oView, oModel, oBinding, oContext, oTable, sId, 
    		oInputFornecedor, oInputLoja, oInputProduto;
    	
    	sId = oEvent.getParameter("arguments").id;
    	
    	oModel = this.getModel();
    	oView = this.getView();
    	oTable = this.byId("tableItems");
    	oTable.setBusyIndicatorDelay(0);
    	
    	oInputFornecedor = this.byId("Fornecedor");
    	oInputLoja = this.byId("Loja");
    	
    	oView.bindElement({
    		path: "/DocumentoEntrada(" + sId + ")",
    		events: {
    			dataReceived: function(oEvent){
    				oContext = oView.getBindingContext();
    				
    				oInputFornecedor.fireSuggest({
    					suggestValue: oContext.getProperty("Fornecedor")
    				});
    				
    				oInputLoja.fireSuggest({
    					suggestValue: oContext.getProperty("Loja")
    				});
    				
    				
    				oTable.bindRows({
    		    		path: "/DocumentoEntradaItem",
    		    		parameters:{
    		    			$count: true
    		    		},
    		    		filters: [
    		    			new Filter("DocumentoEntradaNumero", FilterOperator.EQ, oContext.getProperty("Numero")),
    		    			new Filter("Fornecedor", FilterOperator.EQ, oContext.getProperty("Fornecedor")),
    		    		],
    		    		events: {
    		    			
    		    			dataReceived: function(oEvent){
    		    				
    		    				var oRows = oTable.getRows();
    		    		    	
    		    				for(var i = 0; i < oRows.length; i++){
    		    					
    		    					var oCtx = oTable.getContextByIndex(i);
    		    					
    		    					if (oCtx){
    		    						var oInputProduto = sap.ui.getCore().byId( oRows[i].getCells()[0].getId() );
        		    					
        		    					oInputProduto.fireSuggest({
        		        					suggestValue: oCtx.getProperty("Codigo")
        		        				});
        		    				}
    		    				}
    		    				
    		    			}
  
    		    		}
    		    		
    		    	}); // end of oTable.bindRows
    				
    			}
    	
    		}
  
    	});
    	
    },
    
    
    incluirItem: function(){
    	var oTable, oBinding, oContext, sNumero, sFornecedor, sLoja, dEntrada, nRow;
    	
    	oContext = this.getView().getBindingContext();
    	sNumero = oContext.getProperty("Numero");
    	sFornecedor = oContext.getProperty("Fornecedor");
    	sLoja = oContext.getProperty("Loja");
    	dEntrada = oContext.getProperty("DataRecebimento");
    	
    	oTable = this.byId("tableItems");
    	oBinding = oTable.getBinding("rows");
    	
    	oBinding.create({
    		DocumentoEntradaNumero: sNumero,
    		Fornecedor: sFornecedor,
    		Loja: sLoja,
    		DataEntrada:  dEntrada,
    		ValorUnitario: 0.00,
    		Quantidade: 0
    	}, false, true);
    	
    	nRow = oTable.getRows().length;
		oTable.setFirstVisibleRow( nRow );
    },
    
    cancel: function(oEvent){
    	if (this.getModel().hasPendingChanges()){
    		this.getModel().resetChanges();
    	}
    	
    	this.onNavBack();
    },

    
    save: function(){
    	var that = this,
    		oModel, oContext;
    	    
    	oModel = this.getModel();
    	
    	function resetBusy(){
            that._setBusy(false);
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
    	
        this._setBusy(true);
        oModel.submitBatch("updGroup").then(resetBusy, resetBusy);
    },
    
    
    _setBusy: function(bIsBusy){
    	this.getView().setBusy(bIsBusy);
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
		
    },
    
    
    removeItem: function() {
		var  that = this,
		     oTable, oContext, oModel;
		
		oModel = this.getModel();
		oTable = this.byId("tableItems");
		oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );
		
		if (!oContext){
			MessageBox.warning("Selecione um item na tabela !");
			return;
		}
		
		var fnDeleta = function(){
			that._setBusy(true)
	        oContext.delete("$auto")
	        	.then(
			          function(){
			        	  oTable.clearSelection();
			          }
		        )
		        .finally(
			          function(){
			            that._setBusy(false);
			          }
		        );
		}
		
		if (!oContext.isTransient()){
			MessageBox.show(
				"Lançamento já gravado.Deseja realmente excluir ?",{
	            "icon": MessageBox.Icon.QUESTION,
	            "title": "Exclusão",
	            "actions": [MessageBox.Action.NO, MessageBox.Action.YES],
	            "onClose": function(oAction){
	            	if (oAction == MessageBox.Action.YES){
	            		fnDeleta();
	            	}
	            }
			});	
		}
		
		else {
			fnDeleta();
		}
		
	},
   
    
  });

});
