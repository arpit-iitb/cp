import React, { useState, useEffect } from "react";
import SEO from "components/SEO";
import AssessmentHeader from "./AssessmentHeader";
import Accordion from "../../components/Accordian/AssessmentDetailsAccordian";
import { AssessmentDetailsInterface } from "../../_utils/interface";
import { Typography } from "@mui/material";
import { DataBarSingle } from "pages/AdminDashboard/data";
import BarChart from "components/Charts/BarChart";
import QuestionLevel from "components/cards/QuestionLevel";
import { GridColDef } from "@mui/x-data-grid";
import axiosHttp from "_utils/axios.index";
import { AxiosResponse } from "axios";
import { ApiConstants } from "_utils/api-constants";
import { useParams } from "react-router-dom";
import arrowupright from "assets/images/arrow-up-right.png";
import { useLocation } from "react-router-dom";
import { divide } from "lodash-es";

export default function AssessmentDetailsPage() {
  const location = useLocation();
  const [totalmarks, settotalmarks] = useState(0);

  const [SingleBarChartData, setSingleBarChartData] =
    useState<any>(DataBarSingle);
  const [SingleBarChartData2, setSingleBarChartData2] =
    useState<any>(DataBarSingle);
  const { id: assessmentId } = useParams<{ id: string }>();
  const temp: AssessmentDetailsInterface = {
    total_submissions: 0,
    average_marks: null,
    number_of_questions: null,
    average_attempts: null,
    topic_wise_avg_marks: {},
    section_wise_avg_marks: {},
    submission_list: [],

    question_counts: { easy: 0, medium: 0, hard: 0 },
    marking_scheme: [],
  };
  const [details, setDetails] = useState<AssessmentDetailsInterface>(temp);

  useEffect(() => {
    //Get Details from backend
    if (assessmentId) {
      axiosHttp
        .get(`${ApiConstants.assessment.assessmentDetail(assessmentId)}`)
        .then((res: AxiosResponse) => {
          setDetails(res.data);
          console.info("Assessment Details", res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [assessmentId]);

  //Temporarily static
  const tableData = details.marking_scheme;

  //Update data for both bar charts
  useEffect(() => {
    function updateSingleBarChartData(
      singleBarChartData: any,
      formattedDates: string[],
      timeSpentNumbers: number[]
    ) {
      const updatedLineChartData = {
        ...singleBarChartData,
        options: {
          ...singleBarChartData.options,
          plotOptions: {
            bar: {
              columnWidth: "40%",
            },
          },
          xaxis: {
            categories: formattedDates,
            labels: {
              rotate: 0,
              style: {
                colors: "#5D77A6",
                fontSize: "9px",
              },
            },
          },
          yaxis: {
            max: 100,
            tickAmount: 5,
            labels: {
              formatter: function (value: number) {
                return value.toFixed(0) + "%"; // Format y-axis values to 0 decimal places
              },
            },
          },
        },
        series: [
          {
            name: "Sections",
            data: timeSpentNumbers,
          },
        ],
      };
      return updatedLineChartData;
    }

    function updateSingleBarChartData2(
      singleBarChartData: any,
      formattedDates: string[],
      timeSpentNumbers: number[]
    ) {
      const updatedLineChartData = {
        ...singleBarChartData,
        options: {
          ...singleBarChartData.options,
          plotOptions: {
            bar: {
              columnWidth: "40%",
            },
          },
          xaxis: {
            categories: formattedDates,
            labels: {
              rotate: 0,
              style: {
                colors: "#5D77A6",
                fontSize: "9px",
              },
            },
          },
          yaxis: {
            max: 100,
            tickAmount: 5,
            labels: {
              formatter: function (value: number) {
                return value.toFixed(0) + "%"; // Format y-axis values to 0 decimal places
              },
            },
          },
        },
        series: [
          {
            name: "Topics",
            data: timeSpentNumbers,
          },
        ],
      };
      return updatedLineChartData;
    }

    const sectionNames = Object.keys(details.section_wise_avg_marks);
    const sectionValues = sectionNames.map((section) =>
      Number(details.section_wise_avg_marks[section].toFixed(2))
    );

    const updatedSingleBarChartData = updateSingleBarChartData(
      SingleBarChartData,
      sectionNames,
      sectionValues
    );

    const topicNames = Object.keys(details.topic_wise_avg_marks);
    const topicValues = topicNames.map((topic) =>
      Number(details.topic_wise_avg_marks[topic].toFixed(2))
    );

    const updatedSingleBarChartData2 = updateSingleBarChartData2(
      SingleBarChartData,
      topicNames,
      topicValues
    );

    setSingleBarChartData(updatedSingleBarChartData);
    setSingleBarChartData2(updatedSingleBarChartData2);
  }, [details]);

  const [columnDefs] = useState<GridColDef[]>([
    {
      field: "section",
      headerName: "Section",
      type: "string",
      sortable: false,
      align: "left",
      filterable: false,
      headerAlign: "left",
      disableColumnMenu: true,
    },
    {
      field: "numberofQuestions",
      headerName: "No. of Questions",
      sortable: false,
      align: "center",
      filterable: false,
      headerAlign: "center",
      disableColumnMenu: true,
    },
    {
      field: "marks",
      headerName: "Marks",
      sortable: false,
      align: "center",
      filterable: false,
      headerAlign: "center",
      disableColumnMenu: true,
    },
  ]);

  return (
    <div className="mx-4 lg:mx-24">
      <SEO
        title="Assessment Details | CodePaathshala"
        description={"CodePaathshala"}
        name={"CodePaathshala"}
      />
      <div className="mt-6 lg:mt-[-6.5vh]">
        <AssessmentHeader
          title={location.state.name}
          numberofQues={details.number_of_questions}
          averageAttempts={details.average_attempts}
          averageMarks={details.average_marks}
          total_submission={details.total_submissions}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:w-3/4">
          <div className="shadow-primary-500 shadow border border-[#D9E8FF] rounded-xl p-2">
            {SingleBarChartData && (
              <BarChart
                chartData={SingleBarChartData}
                title={"Section wise Average Marks"}
              />
            )}
          </div>
          <div className="shadow shadow-primary-500 border border-[#D9E8FF] rounded-xl p-2">
            {SingleBarChartData && (
              <BarChart
                chartData={SingleBarChartData2}
                title={"Average marks based on topics"}
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:w-1/4 mt-4 lg:mt-0">
          <QuestionLevel
            easyCount={details.question_counts.easy}
            mediumCount={details.question_counts.medium}
            hardCount={details.question_counts.hard}
          />
          <Typography
            variant="h6"
            gutterBottom
            className="text-xl text-secondary-500 font-bold lg:text-2xl"
          >
            Marking Scheme
          </Typography>
          <div className="shadow rounded-xl p-4">
            <table className="w-full rounded-xl border-y-[#D7E8FF] border text-base ">
              <thead>
                <tr className="border border-[#D7E8FF] text-sm text-secondary-300">
                  <th className="p-2">Section</th>
                  <th className="p-2">No. of Questions</th>
                  <th className=" p-2">Marks</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="border border-[#D7E8FF]">
                    <td className="text-sm p-2">{row.title}</td>
                    <td className="p-2">{row.question_count}</td>
                    <td className="text-secondary-500 p-2">{row.marks}</td>
                  </tr>
                ))}
                <tr className="justify-between">
                  <td className="p-2 text-xs text-secondary-300">
                    Total Marks
                  </td>
                  <td></td>
                  <td className="p-2 text-secondary-500 font-bold">100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="p-4 ps-0 w-full lg:w-3/4 mt-6">
        <Typography
          variant="h5"
          gutterBottom
          className="text-xl text-secondary-500 font-bold lg:text-2xl flex justify-between"
        >
          <span>List of Students</span>
          <span className="text-sm text-primary-500 underline">
            <a href="">View All</a>
          </span>
        </Typography>
        {details.submission_list && details.submission_list.length > 0 ? (
          details.submission_list.map((student, index) => (
            <Accordion
              key={index}
              title={student.name}
              totalScore={Math.round(student.total_marks)}
            >
              {student.resultSheet ? (
                student.resultSheet.map((result, index) => (
                  <div
                    key={index}
                    className="flex flex-row lg:flex-row py-[2px] justify-between"
                  >
                    <Typography
                      className="w-full lg:w-1/2 lg:pl-20 text-secondary-400 flex items-center"
                      sx={{
                        marginLeft: { lg: "9vw" },
                      }}
                    >
                      <img src={arrowupright} className="mr-2 w-5" alt="" />
                      {result.title}
                    </Typography>
                    <Typography className="w-full lg:w-1/2 text-center">
                      <span className="font-semibold text-lg">
                        {result.section_score.toString()}
                      </span>
                      <span className="text-secondary-300 text-sm ps-1">
                        /100
                      </span>
                    </Typography>
                  </div>
                ))
              ) : (
                <div>Results not available</div>
              )}
            </Accordion>
          ))
        ) : (
          <Typography variant="body1" gutterBottom>
            No students have submitted this assessment yet.
          </Typography>
        )}
      </div>
    </div>
  );
}
