sap.ui.define([
	
], 
function(){
	"use strict";
	
	return{
		tipoVenda: function(sTipo){
    		switch(sTipo){
    			case "1":
    				return "VISTA";
    				
    			case "2":
    				return "DUPLIC";
    				
    			case "3":
    				return "CARNE";
    				
    			case "4":
    				return "CHEQUE";
    				
    			case "5":
    				return "CARTAO";	
    		}
    	}
	}
});