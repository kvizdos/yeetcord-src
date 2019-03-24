window.onload = function() {
    var tucCTX = document.getElementById('totalUsersChart').getContext('2d');
    var totalUsersChart = new Chart(tucCTX, {
        type: 'line',
        data: {

            labels: ["Janurary", "Feburary", "March", "April", "May", "June"],

            datasets: [{
                label: 'Total Users',
                data: [10, 30, 30, 60, 800, 12943],
                borderColor: '#666666',
                fill: false
            }],
        },
        options: {
            elements: {
                line: {
                    tension: 0 // disables bezier curves
                }
            },
            scales: {
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: "Date"
                        }
                    }
                ]
            }
        }
    });

    totalUsersChart.render();

}

