import ReactApexChart from "react-apexcharts";
function BarChart({ chartData, title }: any) {
    return <>
        <div className="chart-container w-full p-2 overflow-x-auto ">
            <div className="max-w-sm w-full bg-white rounded-lg">
                <div>
                    <h5 className="text-xl text-secondary-500 ml-4 pt-3">{title}</h5>
                    {chartData && <ReactApexChart options={chartData?.options} series={chartData?.series} type="bar" height={350}  width={chartData?.series[0].data.length > 7 ? chartData?.series[0].data.length * 80 : "100%"}
                    />}
                </div>

            </div>
        </div>
    </>
}
export default BarChart;