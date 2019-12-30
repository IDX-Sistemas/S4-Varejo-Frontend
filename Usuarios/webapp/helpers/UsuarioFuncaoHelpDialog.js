//@ts-nocheck
sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], function (Filter, FilterOperator, Fragment) {
    "use strict";

    return {

        handleValueHelp: function (oView) {

            return new Promise(resolve => {
                Fragment.load({
                    id: oView.getId(),
                    name: "Usuarios.helpers.UsuarioFuncaoHelpDialog",
                    controller: this
                }).then((oDialog) => {

                    oDialog.attachConfirm((oEvent) => {
                        let sFuncaoId = this._confirm(oEvent);
                        resolve(sFuncaoId);
                    });

                    oDialog.attachCancel((oEvent) => oEvent.getSource().getBinding("items").filter([]));

                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            });

        },

        _confirm: function (oEvent) {
            const oContext = oEvent.getParameter("selectedItem").getBindingContext();
            let sFuncaoId = oContext.getProperty("FuncaoId");

            oEvent.getSource().getBinding("items").filter([]);

            return sFuncaoId;
        },

        _handleValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");

            var oFilterFuncaoId = new Filter("FuncaoId", FilterOperator.EQ, sValue)
            var oFilterDescricao = new Filter("Descricao", FilterOperator.StartsWith, sValue)

            var oFilters = new Filter({
                filters: [
                    oFilterFuncaoId,
                    oFilterDescricao
                ],
                and: false
            });

            oEvent.getSource().getBinding("items").filter(oFilters);
        }
    };
});
