//@ts-nocheck
sap.ui.define([
    "sap/ui/model/json/JSONModel"
],

function(JSONModel){

    return {

       
        /**
         * VERIFICA SE CHAVE DE PEDIDO EXISTE NO BACKEND
         * @param {String} sNumero 
         * @param {String} sLoja 
         * @param {typeof sap.ui.model.odata.v4.ODataModel} oModel
         * @returns bool 
         */
        existePedidoVendaCancelamento: function(sNumero, sLoja, oModel){
            const oFunction = oModel.bindContext("/ExistePedidoVendaCancelamento(...)");
            oFunction.setParameter("Numero", sNumero);
            oFunction.setParameter("Loja", sLoja);

            return new Promise((resolve) => {
                oFunction.execute().then(() => {
                    const { value } = oFunction.getBoundContext().getObject();
                    resolve( value )
                });
                
            });
        },


        /**
         * BUSCA ITENS DA PREVENDA
         * @param {String} sNumero 
         * @param {typeof sap.ui.core.Component} oComponent 
         * @returns array de PreVendaItems
         */
        buscaItemsPreVenda: function(sNumero, oComponent) {
            const sUri = oComponent.getManifestEntry("sap.app").dataSources.default.uri;
            const sPath = sUri + "PreVendaItem?$expand=PreVenda($select=Vendedor)&$filter=Numero eq '" + sNumero + "' ";
            const oAction = new JSONModel();
            
            return new Promise( resolve => {
                oAction.loadData(sPath).then(() => {
                    const {value} = oAction.getData();
                    resolve(value);
                });
            });
    
        }

    }

});