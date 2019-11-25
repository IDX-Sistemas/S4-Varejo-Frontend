//@ts-nocheck
sap.ui.define([
    "br/com/idxtec/commons/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
],function (BaseController, Filter, FilterOperator, MessageBox) {
        "use strict";

        return BaseController.extend("Perguntas.controller.App", {

            onInit: function () {
                const oView = this.getView();
                oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());
            },

            search: function(oEvent) {
                const sQuery = oEvent.getParameters().query;
                const oTable = this.byId("table");

                let aFilters = [];

                if (sQuery) {
                    const oFilter = new Filter({
                        path: "Descricao", 
                        operator: FilterOperator.Contains, 
                        value1: sQuery,
                        caseSensitive: false
                    });

                    aFilters.push(oFilter);
                }
                
                oTable.getBinding("rows").filter(aFilters, "Control");
            },

            add: function() {
                const oRouter = this.getRouter();
                oRouter.navTo("Add");
            },

            edit: function() {
                const oModel = this.getModel();
                const oTable = this.byId("table");
                const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );

                if (oContext){
                    const oRouter = this.getRouter();
                    oRouter.navTo("Edit",{
                        id: oContext.getProperty("RowId")
                    });
                } else {
                    MessageBox.warning("Selecione um item na tabela.")
                }
                
            },

            delete: async function(){
                const oModel = this.getModel();
                const oTable = this.byId("table");
                const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );
                
                if (oContext) {
                    try {
                        
                        let sResposta = await this._messageBoxNoYes("Remover item selecionado ?");
                        
                        if (sResposta == "YES") {
                            oContext.delete(oContext.getModel().getGroupId())
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

            refresh: function(){
                const oModel = this.getModel();
                const oTable = this.byId("table");

                oModel.refresh();
                oTable.clearSelection();
            },

            _messageBoxNoYes: function(sMessagem) {
                return new Promise(resolve => {
                    MessageBox.confirm(sMessagem,{
                        actions: [MessageBox.Action.NO, MessageBox.Action.YES],
                        onClose: (sAction) => {
                            resolve(sAction);
                        }
                    });
                });
            }

        });

    });
