class RateLimiter {
    private requests: number[] = [];
    private readonly maxRequests: number;
    private readonly interval: number;
  
    constructor(maxRequests: number, interval: number) {
      this.maxRequests = maxRequests;
      this.interval = interval;
    }

    private cleanupOldRequests(now: number) {
      while (this.requests.length > 0 && now - this.requests[0] > this.interval) {
        this.requests.shift();
      }
    }
  
    async scheduleRequest(fn: () => Promise<any>): Promise<any> {
      return new Promise(async (resolve, reject) => {
        const attemptRequest = async () => {
          const now = Date.now();
          this.cleanupOldRequests(now);
  
          if (this.requests.length < this.maxRequests) {
            this.requests.push(now);
            try {
              const result = await fn();
              resolve(result);
            } catch (error) {
              reject(error);
            }
          } else {
            const waitTime = this.interval - (now - this.requests[0]);
            setTimeout(attemptRequest, waitTime);
          }
        };
  
        await attemptRequest();
      });
  }
}
  
export const rateLimiter = new RateLimiter(2, 1000); // 2 requests per second
export const burstLimiter = new RateLimiter(30, 60000); // 30 requests per 60 seconds