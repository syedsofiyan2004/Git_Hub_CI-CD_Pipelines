const request = require('supertest');
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('Hello from our container! Version: 1.0.0. Deployed automatically! Hello Sofiyan Bro Etlunnav Mawa');
});

describe('GET /', () => {
  it('responds with hello message', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Hello from our container!');
  });
});
