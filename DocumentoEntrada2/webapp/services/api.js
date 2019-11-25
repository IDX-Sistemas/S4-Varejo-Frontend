//@ts-nocheck
sap.ui.define([
    "sap/base/Log",
    "sap/ui/model/json/JSONModel"
], 
function(Log, JSONModel){
    
    return  {
        
        /**
         * 
         * @param {String} sDataSource 
         * @param {typeof sap.ui.core.mvc.Controller} oController 
         * @returns retorna a uri informada na entrada dataSources do manifest.json
         */
        getUri: function(sDataSource, oController){
            const sUri = oController.getOwnerComponent().getManifestEntry("sap.app").dataSources[sDataSource].uri;
            return sUri;
        },


        /**
         * 
         * @param {String} sCodigo 
         * @param {typeof sap.ui.core.mvc.Controller} oController 
         * 
         * @returns retorna a descricao do produto ou nulo se não existir
         */
        getDescricaoCondicao: function(sCodigo, oController){
            const oAction = new JSONModel();
            const sUri = this.getUri("default", oController) + "CondicaoPagamento" 
            
            let sDescricao = null;
            
            try {
                
                oAction.loadData(sUri, {
                    $filter: "Codigo eq '" + sCodigo + "'",
                    $select: "Descricao" 
                }, /*bAsync*/ false);
                
                if ( this.existeCondicao(sCodigo, oController)  ){
                    sDescricao = oAction.getData().value[0].Descricao;
                }
               
            } catch (oError) {
                Log.error(oError.message);
            }	

            return sDescricao;
        },


        /**
         * 
         * @param {String} sCodigo 
         * @param {typeof sap.ui.core.mvc.Controller} oController 
         * @returns bExiste
         */
        existeCondicao: function(sCodigo, oController){
            const oAction = new JSONModel();
            const sUri = this.getUri("default", oController) + "CondicaoPagamento"
            
            let bExiste = false;

            try {
                
                oAction.loadData(sUri, {
                    $filter: "Codigo eq '" + sCodigo + "'",
                    $count: true,
                    $top: 0
                }, /*bAsync*/ false);    // $top=0 para nao retornar dados.

                bExiste = oAction.getProperty("/@odata.count") > 0;

            } catch (oError) {
                Log.error(oError.message);
            }
            
            return bExiste;
        },


        classificaDocumento: function(sNumero, sFornecedor, oController){
            const oModel = oController.getModel();

            return new Promise( resolve => {
                const oFunction = oModel.bindContext("/ClassificaDocumentoEntrada(...)");
                oFunction.setParameter("Numero", sNumero);
                oFunction.setParameter("Fornecedor", sFornecedor);
                oFunction.execute().then(() => {
                    const {value} = oFunction.getBoundContext().getObject();
                    resolve(value);
                });
            });
        },


        estornaClassificacao: function(sNumero, sFornecedor, oController){
            const oModel = oController.getModel();

            return new Promise( resolve => {
                const oFunction = oModel.bindContext("/EstornaClassificacaoDocumentoEntrada(...)");
                oFunction.setParameter("Numero", sNumero);
                oFunction.setParameter("Fornecedor", sFornecedor);
                oFunction.execute().then(() => {
                    const {value} = oFunction.getBoundContext().getObject();
                    resolve(value);
                });
            });
        }

    }
})