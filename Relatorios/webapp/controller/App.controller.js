//@ts-nocheck
sap.ui.define([
    "br/com/idxtec/commons/BaseController",
    "sap/m/MessageBox",
    "../service/api",
    "sap/ui/core/Fragment",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "br/com/idxtec/commons/Validator",
    "sap/ui/model/json/JSONModel"
], function (BaseController, MessageBox, api, Fragment, HorizontalLayout, VerticalLayout, Validator, JSONModel) {
    "use strict";

    return BaseController.extend("Relatorios.controller.App", {

        onInit: function () {
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            let oViewModel = new JSONModel();
            this.getView().setModel(oViewModel, "view");
        },

        parametros: function () {
            const oTable = this.byId("table");
            const oSelectedItem = oTable.getSelectedItem();
            const oViewModel = this.getView().getModel("view");

            if (oSelectedItem) {

                Fragment.load({
                    id: this.getView().getId(),
                    name: "Relatorios.fragments.Parametros",
                    controller: this
                }).then((oDialog) => {
                    const oContext = oSelectedItem.getBindingContext();
                    let sCodigo = oContext.getProperty("Codigo");
                    let sNome = oContext.getProperty("Nome")

                    oViewModel.setProperty("/titulo", sNome);

                    this.getView().addDependent(oDialog);
                    this._montaInterface(sCodigo, oDialog)

                    oDialog.attachAfterClose(() => {
                        oDialog.destroy();
                    });

                    oDialog.open();
                });

            } else {
                MessageBox.warning("Selecione um item na tabela.");
            }

        },

        callReport: async function () {
            const oTable = this.byId("table");
            const oSelectedItem = oTable.getSelectedItem();

            if (oSelectedItem) {

                let oValidator = new Validator();

                if (!oValidator.validate(this.byId("parametros"))) {
                    return;
                }

                const oComponent = this.getOwnerComponent();
                const oContext = oSelectedItem.getBindingContext();
                let sId = oContext.getProperty("RowId");

                try {
                    let oDados = await api.buscaDadosRelatorio(sId, oComponent);
                    let sLink = oDados.Link;
                    let sFunction = oDados.Executar;

                    if (sFunction){
                        this._executaFuncao(sFunction);
                    } else {
                        sLink += this._montaParametros(sFunction);
                    }

                    window.open(sLink, "_blank", "width=800,height=600,top=0,left=0");
                } catch (oError) {
                    MessageBox.error(oError.message);
                }

            } else {
                MessageBox.warning("Selecione um item na tabela.");
            }

        },


        refresh: function () {
            var oTable, oModel

            oTable = this.byId("table");
            oTable.clearSelection();

            oModel = this.getModel();
            oModel.refresh();
        },


        filter: function (oEvent) {
            const sQuery = oEvent.getParameter("query");
            const oFilter = new sap.ui.model.Filter({
                path: "Nome",
                operator: sap.ui.model.FilterOperator.Contains,
                value1: sQuery,
                caseSensitive: false
            });

            const oTable = this.byId("table");
            const aFilters = [
                oFilter
            ];

            oTable.getBinding("items").filter(aFilters, "Control");
        },

        add: function () {
            const oRouter = this.getRouter();
            oRouter.navTo("Add");
        },

        edit: function () {
            const oRouter = this.getRouter();
            const oTable = this.byId("table");
            const oSelectedItem = oTable.getSelectedItem();

            if (oSelectedItem) {
                const oContext = oSelectedItem.getBindingContext();
                let sId = oContext.getProperty("RowId");

                oRouter.navTo("Edit", {
                    id: sId
                });
            } else {
                MessageBox.warning("Selecione um item na tabela.");
            }
        },

        delete: async function () {
            const oModel = this.getModel();
            const oTable = this.byId("table");
            const oSelectedItem = oTable.getSelectedItem();

            if (oSelectedItem) {

                const oContext = oSelectedItem.getBindingContext();

                try {

                    let sResposta = await this._messageBoxYesNo("Remover item selecionado ?");

                    if (sResposta == "YES") {
                        oContext
                            .delete(oContext.getModel().getGroupId())
                            .then(() => {
                                oTable.clearSelection();
                                MessageBox.success("Item removido.");
                                oModel.refresh();
                            });
                    }

                } catch (oError) {
                    MessageBox.error(oError.message);
                }

            } else {
                MessageBox.warning("Selecione um item na tabela.")
            }
        },

        _montaInterface: async function (sCodigo, oDialog) {

            try {

                let oPerguntas = await api.buscaDadosPerguntas(sCodigo, this.getOwnerComponent());

                let oHorizontalLayout = new HorizontalLayout();
                let oVerticalLayout1 = new VerticalLayout({ width: "180px" });
                let oVerticalLayout2 = new VerticalLayout();

                let countId = 1;
                let oCampos = {}

                oPerguntas.value.forEach(e => {

                    let sId = this.createId("param_" + countId.toString());
                    
                    let oLabel = new sap.m.Input("", {
                        value: e.Descricao,
                        editable: false
                    });

                    oVerticalLayout1.addContent(oLabel);

                    if (e.Tipo == "C" && !e.Lista && !e.ValueHelp) {

                        let oInput = new sap.m.Input(sId, {
                            width: "150px",
                            value: "{parametros>/" + e.Parametro + "}",
                            required: e.Obrigatorio == "S"
                        });

                        oCampos[e.Parametro] = e.Resposta;

                        oVerticalLayout2.addContent(oInput);

                    } else if (e.Tipo == "C" && !e.Lista && e.ValueHelp) {

                        let oInput = new sap.m.Input(sId, {
                            width: "150px",
                            value: "{parametros>/" + e.Parametro + "}",
                            required: e.Obrigatorio == "S",
                            valueHelpOnly: true,
                            showValueHelp: true
                        });

                        oCampos[e.Parametro] = e.Resposta;

                        oInput.attachValueHelpRequest({
                            name: e.ValueHelp,
                            controller: this
                        }, this._handleValueHelp);

                        oVerticalLayout2.addContent(oInput);

                    } else if (e.Tipo == "C" && e.Lista && !e.ValueHelp) {

                        let aLista = e.Lista.split(",");
                        let aOpcoes = [];

                        aLista.forEach(e => {
                            let item = e.split("=");
                            aOpcoes.push(
                                new sap.ui.core.ListItem({
                                    key: item[0],
                                    text: item[1]
                                })
                            )
                        });

                        let oSelect = new sap.m.Select(sId, {
                            forceSelection: e.Obrigatorio == "S",
                            width: "150px",
                            selectedKey: "{parametros>/" + e.Parametro + "}",
                            items: aOpcoes
                        });

                        oCampos[e.Parametro] = e.Resposta;

                        oVerticalLayout2.addContent(oSelect);

                    } else if (e.Tipo == "N") {

                        let oInput = new sap.m.Input(sId, {
                            width: "150px",
                            value: "{parametros>/" + e.Parametro + "}",
                            required: e.Obrigatorio == "S",
                            textAlign: "End",
                            type: "Number"
                        });

                        oCampos[e.Parametro] = parseFloat(e.Resposta);

                        oVerticalLayout2.addContent(oInput);

                    } else if (e.Tipo == "D") {

                        let oDatePicker = new sap.m.DatePicker(sId, {
                            displayFormat: "dd.MM.yyyy",
                            placeholder: "dd.mm.aaaa",
                            dateValue: "{parametros>/" + e.Parametro + "}",
                            required: e.Obrigatorio == "S",
                            width: "150px"
                        });

                        oCampos[e.Parametro] = eval(e.Resposta);

                        oVerticalLayout2.addContent(oDatePicker);

                    } else if (e.Tipo == "L") {

                        let oCheckBox = new sap.m.CheckBox(sId, {
                            selected: "{parametros>/" + e.Parametro + "}",
                            text: ""
                        });

                        oCampos[e.Parametro] = e.Resposta == "true";

                        oVerticalLayout2.addContent(oCheckBox);
                    }

                    countId++;

                });

                let oParametrosModel = new JSONModel();
                oParametrosModel.setData(oCampos);

                this.getView().setModel(oParametrosModel, "parametros");

                oHorizontalLayout.addContent(oVerticalLayout1);
                oHorizontalLayout.addContent(oVerticalLayout2);

                oDialog.addContent(oHorizontalLayout);

            } catch (oError) {
                MessageBox.error(oError.message);
            }
        },

        _executaFuncao: async function(sFunction){
            let oView = this.getView();
            let oParamModel = this.getView().getModel("parametros");
            let oModel = this.getModel();
            let aBindings = oParamModel.getBindings();
            
            if (sFunction){
                try {
                
                    var oFunction = oModel.bindContext(sFunction);
                    aBindings.forEach(e => {
                        var sParam = e.getPath().substr(1, e.getPath().length - 1);
                        var sValue = e.getValue() ? e.getValue() : "";
                        if (typeof (sValue) == "object") {  // data
                            sValue = sValue.toISOString().split("T")[0];
                        }
                        oFunction.setParameter(sParam, sValue);
                        debugger;
                    });
                    
                    debugger;
                    oView.setBusy(true);
                    await oFunction.execute();

                } catch (oError) {
                    
                } finally {
                    oView.setBusy(false);
                }
    
            }
            
        },


        _montaParametros: function () {
            let oModel = this.getView().getModel("parametros");
            let aBindings = oModel.getBindings();
            let sParametros = "";

            aBindings.forEach(e => {

                sParametros += "&" + e.getPath().substr(1, e.getPath().length - 1) + "="

                let value = e.getValue() ? e.getValue() : "";
                if (typeof (value) == "object") {  // data
                    value = value.toISOString().split("T")[0];
                }

                sParametros += value;
            });

            return sParametros;
        },

        closeDialog: function () {
            const oDialog = this.byId("parametros");
            if (oDialog) {
                oDialog.close();
            }
        },

        /**@private */
        _handleValueHelp: function (oEvent, oParameters) {
            const sValueHelp = oParameters.name;
            const oController = oParameters.controller;
            const oView = oController.getView();  // não remover
            const oInput = oEvent.getSource();

            sap.ui.require([sValueHelp], async function (s) {
                var sRetorno = await eval("s.handleValueHelp(oView)");
                oInput.setValue(sRetorno);
            });
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
                });
            }); 
        }
    });
});
