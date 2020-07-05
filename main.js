const http = require('http');
const fs = require('fs');
const { promisify } = require('util');

const stats = promisify(fs.stat);

http.createServer(async (req, res) => {
    if(req.method === 'GET' && req.url === '/video') {
        const path = './frozen2.mkv'
        const stat = await stats(path)
        const fileSize = stat.size
        const range = req.headers.range
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1] 
                ? parseInt(parts[1], 10)
                : fileSize-1
            const chunksize = (end-start)+1
            const file = fs.createReadStream(path, {start, end})
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/x-matroska',
            }
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/x-matroska',
            }
            res.writeHead(200, head)
            fs.createReadStream(path).pipe(res)
        }
    }
}).listen(6789)

console.log('servidor rodando ok!')