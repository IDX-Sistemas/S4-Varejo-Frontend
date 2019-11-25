//@ts-nocheck
sap.ui.define([
  "br/com/idxtec/commons/BaseController",
  "Clientes/model/formatter",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"	
], function(BaseController, formatter, MessageBox, JSONModel) {
  "use strict";

  return BaseController.extend("Clientes.controller.Historico", {
	  
	  	formatter: formatter,
	    
	    onInit: function (){
	    	this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());  
	      
	    	var oRouter = this.getRouter();
	    	oRouter.getRoute("Historico").attachMatched( this._routerMatch , this );
	    },
    
		_routerMatch: async function(oEvent){
				const oModel = this.getModel();
				var oView = this.getView();
				var oTable = oView.byId("table");
			
				var id = oEvent.getParameter("arguments").id;
				var codigo = oEvent.getParameter("arguments").codigo;
				
				oView.setBusy(true);

				oView.unbindElement();
				oView.bindElement("/Clientes(" + id + ")");
				
				const oFunction = oModel.bindContext("/GetHistoricoCliente(...)");
				oFunction.setParameter("Codigo", codigo);

				try {
					await oFunction.execute();
					const { value } = oFunction.getBoundContext().getObject();
					
					oView.setModel( new JSONModel(value), "model");
					
					oView.setBusy(false);
				} catch (oError) {
					MessageBox.error(oError.message);
				}

		},

		cancel: function () {
			this.onNavBack();
		}
	
  });

});
