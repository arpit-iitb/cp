
function PieChart({ chartData }: any) {
    return <>
        {/* <div className="!mb-0 !w-full" >
            <h2 style={{ textAlign: "center" }}>Pie Chart</h2>
            <Pie
                data={{
                    labels: [
                        'Last 7 Days',
                        'Last 30 Days',
                        'Lifetime Average',
                    ],
                    datasets: [
                        {
                            data: chartData[0] || 0,
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.5)',
                                'rgba(153, 102, 255, 0.5)',
                                'rgba(201, 203, 207, 0.5)'
                            ],

                        }
                    ]
                }}
                options={{
                    plugins: {
                        title: {
                            display: false,
                            text: "Users Gained between 2016-2020"
                        }
                    }
                }}
            />
        </div> */}
    </>
}
export default PieChart;