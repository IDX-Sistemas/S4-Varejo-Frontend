sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";
    
    return BaseObject.extend("ContaPagar",{
        constructor: function(){
            this.NumeroDocumento="";
            this.Loja="";
            this.NumeroCheque="";
            this.Fornecedor="";
            this.NotaFiscal="";
            this.DataEmissao = null;
            this.Classificacao = "";
            this.Duplicata = "";
            this.ValorDuplicata = 0;
            this.Historico = "";
            this.Juros = 0;
            this.Desconto = 0;
            this.ValorPago = 0;
            this.DataVencimento = null;
            this.DataRecebimento = null;
            this.DataPagamento = null;
            this.CodigoConta = "";
        }
    });
});