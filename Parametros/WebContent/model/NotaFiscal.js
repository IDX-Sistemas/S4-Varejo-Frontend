sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";
    
    return BaseObject.extend("NotaFiscal",{
        constructor: function(){
        	this.Numero= "";
        	this.NumeroDuplicata = "";
        	this.ClassificacaoFiscal= "";
        	this.Serie= "";
        	
        	this.Loja= "";
    		this.Fornecedor= "";
		    
		    this.NaturezaOperacao= "";
		    this.DataEmissao= null;
		    this.DataRecebimento= new Date();
		    
		    this.Condicao= "";
		    this.BaseCalculo= 0;
		    this.ValorICMS= 0;
		    this.ValorIPI= 0;
		    this.ValorTotal= 0;
		    this.Classificacao= "N";

        	this.ParametrosItems = [];
        }
    });
});