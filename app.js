
const express = require('express');
const fs = require('fs/promises'); // Use promises version of fs
const path = require('path');

const app = express();
const PORT = 3000;
const dataPath = path.join(__dirname, 'data.json');

// Middleware to parse JSON bodies
app.use(express.json());

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

// **Create Data**
app.post('/api/data', async (req, res) => {
    const newData = req.body;
    try {
        const data = await readData();
        data.push(newData);
        await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
        res.status(201).send(newData); // Send back the created data
    } catch (error) {
        console.error('Error creating data:', error);
        res.status(500).send('Error creating data');
    }
});

// **Read All Data**
app.get('/api/data', async (req, res) => {
    try {
        const data = await readData();
        res.send(data); // Send back all data
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).send('Error reading data');
    }
});

// **Update Data**
app.put('/api/data/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const updatedData = req.body;
    
    try {
        const data = await readData();
        const index = data.findIndex(item => item.id === id);
        console.log(data)
        
        if (index !== -1) {
            data[index] = { ...data[index], ...updatedData };
            await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
            res.send(data[index]); // Send back the updated item
        } else {
            res.status(404).send('Item not found');
        }
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).send('Error updating data');
    }
});

// **Delete Data**
app.delete('/api/data/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        const data = await readData();
        const newData = data.filter(item => item.id !== id);
        
        await fs.writeFile(dataPath, JSON.stringify(newData, null, 2));
        res.send(`Data deleted with ID: ${id}`);
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).send('Error deleting data');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});