import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Разогрев: повышаем до 20 пользователей за 30 секунд
    { duration: '1m', target: 20 },  // Нагрузка: держим 20 пользователей в течение 1 минуты
    { duration: '30s', target: 0 },  // Спад: постепенно снижаем до 0 за 30 секунд
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% запросов должны выполняться быстрее 500ms
    http_req_failed: ['rate<0.01'],   // Менее 1% запросов могут завершиться с ошибкой
  },
};

const BASE_URL = 'http://localhost:3001';
const ENDPOINTS = {
  tours: `${BASE_URL}/tour`,
  foodCategories: `${BASE_URL}/food-category`,
};

export default function () {
  let toursResponse = http.get(ENDPOINTS.tours);
  check(toursResponse, {
    'tours status is 200': (r) => r.status === 200,
    'tours response time < 200ms': (r) => r.timings.duration < 200,
  });

  let foodCategoriesResponse = http.get(ENDPOINTS.foodCategories);
  check(foodCategoriesResponse, {
    'food categories status is 200': (r) => r.status === 200,
    'food categories response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
} 