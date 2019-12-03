//@ts-nocheck
sap.ui.define([
    "br/com/idxtec/commons/BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "br/com/idxtec/commons/helpers/Lojas4HelpDialog",
    "../libs/Moment"
],

    function (BaseController, MessageBox, JSONModel,
        Lojas4HelpDialog, Momentjs) {
        "use strict";

        return BaseController.extend("FechamentoCaixa.controller.App", {

            onInit: function () {
                let oView, oViewModel, oTableModel;

                oView = this.getView();
                oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());

                oViewModel = new JSONModel();
                oViewModel.setData({ Loja: "", Data: new Date() });

                oTableModel = new JSONModel();
                
                oView.setModel(oViewModel, "viewModel");
                oView.setModel(oTableModel, "model");
            },

            bindRows: async function () {
                const oModel = this.getModel();
                const oView = this.getView();
                
                const oViewModel = oView.getModel("viewModel");
                const oTableModel= oView.getModel("model");

                let dData = oViewModel.getProperty("/Data");
                let sLoja = oViewModel.getProperty("/Loja");

                if (sLoja && dData) {
                    let sData = dData.toISOString();
                    let oAction = oModel.bindContext("/GeraFechamentoCaixa(...)");
                    oAction.setParameter("Loja", sLoja);
                    oAction.setParameter("Data", sData);

                    try {
                        await oAction.execute();
                        let oDados = oAction.getBoundContext().getObject();
                        let aLinhas = [
                            {Texto: "1) VENDA A VISTA                              ", Valor: oDados.VendaVista},
                            {Texto: "2) ENTRADAS (VENDA A PRAZO)                   ", Valor: oDados.EntradaVendaPrazo},
                            {Texto: "3) RECEBIMENTO CREDIARIO                      ", Valor: oDados.RecebimentoCrediario},
                            {Texto: ".......................A) TOTAL DO DIA (1+2+3)", Valor: oDados.TotalDia},
                            {Texto: "5) VENDA A PRAZO (CHEQUE)                     ", Valor: oDados.Cheque},
                            {Texto: "D) TOTAL DESPESAS                             ", Valor: oDados.Despesas},
                            {Texto: "                                              ", Valor: null},
                            {Texto: ".......................E) CAIXA = (A - D)     ", Valor: oDados.TotalCaixa},
                            {Texto: "                                              ", Valor: null},
                            {Texto: "7) RELACAO DE DEPOSITOS                       ", Valor: null}
                        ];   
                            
                        oDados.Depositos.forEach(e => {
                            aLinhas.push({Texto: "....." + e.Historico, Valor: e.Valor});
                        });    
                        
                        aLinhas.push({Texto: "                               ", Valor: null});
                        aLinhas.push({Texto: "F) TOTAL DEPOSITOS             ", Valor: oDados.TotalDepositos});
                        aLinhas.push({Texto: "G) TOTAL DE REMESSA DE CHEQUES ", Valor: oDados.TotalRemessaCheques} );
                        aLinhas.push({Texto: "H) TOTAL (F+G)                 ", Valor: oDados.Total});
                        aLinhas.push({Texto: "I) DIFERENCA DE CAIXA          ", Valor: oDados.DiferencaCaixa});
                        
                        oTableModel.setData(aLinhas);

                    } catch (oError) {
                        MessageBox.error(oError.message);
                    }

                }

            },


            filter: function () {
                var oView, oMovimentoModel, oTable, oFilter1, aFilters, oFilter2, dData, sConta;

                oView = this.getView();
                oTable = this.byId("table");

                oMovimentoModel = oView.getModel("model");

                dData = oMovimentoModel.getProperty("/Data");
                sConta = oMovimentoModel.getProperty("/Conta");

                aFilters = [];

                if (sConta && dData) {
                    dData = dData.toISOString();

                    oFilter1 = new sap.ui.model.Filter("CodigoConta", sap.ui.model.FilterOperator.EQ, sConta);
                    oFilter2 = new sap.ui.model.Filter("Data", sap.ui.model.FilterOperator.BT, dData, dData);

                    aFilters = [
                        oFilter1, oFilter2
                    ];
                }

                oTable.getBinding("rows").filter(aFilters, "Control");
            },


            _setBusy: function (bIsBusy) {
                this.getView().setBusy(bIsBusy);
            },

            handleSearchLoja: async function(){
                const oViewModel = this.getView().getModel("viewModel");
                try {
                    let sCodigo = await Lojas4HelpDialog.handleValueHelp(this.getView());  
                    oViewModel.setProperty("/Loja", sCodigo)  ;
                } catch (oError) {
                    MessageBox.error(oError.message);
                } 
            }

        });

    });
