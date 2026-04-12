document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/chart-data');
        if (!response.ok) {
            const statusCard = document.createElement('p');
            statusCard.textContent = 'Unable to load chart data.';
            document.body.appendChild(statusCard);
            return;
        }

        const data = await response.json();

    const activityCtx = document.getElementById('activityChart').getContext('2d');
    new Chart(activityCtx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Messages',
                    data: data.messagesByDay,
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                    tension: 0.35,
                },
                {
                    label: 'Users',
                    data: data.usersByDay,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.18)',
                    fill: true,
                    tension: 0.35,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
            },
        },
    });

    const overviewCtx = document.getElementById('overviewChart').getContext('2d');
    new Chart(overviewCtx, {
        type: 'doughnut',
        data: {
            labels: ['Users', 'Messages'],
            datasets: [
                {
                    data: [data.totalUsers, data.totalMessages],
                    backgroundColor: ['#1d4ed8', '#60a5fa'],
                    hoverOffset: 6,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
            },
        },
    });
    } catch (error) {
        const statusCard = document.createElement('p');
        statusCard.textContent = 'Unable to connect to the backend for chart data.';
        document.body.appendChild(statusCard);
    }
});
