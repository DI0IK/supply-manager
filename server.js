const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.DEV === 'true';
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	createServer(
		{
			cert: fs.readFileSync(process.cwd() + '/certs/cert.pem'),
			key: fs.readFileSync(process.cwd() + '/certs/key.pem'),
			passphrase: 'localhost',
		},
		async (req, res) => {
			try {
				const parsedUrl = parse(req.url, true);

				await handle(req, res, parsedUrl);
			} catch (err) {
				console.error('Error occurred handling', req.url, err);
				res.statusCode = 500;
				res.end('internal server error');
			}
		}
	).listen(port, (err) => {
		if (err) throw err;
		console.log(`> Ready on https://${hostname}:${port}`, '\n', 'DEV:', dev || 'false');
	});
});
