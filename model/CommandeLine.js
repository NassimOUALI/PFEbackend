const db = require("../config/db")


class CommandeLineModel {
	static getAll = async () => {
		return new Promise((resolve, reject) => {
			db.query("SELECT * FROM lignedecommande;",
				(err, res) => {
					if (err) {
						reject(err);
					} else {
						resolve(res);
					}
				})
		})
	}

	static getByCommande = async (id_commande) => {
		return new Promise((resolve, reject) => {
			db.query("SELECT * FROM lignedecommande WHERE id_commande = ?",
				[id_commande],
				(err, res) => {
					if (err) {
						reject(err);
					} else {
						resolve(res)
					}
				}
			)
		})
	}

	static createCommandeLine = async (quantity, prix_total, id_commande, id_produit) => {
		return new Promise((resolve, reject) => {
			db.query("INSERT INTO lignedecommande (quantite, prixTotal, id_commande, id_produit) VALUES (?, ?, ?, ?);",
				[quantity, prix_total, id_commande, id_produit],
				(err, res) => {
					if (err) {
						reject(err);
					} else {
						resolve(res);
					}
				})
		})
	}
}

module.exports = CommandeLineModel