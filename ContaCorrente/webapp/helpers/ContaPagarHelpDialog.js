//@ts-nocheck
sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
],function (Filter, FilterOperator, Fragment) {
	"use strict";
	
	return {
		
		handleValueHelp: function(oView, sFornecedor) {
			
			return new Promise( resolve => {
				Fragment.load({ 
					id: oView.getId(),
					name: "ContaCorrente.helpers.ContaPagarHelpDialog",
					controller: this
				}).then( function(oDialog){
					oView.addDependent(oDialog);

					
					const oFilter = new Filter("Fornecedor", FilterOperator.EQ, sFornecedor);
					oDialog._oTable.getBinding("items").filter([oFilter], "Control");

					oDialog.attachConfirm( function(evt) {
						const oContext = evt.getParameter("selectedItem").getBindingContext();
						let aData = {};	
						if (oContext) {
							aData.sDuplicata = oContext.getProperty("Duplicata");
							aData.nValor = oContext.getProperty("ValorDuplicata");
						}

						evt.getSource().getBinding("items").filter([]);
						resolve(aData);
					});
					
					oDialog.attachCancel(function (evt){
						evt.getSource().getBinding("items").filter([]);
					});	

					
					oDialog.open();
					
				}.bind(this));
			})
			
			
		},
		
		_handleValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter("Duplicata", FilterOperator.StartsWith, sValue)
			
			var oFilters = new Filter({
				filters:[
					oFilter
				],
				and: false
			});
			
			evt.getSource().getBinding("items").filter(oFilters);
		}
	
	};
});