//@ts-nocheck
sap.ui.define([
    "br/com/idxtec/commons/BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, MessageBox, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("EntradaAntecipada.controller.App", {

        onInit: function () {
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        },

        refresh: function () {
            var oTable, oModel

            oTable = this.byId("table");
            oTable.clearSelection();

            oModel = this.getModel();
            oModel.refresh();
        },

        filter: function (oEvent) {
            let sQuery = oEvent.getParameter("query");
            let oFilter = new Filter("Descricao", FilterOperator.Contains, sQuery);

            let oTable = this.byId("table");

            let aFilters = [
                oFilter
            ];

            oTable.getBinding("rows").filter(aFilters, "Control");
        },

        add: function (oEvent) {
            let oRouter = this.getRouter();
            oRouter.navTo("Add");
        },

        delete: async function (oEvent) {
            const oTable = this.byId("table");
            const oView = this.getView();
            const oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

            if (oContext) {

                if (await this._messageBoxYesNo() == MessageBox.Action.YES) {

                    try {
                        oView.setBusy(true);
                        await oContext.delete("$auto");
                        oTable.clearSelection();
                    } catch (oError) {
                        MessageBox.error(oError.message);
                    } finally {
                        oView.setBusy(false);
                    }
                }

            } else {
                MessageBox.warning("Selecione um item na tabela.");
            }

        },

        _messageBoxYesNo: function () {
            return new Promise(resolve => {
                MessageBox.show(
                    "Excluir item selecionado ?", {
                        "icon": MessageBox.Icon.QUESTION,
                        "title": "Exclusão",
                        "actions": [MessageBox.Action.NO, MessageBox.Action.YES],
                        "onClose": function (oAction) {
                            resolve(oAction);
                        }
                    }
                );
            });
        },


        printEtq: async function () {
            const oTable = this.byId("table");
            const oContext = oTable.getContextByIndex(oTable.getSelectedIndex());
            const oModel = this.getModel();

            if (oContext) {

                const oFunction = oModel.bindContext("/GetProdutoPeloCodigo(...)");
                oFunction.setParameter("Codigo", oContext.getProperty("Produto"));

                try {

                    await oFunction.execute();
                    const oProduto = oFunction.getBoundContext().getObject();

                    const sCodigo = oProduto.Codigo;
                    const sDescricao1 = oProduto.DescricaoEtiqueta1;
                    const sDescricao2 = oProduto.DescricaoEtiqueta2;
                    const nPreco = oProduto.ValorVista;

                    if (typeof cefCustomObject != "undefined") {
                        cefCustomObject.printEtq(sCodigo, sDescricao1, sDescricao2, nPreco);
                    }
                    else {
                        MessageBox.error("Disponivel apenas via IDX Smart Client");
                    }

                } catch (oError) {

                    MessageBox.error(oError.message);

                }

            } else {

                MessageBox.warning("Selecione um item na tabela.");

            }

        },

    });

});
