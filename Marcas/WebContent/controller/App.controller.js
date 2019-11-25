sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox"
], function(BaseController, MessageBox) {
  "use strict";

  return BaseController.extend("Marcas.controller.App", {

    onInit: function (){
      this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());  
    },

    refresh: function (){
      var oTable, oModel
      
      oTable = this.byId("table");
      oTable.clearSelection();
      
      oModel = this.getModel();
      oModel.refresh();
    },

    filter: function (oEvent){
      let sQuery = oEvent.getParameter("query");
      let oFilter = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, sQuery);
      
      let oTable = this.byId("table");

      let aFilters = [
        oFilter
      ];

      oTable.getBinding("rows").filter(aFilters, "Control");
    },

    add: function(oEvent){
      let oRouter = this.getRouter();
      oRouter.navTo("Add");
    },

    edit: function(oEvent){
      let oTable = this.byId("table");
      var oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );

      if (oContext){
        let oRouter = this.getRouter();
        oRouter.navTo("Edit",{
          "id": oContext.getProperty("RowId")
        });
      }

    },

    detele: function(oEvent){
      var that = this;
      var oTable = this.byId("table");
      var oView = this.getView();
      var oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

      function deleta(){
        oView.setBusy(true)
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

      if (oContext){
        MessageBox.show(
          "Excluir item selecionado ?",{
            "icon": MessageBox.Icon.QUESTION,
            "title": "Exclusão",
            "actions": [MessageBox.Action.NO, MessageBox.Action.YES],
            "onClose": function(oAction){
              if (oAction == MessageBox.Action.YES){
                deleta();
              }
            }
          }
        );
      }
    }

  });

});
