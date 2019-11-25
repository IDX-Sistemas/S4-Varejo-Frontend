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
                    name: "br.com.idxtec.commons.helpers.Lojas4HelpDialog",
                    controller: this
                }).then( (oDialog) => {
                    
                    oDialog.attachConfirm( (oEvent) => {
                        let sCodigo = this._confirm(oEvent);
						resolve(sCodigo);
                    });
                    
                    oDialog.attachCancel( (oEvent) => oEvent.getSource().getBinding("items").filter([]) );

                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            });
			
			
		},
        
        _confirm: function (oEvent){
            const oContext = oEvent.getParameter("selectedItem").getBindingContext();
            let sCodigo = oContext.getProperty("Codigo");
            
            oEvent.getSource().getBinding("items").filter([]);

            return sCodigo;
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
		}
	};
});
