import axios from 'axios';

const API_URL = 'http://localhost:3000';

describe('Concurrency Test', () => {
  beforeEach(async () => {
    // Reset the counter before each test
    await axios.post(`${API_URL}/reset`);
  });

  it('should demonstrate a race condition (final value should NOT be 100)', async () => {
    const promises = [];
    const numberOfRequests = 150;

    for (let i = 0; i < numberOfRequests; i++) {
      promises.push(axios.post(`${API_URL}/increment-unsafe`));
    }

    await Promise.allSettled(promises);

    const response = await axios.get(`${API_URL}/get/counter`);
    const finalValue = parseInt(response.data.value, 10);

    console.log(`Final counter value (unsafe): ${finalValue}`);
    // This test PASSES if the final value is NOT 100, proving the race condition exists.
    expect(finalValue).not.toBe(100);
  }, 20000);

  it('should increment safely to the limit under high concurrency using optimistic locking', async () => {
    const promises = [];
    const numberOfRequests = 150;

    for (let i = 0; i < numberOfRequests; i++) {
      promises.push(axios.post(`${API_URL}/increment-safe`));
    }

    await Promise.allSettled(promises);

    const response = await axios.get(`${API_URL}/get/counter`);
    const finalValue = parseInt(response.data.value, 10);

    console.log(`Final counter value (safe): ${finalValue}`);
    // This test PASSES if the final value is EXACTLY 100.
    expect(finalValue).toBe(100);
  }, 20000);
});
