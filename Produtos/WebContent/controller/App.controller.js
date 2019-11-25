sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox"
], function(BaseController, MessageBox) {
  "use strict";

  return BaseController.extend("Produtos.controller.App", {

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
      let oFilter = new sap.ui.model.Filter("Descricao", sap.ui.model.FilterOperator.Contains, sQuery);
      
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

    view: function(oEvent){
        let oTable = this.byId("table");
        var oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );

        if (oContext){
          let oRouter = this.getRouter();
          oRouter.navTo("Overview",{
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
    
    consultaEstoque: function(){
    	MessageBox.error("Funcao não implementada.");
    },


    printEtq: function(){
      const oTable = this.byId("table");
      const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );
      const oComponent = this.getOwnerComponent();

      if (oContext){

        const sId = oContext.getProperty("RowId");
        const sUrl = oComponent.getManifestEntry("sap.app").dataSources.default.uri;
        const sPath = sUrl + "Produtos(" + sId + ")";

        const oAction = new sap.ui.model.json.JSONModel();
        oAction.loadData(sPath,{}, false);
        
        const oProduto = oAction.getData();
        const sCodigo = oProduto.Codigo;
        const sDescricao1 = oProduto.DescricaoEtiqueta1;
        const sDescricao2 = oProduto.DescricaoEtiqueta2;
        const nPreco = oProduto.ValorVista;
        
        if (cefCustomObject){
          cefCustomObject.printEtq(sCodigo, sDescricao1, sDescricao2, nPreco);
        } 
        else{
          MessageBox.error("Disponivel apenas via IDX Smart Client");
        }
        
      }
      else{
        MessageBox.warning("Selecione um item na tabela.");
      }

      
    },

    relatorio: function() {
      window.open("/idx/report/ReportServer/Pages/ReportViewer.aspx?/Produtos&rs:Command=Render&","_blank","width=800,height=600,top=0,left=0");
    }

  });

});
