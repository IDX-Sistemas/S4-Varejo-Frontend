//@ts-nocheck
sap.ui.define([
	"br/com/idxtec/commons/BaseController",
	"sap/m/MessageBox",
	"br/com/idxtec/commons/ErrorHandler",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"PedidoVendaCancelamento/model/formatter"
  ], 
  
  function(BaseController, MessageBox, ErrorHanlder, Filter, FilterOperator, formatter) {
	"use strict";

  return BaseController.extend("PedidoVendaCancelamento.controller.FormView", {
	
	formatter: formatter,

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
    	
    	oView.bindElement({ 
			path: `/PedidoVenda( ${sId} )`, 
			events:{ 
				dataReceived: function(oEvent) {
					const sNumero = oEvent.getSource().getBoundContext().getProperty("Numero");
					const sLoja = oEvent.getSource().getBoundContext().getProperty("Loja");
					this.bindRows(sNumero, sLoja)
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
    
    cancel: function(oEvent){
    	
    	this.onNavBack();
    }
    
  });

});
