import requests
import time
import os

API_URL = 'http://localhost:8002/api/v1'

print('Warming up ZPD Engine API...')
requests.post(f'{API_URL}/zpd/next', json={'user_id': 'u1', 'current_topic': 'Animals'})

print('Testing ZPD Engine API...')
start = time.time()
res = requests.post(f'{API_URL}/zpd/next', json={'user_id': 'u1', 'current_topic': 'Animals'})
latency = (time.time() - start) * 1000
print(f'ZPD Response ({latency:.2f}ms):', res.json())
assert latency < 200, f'Latency too high: {latency:.2f}ms'

print('\nTesting Assessment Limits API...')
import uuid
test_user = f"u_{uuid.uuid4().hex[:6]}"

for i in range(1, 4):
    res = requests.post(f'{API_URL}/assessments/register', json={'user_id': test_user, 'test_type': 'strict_self'})
    print(f'Attempt {i}: Status {res.status_code} - {res.json()}')
    if i == 3:
        assert res.status_code == 403, '3rd attempt was not rejected!'

print('\nAll tests passed successfully!')
