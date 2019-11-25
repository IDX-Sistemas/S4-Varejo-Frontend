sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";
    
    return BaseObject.extend("Motorista",{
        constructor: function(){
            this.Filial="";
            this.Nome="";
            this.Cpf="";
            this.Telefone="";
            this.IsDeleted="";
            this.Bloqueado = "2";  // 2 - nao
        }
    });
});