import ReactApexChart from "react-apexcharts";

function DoughnutChart({ chartData }: any) {
    return <>
         <div className="chart-container w-full p-2 overflow-x-auto">
            <div className="max-w-sm w-full  rounded-lg shadow bg-primary-150">
                <div>
                    <h5 className="text-xl text-secondary-500 ml-4 pt-3">Overall Completion of <br/>Course →</h5>
                    <h3 className="text-xs text-gray-400 ml-5 mt-3">Average completion of course per student</h3>
                    {chartData && <ReactApexChart options={chartData?.options} series={chartData?.series} type="donut" height={350} />}
                </div>

            </div>
        </div>
    </>
}
export default DoughnutChart;