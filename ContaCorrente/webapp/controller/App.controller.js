//@ts-nocheck
sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "br/com/idxtec/commons/helpers/ContaBancaria2HelpDialog",
  "br/com/idxtec/commons/helpers/Fornecedor2HelpDialog",
  "../libs/Moment",
  "../helpers/ContaPagarHelpDialog"
], 

function(BaseController, MessageBox, Filter, FilterOperator, JSONModel, MessageToast,
		 ContaBancaria2HelpDialog, Fornecedor2HelpDialog, Momentjs, ContaPagarHelpDialog) {
  "use strict";

  return BaseController.extend("ContaCorrente.controller.App", {

    onInit: function (){
    	var oView, oMovimentoModel;
    	
		oView = this.getView();
    	oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());
    	
    	oMovimentoModel = new JSONModel();
    	oMovimentoModel.setData({Conta: "  ", Data: null});
    	
    	oView.setModel(oMovimentoModel, "model");
    },
    
    bindRows: function(){
    	var oView = this.getView();
    	var oTable = oView.byId("table");
    	
    	var oMovimentoModel = oView.getModel("model");
         
        var dData = oMovimentoModel.getProperty("/Data");
        var sConta = oMovimentoModel.getProperty("/Conta");
         
        if (sConta && dData){
      	  dData = dData.toISOString();
        
      	  oTable.bindRows({
      		path: '/ContaCorrente',
			parameters:{
				$count: true
			},
			filters:[
				new Filter("CodigoConta", FilterOperator.EQ, sConta),
				new Filter("Data", FilterOperator.BT, dData, dData)
			]
			
      	  });
        
        }	
    	
    },
    
    
    filter: function (){
      var oView, oMovimentoModel, oTable, oFilter1, aFilters, oFilter2, dData, sConta;
      
      oView = this.getView();
      oTable = this.byId("table");
      
      oMovimentoModel = oView.getModel("model");
      
      dData = oMovimentoModel.getProperty("/Data");
      sConta = oMovimentoModel.getProperty("/Conta");
      
      aFilters = [];
      
      if (sConta && dData){
    	  dData = dData.toISOString();
    	  
    	  oFilter1 = new sap.ui.model.Filter("CodigoConta", sap.ui.model.FilterOperator.EQ, sConta);
          oFilter2 = new sap.ui.model.Filter("Data", sap.ui.model.FilterOperator.BT, dData, dData);
         
          aFilters = [
            oFilter1, oFilter2
          ];
      }
      
      oTable.getBinding("rows").filter(aFilters, "Control");
    },
    
    
    
	onCreate : function () {
		var oTable = this.byId("table"),
			oBinding =  oTable.getBinding("rows"),
			oView = this.getView(),
			oContext, oMovimentoModel, sConta, dData; 
		
		oMovimentoModel = oView.getModel("model");
		sConta = oMovimentoModel.getProperty("/Conta");
		dData = oMovimentoModel.getProperty("/Data");
		
		if (sConta && dData){
			oContext = oBinding.create({
				Data: moment().format("YYYY-MM-DD"),
				CodigoConta: sConta,
				CodigoFornecedor: "0000",
				Valor: 0.00
			}, false, true);
		}
		
		else {
			MessageBox.error("Informe a conta e a database de lancamento.");
			return;
		}
		
		var nRow = oTable.getRows().length;
		oTable.setFirstVisibleRow( nRow);
	},

	onResetChanges : function () {
		this.byId("table").getBinding("rows").resetChanges();
	},
	
	onSave : function () {
		var fnSuccess = function () {
			this._setBusy(false);
			this.getModel().refresh();
			MessageToast.show("Salvo !");
		}.bind(this);

		var fnError = function (oError) {
			this._setBusy(false);
			this._setUIChanges(false);
			MessageBox.error(oError.message);
		}.bind(this);

		this._setBusy(true); 
		this.getView().getModel().submitBatch("updGroup").then(fnSuccess, fnError);
	},
	
	onDelete: function() {
		var  that = this,
		     oTable, oContext, oModel;
		
		oModel = this.getModel();
		oTable = this.byId("table");
		oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );
		
		if (!oContext){
			MessageBox.warning("Selecione um lancamento na tabela !");
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
			
			if (oModel.hasPendingChanges()){
				MessageBox.error("Atualizações pendentes.\nNao e possivel excluir neste momento.");
				return;
			}
			
			MessageBox.show(
				"Lancamento já gravado.Deseja realmente excluir ?",{
	            "icon": MessageBox.Icon.QUESTION,
	            "title": "Exclusão",
	            "actions": [MessageBox.Action.NO, MessageBox.Action.YES],
	            "onClose": function(oAction){
	              if (oAction == MessageBox.Action.YES){
	            	 fnDeleta();
	              }
	            }
	          }
			);
				
		}
		
		else {
			fnDeleta();
		}
		
	},
	
	_setBusy : function (bIsBusy) {
		this.getView().setBusy(bIsBusy);
	},
	
	
	handleSearchContaBancaria: function(oEvent){
    	var sId = oEvent.getSource().getId();
        var oView = this.getView();
        
        ContaBancaria2HelpDialog.handleValueHelp( oView, sId);
    },
    
    handleSearchFornecedor: function(oEvent){
    	var sId = oEvent.getSource().getId();
        var oView = this.getView();
 
        Fornecedor2HelpDialog.handleValueHelp( oView, sId);
    },
	
	handleSearchDuplicata: async function(oEvent){
		var oView = this.getView();
		const oContext = oEvent.getSource().getBindingContext();
		
		const sFornecedor = oContext.getProperty("CodigoFornecedor");

		if (sFornecedor == "0000"){
			return ;
		}

		if (sFornecedor){
			try {
				let aData = await ContaPagarHelpDialog.handleValueHelp( oView, sFornecedor);
				if (aData){
					oContext.setProperty("NumeroDuplicata", aData.sDuplicata);
					oContext.setProperty("Valor", aData.nValor);
				}
			} catch (oError) {
				MessageBox.error(oError.message);
			}
		}
	},
	
    handleSuggestContaBancaria:  function(oEvent) {
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
