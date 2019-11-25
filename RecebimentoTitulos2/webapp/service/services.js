
//@ts-nocheck
sap.ui.define([], function(){
	
	"use strict";
	
	return {
		
		getNumeroDocumento: function(sData, sLoja,  oController){
			var oModel = oController.getModel();
			var oFunction = oModel.bindContext("/GetNumeroDocumento(...)");
			oFunction.setParameter("Data", sData);
			oFunction.setParameter("Loja", sLoja);

			return new Promise(function(resolve, reject){
				oFunction.execute().then(
					function(){
						resolve(oFunction.getBoundContext().getObject().value);
					}
				);

			});
		},
		
		
		recebimentoTitulo: function(oRecebimento, oController){
			var oModel = oController.getModel();
			var oFunction = oModel.bindContext("/RecebimentoTitulo(...)");
    		oFunction.setParameter("NumeroDuplicata", oRecebimento.NumeroDuplicata);
    		oFunction.setParameter("DataPagamento", oRecebimento.DataPagamento);
    		oFunction.setParameter("ValorPago", oRecebimento.ValorPago);
    		oFunction.setParameter("NumeroDocumento", oRecebimento.NumeroDocumento);
    		oFunction.setParameter("Loja", oRecebimento.Loja);
    		oFunction.setParameter("ValorJuros", oRecebimento.ValorJuros);
    		oFunction.setParameter("ValorDesconto", oRecebimento.ValorDesconto);
    		oFunction.setParameter("Quitar", oRecebimento.Quitar);
    		
    		return oFunction.execute();
		}
	
	}
	
});