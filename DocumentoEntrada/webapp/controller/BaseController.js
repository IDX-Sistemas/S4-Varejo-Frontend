//@ts-nocheck
sap.ui.define([
    "br/com/idxtec/commons/BaseController",
    "sap/m/MessageBox"
],
function(Controller, MessageBox){
   
    return Controller.extend("DocumentoEntrada.controller.BaseController",{


        buscaProduto: async function(oEvent){
            const oContext = oEvent.getSource().getBindingContext();
            const oModel = this.getModel();
            const oInput = oEvent.getSource();

            let sCodigo = oEvent.getSource().getValue();
            
            /**
             * VALIDA FORMATO DO CODIGO DO PRODUTO XXX XXX XXXXXX
             * E FORMATA CASO NAO ESTEJA NO PADRAO
             */

            if( !sCodigo.match(/^[0-9][A-Z]{3} [0-9][A-Z]{3} [0-9][A-Z]{6}/i) ){ 
                sCodigo = sCodigo.replace(/(\d{3})(\d{3})(\d{6})/, "\$1 \$2 \$3"); 
                oContext.setProperty("Codigo", sCodigo);
            }
            
            if ( oContext.hasPendingChanges() ){
                
                var oFunction = oModel.bindContext("/GetProdutoPeloCodigo(...)");
                oFunction.setParameter("Codigo", sCodigo);
                
                try {
                    await oFunction.execute();
                    const { RowId } = oFunction.getBoundContext().getObject();
                    
                    if( !RowId ){
                        oInput.focus();
                        oContext.setProperty("Codigo", "");
                        MessageBox.error("Produto não cadastrado.")
                    }

                } catch (oError) {
                    MessageBox.error(oError.message);
                }

            }
                
        }

   });

});