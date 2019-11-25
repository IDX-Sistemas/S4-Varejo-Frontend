//@ts-nocheck
sap.ui.define([
    "sap/m/MessageBox"
], function(MessageBox) {
    
    return {
        
        proximaOrdem: async function (oController, sCodigo) {
            const oModel  = oController.getModel();

            return new Promise( (resolve, reject) => {
                const oFunction = oModel.bindContext("/ProximaOrdemPergunta(...)");
                oFunction.setParameter("Codigo", sCodigo);
                oFunction.execute()
                .then( () => {
                    const {value} = oFunction.getBoundContext().getObject();
                    resolve(value);
                })
                .catch((oError) => {
                    reject(oError.message);
                });
                
            });
           
        }
    }
});
