/* global moment:true */
//@ts-nocheck
sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"br/com/idxtec/commons/ErrorHandler",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"PedidoVenda/libs/Moment"
  ], 
  
  function(BaseController, MessageBox, ErrorHanlder, Filter, FilterOperator, Momentjs) {
	"use strict";

  return BaseController.extend("PedidoVenda.controller.FormView", {
	  
    onInit: function (){
    	const oRouter = this.getRouter();
    	oRouter.getRoute("View").attachMatched( this._routerMatch , this );
        
      	this._oErrorHandler = new ErrorHanlder(this);
    },

    
    onExit: function(){
      this._oErrorHandler.destroy();
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
	
    cancel: function(oEvent){
    	
    	this.onNavBack();
    }
    
  });

});
