const request = require('supertest');
const app = require('../src/app');

describe('Health Check & App Initialization Tests', () => {
  it('GET / should return basic service information', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ONLINE');
    expect(res.body.name).toBe('SmartQueue Centralized Backend API');
  });

  it('GET /api/health should return 200 with service health payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.service).toContain('SmartQueue');
    expect(res.body.data.database).toBeDefined();
  });

  it('GET /api/nonexistent should return 404 with error message', async () => {
    const res = await request(app).get('/api/nonexistent-endpoint-123');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Endpoint not found');
  });
});
