//@ts-nocheck
sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "PedidoVendaCancelamento/model/formatter"
], function(BaseController, MessageBox, Filter, FilterOperator, formatter) {
  "use strict";

  return BaseController.extend("PedidoVendaCancelamento.controller.App", {

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
      let oFilter = new Filter("Clientes/Nome", FilterOperator.Contains, sQuery);
      
      let oTable = this.byId("table");

      let aFilters = [
        oFilter
      ];

      oTable.getBinding("rows").filter(aFilters, "Control");
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


    cancelaPedido: async function() {
      const oTable = this.byId("table");
      const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );
      const oModel = this.getModel();

      if ( this._pedidoCancelado() ){
        MessageBox.warning("Pedido ja cancelado.");
        return;
      }

      if ( this._pedidoFaturado() ){
        MessageBox.warning("Pedido faturado.");
        return;
      }

      if (oContext){
        
        const sResult = await this._messageBoxYesNo("Cancelar Pedido ?", "Cancelamento");
        if (sResult == MessageBox.Action.NO){
          return;
        }

        const sNumero = oContext.getProperty("Numero");
        const sLoja = oContext.getProperty("Loja");

        const oFunction = oModel.bindContext("/CancelaPedido(...)");
        oFunction.setParameter("Numero", sNumero );
        oFunction.setParameter("Loja", sLoja);

        try {
            
            await oFunction.execute();
            oModel.refresh();
            MessageBox.success("Pedido cancelado.");

        } catch (oError) {
            MessageBox.error(oError.message);
        }

      }
      else {
        MessageBox.warning("Selecione um item na tabela.");
      }

    },

    
    estornaFaturamento: async function(){
      const oTable = this.byId("table");
      const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );
      const oModel = this.getModel();

      if ( this._pedidoCancelado() ){
        MessageBox.warning("Pedido ja cancelado.");
        return;
      }

      if ( !this._pedidoFaturado() ){
        MessageBox.warning("Pedido nao faturado.");
        return;
      }

      if (oContext){
        
        const sResult = await this._messageBoxYesNo("Estornar Faturamento ?", "Estorno");
        if (sResult == MessageBox.Action.NO){
          return;
        }

        const sNumero = oContext.getProperty("Numero");
        const sLoja = oContext.getProperty("Loja");

        const oFunction = oModel.bindContext("/EstornaFaturamentoPedido(...)");
        oFunction.setParameter("Numero", sNumero );
        oFunction.setParameter("Loja", sLoja);

        try {
            
            await oFunction.execute();
            const { value } = oFunction.getBoundContext().getObject();

            if (value == 2){
              MessageBox.error("Pedido possui recebimentos.\nNao é possivel estornar.")
              return;
            }
            
            oModel.refresh();
            MessageBox.success("Faturamento estornado com sucesso.");

        } catch (oError) {
            MessageBox.error(oError.message);
        }

      }
      else {
        MessageBox.warning("Selecione um item na tabela.");
      }

    },


    /** @private  */
    _pedidoCancelado: function(){
      const oTable = this.byId("table");
      const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );

      if (oContext){
        const sStatus = oContext.getProperty("Faturado");
        return (sStatus === "C")
      }
      
      return false;
    },


     /** @private  */
     _pedidoFaturado: function(){
      const oTable = this.byId("table");
      const oContext = oTable.getContextByIndex( oTable.getSelectedIndex() );

      if (oContext){
        const sStatus = oContext.getProperty("Faturado");
        return (sStatus === "S")
      }
      
      return false;
    },


    /**@private */
    _messageBoxYesNo: function(sMessage, sTitle){

      return new Promise( resolve => {
          
        MessageBox.show( sMessage,{
              "icon": MessageBox.Icon.QUESTION,
              "title": sTitle,
              "actions": [MessageBox.Action.NO, MessageBox.Action.YES],
              "onClose": function(sAction){
                  resolve(sAction);
              }
          });
      
        });
    }


  });

});
