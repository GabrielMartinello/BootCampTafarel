const express = require('express');
const exphbs  = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('oloquinho');
const port = 3000;

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS menes (id INTEGER PRIMARY KEY, name TEXT, type TEXT, link TEXT)");
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.get('/', (req, res) => {

  return db.serialize(function() {
    return db.all('SELECT * from menes', [], (err, memes) => {
      if (err) {
        throw err;
      }
      return res.render('home', {
        memes,
      });
    });
  });
});

app.get('/create', (req, res) => {
  return res.render('create');
});

app.post('/create', (req, res) => {
  const { name, type, link } = req.body;

  return db.run('INSERT INTO menes(name, type, link) values (?,?,?)', [
    name,
    type,
    link,
  ], (err) => {
    if (err) {
      throw err;
    }

    return res.render('created');
  });
});

app.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  return db.all('SELECT * from menes where id = ?', [id], (err, rows) => {
    if (err) {
      throw err;
    }
    const meme = rows[0];
    if (!meme) {
      return res.status(404).send("ERRROU!");
    }
    return res.render('edit', {
      meme,
    });
  });
});

app.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const { name, type, link } = req.body;
  return db.run('UPDATE menes SET name = ?, type = ?, link = ? WHERE id = ?', [name, type, link, id], (err) => {
    if (err) {
      throw err;
    }

    return res.render('edited');
  });
});

app.get('/delete/:id', (req, res) => {
  const id = req.params.id;
  return db.run("DELETE from menes where id = ?", [id], (err) => {
    if (err) {
      throw err;
    }

    return res.render('deleted');
  });
});

app.get('/:id', (req, res) => {
  const id = req.params.id;

  return db.all('SELECT * from menes where id = ?', [id], (err, rows) => {
    if (err) {
      throw err;
    }
    const meme = rows[0];
    if (!meme) {
      return res.status(404).send("ERRROU!");
    }
    return res.render('view', {
      meme,
    });
  });
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

