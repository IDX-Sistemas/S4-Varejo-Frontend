// @ts-nocheck
sap.ui.define([
    "br/com/idxtec/commons/BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "br/com/idxtec/commons/helpers/Cliente3HelpDialog",
    "RecebimentoTitulos/model/formatter",
    "br/com/idxtec/commons/ErrorHandler",
    "RecebimentoTitulos/service/services"
], function (BaseController, MessageBox, JSONModel, Cliente3HelpDialog, formatter, ErrorHandler, services) {
    "use strict";

    return BaseController.extend("RecebimentoTitulos.controller.App", {

        formatter: formatter,

        onInit: function () {
            var oView = this.getView();
            var oTable = this.byId("table");

            oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());

            var oDataModel = new JSONModel();

            oDataModel.setData({
                Cliente: "",
                Total: 0.00,
                Data: new Date()
            });

            oView.setModel(oDataModel, "model");

            var oTableModel = new JSONModel();
            oTable.setModel(oTableModel, "titulos");

            oTable.attachRowSelectionChange(function (oEvent) {
                this.calculaTotal(oEvent);
            }.bind(this));

            this._oErrorHandler = new ErrorHandler(this);
        },

        onExit: function () {
            this._oErrorHandler.destroy();
        },


        handleSearchCliente: function (oEvent) {
            var sId = oEvent.getSource().getId();
            var oView = this.getView();

            Cliente3HelpDialog.handleValueHelp(oView, sId);
        },

        buscaDadosCliente: function (oEvent) {
            var sCodigo = oEvent.getSource().getValue();
            if (!sCodigo) {
                return;
            }

            var oView = this.getView();

            oView.setBusy(true);
            oView.bindElement({
                path: "/GetClientePeloCodigo(Codigo='" + sCodigo + "')",
                events: {
                    dataReceived: function () {
                        oView.setBusy(false);
                    }
                }
            });

            this.exibeTitulos();
        },

        exibeTitulos: async function () {
            const oView = this.getView();
            const sCodigo = oView.getModel("model").getProperty("/Cliente");
            const dData = oView.getModel("model").getProperty("/Data");
            const oModel = this.getModel();

            if (!sCodigo) {
                return;
            }

            const oTable = this.byId("table");
            oTable.clearSelection();

            const oFunction = oModel.bindContext("/GetContasReceberPorCliente(...)");
            oFunction.setParameter("Codigo", sCodigo);
            oFunction.setParameter("Database", dData.toISOString());

            try {
                await oFunction.execute();
                const { value } = oFunction.getBoundContext().getObject();

                const oTableModel = oTable.getModel("titulos");
                oTableModel.setData(value);
                oTable.setModel(oTableModel, "titulos");
            } catch (oError) {
                MessageBox.error(oError.message);
            }
        },

        calculaTotal: function () {
            var oView = this.getView();
            var oTable = this.byId("table");

            /**
             * LIMPA FLAG DE PAGAMENTO
             */
            var len = oTable.getBinding("rows").getLength();

            for (var i = 0; i < len; i++) {
                var oCtx = oTable.getContextByIndex(i)
                oCtx.getModel().setProperty(oCtx.getPath() + "/FlagPgto", null);
            }

            /**
             * TOTALIZA TITULOS SELECIONADOS
             */
            var aIndices = oTable.getSelectedIndices();
            var soma = 0;

            for (var n = 0; n < aIndices.length; n++) {
                var i = aIndices[n];
                var oContext = oTable.getContextByIndex(i);
                var nRecebido = oContext.getProperty("ValorReceber");
                var nSaldo = oContext.getProperty("Saldo");
                var sPath = oContext.getPath();

                if (nRecebido >= nSaldo) {
                    oContext.getModel().setProperty(sPath + "/FlagPgto", 1);
                }
                else {
                    oContext.getModel().setProperty(sPath + "/FlagPgto", 0);
                }

                soma += oContext.getProperty("ValorReceber");
            }

            var oDataModel = oView.getModel("model");
            oDataModel.setProperty("/Total", soma);
        },


        confirmaRecebimento: function () {
            const oTable = this.byId("table");
            const aSelected = oTable.getSelectedIndices();

            if (aSelected.length === 0) {
                MessageBox.warning("Não há titulos selecionados.");
                return;
            }

            MessageBox.show(
                "Confirma recebimento do(s) titulo(s) selecionado(s) ?", {
                "icon": MessageBox.Icon.QUESTION,
                "title": "Recebimento",
                "actions": [MessageBox.Action.YES, MessageBox.Action.NO],
                "onClose": function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        this._gravaRecebimento(aSelected);
                    }
                }.bind(this)
            });
        },


        _gravaRecebimento: async function (aSelect) {
            const oView = this.getView();
            const oTable = this.byId("table");

            let bBaixaOk, dData, sData, sLoja, sNumero, bReimprimir, sMensagem, sAction;

            bBaixaOk = false;
            dData = oView.getModel("model").getProperty("/Data");

            oView.setBusyIndicatorDelay(0);
            oView.setBusy(true);

            try {
                sData = dData.toISOString();
                sLoja = "03";
                sNumero = await services.getNumeroDocumento(sData, sLoja, this);
            }
            catch (oError) {
                MessageBox.error(oError.message);
                return;
            }

            for (let i = 0; i < aSelect.length; i++) {

                let oCtx = oTable.getContextByIndex(aSelect[i]);
                bBaixaOk = false;

                let oRecebimento = {};
                oRecebimento.NumeroDuplicata = oCtx.getProperty("NumeroDuplicata");
                oRecebimento.DataPagamento = sData;
                oRecebimento.ValorPago = oCtx.getProperty("ValorReceber");
                oRecebimento.NumeroDocumento = sNumero;
                oRecebimento.Loja = oCtx.getProperty("Loja");
                oRecebimento.ValorJuros = oCtx.getProperty("Juros");
                oRecebimento.ValorDesconto = 0;
                oRecebimento.Quitar = oCtx.getProperty("FlagPgto");

                try {
                    await services.recebimentoTitulo(oRecebimento, this);
                    bBaixaOk = true;
                }
                catch (oError) {
                    bBaixaOk = false;
                    MessageBox.error(oError.message);
                }

            }

            oView.setBusy(false);

            if (bBaixaOk) {

                bReimprimir = true;
                sMensagem = "Recebimento " + sNumero + " realizado com sucesso.\n Imprimir Recibo ?";

                while (bReimprimir) {
                    try {
                        sAction = await this._messageBoxImprimeRecibo(sMensagem, sNumero);
                        if (sAction === MessageBox.Action.YES) {
                            this.imprimeRecibo(sNumero, sData, sLoja);
                        }
                        else {
                            bReimprimir = false;
                            this._limpaTela();
                        }

                        sMensagem = "Reimprimir Recibo " + sNumero + " ? ";
                    }
                    catch (oError) {
                        bReimprimir = false;
                    }
                }

            }

        },

        _messageBoxImprimeRecibo: function (sMensagem) {
            return new Promise(function (resolve) {
                MessageBox.success(
                    sMensagem, {
                    "icon": MessageBox.Icon.QUESTION,
                    "title": "Recibo",
                    "actions": [MessageBox.Action.YES, MessageBox.Action.NO],
                    "onClose": function (sAction) {
                        resolve(sAction)
                    }
                }
                );
            });
        },


        _limpaTela: function () {
            const oView = this.getView();
            const oTable = oView.byId("table");

            const oDataModel = oView.getModel("model");
            const oTableModel = oTable.getModel("titulos");


            oView.unbindElement();

            oDataModel.setData({
                Cliente: "",
                Total: 0.00,
                Data: new Date()
            });

            oTableModel.setData([]);
            oTable.setModel(oTableModel, "titulos");

            oView.byId("cliente").focus({});
        },


        imprimeRecibo: async function (sNumero, sData, sLoja) {
            const oModel = this.getModel();

            const oFunction = oModel.bindContext("/GetComprovanteRecebimento(...)");
            oFunction.setParameter("NumeroDocumento", sNumero);
            oFunction.setParameter("DataPagamento", sData);
            oFunction.setParameter("Loja", sLoja);

            try {
                await oFunction.execute();
                const oRecebimento = oFunction.getBoundContext().getObject();

                var sJSON = JSON.stringify([oRecebimento]);

                debugger;

                if (typeof cefCustomObject != "undefined") {
                    cefCustomObject.printComprovanteReceb(sJSON);
                }
                else {
                    MessageBox.error("Disponivel apenas via IDX Smart Client");
                }

            } catch (oError) {
                MessageBox.error(oError);
            }

        },

        imprimeExtrato: async function () {
            const oModel = this.getModel();
            const oModelTitulos = this.byId("table").getModel("titulos");
            const oContext = this.getView().getBindingContext();
            const sCodigo = oContext.getProperty("Codigo");

            if (!sCodigo) {
                MessageBox.warning("Informe o cliente.")
                return;
            }

            const oFunction = oModel.bindContext("/GetClientePeloCodigo(...)");
            oFunction.setParameter("Codigo", sCodigo);

            try {
                await oFunction.execute();
                const oCliente = oFunction.getBoundContext().getObject();

                if (typeof oCliente == "object") {

                    let aVencimentos = [];
                    let aTitulos = oModelTitulos.getData();
                    aTitulos.forEach(titulo => {
                        let oVencimento = {
                            Duplicata: titulo.NumeroDuplicata,
                            Vencimento: titulo.DataVencimento,
                            Valor: titulo.ValorReceber
                        };

                        aVencimentos.push(oVencimento);
                    });

                    let oExtrato = {
                        CodigoCliente: oCliente.Codigo,
                        NomeCliente: oCliente.Nome,
                        CpfCliente: oCliente.Cpf,
                        Endereco: oCliente.Endereco,
                        Bairro: oCliente.Bairro,
                        Cidade: oCliente.Cidade,
                        Estado: oCliente.Estado,
                        Vencimentos: aVencimentos
                    }

                    const sJSON = JSON.stringify(oExtrato)

                    if (typeof cefCustomObject != "undefined") {
                        cefCustomObject.printExtratoCarne(sJSON);
                    }
                    else {
                        MessageBox.error("Disponivel apenas via IDX Smart Client");
                    }

                }

            } catch (oError) {
                MessageBox.error(oError.message);
            }

        }

    });

});
