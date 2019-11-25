//@ts-nocheck
sap.ui.define([
    "br/com/idxtec/commons/BaseController",
    "sap/m/MessageBox",
    "br/com/idxtec/commons/ErrorHandler",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "br/com/idxtec/commons/helpers/Lojas2HelpDialog",
    "br/com/idxtec/commons/helpers/Fornecedor2HelpDialog",
    "br/com/idxtec/commons/helpers/Secao2HelpDialog",
    "br/com/idxtec/commons/helpers/Produto2HelpDialog",
    "../libs/Moment"
], function (BaseController, MessageBox, ErrorHanlder, Filter, FilterOperator,
    Lojas2HelpDialog, Fornecedor2HelpDialog, Secao2HelpDialog, Produto2HelpDialog, Momentjs) {
    "use strict";

    return BaseController.extend("EntradaAntecipada.controller.FormAdd", {

        onInit: function () {
            var oView = this.getView();
            oView.setBusyIndicatorDelay(0);

            var oRouter = this.getRouter();
            oRouter.getRoute("Add").attachMatched(this._routerMatch, this);

            this._oErrorHandler = new ErrorHanlder(this);
        },


        onExit: function () {
            this._oErrorHandler.destroy();
        },


        _routerMatch: function (oEvent) {
            var oView = this.getView();
            var oModel = this.getModel();

            var oBinding = oModel.bindList("/EntradaAntecipada");
            var oContext = oBinding.create({
                DataEntrada: moment().format("YYYY-MM-DD"),
                PrecoCusto: 0.00,
                PrecoVista: 0.00,
                Quantidade: 0
            }, false, false);

            oView.setBindingContext(oContext);
        },

        numeroChange: function (oEvent) {
            var sCodigoNew = ("00000000" + oEvent.getParameter("value")).slice(-8);
            oEvent.getSource().setValue(sCodigoNew);
        },


        buscaProduto: async function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const oModel = this.getModel();

            let sCodigo = oEvent.getSource().getValue();

            /**
             * VALIDA FORMATO DO CODIGO DO PRODUTO XXX XXX XXXXXX
             * E FORMATA CASO NAO ESTEJA NO PADRAO
             */

            if (!sCodigo.match(/^[0-9][A-Z]{3} [0-9][A-Z]{3} [0-9][A-Z]{0,6}/i)) {
                sCodigo = sCodigo.replace(/(\d{3})(\d{3})(\d{6})/, "\$1 \$2 \$3");
                oContext.setProperty("Produto", sCodigo);
            }

            if (oContext.hasPendingChanges()) {

                const oFunction = oModel.bindContext("/GetProdutoPeloCodigo(...)");
                oFunction.setParameter("Codigo", sCodigo);

                try {

                    await oFunction.execute();
                    const oProduto = oFunction.getBoundContext().getObject();

                    if (typeof oProduto == "object") {

                        const { Descricao, DescricaoEtiqueta1, DescricaoEtiqueta2, Secao, ValorCusto, ValorVista } = oProduto

                        oContext.setProperty("DescricaoProduto", Descricao ? Descricao : null);
                        oContext.setProperty("Secao", Secao ? Secao : null);
                        oContext.setProperty("DescricaoEtiqueta1", DescricaoEtiqueta1 ? DescricaoEtiqueta1 : null);
                        oContext.setProperty("DescricaoEtiqueta2", DescricaoEtiqueta2 ? DescricaoEtiqueta2 : null);
                        oContext.setProperty("PrecoCusto", ValorCusto ? ValorCusto : 0);
                        oContext.setProperty("PrecoVista", ValorVista ? ValorVista : 0);

                    } 

                } catch (oError) {

                    MessageBox.error(oError.message);

                }

            }

        },


        cancel: function (oEvent) {
            if (this.getModel().hasPendingChanges()) {
                this.getModel().resetChanges();
            }

            this.onNavBack();
        },

        save: async function () {
            const oModel = this.getModel();
            const oView = this.getView();
            const oButtonSave = this.byId("btnSave");

            oView.setBusy(true);
            try {
                await oModel.submitBatch("updGroup");
                if (!oModel.hasPendingChanges()) {
                    oButtonSave.setEnabled(false);
                    MessageBox.success("Dados gravados.", {
                        onClose: function (oEvent) {
                            this.printEtq();
                        }.bind(this)
                    });
                }
            } catch (oError) {
                MessageBox.error(oError.message);
            } finally {
                oView.setBusy(false);
            }

        },

        printEtq: async function () {
            const oView = this.getView();
            const oContext = oView.getBindingContext();
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

                    if (typeof cefCustomObject !== "undefined") {
                        cefCustomObject.printEtq(sCodigo, sDescricao1, sDescricao2, nPreco);
                    }
                    else {
                        MessageBox.error("Disponivel apenas via IDX Smart Client");
                    }


                } catch (oError) {
                    MessageBox.error(oError.message);
                }
            }

        },




        handleSearchLoja: function (oEvent) {
            var sId = oEvent.getSource().getId();
            var oView = this.getView();

            Lojas2HelpDialog.handleValueHelp(oView, sId);
        },

        handleSearchFornecedor: function (oEvent) {
            var sId = oEvent.getSource().getId();
            var oView = this.getView();

            Fornecedor2HelpDialog.handleValueHelp(oView, sId);
        },

        handleSearchSecao: function (oEvent) {
            var sId = oEvent.getSource().getId();
            var oView = this.getView();

            Secao2HelpDialog.handleValueHelp(oView, sId);
        },

        handleSearchProduto: function (oEvent) {
            var sId = oEvent.getSource().getId();
            var oView = this.getView();

            Produto2HelpDialog.handleValueHelp(oView, sId);
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

        },


        handleSuggestFornecedor: function (oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");

            if (sTerm) {
                var oFilterCodigo = new Filter("Codigo", FilterOperator.EQ, sTerm)
                var oFilterNome = new Filter("RazaoSocial", FilterOperator.StartsWith, sTerm)

                var oFilters = new Filter({
                    filters: [
                        oFilterCodigo,
                        oFilterNome
                    ],
                    and: false
                });

                oEvent.getSource().getBinding("suggestionItems").filter(oFilters);
            }

        },

    });

});
