const db = require("../config/db")

class ProductModel {


    static async getAll(){

        return new Promise((resolve, reject) => {

            db.query("SELECT * FROM produit", (err, res) => {
                if (err) {
                    reject(err);  
                } else {
                    resolve(res);  
                }
            });
        });
        
    }
    
    static async getById(id){

        return new Promise((resolve, reject) => {

            db.query("SELECT * FROM produit WHERE id = ?",[id], (err, res) => {
                if (err) {
                    reject(err);  
                } else {
                    resolve(res[0]);  
                }
            });
        });
        
    }


}

module.exports = ProductModel