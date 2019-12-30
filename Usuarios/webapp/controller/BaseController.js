//@ts-nocheck
sap.ui.define([
    "sap/m/MessageBox",
    "br/com/idxtec/commons/BaseController",
    "../helpers/UsuarioFuncaoHelpDialog"
], function (MessageBox, Controller, UsuarioFuncaoHelpDialog) {

    return Controller.extend("Usuarios.controller.BaseController", {

        handleSearchUsuarioFuncao: async function (oEvent) {
            const oSource = oEvent.getSource();
            try {
                let sCodigo = await UsuarioFuncaoHelpDialog.handleValueHelp(this.getView());
                if (sCodigo) {
                    oSource.setValue(sCodigo);
                }
            } catch (oError) {
                MessageBox.error(oError.message);
            }

        }

    });
});
