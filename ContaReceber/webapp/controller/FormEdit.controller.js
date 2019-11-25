//@ts-nocheck
sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "br/com/idxtec/commons/ErrorHandler",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "br/com/idxtec/commons/helpers/Lojas2HelpDialog",
  "br/com/idxtec/commons/helpers/Cliente2HelpDialog",
  "ContaReceber/service/services"
], 

function(BaseController, MessageBox, ErrorHandler, Filter, FilterOperator,
		 Lojas2HelpDialog, Cliente2HelpDialog, services) {
  "use strict";

  return BaseController.extend("ContaReceber.controller.FormEdit", {

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
      var oContext, oInputCliente, sCliente;
      
      oView.setBusy(true);
      oInputCliente = oView.byId("Cliente");
  	
      oView.bindElement({
    	  path: "/ContaReceber(" + id + ")",
    	  events: {
          dataReceived: function(oEvent){
              oContext = oView.getBindingContext();
              sCliente = oContext.getProperty("Cliente");
              
              oInputCliente.fireSuggest({
                suggestValue: sCliente
              });
              
              let sNumero = oContext.getProperty("NumeroDuplicata");
              let sLoja = oContext.getProperty("Loja");
              
              this._bindRows(sNumero, sLoja) ;
              
              oView.setBusy(false);
            }.bind(this)
          }
      }); 
    },
    
    _bindRows: function (sNumero, sLoja) {
      const oTable = this.byId("table");
      oTable.bindRows({
        path: "/RecebimentoConta",
        filters: [
            new Filter("NumeroDuplicata", FilterOperator.EQ, sNumero ),
            new Filter("Loja", FilterOperator.EQ, sLoja )
          ]
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
      const oView = this.getView();
      const oModel = oView.getModel();
      const oContext = oView.getBindingContext();

      let sPago = oContext.getProperty("FlagPgto");
      debugger;
      if (sPago === 1){
        MessageBox.error("Duplicata já esta paga.");
        return;
      }

      let fnResetBusy = function(){
        oView.setBusy(false);
        if ( !oModel.hasPendingChanges() ){
          MessageBox.success("Dados gravados.",{
            onClose: function(oAction){
              if (oAction == "OK"){
            	  oModel.refresh();
            	  this.onNavBack();
              }
            }.bind(this)
          });
        }
      }

      oView.setBusy(true);
      oView.getModel().submitBatch("updGroup").then(fnResetBusy, fnResetBusy);
    },
    
    estornaPagamento: async function () {
      const oModel = this.getModel();
      const oTable = this.byId("table");
      const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );

      let sNumero, sLoja, sDoc, sData, sAction;

      if (!oContext){
        return;
      }

      sNumero = oContext.getProperty("NumeroDuplicata");
      sLoja = oContext.getProperty("Loja");
      sDoc = oContext.getProperty("NumeroDocumento");
      sData = oContext.getProperty("DataPagamento");

      sAction = await this._messageBoxConfirma();
      if (sAction === MessageBox.Action.YES){
        
        try {
          await services.estornoRecebimento(sNumero, sLoja, sDoc, sData, oModel);
          oModel.refresh();
        } catch (oError) {
          MessageBox.error(oError.message) ;
        }
       
      }
    
    },
    
    _messageBoxConfirma: function(){
      return new Promise(function(resolve){
        MessageBox.show(
          "Confirma estorno do recebimento ?",{
            title: "Estorno",
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function(sAction){
              resolve(sAction);
            }
          });
      });
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

