//@ts-nocheck
sap.ui.define([
	"sap/ui/core/format/NumberFormat",
	"PedidoVendaCancelamento/service/api"
], 
function(NumberFormat, api){
	
	return {
		
		/**
		 * 
		 * @param {string} nValor 
		 * @param {string} nQuantidade 
		 * @param {string} nDesconto 
		 * @param {string} nAcrescimo 
		 * 
		 * @returns total do item de linha
		 */
		totalItem: function(nValor, nQuantidade, nDesconto, nAcrescimo) {
    		
    		var nSubtotal = parseFloat(nValor) * parseInt(nQuantidade);
        	var nTotal = nSubtotal + parseFloat(nAcrescimo) - parseFloat(nDesconto);
        	
        	var oFloatNumberFormat = NumberFormat.getFloatInstance({
        		decimals: 2,
				decimalSeparator: ',',
				groupingEnabled: true,
				groupingSeparator: '.'
        	} );
        			
    		return oFloatNumberFormat.format(nTotal);
        },

		/**
		 * 
		 * @param {string} nValor 
		 * @param {string} nDesconto 
		 * @param {string} nAcrescimo 
		 * @returns retorna o valor total do pedido
		 */
		total: function(nValor, nDesconto, nAcrescimo) {
    		
    		var nTotal = parseFloat(nValor) + parseFloat(nAcrescimo) - parseFloat(nDesconto);
        	
        	var oFloatNumberFormat = NumberFormat.getFloatInstance({
        		decimals: 2,
				decimalSeparator: ',',
				groupingEnabled: true,
				groupingSeparator: '.'
        	} );
        			
    		return oFloatNumberFormat.format(nTotal);
		},
		
	
		/**
		 * 
		 * @param {string} sCodigo 
		 * @param {string} sDescricao
		 * 
		 * @returns descricao do produto ou null
		 */
		descricaoProduto: function(sCodigo, sDescricao) {

			if (sCodigo){
				
				if (sDescricao){
					return sDescricao;
				}
	
				const oFunction = this.getModel().bindContext("/GetDescricaoProduto(...)");
				oFunction.setParameter("Codigo", sCodigo);
				
				return oFunction.execute().then(() => {
					let sDescricao = oFunction.getBoundContext().getObject().value;
					return sDescricao;
				});
				
			}
			
		},

		/**
		 * 
		 * @param {string} sTipo 
		 * @returns retorna a descricao do tipo da venda/titulo
		 */
		tipoVenda: function(sTipo){
			switch (sTipo) {
				case "1":
					return "VISTA"
				case "2":
					return "DUPLIC"	
				case "3":
					return "CARNE"
				case "4":
					return "CHEQUE"
				case "5":
					return "CARTAO"		
				default:
					break;
			}
		},


		/**
		 * 
		 * @param {string} sStatus 
		 * @returns retorna cor do icone de status faturamento
		 */
		statusPedido: function(sStatus){
			debugger
			switch (sStatus) {
				case "N":
					return "Negative"
				case "S":
					return "Positive"	
				case "C":
					return "Neutral"
				default:
					break;
			}
		},


		/**
		 * 
		 * @param {string} sStatus 
		 * @returns retorna tooltip do icone de status faturamento
		 */
		statusPedidoTexto: function(sStatus){
			debugger
			switch (sStatus) {
				case "N":
					return "NAO FATURADO"
				case "S":
					return "FATURADO"	
				case "C":
					return "CANCELADO"
				default:
					break;
			}
		}


	}

	
});