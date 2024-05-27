const ProduitModel = require('../model/Product')


class ProductController {

    static async getAllProducts(req, res) {

        try {
            let results = await ProduitModel.getAll();
            if (results.length != 0) {
                res.send(results);
            } else {
                res.status(404).send('No Product found.');
            }
        } catch (error) {
            console.log("Error getAllProducts user:", error.message);
            res.status(500).send('Error getAllProducts: ' + error.message);
        }

    }

    static async getById(req, res) {

        console.log("fetching Product...");
        try {
            let Id = req.body.productId

            if (Id) {
                let results = await ProduitModel.getById(Id);

                if (results) {
                    console.log("Got user info : " + Id);
                    res.send(results);
                } else {
                    console.log("User not found:", Id);
                    res.status(404).send("User not found: " + Id);
                }
            }

        } catch (error) {
            console.log("Error getById:", error.message);
            res.status(500).send('Error getById: ' + error.message);
        }

    }

}
module.exports = ProductController