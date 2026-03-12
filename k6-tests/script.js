import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const latencyTrend = new Trend('latency');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  
    { duration: '1m', target: 50 },   
    { duration: '30s', target: 0 },   
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], 
    'errors': ['rate<0.01'],            
  },
};

export default function () {
  const baseUrl = __ENV.TARGET_URL || 'http://httpbin.performance-test.svc.cluster.local';

  let res = http.get(`${baseUrl}/get`);
  let checkRes = check(res, {
    'status is 200': (r) => r.status === 200,
  });
  errorRate.add(!checkRes);
  latencyTrend.add(res.timings.duration);
  
  const payload = JSON.stringify({ hello: 'world' });
  res = http.post(`${baseUrl}/post`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  checkRes = check(res, {
    'status is 200': (r) => r.status === 200,
    'response has hello': (r) => r.json().json.hello === 'world',
  });
  errorRate.add(!checkRes);
  latencyTrend.add(res.timings.duration);
  
  sleep(1);
}