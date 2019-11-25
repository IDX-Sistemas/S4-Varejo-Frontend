sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "br/com/idxtec/commons/helpers/Lojas2HelpDialog"
], 

function(BaseController, MessageBox, Filter, FilterOperator, JSONModel, 
		MessageToast, Lojas2HelpDialog) {
  "use strict";

  return BaseController.extend("MovimentoCaixa.controller.App", {

    onInit: function (){
    	var oView, oMovimentoModel;
    	
    	oView = this.getView();
    	oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());
    	
    	oMovimentoModel = new JSONModel();
    	oMovimentoModel.setData({Loja: "", Data: null});
    	
    	oView.setModel(oMovimentoModel, "model");
    },
    
    bindRows: function(){
    	var oView = this.getView();
    	var oTable = oView.byId("table");
    	var oMovimentoModel = oView.getModel("model");
    	
    	oTable.unbindRows();
    	
    	var dData = oMovimentoModel.getProperty("/Data");
        var sLoja = oMovimentoModel.getProperty("/Loja");
    	
        if (sLoja && dData){
        	
        	dData = dData.toISOString();
        	
        	oTable.bindRows({
        		path: '/MovimentoCaixa',
    			parameters:{
    				$count: true
    			},
    			filters: [
    				new Filter("Loja", FilterOperator.EQ, sLoja),
    		        new Filter("Data", FilterOperator.BT, dData, dData)
    			]
        	});
        }
    	
    },
    
    
    detele: function(oEvent){
      var that = this;
      var oTable = this.byId("table");
      var oView = this.getView();
      var oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

      function deleta(){
        oView.setBusy(true)
        oContext.delete("$auto").then(
          function(){
        	  oTable.clearSelection();
          }
        ).finally(
          function(){
            oView.setBusy(false);
          }
        );
      }

      if (oContext){
        MessageBox.show(
          "Excluir item selecionado ?",{
            "icon": MessageBox.Icon.QUESTION,
            "title": "Exclusão",
            "actions": [MessageBox.Action.NO, MessageBox.Action.YES],
            "onClose": function(oAction){
              if (oAction == MessageBox.Action.YES){
                deleta();
              }
            }
          }
        );
      }
    },
    
	onCreate : function () {
		var oTable = this.byId("table"),
			oBinding =  oTable.getBinding("rows"),
			oView = this.getView(),
			oContext, oMovimentoModel, sLoja, dData; 
		
		oMovimentoModel = oView.getModel("model");
		sLoja = oMovimentoModel.getProperty("/Loja");
		dData = oMovimentoModel.getProperty("/Data");
		
		if (sLoja && dData){
			oContext = oBinding.create({
				Data: dData.toISOString(),
				Loja: sLoja
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
	
	
	handleSearchLoja: function(oEvent){
    	var sId = oEvent.getSource().getId();
        var oView = this.getView();
        
        Lojas2HelpDialog.handleValueHelp( oView, sId);
    },
    
   
    handleSuggestLoja:  function(oEvent) {
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
