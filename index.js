const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

async function getResults(url) {
    try {
        const response = await axios.get(url);

        // Check if response is not HTML
        if (!response.headers['content-type'].includes('text/html')) {
            throw new Error('Response is not HTML');
        }

        const data = response.data;
        const $ = cheerio.load(data);
        const results = [];

        // Select the required table
        const table = $('table').eq(2);

        table.find('tbody tr').each((index, element) => {
            const examNumber = $(element).find('td').eq(0).text().trim();
            const points = parseInt($(element).find('td').eq(2).text().trim(), 10);
            const division = $(element).find('td').eq(3).text().trim();
            const detailedSubjects = $(element).find('td').eq(4).text().trim();

            // Extract subject grades efficiently using a single loop and regex
            const subjectRegex = /([A-Z\/]+) - '([A-F])'/gi; // Case-insensitive global match
            const subjectsData = [];
            let match;

            while ((match = subjectRegex.exec(detailedSubjects)) !== null) {
                subjectsData.push({ subject: match[1], grade: match[2] });
            }

            if (subjectsData.length === 0) {
                subjectsData.push({ subject: 'N/A', grade: 'N/A' }); // Handle no subject data
            }

            results.push({
                examNumber,
                points,
                division,
                subjects: subjectsData,
            });
        });

        // Write the data to a JSON file
        fs.writeFileSync('scrapedData.json', JSON.stringify(results, null, 2), 'utf-8');
        console.log('Data successfully written to scrapedData.json');

        return results; //return results data
    } catch (error) {
        console.error('Error scraping necta results: ', error);
        return [];
    }
}

// Endpoint to get the scraped data
app.get('/api/results', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const results = await getResults(url);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
