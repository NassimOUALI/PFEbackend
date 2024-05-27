const createInvoice = require("../Services/PDF")
const { generateUniqueFilename } = require("../Services/utils")
require('dotenv').config()


class PDFManager {

	static async makeReceipt(req, res) {
		if (!req.session.checkoutData) {
			res.status(404).send({
				error: "checkout info not found",
			})
			return
		}

		let subtotal = 0


		await req.session.checkoutData.cart.map(item => {
			subtotal = parseFloat(subtotal) + (parseFloat(item.quantity) * parseFloat(item.product.prix_unitaire))
		})

		const invoice = {
			shipping: {
				name: req.session.checkoutData.nom + " " + req.session.checkoutData.prenom,
				address: req.session.checkoutData.adresse,
				city: req.session.checkoutData.ville,
				telephone: req.session.checkoutData.telephone,
				country: "Maroc",
				postal_code: req.session.checkoutData.codePostale
			},
			items: req.session.checkoutData.cart,
			subtotal: String(subtotal),
		};
		let unique_receipt = "./receipt/" + generateUniqueFilename("receipt_" + req.session.checkoutData.nom + "_" + req.session.checkoutData.prenom + ".pdf")
		createInvoice(invoice, unique_receipt);
		return { receipt_path: unique_receipt, subtotal: subtotal, cart: invoice.items }
	}
}

module.exports = PDFManager