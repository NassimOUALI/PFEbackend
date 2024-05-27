const CategoryModel = require('../model/Categorie')


class CategoryController {

    static async getAllCategorys(req, res) {

        try {
            let results = await CategoryModel.getAll();
            if (results.length != 0) {
                res.send(results);
            } else {
                res.status(404).send('No Category found.');
            }
        } catch (error) {
            console.log("Error getAllCategorys user:", error.message);
            res.status(500).send('Error getAllCategorys: ' + error.message);
        }
    }
}
module.exports = CategoryController