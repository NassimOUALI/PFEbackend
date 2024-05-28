const db = require("../config/db")


class CommandeModel {

	static async getAll() {
		return new Promise((resolve, reject) => {
			db.query("SELECT * FROM commande;", (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			})
		})
	}

	static async validate(id, date, id_admin) {
		return new Promise((resolve, reject) => {
			const query = "UPDATE commande SET etat = ?, date_livraison = ?, date_reponse = ?, id_admin = ? WHERE id = ?";
			const values = ["valide", date, new Date(), id_admin, id];

			db.query(query, values, (err, res) => {
				if (err) {
					reject(false);
				} else {
					resolve(true);
				}
			});
		})
	}

	static async refuse(id, motif, id_admin) {
		return new Promise((resolve, reject) => {
			db.query("UPDATE commande SET etat = ?, motif = ?, id_admin = ? WHERE id = ?",
				["refusé", motif, id_admin, id],
				(err, res) => {
					if (err) {
						reject(false)
					} else {
						db.query("SELECT * FROM commande WHERE id = ?",
							[id],
							(err2, res2) => {
								if (err2) {
									reject(false)
								} else {
									resolve(res2[0].id_payment)
								}
							}
						)
					}
				}
			)
		})
	}

	static async getUnreviewed() {
		return new Promise((resolve, reject) => {

			db.query("SELECT commande.*, payment.montant, users.username FROM commande LEFT JOIN payment ON payment.id = commande.id_payment LEFT JOIN users ON commande.id_client = users.id WHERE commande.etat = ? ORDER BY commande.id DESC;",
				["attente"],
				(err, res) => {
					if (err) {
						reject(err)
					} else {
						resolve(res)
					}
				}
			)

		})
	}

	static async createInitSansClient(email, nom, prenom, adresse, ville, codePostale, telephone, id_payment, receipt_path) {
		let etat = "attente"
		return new Promise((resolve, reject) => {
			db.query("INSERT INTO commande (etat, email, nom, prenom, adresse, ville, code_postale, telephone, id_payment, recue) values ( ? ,?, ?, ?, ?, ?, ?, ?, ?, ?)",
				[etat, email, nom, prenom, adresse, ville, codePostale, telephone, id_payment, receipt_path],
				(err, res) => {
					if (err) {
						reject(err);
					} else {
						db.query("SELECT * FROM commande ORDER BY id DESC;", (err, res) => {
							if (err) {
								reject(err);
							} else {
								resolve(res[0].id)
							}
						})
					}
				})
		})
	}

	static async getByIdClient(id) {
		return new Promise((resolve, reject) => {
			db.query(" SELECT * FROM commande WHERE id_client = ? ORDER BY id DESC; ",
				[id],
				(err, res) => {
					if (err)
						reject(err);
					else
						resolve(res);
				}
			)
		})
	}

	static async getCommandeStatus(id) {
		return new Promise((resolve, reject) => {
			db.query(" SELECT * FROM commande WHERE id = ?; ",
				[id],
				(err, res) => {
					if (err)
						reject(err);
					else
						resolve(res[0]);
				}
			)
		})
	}

	static async getById(id) {
		return new Promise((resolve, reject) => {
			db.query("SELECT * FROM commande WHERE id = ? LIMIT 1;",
				[id],
				(err, res) => {
					if (err) {
						reject(err);
					} else {
						resolve(res[0]);
					}
				})
		})
	}

	static async deleteById(id) {
		return new Promise((resolve, reject) => {
			db.query("DELETE FROM commande WHERE id = ?;",
				[id],
				(err, res) => {
					if (err) {
						reject(err);
					} else {
						resolve(true);
					}
				})
		})
	}

	static async getReceipt(id) {
		return new Promise((resolve, reject) => {
			db.query(" SELECT * FROM commande WHERE id = ?; ",
				[id],
				(err, res) => {
					if (err)
						reject(err);
					else
						resolve(res[0].recue);
				}
			)
		})
	}

	static async createInitAvecClient(email, nom, prenom, adresse, ville, codePostale, telephone, idClient, id_payment, receipt_path) {
		let etat = "attente"
		return new Promise((resolve, reject) => {
			db.query("INSERT INTO commande (etat, email, nom, prenom, adresse, ville, code_postale, telephone, id_client, id_payment, recue) values ( ? ,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
				[etat, email, nom, prenom, adresse, ville, codePostale, telephone, idClient, id_payment, receipt_path],
				(err, res) => {
					if (err) {
						reject(err);
					} else {
						db.query("SELECT * FROM commande ORDER BY id DESC;", (err, res) => {
							if (err) {
								reject(err);
							} else {
								resolve(res[0].id)
							}
						})
					}
				})
		})
	}

	static async getReviewedByAdmin(id) {
		return new Promise((resolve, reject) => {
			db.query("SELECT commande.*, payment.montant, users.username FROM commande LEFT JOIN payment ON payment.id = commande.id_payment LEFT JOIN users ON commande.id_client = users.id WHERE commande.id_admin = ? ORDER BY commande.id DESC;",
				[id],
				(err, res) => {
					if (err) {
						reject(err)
					} else {
						resolve(res)
					}
				}
			)
		})
	}

	static async getRecent() {
		return new Promise((resolve, reject) => {

			db.query("SELECT commande.*, payment.montant, users.username FROM commande LEFT JOIN payment ON payment.id = commande.id_payment LEFT JOIN users ON commande.id_client = users.id WHERE commande.etat = ? ORDER BY commande.date_commande DESC LIMIT 3;",
				["attente"],
				(err, res) => {
					if (err) {
						reject(err)
					} else {
						resolve(res)
					}
				}
			)

		})
	}

	static async numCommande() {
		try {
			const currentYear = new Date().getFullYear();
			const currentMonth = new Date().getMonth() + 1; // getMonth() is zero-based
			const currentDay = new Date().getDate(); // getDate() returns the day of the month

			const yearCountPromise = new Promise((resolve, reject) => {
				db.query("SELECT count(*) as cnt FROM commande WHERE YEAR(date_commande) = ?", [currentYear], (err, res) => {
					if (err) reject(err);
					else resolve(res[0].cnt);
				});
			});

			const monthCountPromise = new Promise((resolve, reject) => {
				db.query("SELECT count(*) as cnt FROM commande WHERE MONTH(date_commande) = ?", [currentMonth], (err, res) => {
					if (err) reject(err);
					else resolve(res[0].cnt);
				});
			});

			const dayCountPromise = new Promise((resolve, reject) => {
				db.query("SELECT count(*) as cnt FROM commande WHERE DAY(date_commande) = ?", [currentDay], (err, res) => {
					if (err) reject(err);
					else resolve(res[0].cnt);
				});
			});

			const [yearCount, monthCount, dayCount] = await Promise.all([yearCountPromise, monthCountPromise, dayCountPromise]);

			return { year: yearCount, month: monthCount, day: dayCount };
		} catch (err) {
			throw err;
		}
	}

}

module.exports = CommandeModel