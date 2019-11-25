//@ts-nocheck
sap.ui.define([
    "sap/ui/model/json/JSONModel"
],

function(JSONModel){

    return {
        
        buscaDadosRelatorio: function(sId, oComponent){
            const sUri = oComponent.getManifestEntry("sap.app").dataSources.default.uri;
            const sPath = sUri + "Relatorios(" + sId + ") ";
            const oAction = new JSONModel();
        
            return new Promise( resolve => {
                oAction.loadData(sPath).then(() => {
                    resolve( oAction.getData() );
                });
            });

        },

        buscaDadosPerguntas: function(sCodigo, oComponent){
            const sUri = oComponent.getManifestEntry("sap.app").dataSources.default.uri;
            const sPath = sUri + `Perguntas?$filter=Codigo eq '${sCodigo}'&$orderBy=Ordem`;
            const oAction = new JSONModel();
        
            return new Promise( resolve => {
                oAction.loadData(sPath).then(() => {
                    resolve( oAction.getData() );
                });
            });

        },

        buscaProximoCodigo: function (oModel) {
            return new Promise(resolve => {
                const oFunction = oModel.bindContext("/ProximoCodigoRelatorio(...)");
                oFunction.execute().then( () => {
                    const { value } = oFunction.getBoundContext().getObject();
                    resolve(value);
                });
            });
        }

    }

});
