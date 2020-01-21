//@ts-nocheck
sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"br/com/idxtec/commons/BaseController",
	"br/com/idxtec/commons/helpers/Lojas2HelpDialog",
	"br/com/idxtec/commons/helpers/Cliente2HelpDialog",
	"br/com/idxtec/commons/helpers/Produto2HelpDialog",
	"br/com/idxtec/commons/helpers/Vendedor2HelpDialog",
	"br/com/idxtec/commons/helpers/Secao2HelpDialog",
	"br/com/idxtec/commons/helpers/Cartao2HelpDialog",
	"PedidoVenda/helpers/PreVendaHelpDialog",
	"PedidoVenda/model/formatter"
], function(MessageBox, Filter, FilterOperator, Controller, 
		    Lojas2HelpDialog, Cliente2HelpDialog, Produto2HelpDialog, Vendedor2HelpDialog, Secao2HelpDialog, Cartao2HelpDialog,
		    PreVendaHelpDialog, formatter) {
	
	"use strict";
	
	return Controller.extend("PedidoVenda.controller.BaseController",{
		
		formatter: formatter,
	    
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
	    
	    handleSearchProduto: function(oEvent){
	        var sId = oEvent.getSource().getId();
	    	var oView = this.getView();
	    	
	    	Produto2HelpDialog.handleValueHelp( oView, sId);
	    },
	    
	    handleSearchVendedor: function(oEvent){
	        var sId = oEvent.getSource().getId();
	    	var oView = this.getView();
	 
	        Vendedor2HelpDialog.handleValueHelp( oView, sId);
	    },
	    
	    handleSearchSecao: function(oEvent){
	        var sId = oEvent.getSource().getId();
	    	var oView = this.getView();
	 
	        Secao2HelpDialog.handleValueHelp( oView, sId);
	    },
		
		handleSearchCartao: function(oEvent){
	    	var sId = oEvent.getSource().getId();
	        var oView = this.getView();
	        
	        Cartao2HelpDialog.handleValueHelp( oView, sId);
		},
		
		handleSearchPreVenda: function(oEvent){
			const oView = this.getView();
		
	        return PreVendaHelpDialog.handleValueHelp( oView );
		},

	    buscaProduto: function(oEvent){
			const oContext = oEvent.getSource().getBindingContext();
			const oModel = this.getModel();
			const oInput = oEvent.getSource();

			let sCodigo = oEvent.getSource().getValue();
			
	    	/**
			 * VALIDA FORMATO DO CODIGO DO PRODUTO XXX XXX XXXXXX
			 * E FORMATA CASO NAO ESTEJA NO PADRAO
			 */

			if( !sCodigo.match(/^[0-9][A-Z]{3} [0-9][A-Z]{3} [0-9][A-Z]{6}/i) ){ 
				sCodigo = sCodigo.replace(/(\d{3})(\d{3})(\d{6})/, "\$1 \$2 \$3"); 
				oContext.setProperty("Codigo", sCodigo);
	    	}
	    	
	    	if ( oContext.hasPendingChanges() ){
	        	
	    		var oFunction = oModel.bindContext("/GetProdutoPeloCodigo(...)");
	    		oFunction.setParameter("Codigo", sCodigo);
	    		
	    		oFunction.execute().then( function(){
					
					const oProduto = oFunction.getBoundContext().getObject();
					
	    			if( oProduto.hasOwnProperty("RowId") ){
						
						const { ValorVista, Secao } = oProduto

						oContext.setProperty("ValorUnitario", ValorVista);
						oContext.setProperty("Secao", Secao);
					} else {
						oInput.focus();
						oContext.setProperty("Codigo", "");
						MessageBox.error("Produto não cadastrado.")	
					}
	    			
	    		}).catch( function(oError) {
	    			
	    			MessageBox.error(oError.message);
	    			
	    		});
		
	    	}
	        	
	    },
	    
	    
	    existeVendedor: function(oEvent){
	    	var oContext = oEvent.getSource().getBindingContext();
	    	var sCodigo = oEvent.getSource().getValue();
	    	
	    	var oModel = this.getModel();
	    	
	    	if ( oContext.hasPendingChanges() ){
	    		var oTable = this.byId("tableItems");
			  	var nIndex = oContext.getIndex();   //qual linha eu estou no change
		    	
				var oRows = oTable.getRows();
		    	
				var sInputId = oRows[nIndex].getCells()[2].getId();
				var oInput = sap.ui.getCore().byId( sInputId );
				
				var oFunction = oModel.bindContext("/ExisteCodigoVendedor(...)");
	    		oFunction.setParameter("Codigo", sCodigo);
	        	oFunction.execute().then(
					function(){
						var bExiste = oFunction.getBoundContext().getObject().value;
						if (bExiste == false){
							oInput.setValue("");
							oInput.focus();
							MessageBox.error("Vendedor não cadastrado.");
						}
					}
	    		);
			}
	    	
	    },
	    
	    existeSecao: function(oEvent){
	    	var oContext = oEvent.getSource().getBindingContext();
	    	var sCodigo = oEvent.getSource().getValue();
	    	
	    	var oModel = this.getModel();
	    	
	    	if ( oContext.hasPendingChanges() ){
	    		var oTable = this.byId("tableItems");
			  	var nIndex = oContext.getIndex();     //qual linha eu estou no change
		    	
				var oRows = oTable.getRows();
		    	
				var sInputId = oRows[nIndex].getCells()[3].getId();
				var oInput = sap.ui.getCore().byId( sInputId );
				
				var oFunction = oModel.bindContext("/ExisteCodigoSecao(...)");
	    		oFunction.setParameter("Codigo", sCodigo);
	        	oFunction.execute().then(
					function(){
						var bExiste = oFunction.getBoundContext().getObject().value;
						if (bExiste == false){
							oInput.setValue("");
							oInput.focus();
							MessageBox.error("Secao não cadastrada.");
						}
					}
	    		);
			}
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
			
		},
		
		handleSuggestCartao:  function(oEvent) {
	    	var sTerm = oEvent.getParameter("suggestValue");
	    	
			if (sTerm){
				var oFilterId = new Filter("RowId", FilterOperator.EQ, sTerm)
				var oFilterNome = new Filter("Descricao", FilterOperator.StartsWith, sTerm)
				
				var oFilters = new Filter({
					filters:[
						oFilterId,
						oFilterNome
					],
					and: false
				});
				
				oEvent.getSource().getBinding("suggestionItems").filter(oFilters);
			} 
			
		},
		
		_criarDialog: function(){
			const oView = this.getView();
			let oDialog = this.byId("vencimentosDialog");
			
			if(!oDialog){
				oDialog = sap.ui.xmlfragment(oView.getId(), "PedidoVenda.fragments.ContaReceber", this);
				oView.addDependent(oDialog); 
			}
					
			return oDialog;
    	}

	});

})
