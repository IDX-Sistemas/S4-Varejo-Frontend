sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "sap/m/MessageBox"
], function(BaseController, MessageBox) {
  "use strict";

  return BaseController.extend("MovimentoEstoque.controller.App", {

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
	      let oFilter = new sap.ui.model.Filter("CodigoItem", sap.ui.model.FilterOperator.EQ, sQuery);
	      
	      let oTable = this.byId("table");
	
	      let aFilters = [
	        oFilter
	      ];
	
	      oTable.getBinding("rows").filter(aFilters, "Control");
	    },
	
	    saldoInicial: function(oEvent){
	      let oRouter = this.getRouter();
	      oRouter.navTo("SaldoInicial",{ }, false);
	    },
	    
	    acertoMaior: function(oEvent){
	        let oRouter = this.getRouter();
	        oRouter.navTo("AcertoMaior",{ }, false);
	    },
	    
	    acertoMenor: function(oEvent){
	        let oRouter = this.getRouter();
	        oRouter.navTo("AcertoMenor",{ }, false);
	      },
      
      transferencia: function(oEvent){
          let oRouter = this.getRouter();
          oRouter.navTo("Transferencia",{ }, false);
        }  
    
  });

});
