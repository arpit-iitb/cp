export const Data = {

    series: [{
        name: "No. of hours",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
        color: "#3183FF"
    }],
    options: {
        chart: {
            height: 350,
            type: 'line',
            zoom: {
                enabled: false
            },
            toolbar: {
                show: false
            },
        },
        legend: {
            show: true,
            showForSingleSeries: true,
            labels: {
                colors: ["#001F68"],
                useSeriesColors: false
            }
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 4,
            colors: "#001F68",
            shape: "circle"
        },
        stroke: {
            curve: 'straight'
        },
        grid: {
            borderColor: "#E6F0FF",
            row: {
                opacity: 0.5
            },
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            scrollbar: {
                enabled: true
            }
        },
        tooltip: {
            // @ts-ignore
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const xAxisCategories = w?.globals?.categoryLabels;
                const xAxisValue = xAxisCategories && xAxisCategories[dataPointIndex];
                const value = series[seriesIndex][dataPointIndex];

                return `<div class="w-32 p-2">
                            <span class="text-2xl text-secondary-500">${value} <span class="text-xs">hrs</span></span><br>
                            on <span class="text-gray-500 text-xs">${xAxisValue}</span>
                        </div>`;
            }
        }
    },

};
export const DataBar = {

    series: [{
        name: 'Videos',
        color: "#3183FF",
        data: [44, 55, 41, 67, 22, 43]
    }, {
        name: 'MCQs',
        color: "#001F68",
        data: [13, 23, 20, 8, 13, 27]
    }, {
        name: 'Problems',
        color: "#9B51E0",
        data: [11, 17, 15, 15, 21, 14]
    }, {
        name: 'Assignment',
        color: "#FFC700",
        data: [21, 7, 25, 13, 22, 8]
    }],
    options: {
        chart: {
            height: 350,
            type: 'bar',
            stacked: true,
            colors: ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800'],
            zoom: {
                enabled: true,
                type: 'x',
                resetIcon: {
                    offsetX: -10,
                    offsetY: 0,
                    fillColor: '#fff',
                    strokeColor: '#37474F'
                },
          
            },
            toolbar: {
                show: false
            },
        },
        legend: {
            show: true,
            tooltipHoverFormatter: function (val: any, opts: any) {
                return val + ' - <strong>' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '</strong>'
            }
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 4,
            fillColor: "#001F68",
            shape: "circle"
        },
        stroke: {
            curve: 'straight'
        },
        grid: {
            borderColor: "#E6F0FF",
            row: {
                opacity: 0.5
            },
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            scrollbar: {
                enabled: true
            }
        },
        tooltip: {
            // @ts-ignore
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const xAxisCategories = w.config.xaxis.categories;
                const value = series[seriesIndex][dataPointIndex];
                const color = w.config.series[seriesIndex].color;
                const name = w.config.series[seriesIndex].name

                return `<div class="w-32 p-2">
                            <span class="text-2xl" style="color:${color}">${value} <span class="text-xs">${name}</span></span><br>
                            on <span class="text-gray-500 text-xs" >${xAxisCategories[dataPointIndex]}</span>
                        </div>`;
            }
        }

    },

};
export const DataBarSingle = {

    series: [{
        name: 'No of Logins',
        color: "#001F68",
        data: [44, 55, 41, 67, 22, 43]
    },],
    options: {
        chart: {
            height: 350,
            type: 'bar',
            stacked: false,
            colors: ['#001F68'],
            zoom: {
                enabled: false
            },
            toolbar: {
                show: false
            },
        },
        legend: {
            show: true,
            showForSingleSeries: true,
            labels: {
                colors: ["#001F68"],
                useSeriesColors: false
            }
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 4,
            fillColor: "#001F68",
            shape: "circle"
        },
        stroke: {
            curve: 'straight'
        },
        grid: {
            borderColor: "#E6F0FF",
            row: {
                opacity: 0.5
            },
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            scrollbar: {
                enabled: true
            }
        },
        tooltip: {
            // @ts-ignore
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const xAxisCategories = w.config.xaxis.categories;
                const value = series[seriesIndex][dataPointIndex];
                const color = w.config.series[seriesIndex].color;
                const name = w.config.series[seriesIndex].name

                return `<div class="w-32 p-2">
                            <span class="text-2xl" style="color:${color}">${value} <span class="text-xs">${name}</span></span><br>
                            on <span class="text-gray-500 text-xs" >${xAxisCategories[dataPointIndex]}</span>
                        </div>`;
            }
        }

    },

};
export const DataDount = {
    series: [66, 34],
    colors: ['#2E93fA', '#FFFFFF'],

    fill: { colors: ['#2E93fA', '#FFFFFF'] },
    options: {
        chart: {
            height: 350,
            type: 'donut',
            toolbar: {
                show: false
            },
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: false
        },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Completion',
                            formatter: function (w: any) {
                                return `${w?.config?.series[0]} %`;
                            }
                        },
                        name: {
                            show: true,
                            offsetY: -10,
                            formatter: function (val: any) {
                                return val;
                            }
                        },
                        value: {
                            show: true,
                            offsetY: 10,
                            formatter: function (val: any) {
                                return val;
                            }
                        }
                    }
                }
            }
        },
        tooltip: {
            enabled: true,
            // @ts-ignore
            custom: function ({ series, seriesIndex, w }) {
                if (seriesIndex === 0) {
                    const value = series[0];
                    return `<div class="w-24 bg-white text-secondary-500 p-2">
                                <span class="text-2xl">${value} <span class="text-xs">%</span></span><br>
                            </div>`;
                } else {
                    return '';
                }
            }
        },
        colors: ['#2E93fA', '#FFFFFF']
    }
};

