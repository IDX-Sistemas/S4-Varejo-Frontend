sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
],function (Filter, FilterOperator, Fragment) {
	"use strict";
	
	return {
		
		handleValueHelp: function(oView, sId) {
			var that = this;
			this._oView = oView;
			this._sId = sId;
			
			Fragment.load({
				id: oView.getId(),
				name: "br.com.idxtec.commons.helpers.Cliente2HelpDialog",
				controller: this
			}).then( function(oDialog){
				that._oView.addDependent(oDialog);
				oDialog.open();
			});
			
		},
		
		_handleValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			
			var oFilterCodigo = new Filter("Codigo", FilterOperator.EQ, sValue)
			var oFilterNome = new Filter("Nome", FilterOperator.StartsWith, sValue)
			
			var oFilters = new Filter({
				filters:[
					oFilterCodigo, 
					oFilterNome
				],
				and: false
			});
			
			evt.getSource().getBinding("items").filter(oFilters);
		},
		
		
		_handleValueHelpClose : function (evt) {
			var oContext = evt.getParameter("selectedItem").getBindingContext();
			
			if (oContext) {
				var oInput = sap.ui.getCore().byId(this._sId);
				oInput.setValue( oContext.getProperty("Codigo") );
				oInput.fireChange();
			}

			evt.getSource().getBinding("items").filter([]);
			
			this._valueHelpDialog = undefined;
		}
	};
});