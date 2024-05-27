const db = require("../config/db")

class CategoryModel {


    static async getAll(){

        return new Promise((resolve, reject) => {

            db.query("SELECT * FROM categorie", (err, res) => {
                if (err) {
                    reject(err);  
                } else {
                    resolve(res);  
                }
            });
        });
        
    }
    


}

module.exports = CategoryModel