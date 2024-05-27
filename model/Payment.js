const db = require("../config/db")


class PaymentModel {
	static getAll = () => {
		return new Promise((resolve, reject) => {
			db.query("SELECT * FROM payment;", (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			})
		})
	}

	static getById = (id) => {
		return new Promise((resolve, reject) => {
			db.query("SELECT * FROM payment WHERE id = ? ;",
				[id]
				, (err, res) => {
					if (err) {
						reject(err);
					} else {
						resolve(res[0]);
					}
				})
		})
	}

	static createPayment = (id, TOTAL) => {
		return new Promise((resolve, reject) => {
			db.query("INSERT INTO payment (id, montant, type) VALUES (?, ? ,?);", [id, TOTAL, "CREDIT_CARD"], (err, res) => {
				if (err) {
					reject(err);
				} else {
					db.query("SELECT * FROM payment ORDER BY id DESC;", (error, result) => {
						if (error) {
							reject(error);
						} else {
							resolve(result[0].id); // This will resolve with the first (maximum) ID
						}
					});
				}
			})
		})
	}
}

module.exports = PaymentModel