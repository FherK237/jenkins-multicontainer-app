const request = require('supertest');
const { app } = require('../../src/app');

describe('Pruebas Unitarias - API', () => {
  test('GET /health debe retornar estado saludable', async () => {
    const response = await request(app).get('/health').expect(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('POST /users debe crear un usuario', async () => {
    const userData = { name: 'Juan Pérez', email: 'juan@ejemplo.com' };
    const response = await request(app).post('/users').send(userData).expect(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(userData.name);
    expect(response.body.email).toBe(userData.email);
  });
});//asdasdadasd