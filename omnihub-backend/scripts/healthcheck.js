import http from 'http';

const PORT = process.env.PORT || 5000;

const options = {
  host: '127.0.0.1',
  port: PORT,
  path: '/health',
  timeout: 3000,
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    console.error(`Healthcheck failed with status code: ${res.statusCode}`);
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error(`Healthcheck request error: ${err.message}`);
  process.exit(1);
});

request.end();
