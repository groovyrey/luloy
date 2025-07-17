const rateLimitMap = new Map();

export function rateLimit(ip, limit = 5, windowMs = 60 * 1000) { // 5 requests per minute by default
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];

  // Filter out expired requests
  const validRequests = requests.filter(timestamp => timestamp > now - windowMs);

  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);

  if (validRequests.length > limit) {
    return { allowed: false, resetTime: validRequests[0] + windowMs };
  }

  return { allowed: true, remaining: limit - validRequests.length };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > now - (60 * 1000)); // Use the default windowMs
    if (validRequests.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, validRequests);
    }
  }
}, 30 * 1000); // Clean up every 30 seconds
