//@ts-nocheck
sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "PedidoVenda/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, MessageBox, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("PedidoVenda.controller.App", {

        formatter: formatter,

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
            let oFilter = new sap.ui.model.Filter("Clientes/Nome", sap.ui.model.FilterOperator.Contains, sQuery);

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

        edit: function (oEvent) {
            let oTable = this.byId("table");
            var oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

            if (this._pedidoFaturado()) {
                return;
            }

            if (oContext) {
                let oRouter = this.getRouter();
                oRouter.navTo("Edit", {
                    "id": oContext.getProperty("RowId"),
                    "numero": oContext.getProperty("Numero"),
                    "loja": oContext.getProperty("Loja")
                });
            }

        },

        view: function (oEvent) {
            let oTable = this.byId("table");
            var oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

            if (oContext) {
                let oRouter = this.getRouter();
                oRouter.navTo("View", {
                    "id": oContext.getProperty("RowId"),
                    "numero": oContext.getProperty("Numero"),
                    "loja": oContext.getProperty("Loja")
                });
            }
        },


        ajustaVencimentos: function (sNumero, sLoja) {
            const oDialog = this._criarDialog();
            const oTable = this.byId("table");
            const oContext = oTable.getContextByIndex(oTable.getSelectedIndex());
            const oTableVenc = this.byId("tbVencimentos");

            if (this._pedidoFaturado()) {
                MessageBox.warning("Pedido ja faturado.");
                return;
            }

            if (this._vendaPrazo()) {

                if (oContext) {
                    const sNumero = oContext.getProperty("Numero");
                    const sLoja = oContext.getProperty("Loja");

                    oDialog.open();

                    oTableVenc.bindRows({
                        path: '/ContaReceberTemp',
                        sorter: new sap.ui.model.Sorter("NumeroDuplicata", false),
                        filters: [
                            new Filter("NumeroCI", FilterOperator.EQ, sNumero),
                            new Filter("Loja", FilterOperator.EQ, sLoja),
                            new Filter("FlagPgto", FilterOperator.NE, 1)
                        ]
                    });

                }

            }

        },


        confirmaVencimentos: async function () {
            const oDialog = this.byId("vencimentosDialog");
            const oModel = this.getModel();

            oModel.submitBatch("updGroup").then(function () {
                if (!oModel.hasPendingChanges()) {
                    MessageBox.success("Dados gravados.");
                    oDialog.close();
                }
            });

        },

        fechaVencimentos: function () {
            const oDialog = this.byId("vencimentosDialog");
            const oModel = this.getModel();

            if (oModel.hasPendingChanges()) {
                oModel.resetChanges();
            }

            oDialog.close();
        },


        /** @private  */
        _filtraVencimentos: function (sNumero, sLoja) {
            const oTableVencimentos = this.byId("tbVencimentos");

            const oFilterNumero = new Filter("NumeroCI", FilterOperator.EQ, sNumero);
            const oFilterLoja = new Filter("NumeroCI", FilterOperator.EQ, sLoja);
            const oFilterPago = new Filter("FlagPgtp", FilterOperator.NE, 1);

            let aFilters = [oFilterNumero, oFilterLoja, oFilterPago];

            return new Promise(resolve => {
                oTableVencimentos.getBinding("rows").filter(aFilters, "Control");
                resolve();
            });

        },

        faturarPedido: async function () {
            const oTable = this.byId("table");
            const oContext = oTable.getContextByIndex(oTable.getSelectedIndex());
            const oModel = this.getModel();

            if (this._pedidoFaturado()) {
                MessageBox.warning("Pedido ja faturado.");
                return;
            }

            if (oContext) {

                const sResult = await this._messageBoxYesNo("Faturar Pedido ?", "Faturar");
                if (sResult == MessageBox.Action.NO) {
                    return;
                }

                const sNumero = oContext.getProperty("Numero");
                const sLoja = oContext.getProperty("Loja");

                const oFunction = oModel.bindContext("/FaturaPedido(...)");
                oFunction.setParameter("Numero", sNumero);
                oFunction.setParameter("Loja", sLoja);

                try {
                    await oFunction.execute();
                    oModel.refresh();
                    MessageBox.success("Pedido faturado com sucesso.");
                } catch (oError) {
                    MessageBox.error(oError.message);
                }
            }
            else {
                MessageBox.warning("Selecione um item na tabela.");
            }

        },


        _pedidoFaturado: function () {
            const oTable = this.byId("table");
            const oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

            if (oContext) {
                const sStatus = oContext.getProperty("Faturado");
                return (sStatus === "S")
            }

            return false;
        },


        _vendaPrazo: function () {
            const oTable = this.byId("table");
            const oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

            if (oContext) {
                const sTipoVenda = oContext.getProperty("TipoVenda");
                return (sTipoVenda === "2" || sTipoVenda === "3" || sTipoVenda === "4");
            }

            return false;
        },


        /**@private */
        _messageBoxYesNo: function (sMessage, sTitle) {

            return new Promise(resolve => {
                MessageBox.show(sMessage, {
                    "icon": MessageBox.Icon.QUESTION,
                    "title": sTitle,
                    "actions": [MessageBox.Action.NO, MessageBox.Action.YES],
                    "onClose": function (sAction) {
                        resolve(sAction);
                    }
                }
                );
            });

        },


        imprimeCarne: async function () {
            const oTable = this.byId("table");
            const oContext = oTable.getContextByIndex(oTable.getSelectedIndex());
            const oModel = this.getModel();

            if ( !this._pedidoFaturado() ){
                MessageBox.warning("Pedido nao faturado.");
                return;
            }

            if (oContext) {
                const sTipoVenda = oContext.getProperty("TipoVenda");
                
                if (sTipoVenda == "2" || sTipoVenda == "3"){
                
                    const oFunction = oModel.bindContext("/GetDadosCarne(...)")
                    oFunction.setParameter("Numero", oContext.getProperty("Numero"));
                    oFunction.setParameter("Loja", oContext.getProperty("Loja"));

                    try {
                        await oFunction.execute();
                        const oCarne = oFunction.getBoundContext().getObject();
                        const sJSON = JSON.stringify(oCarne)

                        if (typeof cefCustomObject != "undefined") {
                            cefCustomObject.printCarne(sJSON);
                        }
                        else {
                            MessageBox.error("Disponivel apenas via IDX Smart Client");
                        }

                    } catch (oError) {
                        MessageBox.error(oError.message);
                    } 
                
                } else {
                    MessageBox.warning("Somente duplicata/carne");
                }
            }
            else {
                MessageBox.warning("Selecione um item na tabela.");
            }

        }

    });

});
