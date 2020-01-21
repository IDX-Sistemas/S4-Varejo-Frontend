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
	"DocumentoEntrada/libs/Moment",
	"br/com/idxtec/commons/helpers/CondicaoPagamentoHelpDialog",
	"../services/api"
], 

function(BaseController, MessageBox, ErrorHanlder, Filter, FilterOperator,
		Lojas2HelpDialog, Fornecedor2HelpDialog, Produto2HelpDialog, formatter, Momentjs,
		CondicaoPagamentoHelpDialog, api ) {
  "use strict";

  return BaseController.extend("DocumentoEntrada.controller.FormAdd", {

	formatter: formatter,
    
    onInit: function (){
    	var oRouter
    	
      	oRouter = this.getRouter();
        oRouter.getRoute("Add").attachMatched( this._routerMatch , this );
        
      	this._oErrorHandler = new ErrorHanlder(this);
    },

    
    onExit: function(){
      this._oErrorHandler.destroy();
      
      this.byId("tableItems").unbindRows();
    },
	

	existeCondicao: function(oEvent){
		const oInput = oEvent.getSource();
		const sCodigo = oEvent.getParameter("value");
		
		const bExiste = api.existeCondicao(sCodigo, this);
		
		if (!bExiste){
			oInput.setValue(null)
			oInput.focus();
			MessageBox.error("Codigo nao encontrado.");
		}
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
    		oView, oModel, oBinding, oContext, oTable;
    	
    	oModel = this.getModel();
    	oView = this.getView();
    	oTable = this.byId("tableItems");
    	oTable.unbindRows();
    	
    	oBinding = oModel.bindList("/DocumentoEntrada");
    	oContext = oBinding.create({
    		DataRecebimento: moment().format("YYYY-MM-DD"),
		    BaseCalculo: 0.00,
		    ValorICMS: 0.00,
		    ValorIPI: 0.00,
		    ValorTotal: 0.00
    	}, false, false);
    		
    	oView.setBindingContext(oContext);
    },
    
    numeroChange: function(oEvent){
    	var sCodigoNew = ("00000000" + oEvent.getParameter("value") ).slice(-8);
    	oEvent.getSource().setValue(sCodigoNew);
    		
    	this.bindRows();
    },
    
    duplicataChange: function(oEvent){
    	var sCodigoNew = ("000000" + oEvent.getParameter("value") ).slice(-6);
    	oEvent.getSource().setValue(sCodigoNew);
    },
    
    fornecedorChange: function(oEvent){
    	this.bindRows();
    },
    
    
    bindRows: function(){
    	var oModel = this.getModel();
    	var oContext = this.getView().getBindingContext();
    	var sNumero = oContext.getProperty("Numero");
    	var sFornecedor = oContext.getProperty("Fornecedor");
    	
    	if ( !oModel.hasPendingChanges() ){
    		return;
    	}
    	
    	if (sNumero && sFornecedor){
    		var oTable = this.byId("tableItems");
    		oTable.setBusyIndicatorDelay(0);
    		
    		oTable.bindRows({
        		path: "/DocumentoEntradaItem",
        		filters:[
        			new Filter("DocumentoEntradaNumero", FilterOperator.EQ, sNumero),
        			new Filter("Fornecedor", FilterOperator.EQ, sFornecedor)
        		],
        		parameters:{
        			$count: true
        		},
        		events: {
        			
        			dataReceived: function(oEvent){
        				
        				var oRows = oTable.getRows();
        		    	
        				for(var i = 0; i < oRows.length; i++){
        					
        					var oCtx = oTable.getContextByIndex(i);
        					
        					if (oCtx){
        						
        						var sId = oRows[i].getCells()[0].getId();
        						var oInputProduto = sap.ui.getCore().byId( sId );
    	    					
        						oInputProduto.fireSuggest({
    	        					suggestValue: oCtx.getProperty("Codigo")
    	        				});
        						
    	    				}
        				}
        				
        			}
        		}
        	}); // end of oTable.bindRows
    	}
    	
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
    	oContext = this.getView().getBindingContext();
    	
    	oContext.created().then(
		    function(){
	            MessageBox.success("Dados gravados.",{
	                onClose: function(oAction){
	                    if (oAction == "OK"){
	                	    oModel.refresh();
	                    	that.onNavBack();
	                    	return;
	                    }
	                }
	            })
	        }
	    );
    	
    	
    	var fnResetBusy = function resetBusy(){
    		this._setBusy(false)
        }.bind(this);
    	
        this._setBusy(true);
        oModel.submitBatch("updGroup").then(fnResetBusy, fnResetBusy);
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
		
    }
   
    
  });

});
