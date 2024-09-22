const http = require('http');
const fs = require('fs/promises'); // Use promises version of fs
const path = require('path');

const PORT = 3000;
const dataPath = path.join(__dirname, 'data.json');

// **Read Data**
async function readData() {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return [];
    }
}

// **Create Server**
const server = http.createServer(async (req, res) => {
    // Set response headers
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'POST' && req.url === '/api/data') {
        // Handle Create Data
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });
        req.on('end', async () => {
            const newData = JSON.parse(body);
            try {
                const data = await readData();
                data.push(newData);
                await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
                res.writeHead(201);
                res.end(JSON.stringify(newData)); // Send back the created data
            } catch (error) {
                console.error('Error creating data:', error);
                res.writeHead(500);
                res.end(JSON.stringify({ message: 'Error creating data' }));
            }
        });
    } else if (req.method === 'GET' && req.url === '/api/data') {
        // Handle Read All Data
        try {
            const data = await readData();
            res.writeHead(200);
            res.end(JSON.stringify(data)); // Send back all data
        } catch (error) {
            console.error('Error reading data:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ message: 'Error reading data' }));
        }
    } else if (req.method === 'PUT' && req.url.startsWith('/api/data/')) {
        // Handle Update Data
        const id = parseInt(req.url.split('/').pop());
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });
        req.on('end', async () => {
            const updatedData = JSON.parse(body);
            
            try {
                const data = await readData();
                const index = data.findIndex(item => item.id === id);
                
                if (index !== -1) {
                    data[index] = { ...data[index], ...updatedData };
                    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
                    res.writeHead(200);
                    res.end(JSON.stringify(data[index])); // Send back the updated item
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ message: 'Item not found' }));
                }
            } catch (error) {
                console.error('Error updating data:', error);
                res.writeHead(500);
                res.end(JSON.stringify({ message: 'Error updating data' }));
            }
        });
    } else if (req.method === 'DELETE' && req.url.startsWith('/api/data/')) {
        // Handle Delete Data
        const id = parseInt(req.url.split('/').pop());
        
        try {
            const data = await readData();
            const newData = data.filter(item => item.id !== id);
            
            await fs.writeFile(dataPath, JSON.stringify(newData, null, 2));
            res.writeHead(200);
            res.end(JSON.stringify({ message: `Data deleted with ID: ${id}` }));
        } catch (error) {
            console.error('Error deleting data:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ message: 'Error deleting data' }));
        }
    } else {
        // Handle 404 Not Found
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});