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
				name: "br.com.idxtec.commons.helpers.Lojas2HelpDialog",
				controller: this
			}).then( function(oDialog){
				that._oView.addDependent(oDialog);
				oDialog.open();
			});
			
		},
		
		_handleValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			
			var oFilter1 = new Filter("Codigo", FilterOperator.EQ, sValue)
			var oFilter2 = new Filter("Nome", FilterOperator.StartsWith, sValue)
			
			var oFilters = new Filter({
				filters:[
					oFilter1, 
					oFilter2
				],
				and: false
			});
			
			evt.getSource().getBinding("items").filter(oFilters);
		},
		
		
		_handleValueHelpClose : function (evt) {
			var oContext = evt.getParameter("selectedItem").getBindingContext();
			
			if (oContext) {
				var oInput = sap.ui.getCore().byId(this._sId);
				oInput.setSelectedKey( oContext.getProperty("Codigo") );
				oInput.fireSuggest({
    				suggestValue: oContext.getProperty("Codigo")
    			});
			}

			evt.getSource().getBinding("items").filter([]);
			
			this._valueHelpDialog = undefined;
		}
	};
});