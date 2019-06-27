const sqlite = require("sqlite3");
const DBSOURCE = 'db.sqlite';

export let db = new sqlite.Database(DBSOURCE, (err) => {
   if (err) {
       console.log(err);
       throw err
   } else {
       db.run(`CREATE TABLE IF NOT EXISTS user (
       name TEXT PRIMARY KEY,
       password TEXT
       )`, (err) => {
           if (err) {
               console.log(err);
           } else {
               db.run('INSERT INTO user (name, password) VALUES ("admin", "admin")', (err) => {});
           }

       }).run(`CREATE TABLE IF NOT EXISTS scenario (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       owner TEXT NOT NULL,
       name TEXT UNIQUE,
       descr TEXT,
       file LONGTEXT,
       FOREIGN KEY(owner) REFERENCES user(name)
       )`, (err) => {
           if (err) console.log(err);
       }).run(`CREATE TABLE IF NOT EXISTS session (
       secret TEXT PRIMARY KEY, 
       valid_time INTEGER NOT NULL)`, (err) => {
           if (err) console.log(err)
       })
   }
});
