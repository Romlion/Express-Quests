const request = require('supertest');

const crypto = require('node:crypto');
const app = require('../src/app');
const database = require('../database');

afterAll(() => database.end());

describe('GET /api/users', () => {
  it('should return all users', async () => {
    try {
      const response = await request(app).get('/api/users');

      expect(response.headers['content-type']).toMatch(/json/);

      expect(response.status).toEqual(200);
    } catch (error) {
      fail(error);
    }
  });
});

describe('GET /api/users/:id', () => {
  it('should return one user', async () => {
    const response = await request(app).get('/api/users/1');

    expect(response.headers['content-type']).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it('should return no user', async () => {
    const response = await request(app).get('/api/users/0');

    expect(response.status).toEqual(404);
  });
});

describe('POST /api/users', () => {
  it('should return created user', async () => {
    const newUser = {
      firstname: 'Luc',
      lastname: 'Skywolker',
      email: `${crypto.randomUUID()}@wild.co`,
      city: 'Tatouine',
      language: 'English',
    };

    const response = await request(app).post('/api/users').send(newUser);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe('number');

    const [result] = await database.query(
      'SELECT * FROM users WHERE id=?',
      response.body.id,
    );

    const [userInDatabase] = result;

    expect(userInDatabase).toHaveProperty('id');

    expect(userInDatabase).toHaveProperty('firstname');
    expect(userInDatabase.firstname).toStrictEqual(newUser.firstname);
  });

  it('should return an error', async () => {
    const userWithMissingProps = { firstname: 'Obiwan' };

    const response = await request(app)
      .post('/api/users')
      .send(userWithMissingProps);

    expect(response.status).toEqual(500);
  });
});

describe('PUT /api/users/:id', () => {
  it('should edit user', async () => {
    const newUser = {
      firstname: 'Luc',
      lastname: 'Skywolker',
      email: `${crypto.randomUUID()}@wild.co`,
      city: 'Tatouine',
      language: 'English',
    };

    const [result] = await database.query(
      'INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)',
      [newUser.firstname, newUser.lastname, newUser.email, newUser.city, newUser.language],
    );

    const id = result.insertId;

    const updateUser = {
      firstname: 'Lea',
      lastname: 'Sky',
      email: `${crypto.randomUUID()}@wild.co`,
      city: 'Tatone',
      language: 'English',
    };

    const response = await request(app)
      .put(`/api/users/${id}`)
      .send(updateUser);

    expect(response.status).toEqual(204);

    const [users] = await database.query('SELECT * FROM users WHERE id=?', id);

    const [userInDatabase] = users;

    expect(userInDatabase).toHaveProperty('id');

    expect(userInDatabase).toHaveProperty('firstname');
    expect(userInDatabase.firstname).toStrictEqual(updateUser.firstname);

    expect(userInDatabase).toHaveProperty('lastname');
    expect(userInDatabase.lastname).toStrictEqual(updateUser.lastname);

    expect(userInDatabase).toHaveProperty('email');
    expect(userInDatabase.email).toStrictEqual(updateUser.email);

    expect(userInDatabase).toHaveProperty('city');
    expect(userInDatabase.city).toStrictEqual(updateUser.city);

    expect(userInDatabase).toHaveProperty('language');
    expect(userInDatabase.language).toStrictEqual(updateUser.language);
  });

  it('should return an error', async () => {
    const userWithMissingProps = { firstname: 'Harry' };

    const response = await request(app)
      .put('/api/users/1')
      .send(userWithMissingProps);

    expect(response.status).toEqual(500);
  });

  it('should return no user', async () => {
    const newUser = {
      firstname: 'Luc',
      lastname: 'Skywolker',
      email: `${crypto.randomUUID()}@wild.co`,
      city: 'Tatouine',
      language: 'English',
    };

    const response = await request(app).put('/api/users/0').send(newUser);

    expect(response.status).toEqual(404);
  });
});
