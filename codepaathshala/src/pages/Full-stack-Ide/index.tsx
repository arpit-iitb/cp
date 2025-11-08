import SEO from "components/SEO";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SingleProblemInterface } from "_utils/interface";
import axiosHttp from "_utils/axios.index";
import { ApiConstants } from "_utils/api-constants";
import { AxiosResponse } from "axios";
import {
  DifficultyLevel,
  DifficultyLevelIcon,
  DifficultyScore,
  LessonType,
} from "_utils/enum";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import TabComponent from "components/TabsComponent/TabComponent";
import { Box, Tab, Tooltip, useTheme } from "@mui/material";
import { Css, Html, Javascript } from "@mui/icons-material";
import Editor from "components/ProgramIDE/full-stack-editor/Editor";
import PrevNext from "components/prevNext/prevnext";
import "index.css";
function FullStackIde({
  fullData,
  batchName,
  customIde,
  onCodeChange,
  flagAction,
}: {
  fullData?: SingleProblemInterface;
  batchName?: string;
  customIde?: boolean;
  onCodeChange?: any;
  flagAction?: () => void;
}) {
  const { batch, id } = useParams();
  const [domain, setDomain] = useState("");
  const [problemData, setProblemData] = useState<SingleProblemInterface>();
  const theme = useTheme();
  const [value, setValue] = useState("0");
  const [testResults, setTestResults] = useState("");
  const [totalTestCases, setTotalTestCases] = useState<any>(0);
  const [passedTests, setPassedTestCases] = useState<any>(0);
  const [failedTests, setFailedTests] = useState<any>(0);
  const defaultHtmlCode = `<!-- Write your HTML Code here  -->`;
  const defaultCssCode = `/* Write your CSS code here */`;
  const defaultJsCode = `// Write your JavaScript code here`;
  const [htmlCode, setHtmlCode] = useState<string>(defaultHtmlCode);
  const [cssCode, setCssCode] = useState<string>(defaultCssCode);
  const [jsCode, setJsCode] = useState<string>(defaultJsCode);
  const [srcDoc, setSrcDoc] = useState<any>("");

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getData();
  }, [batch, id]);

  function getData() {
    if (customIde) {
      let obj: any = localStorage?.getItem(`html_code_Data${fullData?.id}`);
      let obj1: any = localStorage?.getItem(`css_code_Data${fullData?.id}`);
      let obj2: any = localStorage?.getItem(`js_code_Data${fullData?.id}`);
      let data = JSON?.parse(obj);
      let data1 = JSON?.parse(obj1);
      let data2 = JSON?.parse(obj2);
      if (
        localStorage.getItem(`html_code_Data${fullData?.id}`) !== null &&
        fullData?.id === data?.data?.id
      ) {
        setProblemData(data?.data);
        setHtmlCode(data.code);
        if (data1 && data1.code) {
          setCssCode(data1.code);
        }
        if (data2 && data2.code) {
          setJsCode(data2.code);
        }
      }
      setProblemData(fullData);
    } else {
      axiosHttp
        .get(ApiConstants.problems.problems(batch, id))
        .then((res: AxiosResponse) => {
          setDomain(window.location.hostname);
          document.title = `${res.data.id}. ${res?.data.title}`;
          setProblemData(res.data);
        });
    }
  }
  const handleChangeIndex = (index: number) => {
    setValue(index.toString());
  };

  const handleHtmlChange = (code: any) => {
    setHtmlCode(code);
    if (customIde) {
      let dataOb = {
        code: code,
        data: fullData,
      };
      localStorage.setItem(
        `html_code_Data${fullData?.id}`,
        JSON.stringify(dataOb)
      );
    }
  };
  const handleCssChange = (code: any) => {
    setCssCode(code);
    if (customIde) {
      let dataOb = {
        code: code,
        data: fullData,
      };
      localStorage.setItem(
        `css_code_Data${fullData?.id}`,
        JSON.stringify(dataOb)
      );
    }
  };
  const handleJsChange = (code: any) => {
    setJsCode(code);
    if (customIde) {
      let dataOb = {
        code: code,
        data: fullData,
      };
      localStorage.setItem(
        `js_code_Data${fullData?.id}`,
        JSON.stringify(dataOb)
      );
    }
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
            <html>
              <body>${htmlCode}</body>
              <style>${cssCode}</style>
              <script>${jsCode}</script>
            </html>
          `);
    }, 250);

    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  function describe(description: any, callback: any) {
    try {
      setTestResults(
        (prevResults: any) =>
          prevResults +
          `<b style="font-weight: bold;">${description} :</b><br/>`
      );
      callback();
    } catch (error: any) {
      setTestResults(
        (prevResults: any) =>
          prevResults +
          `<b style="color: red;">${description} - Failed: ${error.message}</b><br/>`
      );
    }
  }

  function it(testDescription: any, testFunction: any) {
    try {
      testFunction();
      setPassedTestCases((passedTests: any) => passedTests + 1);
      setTestResults(
        (prevResults) =>
          prevResults +
          `<p style="color: green;">${testDescription} - Passed</p>`
      );
    } catch (error: any) {
      setFailedTests((failedTests: any) => failedTests + 1);
      setTestResults(
        (prevResults) =>
          prevResults +
          `<p style="color: red;">${testDescription} - Failed: ${error.message}</p>`
      );
    }
  }
  const runTests = () => {
    setPassedTestCases(0);
    setFailedTests(0);
    try {
      problemData?.test_cases?.forEach((testCase: any) => {
        try {
          if (testCase.input_data !== "NA") {
            eval(testCase.input_data);
          }
        } catch (error) {
          console.error("Test case failed:", error);
        }
      });
    } catch (error) {
      // console.error('Failed to run tests:', error);
    }
  };

  useEffect(() => {
    setTotalTestCases(passedTests + failedTests);
  }, [passedTests, failedTests]);

  function runcode() {
    try {
      setTestResults("");
      runTests();
    } catch (error: any) {}
  }

  function submitCode() {
    setTestResults("");
    let dataObj: any = {
      totalTestCases: totalTestCases,
      passedTests: passedTests,
      failedTests: failedTests,
      htmlCode: htmlCode,
      cssCode: cssCode,
      jsCode: jsCode,
    };
    if (customIde) {
      onCodeChange(
        (passedTests / totalTestCases) *
          DifficultyScore[fullData?.difficulty_level ?? 1]
          ? (passedTests / totalTestCases) *
              DifficultyScore[fullData?.difficulty_level ?? 1]
          : 0
      );
      setTestResults(
        `<b style="font-weight: bold; display: flex;justify-content:center;align-items: center;">Successfully Submitted.</b><br/>`
      );
    } else {
      axiosHttp
        .post(ApiConstants.problems.submitfullStack(batch, id), dataObj)
        .then((res: AxiosResponse) => {
          setTestResults(
            `<b style="font-weight: bold; display: flex;justify-content:center;align-items: center;">Successfully Submitted.</b><br/>`
          );
        });
    }
  }

  return (
    <>
      <SEO
        title="Full Stack IDE | CodePaathshala"
        description={"CodePaathshala"}
        name={"CodePaathshala"}
      />
      {flagAction ? <button onClick={() => flagAction()}></button> : null}
      {problemData ? (
        <section className={`${customIde ? "mb-3" : "px-6 mb-3"}`}>
          {!customIde && (
            <PrevNext
              batchName={batch}
              problem={problemData}
              type={LessonType.PROBLEM}
            />
          )}
          <div className={`grid grid-cols-12 gap-3 px-3`}>
            <div className="col-span-12 lg:col-span-6 !rounded-xl  border border-1 !border-primary-100 p-2">
              {customIde ? (
                <>
                  <div className="col-span-4">
                    <p className="mt-3 flex mx-3">
                      <Tooltip
                        title={
                          DifficultyLevel[problemData?.difficulty_level ?? 1]
                        }
                        className="z-10"
                      >
                        <img
                          src={
                            DifficultyLevelIcon[
                              problemData?.difficulty_level ?? 1
                            ]
                          }
                          alt={
                            DifficultyLevel[problemData?.difficulty_level ?? 1]
                          }
                          className="h-6 w-6"
                        />
                      </Tooltip>
                      <span className="text-2xl text-secondary-800 font-bold mb-4 ms-3 ">
                        {problemData.title}
                      </span>
                    </p>
                    <p
                      className="mb-4 description w-50"
                      style={{ whiteSpace: "pre-wrap" }}
                      dangerouslySetInnerHTML={{
                        __html: problemData?.description
                          ? problemData?.description
                          : "",
                      }}
                    ></p>
                    <div className="flex mx-2 gap-5 mt-4">
                      {(problemData?.input_format !== "NA" ||
                        !problemData?.input_format) && (
                        <div className="bg-primary-50 border border-1 border-primary-200 rounded-xl p-2 w-96">
                          <p className="text-xl font-bold text-secondary-800">
                            Input Format
                            <br />
                            <span
                              className="break-words text-base text-justify"
                              dangerouslySetInnerHTML={{
                                __html: problemData?.input_format ?? "",
                              }}
                              style={{ whiteSpace: "pre-wrap" }}
                            ></span>
                          </p>
                        </div>
                      )}
                      {(problemData.output_format !== "NA" ||
                        !problemData?.output_format) && (
                        <div className="bg-primary-50 border border-1 border-primary-200 rounded-xl p-2 w-96">
                          <p className="text-xl font-bold text-secondary-800">
                            Output Format
                            <br />
                            <span
                              className="break-words text-base text-justify"
                              dangerouslySetInnerHTML={{
                                __html: problemData?.output_format ?? "",
                              }}
                              style={{ whiteSpace: "pre-wrap" }}
                            ></span>
                          </p>
                        </div>
                      )}
                    </div>
                    {(problemData.constraints !== "NA" ||
                      !problemData?.constraints) && (
                      <div className="mx-3 my-4">
                        <p className="text-xl font-bold text-secondary-800">
                          Constraints
                        </p>
                        <p
                          className="break-words text-base text-justify"
                          style={{ whiteSpace: "pre-wrap" }}
                          dangerouslySetInnerHTML={{
                            __html: problemData?.constraints ?? "",
                          }}
                        ></p>
                      </div>
                    )}
                    <div>
                      <label className="mt-3 font-bold">Live Preview:</label>
                      <iframe
                        srcDoc={srcDoc}
                        title="output"
                        sandbox="allow-scripts"
                        width="100%"
                        height="300"
                        className="border border-gray-600 rounded rounded-xs"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* {domain !== "lms.eventbeep.com" ? ( */}
                  <TabComponent
                    problem={{
                      id: problemData?.id,
                      title: problemData?.title,
                      description: problemData?.description,
                      difficulty_level: problemData?.difficulty_level,
                      batch_name: problemData?.batch_name,
                      lesson_type: LessonType.FULLSTACK,
                      img_urls: problemData?.image_urls,
                      input_format: problemData?.input_format,
                      output_format: problemData?.output_format,
                      constraints: problemData?.constraints,
                      csv_link: problemData?.csv_link,
                      srcDoc: srcDoc,
                      week_number: problemData?.week_number,
                    }}
                  />
                  {/* ) : (
                    <>
                      <div className="flex justify-center items-center text-secondary-500 text-3xl min-h-40">
                        Please subscribe to Unlock
                      </div>
                    </>
                  )} */}
                </>
              )}
            </div>
            <div
              className={`${
                customIde
                  ? "col-span-12 lg:col-span-6"
                  : "col-span-12 lg:col-span-6 ml-3"
              } !rounded-xl  border border-1 !border-primary-100 p-2`}
            >
              <Box sx={{ width: "100%" }}>
                <TabContext value={value}>
                  <Box
                    sx={{
                      backgroundColor: "#EBF3FF",
                      borderRadius: "0.5rem",
                      padding: "0.35rem 0.35rem",
                      width: "100%",
                    }}
                  >
                    <TabList
                      TabIndicatorProps={{
                        sx: { display: "none" },
                      }}
                      className={"items-center !max-h-[50px]"}
                      variant="scrollable"
                      scrollButtons={false}
                      onChange={handleChange}
                      aria-label="lab API tabs example"
                    >
                      <Tab
                        icon={<Html />}
                        iconPosition="start"
                        className="transition-all"
                        sx={{
                          textTransform: "none",
                          borderRadius: "0.5rem",
                          color: "#5D77A6",
                          "&.Mui-selected": {
                            backgroundColor: "#3183FF",
                            color: "white !important",
                          },
                        }}
                        disableRipple={true}
                        label="HTML"
                        value="0"
                      />
                      <Tab
                        icon={<Css />}
                        iconPosition="start"
                        className="transition-all"
                        sx={{
                          textTransform: "none",
                          borderRadius: "0.5rem",
                          color: "#5D77A6",
                          "&.Mui-selected": {
                            backgroundColor: "#3183FF",
                            color: "white !important",
                          },
                        }}
                        disableRipple={true}
                        label="CSS"
                        value="1"
                      />
                      <Tab
                        icon={<Javascript />}
                        iconPosition="start"
                        className="transition-all"
                        sx={{
                          textTransform: "none",
                          borderRadius: "0.5rem",
                          color: "#5D77A6",
                          "&.Mui-selected": {
                            backgroundColor: "#3183FF",
                            color: "white !important",
                          },
                        }}
                        disableRipple={true}
                        label="JS"
                        value="2"
                      />
                    </TabList>
                  </Box>
                  <TabPanel value="0" dir={theme.direction}>
                    <div>
                      <Editor
                        theme={"vs-dark"}
                        language={"html"}
                        codes={htmlCode}
                        id="61"
                        onCodeChange={handleHtmlChange}
                        disableCopyPaste={true}
                      />
                    </div>
                  </TabPanel>
                  <TabPanel value="1" dir={theme.direction}>
                    <div>
                      <Editor
                        theme={"vs-dark"}
                        language={"css"}
                        codes={cssCode}
                        id="61"
                        onCodeChange={handleCssChange}
                        disableCopyPaste={true}
                      />
                    </div>
                  </TabPanel>

                  <TabPanel value="2" dir={theme.direction}>
                    <div>
                      <Editor
                        theme={"vs-dark"}
                        language={"javascript"}
                        codes={jsCode}
                        id="61"
                        onCodeChange={handleJsChange}
                        disableCopyPaste={true}
                      />
                    </div>
                  </TabPanel>
                </TabContext>
              </Box>
              <div className="flex items-center justify-end space-x-3 mb-4">
                <button
                  type="submit"
                  className="border border-1 border-primary-500 text-primary-500 font-bold py-2 px-4 rounded cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-400"
                  onClick={runcode}
                >
                  Run Code
                </button>
                <button
                  type="submit"
                  data-tooltip-target="tooltip-default"
                  className="bg-primary-500 text-white font-bold py-2 px-4 rounded cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400"
                  onClick={submitCode}
                >
                  Submit
                </button>
              </div>
              {testResults && (
                <>
                  <div className="border border-gray-200 rounded rounded-xs p-3 mb-3">
                    <div
                      dangerouslySetInnerHTML={{ __html: testResults }}
                    ></div>
                  </div>
                  <div
                    className={`border border-gray-300 rounded rounded-xs p-2 flex justify-center align-center ${
                      passedTests === totalTestCases
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {passedTests}/{totalTestCases} passed Successfully
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export default FullStackIde;
