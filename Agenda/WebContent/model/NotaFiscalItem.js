sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";
    
    return BaseObject.extend("NotaFiscalItem",{
        constructor: function(){
        	this.Codigo = "";
        	this.Descricao = "";
        	this.ValorUnitario = 0;
        	this.Quantidade = 0;
        	this.Total = 0;
        }
    });
});