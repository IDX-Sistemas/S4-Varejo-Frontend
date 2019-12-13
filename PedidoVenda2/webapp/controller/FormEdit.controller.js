/* global moment:true */
//@ts-nocheck
sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"br/com/idxtec/commons/ErrorHandler",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"PedidoVenda/libs/Moment",
	"PedidoVenda/service/api"
  ], 
  
  function(BaseController, MessageBox, ErrorHanlder, Filter, FilterOperator, Momentjs, api) {
	"use strict";

  return BaseController.extend("PedidoVenda.controller.FormEdit", {
	  
    onInit: function (){
    	const oRouter = this.getRouter();
    	oRouter.getRoute("Edit").attachMatched( this._routerMatch , this );
        
        window["idxtec_pedido_venda_status"] = "update";

      	this._oErrorHandler = new ErrorHanlder(this);
    },

    
    onExit: function(){
      this._oErrorHandler.destroy();
      this.byId("tableItems").unbindRows();
    },
   
  
    _routerMatch: function(oEvent){
    	const oView = this.getView();
    	const sId  = oEvent.getParameter("arguments").id;
    	const sNumero = oEvent.getParameter("arguments").numero;
    	const sLoja = oEvent.getParameter("arguments").loja;
    	
    	oView.bindElement({
    		path: "/PedidoVenda(" + sId + ")",
    		events: {
    			dataReceived: function(oEvent){
					this._fireSuggestCliente();
					//this._fireSuggestCartao();
    				this.bindRows(sNumero, sLoja);
    			}.bind(this)
    		}
		});
	
    },
    

    bindRows: function(sNumero, sLoja){
    	const oTable = this.byId("tableItems");
		oTable.unbindRows();	
		oTable.bindRows({
    		path: "/PedidoVendaItem",
    		filters:[
    			new Filter("NumeroVenda", FilterOperator.EQ, sNumero),
    			new Filter("Loja", FilterOperator.EQ, sLoja)
    		],
    		parameters:{
    			$count: true
			}
		}); 
    	
    },
        
    _fireSuggestCliente: function() {
    	const oContext = this.getView().getBindingContext();
		const oInput = this.getView().byId("cliente");
		
		oInput.fireSuggest({
			suggestValue: oContext.getProperty("Cliente")
		});
		
    },
    
    // _fireSuggestCartao: function() {
    // 	const oContext = this.getView().getBindingContext();
	// 	const oInput = this.getView().byId("cartaoCredito");
		
	// 	debugger;
	// 	oInput.fireSuggest({
	// 		suggestValue: oContext.getProperty("OperadoraId")
	// 	});
		
	// },
	
	buscarCI: async function(oEvent) {
		const oView = this.getView();
		const oContext = oView.getBindingContext();
		const oTable = this.byId("tableItems");
		const oComponent = this.getOwnerComponent();

		const sNumero = oContext.getProperty("Numero");
		const sLoja = oContext.getProperty("Loja");
		
		if ( sNumero && sLoja ) {

			try {
		
				const sNumeroCI = await this.handleSearchPreVenda(oEvent);
				
				if (sNumeroCI) {
					
					oView.setBusy(true);

					const aItems = await api.buscaItemsPreVenda(sNumeroCI, oComponent);
					const oBinding = oTable.getBinding("rows");
					
					for (let i = 0; i < aItems.length; i++) {
						const item = aItems[i];
						
						let oNovoItem = {
							NumeroVenda: sNumero,
							Loja: sLoja,
							Codigo: item.Codigo,
							Vendedor: item.PreVenda.Vendedor,
							ValorUnitario: parseFloat( item.ValorUnitario + 0 ),
							ValorDesconto: parseFloat( item.Desconto + 0 ),
							ValorAcrescimo: parseFloat( item.Acrescimo + 0 ),
							Quantidade: parseInt( item.Quantidade + 0 ),
							NumeroPreVenda: item.Numero
						};

	    				oBinding.create( oNovoItem, false, true);
					}
						
					oView.setBusy(false);

					const nRow = oBinding.getContexts().length;
					oTable.setFirstVisibleRow( nRow );

					this.totalizaPedido()
				}

			} catch (oError) {
				MessageBox.error(oError.message);
			}
			
		}

		else {
			MessageBox.warning("Informe o numero da venda e a loja.");
		}
		
	},
	
    incluirItem: function(){
    	const oTable = this.byId("tableItems");
    	const oBinding = oTable.getBinding("rows");
    	
    	const oContext = this.getView().getBindingContext();
    	
    	let oNovoItem = {};
    	oNovoItem.NumeroVenda = oContext.getProperty("Numero");
    	oNovoItem.Loja = oContext.getProperty("Loja");
    	oNovoItem.ValorUnitario = 0.00;
    	oNovoItem.ValorDesconto = 0.00;
    	oNovoItem.ValorAcrescimo = 0.00;
    	oNovoItem.Quantidade = 1;
    	
    	oBinding.create(oNovoItem, false, true);
    	
    	const nRow = oTable.getBinding("rows").getContexts().length
		
		oTable.setFirstVisibleRow( nRow );
    },
	
	
    removeItem: async function() {
		const oTable = this.byId("tableItems");
		const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );
		
		if (!oContext){
			MessageBox.warning("Selecione um item na tabela !");
			return;
		}
		
		if (!oContext.isTransient()){	
			if ( await this.messageBoxExclusao() ==  MessageBox.Action.NO ) {
				return;
			}
		}
		
		try {
			await this.deletaItem(oContext);
			oTable.clearSelection();
		} catch (oError) {
			MessageBox.error(oError.message);
		}
    },
	
	changeCondicao: function(oEvent) {
		const sOpcao = oEvent.getSource().getSelectedKey();
		const oInputParcelas = this.byId("parcelas");
		const oInputEntrada = this.byId("entrada");
		const oInputCartaoCredito = this.byId("cartaoCredito");

		switch (sOpcao) {
			case "1":
				oInputParcelas.setEditable(false);
				oInputEntrada.setEditable(false);
				oInputCartaoCredito.setEditable(false);
				break;
			case "5":
				oInputParcelas.setEditable(true);
				oInputEntrada.setEditable(true);
				oInputCartaoCredito.setEditable(true);
				break;	
			default:
				oInputParcelas.setEditable(true);
				oInputEntrada.setEditable(true);
				oInputCartaoCredito.setEditable(false);
				break;
		}
	},

	changeEntrada: function(oEvent) {
		const sOpcao = oEvent.getSource().getSelectedKey();
		const oInputValorEntrada = this.byId("valorEntrada");

		oInputValorEntrada.setEditable(sOpcao === "S");
	},

	totalizaPedido: function() {
		const oContext = this.getView().getBindingContext();
		const oTable = this.byId("tableItems");
		const nRows = oTable.getBinding("rows").getLength();
		
		let nTotalVenda = 0;
		let nTotalDesconto = 0;
		let nTotalAcrescimo = 0;

		for(let i=0; i < nRows; i++){
			const oCtx= oTable.getContextByIndex(i);
			
			const nQuantidade = oCtx.getProperty("Quantidade");
			const nValorUnit  = oCtx.getProperty("ValorUnitario");
			
			nTotalDesconto += oCtx.getProperty("ValorDesconto");
			nTotalAcrescimo += oCtx.getProperty("ValorAcrescimo");
			nTotalVenda += nQuantidade * nValorUnit;	
		}

		oContext.setProperty("ValorVenda", nTotalVenda);
		oContext.setProperty("ValorDesconto", nTotalDesconto);
		oContext.setProperty("ValorAcrescimo", nTotalAcrescimo);
	},
	
	/**@private */
	messageBoxExclusao: function(){
		return new Promise((resolve) => {
			MessageBox.show(
				"Lançamento já gravado.Deseja realmente excluir ?",{
	            "icon": MessageBox.Icon.QUESTION,
	            "title": "Exclusão",
	            "actions": [MessageBox.Action.NO, MessageBox.Action.YES],
	            "onClose": function(oAction){
	            	resolve(oAction);
	            }
			});	
		});
	},

	/**@private */
	deletaItem: function(oContext){
		const oView = this.getView();
		oView.setBusy(true);

		return new Promise((resolve) => {
			oContext.delete("$auto").then(() => {
				oView.setBusy(false);
				resolve();
			});
		});
	},

    cancel: function(oEvent){
    	if (this.getModel().hasPendingChanges()){
    		this.getModel().resetChanges();
    	}
    	
    	this.onNavBack();
    },

	/**@private */
	refreshData: function(){
		const oModel = this.getModel();
		if (oModel.hasPendingChanges()){
			oModel.resetChanges();
		}

		oModel.refresh();
	},
    
    save: async function(){
		const oView = this.getView();
		const oModel = this.getModel();
		
		try {
			
			oView.setBusy(true);

			if( await this.submitBatch() ){
				
				oModel.refresh();
				oView.setBusy(false);

				MessageBox.success("Dados gravados.",{
    				onClose: function(oAction){
    					if (oAction == "OK"){
    						this.onNavBack();
 	                    }
    				}.bind(this)
				});
				
			}

		} catch (oError) {
			MessageBox.error(oError.message);
		}

    },
    
	/**@private */
	submitBatch: function(){
		const oModel = this.getModel();

		return new Promise((resolve) => {
			oModel.submitBatch("updGroup").then(() => {
				resolve( !oModel.hasPendingChanges() );
			});
		});
	},

	/**@private */
    _setBusy: function(bIsBusy){
    	this.getView().setBusy(bIsBusy);
    } 
    
  });

});
