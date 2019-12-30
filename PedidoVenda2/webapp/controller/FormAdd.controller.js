/* global moment:true */
//@ts-nocheck
sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"br/com/idxtec/commons/ErrorHandler",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"PedidoVenda/service/api",
	"PedidoVenda/libs/Moment"
],

	function (BaseController, MessageBox, ErrorHanlder, Filter, FilterOperator, api, Momentjs) {
		"use strict";

		return BaseController.extend("PedidoVenda.controller.FormAdd", {

			onInit: function () {
				var oRouter
				oRouter = this.getRouter();
				oRouter.getRoute("Add").attachMatched(this._routerMatch, this);

				this._oErrorHandler = new ErrorHanlder(this);
			},


			onExit: function () {
				this._oErrorHandler.destroy();
				this.byId("tableItems").unbindRows();
			},


			_routerMatch: function (oEvent) {
				var oModel = this.getModel();
				var oView = this.getView();

				oView.byId("Numero").setEditable(true);
				oView.byId("Loja").setEditable(true);

				var oTable = this.byId("tableItems");
				oTable.unbindRows();

				var oBinding = oModel.bindList("/PedidoVenda");

				var oNovoPedido = {};
				oNovoPedido.Data = moment().format("YYYY-MM-DD");
				oNovoPedido.TipoVenda = "1";
				oNovoPedido.ValorVenda = 0.00;
				oNovoPedido.ValorDesconto = 0.00;
				oNovoPedido.ValorAcrescimo = 0.00;
				oNovoPedido.Parcelas = 1;
				oNovoPedido.FlagEntrada = "N";
				oNovoPedido.ValorEntrada = 0.00;
				oNovoPedido.Cliente = "00000"

				var oContext = oBinding.create(oNovoPedido, false, false);

				oView.setBindingContext(oContext);
			},


			numeroChange: function (oEvent) {
				var sCodigoNew = ("000000" + oEvent.getParameter("value")).slice(-6);
				oEvent.getSource().setValue(sCodigoNew);

				this.bindRows();
			},


			lojaChange: function (oEvent) {
				this.bindRows();
			},


			bindRows: async function () {
				const oModel = this.getModel();
				const oView = this.getView();
				const oTable = this.byId("tableItems");
				const oContext = this.getView().getBindingContext();
				const sNumero = oContext.getProperty("Numero");
				const sLoja = oContext.getProperty("Loja");
				const bHasPendingChanges = oModel.hasPendingChanges();

				if (!sNumero || !sLoja || !bHasPendingChanges) {
					return;
				}

				try {

					if (await api.existePedidoVenda(sNumero, sLoja, oModel)) {
						oContext.setProperty("Numero", null);
						oContext.setProperty("Loja", null);
						MessageBox.error("Numero de pedido ja cadastrado.");
						return;
					}

					oTable.bindRows({
						path: "/PedidoVendaItem",
						filters: [
							new Filter("NumeroVenda", FilterOperator.EQ, sNumero),
							new Filter("Loja", FilterOperator.EQ, sLoja)
						],
						parameters: {
							$count: true
						}
					});

					oView.byId("Numero").setEditable(false);
					oView.byId("Loja").setEditable(false);

				} catch (oError) {
					MessageBox.error(oError.message);
				}

			},

			buscarCI: async function (oEvent) {
				const oView = this.getView();
				const oContext = oView.getBindingContext();
				const oTable = this.byId("tableItems");
				const oComponent = this.getOwnerComponent();

				const sNumero = oContext.getProperty("Numero");
				const sLoja = oContext.getProperty("Loja");

				if (sNumero && sLoja) {

					try {

						const sNumeroCI = await this.handleSearchPreVenda(oEvent);

						if (sNumeroCI) {

							oView.setBusy(true);

							const aItems = await api.buscaItemsPreVenda(sNumeroCI, oComponent);
							const oBinding = oTable.getBinding("rows");

							for (let i = 0; i < aItems.length; i++) {
								const item = aItems[i];

								let oNovoItem = {
									NumeroVenda: sNumero,
									Loja: sLoja,
									Codigo: item.Codigo,
									Vendedor: item.PreVenda.Vendedor,
									ValorUnitario: parseFloat(item.ValorUnitario + 0),
									ValorDesconto: parseFloat(item.Desconto + 0),
									ValorAcrescimo: parseFloat(item.Acrescimo + 0),
									Quantidade: parseInt(item.Quantidade + 0),
									NumeroPreVenda: item.Numero
								};

								oBinding.create(oNovoItem, false, true);
							}

							oView.setBusy(false);

							const nRow = oBinding.getContexts().length;
							oTable.setFirstVisibleRow(nRow);

							this.totalizaPedido()
						}

					} catch (oError) {
						MessageBox.error(oError.message);
					}

				}

				else {
					MessageBox.warning("Informe o numero da venda e a loja.");
				}

			},


			incluirItem: function () {
				const oContext = this.getView().getBindingContext();
				const oTable = this.byId("tableItems");

				let oNovoItem = {
					NumeroVenda: oContext.getProperty("Numero"),
					Loja: oContext.getProperty("Loja"),
					ValorUnitario: 0.00,
					ValorDesconto: 0.00,
					ValorAcrescimo: 0.00,
					Quantidade: 1,
					NumeroPreVenda: ""
				};

				if (oNovoItem.NumeroVenda && oNovoItem.Loja) {
					const oBinding = oTable.getBinding("rows");
					oBinding.create(oNovoItem, false, true);

					const nRow = oBinding.getContexts().length;
					oTable.setFirstVisibleRow(nRow);
				}
			},


			removeItem: function () {
				var oTable = this.byId("tableItems");
				var oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

				if (!oContext) {
					MessageBox.warning("Selecione um item na tabela !");
					return;
				}

				oContext.delete("$auto").then(() => {
					oTable.clearSelection();
				});
			},

			changeCondicao: function (oEvent) {
				const sOpcao = oEvent.getSource().getSelectedKey();
				const oInputParcelas = this.byId("parcelas");
				const oInputEntrada = this.byId("entrada");
				const oInputCartaoCredito = this.byId("cartaoCredito");

				switch (sOpcao) {
					case "1":
						oInputParcelas.setEditable(false);
						oInputEntrada.setEditable(false);
						oInputCartaoCredito.setEditable(false);
						break;
					case "5":
						oInputParcelas.setEditable(true);
						oInputEntrada.setEditable(true);
						oInputCartaoCredito.setEditable(true);
						break;
					default:
						oInputParcelas.setEditable(true);
						oInputEntrada.setEditable(true);
						oInputCartaoCredito.setEditable(false);
						break;
				}
			},

			changeEntrada: function (oEvent) {
				const sOpcao = oEvent.getSource().getSelectedKey();
				const oInputValorEntrada = this.byId("valorEntrada");

				oInputValorEntrada.setEditable(sOpcao === "S");
			},

			totalizaPedido: function () {
				const oContext = this.getView().getBindingContext();
				const oTable = this.byId("tableItems");
				const nRows = oTable.getBinding("rows").getLength();

				let nTotalVenda = 0;
				let nTotalDesconto = 0;
				let nTotalAcrescimo = 0;

				for (let i = 0; i < nRows; i++) {
					const oCtx = oTable.getContextByIndex(i);

					const nQuantidade = oCtx.getProperty("Quantidade");
					const nValorUnit = oCtx.getProperty("ValorUnitario");

					nTotalDesconto += oCtx.getProperty("ValorDesconto");
					nTotalAcrescimo += oCtx.getProperty("ValorAcrescimo");
					nTotalVenda += nQuantidade * nValorUnit;
				}

				oContext.setProperty("ValorVenda", nTotalVenda);
				oContext.setProperty("ValorDesconto", nTotalDesconto);
				oContext.setProperty("ValorAcrescimo", nTotalAcrescimo);
			},

			cancel: function (oEvent) {
				if (this.getModel().hasPendingChanges()) {
					this.getModel().resetChanges();
				}

				this.onNavBack();
			},

			save: async function () {
				const sTipoVenda = this.getView().getBindingContext().getProperty("TipoVenda");

				this.totalizaPedido();

				if (await this._messageBoxConfirma() == MessageBox.Action.YES) {

					try {

						this._setBusy(true);

						if (await this._submitBatch()) {
							this._refresh();
							MessageBox.success(
								"Dados gravados.", {
								onClose: function (sAction) {
									this.onNavBack();
								}.bind(this)
							}
							)
						}

					} catch (oError) {
						MessageBox.erro(oError.message);
					} finally {
						this._setBusy(false);
					}
				}
			},


			/**@private */
			_messageBoxConfirma: function () {
				return new Promise(resolve => {
					MessageBox.show(
						"Confirma Pedido ?", {
						icon: MessageBox.Icon.QUESTION,
						title: "Confirmacao",
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						onClose: sAction => {
							resolve(sAction);
						}
					}
					);
				});
			},


			/**@private */
			_submitBatch: function () {
				const oModel = this.getModel();
				return new Promise((resolve, reject) => {
					oModel.submitBatch("updGroup").then(() => {
						resolve(!oModel.hasPendingChanges());
					}).catch(oError => {
						reject(oError);
					});
				});
			},


			/**@private */
			_setBusy: function (bIsBusy) {
				this.getView().setBusy(bIsBusy);
			},

			/**@private */
			_refresh: function () {
				const oModel = this.getModel();

				if (!oModel.hasPendingChanges()) {
					oModel.refresh();
				}
			}

		});

	});
