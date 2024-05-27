const db = require("../config/db")
const bcrypt = require('bcrypt');
const saltRounds = 10;

class UserModel {

    static async getAll() {

        return new Promise((resolve, reject) => {
            db.query("SELECT u1.*, u2.username AS promoted_by_username FROM users u1 LEFT JOIN users u2 ON u1.promoted_by = u2.id;", (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    static async checkEmailOrUsername(username, email) {

        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    if (res.lenght > 0) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            })
        })

    }

    static async getByUsername(username) {

        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE username = ?", [username], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res[0]);
                }
            })
        })

    }

    static async getByEmail(email) {

        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE email = ?", [email], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res[0]);
                }
            })
        })

    }

    static async getByID(id) {

        return new Promise((resolve, reject) => {
            db.query("SELECT username, promoted_by, nom, prenom, telephone, email, adresse, ville, role FROM users WHERE id = ?", [id], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res[0]);
                }
            })
        })

    }

    static async verifyUserPassword(user_pass, password) {
        return bcrypt.compare(password, user_pass);
    }

    static async addUser(username, password, nom, prenom, tele, email, adress, city) {
        try {
            // hashage du password
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // insertion du user
            return new Promise((resolve, reject) => {
                db.query(
                    "INSERT INTO users (username, password, nom, prenom, telephone, email, adresse, ville) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [username, hashedPassword, nom, prenom, tele, email, adress, city],
                    (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(true);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Error hashing password: ', error);
            throw new Error('Failed to hash password');
        }
    }

    static async deleteUser(username) {
        return new Promise((resolve, reject) => {
            db.query("DELETE FROM users WHERE username = ?", [username], (err, result) => {
                if (err) {
                    reject(err);  // Reject with the error object for more informative error handling
                } else {
                    if (result.affectedRows === 0) {
                        resolve(false);  // Resolve with false if no rows were affected (i.e., no user found)
                    } else {
                        resolve(true);  // Resolve with true if the deletion was successful
                    }
                }
            });
        });
    }

    static async promote(id, id_prom){
        return new Promise((resolve, reject)=>{
            db.query("UPDATE users SET role = ?, promoted_by = ? WHERE id = ?",
                ["ADMIN", id_prom, id],
                (err,res)=>{
                    if(err){
                        reject(false)
                    }else{
                        resolve(true)
                    }
                }
            )
        })
    }

    static async demote(id){
        return new Promise((resolve, reject)=>{
            db.query("UPDATE users SET role = ?, promoted_by = ? WHERE id = ?",
                ["USER", null, id],
                (err,res)=>{
                    if(err){
                        reject(false)
                    }else{
                        resolve(true)
                    }
                }
            )
        })
    }

    static async getPromoterchChildren(id){
        return new Promise((resolve, reject)=>{
            db.query("SELECT * FROM users WHERE promoted_by = ?",
                [id],
                (err,res)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(res);
                    }
                }
            )
        })
    }

}

module.exports = UserModel