const redisClient = require("../db/connectToRedis");

const invalidatePostCache = async (input) => {
  const cachedKey = `post:${input}`;
  await redisClient.del(cachedKey);
  const keys = await redisClient.keys("posts:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

module.exports = { invalidatePostCache };
