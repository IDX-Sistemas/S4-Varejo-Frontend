sap.ui.define([
    "sap/ui/base/Object"
], 
function(BaseObject) {
    "use strict";
    
    return BaseObject.extend("Usuario",{
        constructor: function(){
            this.Nome="";
            this.Senha="";
            this.Funcao="";
        }
    });
});