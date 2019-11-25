//@ts-nocheck
sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], 

function(BaseController, MessageBox, Filter, FilterOperator) {
  "use strict";

  return BaseController.extend("Usuarios.controller.App", {

    onInit: function (){
      const oView = this.getView();
      oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());
    },
    

    filter: function(oEvent){
      const oTable = this.byId("table");

      let sQuery, aFilters;

      sQuery = oEvent.getParameter("query");
      aFilters = [];

      if (sQuery){
        const oFilter = new Filter("Nome", FilterOperator.Contains, sQuery);
        aFilters.push(oFilter);
      }

      oTable.getBinding("rows").filter(aFilters, "Control");
    },
  
    refresh: function (){
      const oTable = this.byId("table");
      const oModel = this.getModel();
      
      oTable.clearSelection();
      oModel.refresh();
    },


    add: function(oEvent){
      const oRouter = this.getRouter();
      oRouter.navTo("Add");
    },

    edit: function(oEvent){
      const oTable = this.byId("table");
      const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );

      if (oContext){
        const oRouter = this.getRouter();
        oRouter.navTo("Edit",{
          "id": oContext.getProperty("RowId")
        });
      }

    },

    detele: async function(oEvent){
      const oTable = this.byId("table");
      const oView = this.getView();
      const oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

      if (oContext){
        if (await this._messageBoxExcluir() === MessageBox.Action.YES){
          oView.setBusy(true);
          oContext.delete("$auto").then(
            function(){
              oTable.clearSelection();
            }
          ).finally(
            function(){
              oView.setBusy(false);
            }
          );
        }
      }
      else{
        MessageBox.warning("Selecione um item na tabela.");
      }
      
    },

    _messageBoxExcluir: function(){
      return new Promise(function(resolve){
        MessageBox.show(
          "Excluir item selecionado ?",{
            "icon": MessageBox.Icon.QUESTION,
            "title": "Exclusão",
            "actions": [MessageBox.Action.NO, MessageBox.Action.YES],
            "onClose": function(oAction){
              resolve(oAction);
            }
          }
        );
      });
    }

  });

});
