//@ts-nocheck
sap.ui.define([

],
function(){
    
    return {

        estornoRecebimento: function(sNumero, sLoja, sDoc, sData, oModel){
            const oFunction = oModel.bindContext("/EstornoRecebimento(...)");
            oFunction.setParameter("NumeroDuplicata", sNumero);
            oFunction.setParameter("Loja", sLoja);
            oFunction.setParameter("NumeroDocumento", sDoc);
            oFunction.setParameter("DataPagamento", sData);

            return new Promise(function(resolve){
                oFunction.execute().then( function() {
                    resolve();
                });
            });

        }
    }
});