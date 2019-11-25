sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";
    
    return BaseObject.extend("ContaReceber",{
        constructor: function(){
            this.Cliente="";
            this.Loja="";
            this.NumeroDocumento="";
            this.Vendedor="";
            this.NumeroDuplicata="";
            this.ValorDuplicata = 0.00;
            this.NumeroFatura = "";
            this.ValorFatura = 0.00;
            this.Juros = 0.00;
            this.Desconto = 0.00;
            this.DataEmissao = null;
            this.DataVencimento = null;
            this.NumeroCI = "";
            this.ValorTotal = 0.00;
            this.FlagPgto = 0;
            this.TipoVenda = "";
            this.FlagEntrada = "N";
        }
    });
});