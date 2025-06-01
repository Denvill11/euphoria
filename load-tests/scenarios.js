  import http from 'k6/http';
  import { check, sleep, group } from 'k6';
  import { SharedArray } from 'k6/data';
  import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

  export const options = {
    scenarios: {
      browse_content: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '1m', target: 20 },
          { duration: '3m', target: 20 },
          { duration: '1m', target: 0 },
        ],
        gracefulRampDown: '30s',
      },
      create_tours: {
        executor: 'constant-vus',
        vus: 5,
        duration: '5m',
        startTime: '30s',
      },
    },
    thresholds: {
      http_req_duration: ['p(95)<1000'],
      http_req_failed: ['rate<0.02'],
      'group_duration{group:::browse}': ['avg < 2000'],
      'group_duration{group:::auth}': ['avg < 3000'],
      'group_duration{group:::create_tour}': ['avg < 4000'],
    },
  };

  const BASE_URL = 'http://localhost:3001';

  // Тестовые данные
  const TEST_USERS = new SharedArray('test users', function () {
    return [
      { email: 'test1@example.com', password: 'password123' },
      { email: 'test2@example.com', password: 'password123' },
      { email: 'test3@example.com', password: 'password123' },
    ];
  });

  export default function () {
    const user = TEST_USERS[__VU % TEST_USERS.length];
    let authToken;

    group('auth', function () {
      const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        email: user.email,
        password: user.password,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });

      check(loginRes, {
        'login successful': (r) => r.status === 200,
        'has access token': (r) => JSON.parse(r.body).token !== undefined,
      });

      if (loginRes.status === 200) {
        authToken = JSON.parse(loginRes.body).token;
      }
    });

    group('browse', function () {
      const responses = http.batch([
        ['GET', `${BASE_URL}/tour`],
        ['GET', `${BASE_URL}/food-category`],
      ]);

      responses.forEach((res) => {
        check(res, {
          'status is 200': (r) => r.status === 200,
          'response time < 500ms': (r) => r.timings.duration < 500,
        });
      });
    });

    if (authToken) {
      group('create_tour', function () {
        const payload = {
          title: `Test Tour ${randomString(8)}`,
          description: 'Load test tour description',
          price: Math.floor(Math.random() * 1000) + 100,
          duration: Math.floor(Math.random() * 10) + 1,
          maxParticipants: Math.floor(Math.random() * 20) + 5,
          categoryId: 1,
          foodCategoryIds: [1],
        };

        const createTourRes = http.post(
          `${BASE_URL}/tour`,
          JSON.stringify(payload),
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
          }
        );

        check(createTourRes, {
          'tour created successfully': (r) => r.status === 201,
          'create tour response time < 1000ms': (r) => r.timings.duration < 1000,
        });
      });
    }

    sleep(Math.random() * 3 + 1); // Случайная пауза 1-4 секунды
  } 