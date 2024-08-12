class RateLimiter {
    private requests: number[] = [];
    private readonly maxRequests: number;
    private readonly interval: number;
  
    constructor(maxRequests: number, interval: number) {
      this.maxRequests = maxRequests;
      this.interval = interval;
    }
  
    async scheduleRequest(fn: () => Promise<any>): Promise<any> {
      while (this.requests.length >= this.maxRequests) {
        const now = Date.now();
        if (now - this.requests[0] > this.interval) {
          this.requests.shift();
        } else {
          await new Promise(resolve => setTimeout(resolve, this.interval - (now - this.requests[0])));
        }
      }
  
      this.requests.push(Date.now());
      return fn();
    }
  }
  
  export const rateLimiter = new RateLimiter(2, 1000); // 2 requests per second
  export const burstLimiter = new RateLimiter(30, 60000); // 30 requests per 60 seconds
  