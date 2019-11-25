//@ts-nocheck
sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "DocumentoEntrada/model/formatter",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "../services/api"
], 

function(BaseController, MessageBox, formatter, Filter, FilterOperator, api) {
  "use strict";

  return BaseController.extend("DocumentoEntrada.controller.App", {

      formatter: formatter,

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
        let oFilter = new sap.ui.model.Filter("Fornecedores/RazaoSocial", sap.ui.model.FilterOperator.Contains, sQuery);
        
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
          
          const sClassificado = oContext.getProperty("Classificacao");
          if (sClassificado == "S"){
            MessageBox.error("Documento já classificado.")
            return;
          }
          
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
          oRouter.navTo("View",{
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
          const sClassificado = oContext.getProperty("Classificacao");
          if (sClassificado == "S"){
            MessageBox.error("Documento já classificado.")
            return;
          }
          
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


      ajustaVencimentos: function(sNumero, sLoja){
        const oDialog = this._criarDialog();
        const oTable = this.byId("table");
        const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );
        const oTableVenc = this.byId("tbVencimentos");
  
        if (oContext){
          
          const sClassificado = oContext.getProperty("Classificacao");
          if (sClassificado == "S"){
            MessageBox.error("Documento já classificado.")
            return;
          }

          const sNumero = oContext.getProperty("Numero");
          const sFornecedor = oContext.getProperty("Fornecedor");
          
          oDialog.open();
  
          oTableVenc.bindRows({
            path: '/ContaPagarTemp',
            sorter: new sap.ui.model.Sorter("NotaFiscal", false),
            filters:[
              new Filter("NotaFiscal", FilterOperator.EQ, sNumero),
              new Filter("Fornecedor", FilterOperator.EQ, sFornecedor)
            ]
          });
  
        }
  
      },
    
    
      confirmaVencimentos: async function(){
        const oDialog = this.byId("vencimentosDialog");
        const oModel = this.getModel();
    
        oModel.submitBatch("updGroup").then( function() {
           if ( !oModel.hasPendingChanges() ){
            MessageBox.success("Dados gravados.");
              oDialog.close();
            }
        });
    
      },
    
      fechaVencimentos: function(){
        const oDialog = this.byId("vencimentosDialog");
        const oModel = this.getModel();
        
        if (oModel.hasPendingChanges()){
          oModel.resetChanges();
        }
  
        oDialog.close();
      },
  
  
      /**
       * 
       * @private
       */
      _criarDialog: function(){
        const oView = this.getView();
        let oDialog = this.byId("vencimentosDialog");
        
        if(!oDialog){
          oDialog = sap.ui.xmlfragment(oView.getId(), "DocumentoEntrada.fragments.ContaPagar", this);
          oView.addDependent(oDialog); 
        }
            
        return oDialog;
      },
      
      classificaDocumento: async function(){
        const oModel = this.getModel();
        const oTable = this.byId("table");
        const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() )

        if (oContext){
          const sClassificado = oContext.getProperty("Classificacao");
          if (sClassificado == "S"){
            MessageBox.error("Documento já classificado.")
            return;
          }

          if (await this._messageBoxYesNo("Classificar Documento ?") == MessageBox.Action.YES){
            const sNumero = oContext.getProperty("Numero");
            const sFornecedor = oContext.getProperty("Fornecedor");

            try {
              await api.classificaDocumento(sNumero, sFornecedor, this);
              if ( !oModel.hasPendingChanges() ){
                oModel.refresh();
              }
            } catch (oError) {
              MessageBox.error(oError.message);
            }

          }
        }
        else{
          MessageBox.warning("Selecione um item na tabela.")
        }
      
      },


      estornaClassificacao: async function(){
        const oModel = this.getModel();
        const oTable = this.byId("table");
        const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() )

        if (oContext){
          const sClassificado = oContext.getProperty("Classificacao");
          if (sClassificado == "N"){
            MessageBox.error("Documento nao classificado.")
            return;
          }

          if (await this._messageBoxYesNo("Estornar Classificacao ?") == MessageBox.Action.YES){
            const sNumero = oContext.getProperty("Numero");
            const sFornecedor = oContext.getProperty("Fornecedor");

            try {
              await api.estornaClassificacao(sNumero, sFornecedor, this);
              if ( !oModel.hasPendingChanges() ){
                oModel.refresh();
              }
            } catch (oError) {
              MessageBox.error(oError.message);
            }

          }
        }
        else{
          MessageBox.warning("Selecione um item na tabela.")
        }
      
      },


      _messageBoxYesNo: function(sMessage) {
        return new Promise( resolve => {
          MessageBox.show( sMessage, {
              "icon": MessageBox.Icon.QUESTION,
              "title": "Documento de Entrada",
              "actions": [MessageBox.Action.YES, MessageBox.Action.NO],
              "onClose": function(oAction){
                resolve(oAction);
              }
            }
          );
        });

      }

    });

});
