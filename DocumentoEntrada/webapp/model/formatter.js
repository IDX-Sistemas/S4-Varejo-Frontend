//@ts-nocheck
sap.ui.define([
    "sap/ui/core/format/NumberFormat",
	"sap/m/MessageBox",
	"../services/api"
], function(NumberFormat, MessageBox, api){
    
    return {

        /**
         * 
         * @param {string} nValor 
         * @param {string} nQuantidade 
         * 
         * @returns calculo do total do item de linha
         */
        totalFormatter: function(nValor, nQuantidade){
        	var nTotal = parseFloat(nValor) * parseInt(nQuantidade);
            
            var oFloatNumberFormat = NumberFormat.getFloatInstance({
        		decimals: 2,
				decimalSeparator: ',',
				groupingEnabled: true,
				groupingSeparator: '.'
        	});
        			
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
					const sDescricao = oFunction.getBoundContext().getObject().value;
					return sDescricao;
				});
				
			}
			
        },
        

        /**
		 * 
		 * @param {string} sStatus 
		 * @returns retorna cor do icone de status faturamento
		 */
		status: function(sStatus){
			switch (sStatus) {
				case "N":
					return "Negative"
				case "S":
					return "Positive"
				default:
					break;
			}
		},


		/**
		 * 
		 * @param {string} sStatus 
		 * @returns retorna tooltip do icone de status faturamento
		 */
		statusTexto: function(sStatus){
			switch (sStatus) {
				case "N":
					return "PENDENTE"
				case "S":
					return "CLASSIFICADO"	
				default:
					break;
			}
		},
		

		/**
		 * 
		 * @param {String} sCodigo 
		 * @param {String} sDescricao 
		 * 
		 * @returns Retorna descricao da condicao de pagamento
		 */
		descricaoCondicao: function(sCodigo, sDescricao){
			if (sCodigo){

				if (sDescricao){
					return sDescricao;
				} else {
					return api.getDescricaoCondicao(sCodigo, this);
				}
				
			}

		}
        
    }

});