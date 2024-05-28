const CommandeModel = require("../model/Commande");
const CommandeLineModel = require("../model/CommandeLine")
const PDFManager = require('./ReceiptController')
const PaymentModel = require("../model/Payment")
const ProduitModel = require('../model/Product')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const path = require('path');
const sendmail = require("../Services/mail");
const { error } = require("console");

class CheckoutController {

	static async saveCommande(req, res) {

		if (!req.session.currentCommandeData) {
			console.log("no commande to save");
			res.status(404).json({
				error: "no commande to save"
			})
			return
		}

		const { user_id, email, nom, prenom, adresse, ville, codePostale, telephone } = req.session.currentCommandeData;
		const payment = req.session.payment_id
		// console.log(payment);
		if (!email || !nom || !prenom || !adresse || !ville || !codePostale || !telephone) {
			console.log(req.session.currentCommandeData);
			return res.status(400).send({
				status: 400,
				message: "Missing or invalid parameters"
			});
		}

		req.session.checkoutData = req.session.currentCommandeData
		req.session.checkoutData.cart = req.session.fullCartDetails

		try {

			const receipt_info = await PDFManager.makeReceipt(req, res);
			await PaymentModel.createPayment(payment, receipt_info.subtotal);

			// console.log("user saving cmd : ", user_id);

			const commande_id = user_id ?
				await CommandeModel.createInitAvecClient(email, nom, prenom, adresse, ville, codePostale, telephone, user_id, payment, receipt_info.receipt_path) :
				await CommandeModel.createInitSansClient(email, nom, prenom, adresse, ville, codePostale, telephone, payment, receipt_info.receipt_path)

			receipt_info.cart.map((item) => {
				CommandeLineModel.createCommandeLine(item.quantity, item.quantity * item.product.prix_unitaire, commande_id, item.product.id);
			}
			)

			res.cookie('commande_id', commande_id, { maxAge: 100 * 60 * 30 }); // Cookie expires in 30 minutes

			if (commande_id) {
				delete req.session.currentCommandeData
				delete req.session.checkoutData
				delete req.session.cart
				delete req.session.fullCartDetails
				sendmail(email, 
					"Recue de commande CHOPAIN",
					`<p>Merci pour votre achat chez Chopain, votre commande vas étre revue par un administrateur.</p>
					<p>Votre numéro de commande est : ${commande_id}.</p>
					<p>Vous trouverez votre reçu en pièce jointe.</p>
					<p>Nous espérons que vous apprécierez votre achat. Si vous avez des questions, n'hésitez pas à nous contacter au 0500000000.</p>
					`
					, receipt_info.receipt_path);
				res.status(200).send({
					status: 200,
					message: "Commande added",
				});// success
			}

		} catch (e) {
			console.error({ error: e.message });
		}

	}

	static async getReceipt(req, res) {
		const { commande_id } = req.query;

		if (!commande_id) {
			return res.status(400).send({
				status: 400,
				message: "Missing or invalid parameters"
			});
		}

		const receipt_path = await CommandeModel.getReceipt(commande_id);

		res.sendFile(path.resolve(receipt_path), (err) => {
			if (err) {
				// Handle error
				console.error('Error sending Receipt:', err);
				res.status(err.status).end();
			}
		});
	}

	static async confirm(req, res) {
		req.session.currentCommandeData = req.body

		if (!req.session.cart) {
			res.status(404).send({ error: "not found" });
			return
		}

		let TOTAL = 0

		const cartPromises = Object.entries(req.session.cart).map(async ([productId, quantity]) => {
			const productDetails = await ProduitModel.getById(productId);
			if (!productDetails) {
				throw new Error(`No product found for ID: ${productId}`);
			}
			TOTAL += parseFloat(parseFloat(productDetails.prix_unitaire*quantity).toFixed(2)) 
			return {
				product: productDetails,
				quantity: quantity
			};
		});

		

		let cart = await Promise.all(cartPromises);
		
		
		
		try {
			if(parseFloat(TOTAL).toFixed(2) <= 50){
				throw new Error("Quantity")
			}
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				mode: 'payment',
				line_items: cart.map(item => {
					return {
						price_data: {
							currency: 'mad',
							product_data: {
								name: item.product.nom
							},
							unit_amount: item.product.prix_unitaire * 100,
						},
						quantity: item.quantity
					}
				}),
				success_url: `${process.env.CLIENT_URL}/postcheckout`,
				cancel_url: `${process.env.CLIENT_URL}/checkout`
			})

			req.session.payment_id = session.id

			if ((session.url).includes("/postcheckout")) {
				res.status(200).json({
					url: session.url,
					total: session.amount_total,
					payment: true,
				})
			} else {
				res.status(200).json({
					url: session.url,
					total: session.amount_total,
					payment: false,
				})
			}

		} catch (e) {
			console.log(e);
			if(e.statusCode === 400 || e.message === "Quantity"){
				return res.status(400).json({message: "Montant trop petit..."})
			}
			res.status(500).json({ error: e.message })
		}

	}
}

module.exports = CheckoutController;