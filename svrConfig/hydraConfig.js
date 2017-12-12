module.exports = {
    "hydra": {
    "serviceName": "nodeMon",
    "serviceIP": "",
    "servicePort": process.env.HYDRAPORT,
    "serviceType": "",
    "serviceDescription": "",
    "redis": {
      "url": process.env.REDISLAB,
      "port": process.env.REDISLABPORT,
      "db": 0
    }
    }
};