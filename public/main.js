document.getElementById('scrape-button').addEventListener('click', async () => {
    const url = document.getElementById('url-input').value;
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    document.getElementById('scrape-button').disabled = true;

    try {
        const response = await fetch(`/api/results?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch results');
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        document.getElementById('scrape-button').disabled = false;
    }
});

function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (data.length === 0) {
        resultsContainer.textContent = 'No results found';
        return;
    }

    data.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        const examNumber = document.createElement('p');
        examNumber.textContent = `Exam Number: ${item.examNumber}`;
        resultItem.appendChild(examNumber);

        const points = document.createElement('p');
        points.textContent = `Points: ${item.points}`;
        resultItem.appendChild(points);

        const division = document.createElement('p');
        division.textContent = `Division: ${item.division}`;
        resultItem.appendChild(division);

        const subjects = document.createElement('p');
        subjects.textContent = 'Subjects:';
        resultItem.appendChild(subjects);

        const subjectsList = document.createElement('ul');
        item.subjects.forEach(subject => {
            const subjectItem = document.createElement('li');
            subjectItem.textContent = `${subject.subject}: ${subject.grade}`;
            subjectsList.appendChild(subjectItem);
        });
        resultItem.appendChild(subjectsList);

        resultsContainer.appendChild(resultItem);
    });
}