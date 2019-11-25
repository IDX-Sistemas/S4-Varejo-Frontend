sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
],function (Filter, FilterOperator, Fragment) {
	"use strict";
	
	return {
		
		handleValueHelp: function(oView, oContext, sProperty) {
			var that = this;
			this._oView = oView;
			this._oContext = oContext;
			this._sProperty = sProperty;
			
			
			
			Fragment.load({
				id: oView.getId(),
				name: "br.com.idxtec.commons.helpers.FornecedorHelpDialog",
				controller: this
			}).then( function(oDialog){
				that._oView.addDependent(oDialog);
				oDialog.open();
			});
			
		},
		
		_handleValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var aFilters = [];
			var oFilter1 = new Filter( "RazaoSocial", FilterOperator.Contains, sValue);
			aFilters.push(oFilter1);
			
			evt.getSource().getBinding("items").filter(aFilters);
		},
		
		
		_handleValueHelpClose : function (evt) {
			var oContext = evt.getParameter("selectedItem").getBindingContext();
			
			if (oContext) {
				this._oContext.setProperty(this._sProperty, oContext.getProperty("Codigo"));
				
				var oInput = this._oView.byId(this._sProperty);
				oInput.fireSuggest({
    				suggestValue: oContext.getProperty("Codigo")
    			});
			}

			evt.getSource().getBinding("items").filter([]);
			
			this._valueHelpDialog = undefined;
		}
	};
});