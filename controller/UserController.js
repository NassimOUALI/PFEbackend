const UserModel = require('../model/User');
const CityModel = require('../model/City');
const CommandeModel = require("../model/Commande");
const CommandeLineModel = require('../model/CommandeLine');
const PaymentModel = require('../model/Payment');
const fs = require('fs');
const jwt = require("jsonwebtoken")
const path = require('path');
const sendmail = require('../Services/mail');
const exp = require('constants');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

class UserController {

    static async getAll(req, res) {
        try {
            let results = await UserModel.getAll();
            if (results.length != 0) {
                res.send(results);
            } else {
                res.status(404).send('No users found.');
            }
        } catch (error) {
            console.log("Error getAllUsers user:", error.message);
            res.status(500).send('Error getAllUsers: ' + error.message);
        }
    }

    static async addUser(req, res) {
        console.log("adding a user...");
        try {

            const { username, password, nom, prenom, telephone, email, adresse, city } = req.body;

            // Validate required fields
            if (!username || !password || !telephone || !email || !adresse || !city) {
                return res.status(400).send("Missing or invalid parameters");
            }

            let DisponibleEmail = await UserModel.getByEmail(email);

            if (DisponibleEmail) {
                return res.status(401).send({
                    status: 401,
                    message: "Email already exists"
                }); // Email not valid error 401
            }

            let DisponibleUsername = await UserModel.getByUsername(username);

            if (DisponibleUsername) {
                return res.status(402).send({
                    status: 402,
                    message: "Username already exists"
                }); // Username not valid error 402
            }

            let stats = await UserModel.addUser(username, password, nom, prenom, telephone, email, adresse, city)
            if (stats) {
                res.send({
                    status: 200,
                    message: "User added"
                });// success
            }
        } catch (error) {
            console.log("Error addUser user:", error.message);
            res.status(500).send('Error addUser: ' + error.message);
        }
    }

    static async login(req, res) {
        console.log("Checking credentials...");
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).send({
                    status: 400,
                    message: "Missing or invalid parameters"
                });
            }

            let user = await UserModel.getByEmail(email);

            if (!user || user.length == 0) {
                return res.status(404).send({
                    status: 404,
                    message: 'Email not found'
                });
            }

            let passwordIsValid = await UserModel.verifyUserPassword(user.password, password);

            if (passwordIsValid) {
                req.session.userId = user.id;

                const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET)

                return res
                    .status(200)
                    .json({
                        message: "Correct credentials",
                        token,
                        user
                    })
            } else {
                console.log("Incorrect password for user " + user.username);
                res.status(401).send({
                    status: 401,
                    message: "Password incorrect"
                });
            }

        } catch (error) {
            console.log("Error logging in user:", error.message);
            res.status(500).send('Error logging in: ' + error.message);
        }
    }

    static async logout(req, res) {
        req.session.destroy();
        res.status(200).json({
            status: 200,
            message: "logged out"
        })
    }

    static async getAllCityNames(req, res) {
        try {

            CityModel.getAllCityNames()
                .then(
                    data => {
                        if (data.length != 0) {
                            res.send(data)
                        } else {
                            res.status(404).send("nothing found");
                        }
                    }
                )

        } catch (error) {
            console.log("ERROR getAllCountryNames : ", error.message);
        }
    }

    static async isLogged(req, res) {
        return res.status(200).json(req.user)
    }

    static async deleteUser(req, res) {
        console.log("Deleting user...");
        try {
            let username = req.body.username;

            if (username) {
                let success = await UserModel.deleteUser(username);

                if (success) {
                    console.log("Deleted user:", username);
                    res.status(200).send("Deleted user: " + username);
                } else {
                    console.log("User not found:", username);
                    res.status(404).send("User not found: " + username);
                }
            } else {
                res.status(400).send("Missing or invalid username parameter");
            }
        } catch (error) {
            console.log("Error deleteUser user:", error.message);
            res.status(500).send('Error deleteUser user: ' + error.message);
        }
    }

    static async getByUsername(req, res) {
        console.log("fetching user : ", req.body.username, "...");
        try {
            let username = req.body.username

            if (username) {
                let results = await UserModel.getByUsername(username);

                if (results) {
                    console.log("Got user info : " + username);
                    res.send(results);
                } else {
                    console.log("User not found:", username);
                    res.status(404).send("User not found: " + username);
                }
            }

        } catch (error) {
            console.log("Error getUserByUsername:", error.message);
            res.status(500).send('Error getUserByUsername: ' + error.message);
        }
    }

    static async getUserCommandes(req, res) {
        try {


            let Commandes = await CommandeModel.getByIdClient(req.user.id);

            if (!Commandes || Commandes.length <= 0) {
                res.status(404).send({ message: 'No Commandes made' });
                return
            }

            Commandes = await Promise.all(Commandes.map(async (item) => {
                return {
                    ...item,
                    ligneCommande: await CommandeLineModel.getByCommande(item.id),
                    payment: await PaymentModel.getById(item.id_payment)
                };
            }));

            res.status(200).json(Commandes)

        } catch (error) {
            console.log("Error getAllCommandes:", error.message);
            res.status(500).send('Error getAllCommandes: ' + error.message);
        }
    }

    static async deleteCommande(req, res) {
        const { id } = req.body;
        //  const {id} = req.params

        try {
            if (!id) {
                res.status(402).send({ error: "id not given." });
                return;
            }

            const stateRow = await CommandeModel.getCommandeStatus(id);

            if (stateRow.length <= 0) {
                res.status(404).send({ error: "NOT FOUND" });
                return;
            }

            const state = stateRow.etat
            if (state == 'attente') {

                let receipt = await CommandeModel.getReceipt(id);
                receipt = "../" + receipt
                receipt = path.join(__dirname, receipt)
                try {
                    if (fs.existsSync(receipt)) {
                        fs.unlink(receipt, (err) => {
                            if (err) {
                                console.error('Error deleting file:', err);
                            } else {
                            }
                        })
                    } else {
                        console.error('File does not exist:', filePath);
                    }

                } catch (error) {
                    console.log(error);
                }

                await CommandeModel.deleteById(id);
                res.send({ message: "deleted" });


            } else {
                res.status(401).send({ message: "can't delete" });
            }
        } catch (e) {
            res.status(500).send({ message: "INTERNAL ERROR" });
            console.log(e);
        }
    }

    static async getReviewCommande(req, res) {
        const commandes = await CommandeModel.getUnreviewed()
        return res.status(200).send(commandes);
    }

    static async validateCommande(req, res) {
        try {
            const { id_commande, date_livr, id_admin, email } = req.body;

            const current_commande = await CommandeModel.getById(id_commande);

            if (new Date(current_commande.date_commande) >= new Date(date_livr)) {
                throw new Error("date livraison invalide");
            }

            const results = await CommandeModel.validate(id_commande, date_livr, id_admin);
            const options = { year: "numeric", month: "short", day: "numeric" };

            if (results) {
                sendmail(email,
                    "Validation de commande CHOPAIN",
                    `<p>Merci d'avoir choisi Chopain !</p>
                <p>Votre commande a été approuvée par un administrateur [ID: ${id_admin}] et sera livrée le ${new Date(date_livr).toLocaleDateString(
                        "fr-MA",
                        options
                    )}.</p>
                <p>Nous espérons que vous apprécierez votre achat. Si vous avez des questions, n'hésitez pas à nous contacter au 0500000000.</p>
                `)
                return res.status(200).json({
                    message: "validated"
                })
            } else {
                res.status(500).json({
                    message: "ERROR VALIDATING THE COMMANDE"
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message)
        }


    }

    static async refuseCommande(req, res) {
        const { id_commande, motif, id_admin, email } = req.body;
        const id_payment = await CommandeModel.refuse(id_commande, motif, id_admin);
        if (id_payment) {
            try {
                // Retrieve the checkout session
                const session = await stripe.checkout.sessions.retrieve(id_payment);
                const paymentIntentId = session.payment_intent;

                const refund = await stripe.refunds.create({
                    payment_intent: paymentIntentId
                });

                console.log(`Refund created successfully: ${refund.id}`);
            } catch (error) {
                console.error('Error creating refund:', error.message);
            }
        } else {
            return res.status(500).json({
                message: "ERROR VALIDATING THE COMMANDE"
            })
        }

        if (id_payment) {
            sendmail(email,
                "Rejection de commande CHOPAIN",
                `<p>Nous regrettons de vous informer que votre commande a été rejetée par un administrateur [ID: ${id_admin}].</p>
                <p>MOTIF : ${motif}</p>
                <p>Si vous avez des questions ou des préoccupations, n'hésitez pas à nous contacter au 0500000000.</p>
                `,)
            return res.status(200).json({
                message: "validated"
            })
        } else {
            return res.status(500).json({
                message: "ERROR VALIDATING THE COMMANDE"
            })
        }
    }

    static async getReviewedByAdmin(req, res) {

        if (!req.user.id) {
            console.log("userContr : no user id provided");
            res.status(402).json({ message: "missing params" });
            return
        }

        const results = await CommandeModel.getReviewedByAdmin(req.user.id)
        console.log(results);
        res.status(200).send(results)
    }

    static async getRecent(req, res){
        if (!req.user.id) {
            console.log("userContr : no user id provided");
            res.status(402).json({ message: "missing params" });
            return
        }

        const results = await CommandeModel.getRecent(req.user.id)
        console.log(results);
        res.status(200).send(results)
    }

    static async numCommande(req, res){
        if (!req.user.id) {
            console.log("userContr : no user id provided");
            res.status(402).json({ message: "missing params" });
            return
        }

        const results = await CommandeModel.numCommande()
        console.log(results);
        res.status(200).json(results)
    }


    static async promoteuser(req, res) {
        const { id } = req.body;

        if (!id || !req.user.id) {
            console.log("promoteuser : not enough params");
            res.status(402).json({ message: "missing params" });
            return
        }

        try {
            const resul = await UserModel.promote(id, req.user.id)

            resul ? res.status(200).send(resul) : res.status(500).send({ message: "internal server error" })

        } catch (error) {
            console.log(error);
            res.status(500).send(error)
        }

    }

    static async demoteuser(req, res) {
        const { id } = req.body;

        if (!id || !req.user.id) {
            console.log("demoteuser : not enough params");
            res.status(402).json({ message: "missing params" });
            return
        }

        const user_targer = await UserModel.getByID(id)

        if (user_targer.promoted_by !== req.user.id) {
            console.log("demoteuser : unAuthorized");
            res.status(401).json({ message: "unAuthorized" });
            return
        }

        const children = await UserModel.getPromoterchChildren(id);

        try {
            const resul = await UserModel.demote(id)

            for (const child of children) {
                UserModel.promote(child.id, req.user.id);
            }

            resul ? res.status(200).send(resul) : res.status(500).send({ message: "internal server error" })

        } catch (error) {
            console.log(error);
            res.status(500).send(error)
        }

    }
}

module.exports = UserController