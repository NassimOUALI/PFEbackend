const db = require("../config/db")

class CityModel{

    static async getAllCityNames() {
        return new Promise((resolve, reject) => {
            db.query("SELECT city FROM cities ORDER BY city;", (err, res) => {
                if (err) {
                    reject(err);  
                } else {
                    resolve(res);  
                }
            })
        })
    }

}

module.exports = CityModel