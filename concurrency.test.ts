import axios from 'axios';

const API_URL = 'http://localhost:3000';

describe('Concurrency Test', () => {
  beforeEach(async () => {
    // Reset the counter before each test
    await axios.post(`${API_URL}/reset`);
  });

  it('should increment safely to the limit under high concurrency using optimistic locking', async () => {
    const promises = [];
    const numberOfRequests = 150;

    // Send many requests concurrently
    for (let i = 0; i < numberOfRequests; i++) {
      promises.push(axios.post(`${API_URL}/increment-safe`));
    }

    // Wait for all requests to settle
    await Promise.allSettled(promises);

    // Check the final value
    const response = await axios.get(`${API_URL}/get/counter`);
    const finalValue = parseInt(response.data.value, 10);

    // The final value should be exactly the limit
    expect(finalValue).toBe(100);
  }, 20000); // Increased timeout for this high-contention test
});
