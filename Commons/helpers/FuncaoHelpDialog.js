sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
],function (Filter, FilterOperator) {
	"use strict";
	
	return {
		
		handleValueHelp: function(oView, oContext, sProperty) {
			this._oView = oView;
			this._oContext = oContext;
			this._sProperty = sProperty;
			
			var sFrag = "br.com.idxtec.commons.helpers.FuncaoHelpDialog"; 
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(sFrag,this);
				this._oView.addDependent(this._valueHelpDialog);
			}
							
			this._valueHelpDialog.open();
		},
		
		_handleValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var aFilters = [];
			var oFilter1 = new Filter( "Id", FilterOperator.Contains, sValue);
			aFilters.push(oFilter1);
			
			evt.getSource().getBinding("items").filter(aFilters);
		},
		
		
		_handleValueHelpClose : function (evt) {
			var oContext = evt.getParameter("selectedItem").getBindingContext();
			
			if (oContext) {
				this._oContext.setProperty(this._sProperty, oContext.getProperty("Id"));
			}

			evt.getSource().getBinding("items").filter([]);
			
			this._valueHelpDialog = undefined;
		}
	};
});