//@ts-nocheck
sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "ContaReceber/model/formatter",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], 

function(BaseController, MessageBox, formatter, Filter, FilterOperator) {
  "use strict";

  return BaseController.extend("ContaReceber.controller.App", {

    formatter: formatter,
    
    onInit: function (){
      var oView = this.getView();
      oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());
    },
    
    filtraTitulos: function(oEvent){
      const oTable = this.byId("table");
      const oSelect = this.byId("exibeTitulo");
      const sNome = this.byId("filtraNome").getValue();
      const sCodigo = oSelect.getSelectedKey();
      
      let oFilter, aFilters = [];

      if (sCodigo === "1"){
        oFilter = new Filter("FlagPgto", FilterOperator.EQ, "1");
        aFilters.push(oFilter);
      }
      if(sCodigo === "0"){
        oFilter = new Filter("FlagPgto", FilterOperator.NE, "1");
        aFilters.push(oFilter);
      }

      if (sNome){
        oFilter = new Filter("Clientes/Nome", FilterOperator.StartsWith, sNome);
        aFilters.push(oFilter);
      }

      oTable.getBinding("rows").filter(aFilters, "Control");
    },
  
    refresh: function (){
      let oTable, oModel
      
      oTable = this.byId("table");
      oTable.clearSelection();
      
      oModel = this.getModel();
      oModel.refresh();
    },

    filter: function (oEvent){
      const sQuery = oEvent.getParameter("query");
      const oTable = this.byId("table");
      
      if (sQuery){
        let oFilter = new Filter("Clientes/Nome", FilterOperator.StartsWith, sQuery);
        this._aFilters.push(oFilter);  
      }
      
      oTable.getBinding("rows").filter(this._aFilters, "Control");
      
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
    },
    
    pagamento: function(){
    	MessageBox.error("Funcao não implementada.");
    }

  });

});
