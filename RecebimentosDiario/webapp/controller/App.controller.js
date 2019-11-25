//@ts-nocheck
sap.ui.define([
    "br/com/idxtec/commons/BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "br/com/idxtec/commons/helpers/Lojas2HelpDialog"
], function (BaseController, MessageBox, Filter, FilterOperator, JSONModel,
    Lojas2HelpDialog) {
    "use strict";

    return BaseController.extend("RecebimentosDiario.controller.App", {

        onInit: function () {
            var oView, oMovimentoModel;

            oView = this.getView();
            oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());

            oMovimentoModel = new JSONModel();
            oMovimentoModel.setData({ Loja: "", Data: null });

            oView.setModel(oMovimentoModel, "model");
        },

        bindRows: function () {
            var oView = this.getView();
            var oTable = oView.byId("table");
            var oMovimentoModel = oView.getModel("model");

            oTable.unbindRows();

            var dData = oMovimentoModel.getProperty("/Data");
            var sLoja = oMovimentoModel.getProperty("/Loja");

            if (sLoja && dData) {

                dData = dData.toISOString();

                oTable.bindRows({
                    path: '/RecebimentoConta',
                    parameters: {
                        $count: true
                    },
                    filters: [
                        new Filter("Loja", FilterOperator.EQ, sLoja),
                        new Filter("DataPagamento", FilterOperator.BT, dData, dData)
                    ]
                });
            }

        },


        estornoRecebimento: async function () {
            const oModel = this.getModel();
            const oTable = this.byId("table");
            const oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

            if (oContext) {
                if (await this._messageBoxNoYes() == MessageBox.Action.YES) {

                    this._setBusy(true);

                    const sData = oContext.getProperty("DataPagamento");
                    const sLoja = oContext.getProperty("Loja");
                    const sNumeroDuplicata = oContext.getProperty("NumeroDuplicata");
                    const sNumeroDocumento = oContext.getProperty("NumeroDocumento");

                    const oFunction = oModel.bindContext("/EstornoRecebimento(...)");
                    oFunction.setParameter("NumeroDuplicata", sNumeroDuplicata);
                    oFunction.setParameter("Loja", sLoja);
                    oFunction.setParameter("NumeroDocumento", sNumeroDocumento);
                    oFunction.setParameter("DataPagamento", sData);
                    try {
                        await oFunction.execute();
                        oTable.clearSelection();
                        oModel.refresh();
                    }
                    catch (oError) {
                        MessageBox.error(oError.message);
                    }

                    this._setBusy(false);
                }
            }
            else {
                MessageBox.warning("Selecione um item na tabela.");
            }
        },


        imprimeRecibo: async function () {
            const oModel = this.getModel();
            const oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

            if (oContext){
                let sNumero = oContext.getProperty("NumeroDocumento");

                if (sNumero) {
                    let sData = oContext.getProperty("DataPagamento");
                    let sLoja = oContext.getProperty("Loja");

                    const oFunction = oModel.bindContext("/GetComprovanteRecebimento(...)");
                    oFunction.setParameter("NumeroDocumento", sNumero);
                    oFunction.setParameter("DataPagamento", sData);
                    oFunction.setParameter("Loja", sLoja);

                    try {
                        await oFunction.execute();
                        const oRecebimento = oFunction.getBoundContext().getObject();

                        var sJSON = JSON.stringify([oRecebimento]);

                        if (typeof cefCustomObject != "undefined") {
                            cefCustomObject.printComprovanteReceb(sJSON);
                        }
                        else {
                            MessageBox.error("Disponivel apenas via IDX Smart Client");
                        }

                    } catch (oError) {
                        MessageBox.error(oError);
                    }
                }
    
            } else {
                MessageBox.warning("Selecione um item na tabela.")
            }

        },

        _messageBoxNoYes: function () {
            return new Promise(resolve => {
                MessageBox.show(
                    "Estornar recebimento ?", {
                    icon: MessageBox.Icon.QUESTION,
                    title: "Confirmacao",
                    actions: [MessageBox.Action.NO, MessageBox.Action.YES],
                    onClose: sAction => {
                        resolve(sAction);
                    }
                }
                );
            });
        },

        _setBusy: function (bIsBusy) {
            this.getView().setBusy(bIsBusy);
        },


        handleSearchLoja: function (oEvent) {
            var sId = oEvent.getSource().getId();
            var oView = this.getView();

            Lojas2HelpDialog.handleValueHelp(oView, sId);
        },


        handleSuggestLoja: function (oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");

            if (sTerm) {
                var oFilterCodigo = new Filter("Codigo", FilterOperator.EQ, sTerm)
                var oFilterNome = new Filter("Nome", FilterOperator.StartsWith, sTerm)

                var oFilters = new Filter({
                    filters: [
                        oFilterCodigo,
                        oFilterNome
                    ],
                    and: false
                });

                oEvent.getSource().getBinding("suggestionItems").filter(oFilters);
            }

        }

    });

});
