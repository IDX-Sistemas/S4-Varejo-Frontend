sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], 

function(BaseController, MessageBox, Filter, FilterOperator, JSONModel, MessageToast) {
  "use strict";

  return BaseController.extend("Parametros.controller.App", {

    onInit: function (){
    	var oView, oTable, nRow;
    	
    	oView = this.getView();
    	oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());
    	
    },
    
    
    filter: function (oEvent){
      var sQuery, oTable, oFilter, 
          aFilters = [];
      sQuery = oEvent.getParameter("query");
      
      oTable = this.byId("table");
      
      if (sQuery){
    	  oFilter = new sap.ui.model.Filter("Variavel", sap.ui.model.FilterOperator.Contains, sQuery);
          aFilters = [ oFilter ];
      }
      
      oTable.getBinding("rows").filter(aFilters, "Control");
    },
    
    
	onCreate : function () {
		var oTable = this.byId("table"),
			oBinding = oTable.getBinding("rows"),
			oContext = oBinding.create({}, false, /* bAtEnd */ false);
	},

	
	onResetChanges : function () {
		this.byId("table").getBinding("rows").resetChanges();
	},
	
	
	onSave : function () {
		var fnSuccess = function () {
			this._setBusy(false);
			MessageToast.show("Salvo !");
		}.bind(this);

		var fnError = function (oError) {
			this._setBusy(false);
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
				"Confirma exclusão ?",{
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
	}
	
	
  });

});
