const express = require("express");
const formidable = require('express-formidable');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');
const fs = require('fs')
const app = express();

const database = require('./database');

interface Session {
    secret: string;
    user: string;
}

async function startSession(user: string): Promise<Session> {
    let session = {user: user, secret: uuid.v4()};
    return new Promise((resolve, reject) => {
        database.db.run(`INSERT INTO session VALUES (?,?)`, [session.secret, Date.now() + 15 * 60000],
                err => {
                    if (err) reject(err);
                    else resolve(session);
                });
    });
}

async function checkSession(secret: string) {
    return new Promise((resolve, reject) => {
        database.db.all(`SELECT valid_time FROM session WHERE secret = ?`, [secret], (err, rows) => {
            if (err) {
                return reject(err)
            } else {
                return resolve(rows.length == 1 && rows[0].valid_time > Date.now())
            }
            });
    });
}

function authenticate(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        database.db.all('SELECT * FROM user WHERE name == ?',[username], (err, row) => {
            if (err)
                reject(err);
            else {
                if (row.length < 1) {
                    resolve(false)
                } else if (row[0].password == password) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        })
    })
}

async function logged(cookies) {
    return cookies.my_session
        && cookies.my_session.secret
        && await checkSession(cookies.my_session.secret)
}

function getUser(req) {
    return req.cookies.my_session.user
}

async function requireAuth(req, res, next) {
    if (req.cookies && await logged(req.cookies)) {
        return next();
    } else {
        res.redirect('/game/form.html')
    }
}

async function getScenarioById(id) {
    return new Promise((resolve, reject) => {
        database.db.all(`SELECT file FROM scenario WHERE id = (?)`, [id], (err, rows) => {
            if (err) {
                return reject(err)
            } else {
                if (rows.length < 0) return reject();
                else {
                    resolve(rows[0].file)
                }
            }
        })
    })
}

async function getScenariosByUser(user: string) {
    return new Promise(((resolve, reject) => {
        database.db.all(`SELECT id, name, descr FROM scenario WHERE owner = ?`, [user], (err, rows) => {
            if (err) {
                return reject(err)
            } else {
                return resolve(rows)
            }
        })
    }))
}

async function getAllScenarios() {
    return new Promise(((resolve, reject) => {
        database.db.all(`SELECT id, name, owner, descr FROM scenario`, (err, rows) => {
            if (err) {
                return reject(err)
            } else {
                return resolve(rows)
            }
        })
    }))
}

async function loadFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, {encoding: 'utf8'}, (err, data) => {
            if (err) {
                return reject(err);
            } else {
                resolve(data);
            }
        })
    });
}

async function insertScenario(user: string, name: string, description: string, content: string) {
    return new Promise((resolve, reject) => {
        database.db.run(`INSERT INTO scenario (owner, name, descr, file) VALUES (?, ?, ?, ?)`,
        [user, name, description, content], (err => {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
            }))
    })
}

async function deleteScenario(id) {
    return new Promise((resolve, reject) => {
        database.db.run(`DELETE FROM scenario WHERE id = (?)`, [id], err => {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
        })
    })
}

app.use(formidable());
app.use(cookieParser());
app.use('/game', express.static('dist/game'));
app.use('/cockpit.html', [requireAuth, express.static('dist/cockpit.html')]);

app.get('/scenarios/user', requireAuth, async (req, res) => {
    let scenarios = await getScenariosByUser(getUser(req));
    res.json(scenarios)
});

app.get('/scenarios', async (req, res) => {
    let scenarios = await getAllScenarios();
    res.json(scenarios)
});

app.post('/scenarios', requireAuth, async (req, res) => {
    if (req.fields.scenario_name && req.fields.scenario_description && req.files.scenario_file) {
        let name = req.fields.scenario_name;
        let description = req.fields.scenario_description;
        if (name.length > 0 && description.length > 0) {
            await insertScenario(getUser(req), name, description, await loadFile(req.files.scenario_file.path))
        }
    }
    res.redirect('/cockpit.html');
});

app.delete('/scenarios/:id', requireAuth, async (req, res) => {
    try {
        await deleteScenario(req.params.id);
        res.status(200).send();
    } catch (e) {
        res.status(401).send(e);
    }
});

app.get('/scenarios/:id', async (req, res) => {
    try {
        let scenario = await getScenarioById(req.params.id);
        res.send(scenario);
    } catch (e) {
        res.status(404).send(e);
    }
});

app.post('/login', async (req, res) => {
    if (req.fields.user && req.fields.password && await authenticate(req.fields.user, req.fields.password)) {
        let session = await startSession(req.fields.user);
        res.cookie("my_session", session, {httpOnly: true});
        res.redirect('/cockpit.html')
    } else {
        res.status(401).redirect('/game/form.html')
    }
});

app.listen(8888);