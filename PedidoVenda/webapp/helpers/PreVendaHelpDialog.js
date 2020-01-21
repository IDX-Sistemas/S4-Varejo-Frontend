//@ts-nocheck
sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
],function (Filter, FilterOperator, Fragment) {
	"use strict";
	
	return {
		
		handleValueHelp: function(oView) {
			
			return new Promise( resolve => {
				Fragment.load({ 
					id: oView.getId(),
					name: "PedidoVenda.helpers.PreVendaHelpDialog",
					controller: this
				}).then( function(oDialog){
					
					oDialog.attachConfirm( function(evt) {
						const oContext = evt.getParameter("selectedItem").getBindingContext();
						let sNumero = null;	
						if (oContext) {
							sNumero = oContext.getProperty("Numero");
						}

						evt.getSource().getBinding("items").filter([]);
						resolve(sNumero);
					});
					
					oDialog.attachCancel(function (evt){
						evt.getSource().getBinding("items").filter([]);
					});	

					oView.addDependent(oDialog);
					oDialog.open();
					
				}.bind(this));
			})
			
			
		},
		
		_handleValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter("Numero", FilterOperator.EQ, sValue)
			
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