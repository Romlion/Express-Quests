const database = require('../../database');

const getUsers = (req, res) => {
  const initialSql = 'select * from users';
  const where = [];

  if (req.query.language != null) {
    where.push({
      column: 'language',
      value: req.query.language,
      operator: '=',
    });
  }
  if (req.query.city != null) {
    where.push({
      column: 'city',
      value: req.query.city,
      operator: '=',
    });
  }
  database
    .query(
      where.reduce(
        (sql, { column, operator }, index) => `${sql} ${index === 0 ? 'where' : 'and'} ${column} ${operator} ?`,
        initialSql,
      ),
      where.map(({ value }) => value),
    )
    .then(([users]) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving data from database');
    });
};
const getUserById = (req, res) => {
  const id = parseInt(req.params.id);

  database.query('select * from users where id = ?', [id])
    .then(([users]) => {
      if (users[0] != null) {
        res.json(users[0]);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const postUser = (req, res) => {
  const {
    firstname, lastname, email, city, language,
  } = req.body;

  database.query('INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)', [firstname, lastname, email, city, language])
    .then(([result]) => {
      res.status(201).send({ id: result.insertId });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const updateUser = (req, res) => {
  const {
    firstname, lastname, email, city, language,
  } = req.body;

  database.query('UPDATE user SET firstname = ?, lastname = ?, email = ?, city = ?, language = ? WHERE id = ?', [firstname, lastname, email, city, language])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error('Erreur lors de la mise à jour de l utilisateur :', err);
      res.sendStatus(500);
    });
};

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  database.query('DELETE from users where id = ?', [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

module.exports = {
  getUsers,
  getUserById,
  postUser,
  updateUser,
  deleteUser,
};
