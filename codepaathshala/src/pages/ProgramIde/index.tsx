import Editor from "components/ProgramIDE/full-stack-editor/Editor";
import SEO from "components/SEO";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import {
  LanguageAssessmentOptions,
  LanguageOptions,
} from "../../_utils/constants";
import axiosHttp from "_utils/axios.index";
import { ApiConstants } from "_utils/api-constants";
import axios, { AxiosResponse } from "axios";
import { languageMapper, SingleProblemInterface } from "_utils/interface";
import TabComponent from "components/TabsComponent/TabComponent";
import {
  DifficultyLevel,
  DifficultyLevelIcon,
  LessonType,
} from "../../_utils/enum";
import { TabContext, TabList } from "@mui/lab";
import PrevNext from "components/prevNext/prevnext";
import "index.css";
import { Tooltip, Box } from "@mui/material";
const languageOptions = LanguageOptions;
const languageAssessmentOptions = LanguageAssessmentOptions;
function ProgramIde({
  fullData,
  batchName,
  customIde = false,
  onCodeChange,
}: {
  fullData?: SingleProblemInterface;
  batchName?: string;
  customIde?: boolean;
  onCodeChange?: any;
}) {
  const { batch, id } = useParams();
  const [domain, setDomain] = useState("");
  const [stdIn, setStdIn] = useState<string>("");
  const [stdOut, setStdOut] = useState<string>("");
  const [failedCases, setFailedCases] = useState<any>([]);
  const [previousData, setPreviousData] = useState<any>([]);
  const [resultStatus, setResultStatus] = useState<string>("");
  const [testResults, setTestResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime] = useState<any>(new Date());
  const [showResults, setShowResults] = useState(" ");
  const [language, setLanguage] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [showManualCases, setShowManualCases] = useState(false);
  const [problemData, setProblemData] = useState<SingleProblemInterface>();
  const [disabled, setDisabled] = useState(
    localStorage.getItem("buttonDisabled") === "true" ? true : false
  );
  const [timeLeft, setTimeLeft] = useState(
    parseInt(localStorage.getItem("timeLeft") || "0", 10)
  );
  useEffect(() => {
    //  eslint-disable-next-line
    getData();
    // eslint-disable-next-line
  }, [batch, id, fullData]);

  useEffect(() => {
    // eslint-disable-next-line
    getData();
    // eslint-disable-next-line
  }, []);

  function getData() {
    let defaultLanguage: any = localStorage.getItem(
      `default_language${fullData?.id}`
    );
    let dataLan = JSON?.parse(defaultLanguage);
    let obj: any = localStorage?.getItem(`${dataLan}code_Data${fullData?.id}`);
    let data = JSON?.parse(obj);

    if (
      localStorage.getItem(`${dataLan}code_Data${fullData?.id}`) !== null &&
      fullData?.id === data?.data?.id
    ) {
      let obj: any = localStorage?.getItem(
        `${dataLan}code_Data${fullData?.id}`
      );
      let data = JSON?.parse(obj);
      setCode(data?.code);
      setLanguage(dataLan);
      setProblemData(data?.data);
    } else if (batch && id) {
      axiosHttp
        .get(ApiConstants.problems.problems(batch, id))
        .then((res: AxiosResponse) => {
          setProblemData(res.data);
          setDomain(window.location.hostname);
          setLanguage(res.data.default_language);
          setCode(
            getDefaultCodeForLanguage(
              res.data.template_codes,
              res.data.default_language
            )
          );
        });
      axiosHttp
        .get(ApiConstants.problems.lastSubmission(id))
        .then((res: AxiosResponse) => {
          setPreviousData(res.data);
        });
    } else if (customIde) {
      setProblemData(fullData);
      setLanguage(fullData?.default_language as string);
      setCode(
        getDefaultCodeForLanguage(
          fullData?.template_codes,
          fullData?.default_language
        )
      );
    }
  }

  function runcode() {
    setLoading(true);
    setTestResults(false);
    setFailedCases([]);
    let dataObj: any = {
      language_id: languageMapper[language],
      source_code: code,
    };
    if (stdIn) {
      dataObj["stdin"] = stdIn;
    }
    if (customIde) {
      let dataOb = {
        default_language: language,
        code: code,
        data: fullData,
      };
      localStorage.setItem(
        `${language}code_Data${fullData?.id}`,
        JSON.stringify(dataOb)
      );
      localStorage.setItem(
        `default_language${fullData?.id}`,
        JSON.stringify(language)
      );
      axiosHttp
        .post(ApiConstants.problems.runCode(batchName, fullData?.id), dataObj)
        .then((res: AxiosResponse) => {
          setShowResults(res.data.message);
          setResultStatus(res.data.status);
          setTestResults(true);
          if (res.data.failedTestCases?.length > 0) {
            setFailedCases(res.data.failedTestCases);
          }
          if (res.data.stdout) {
            setStdOut(res.data.stdout);
          }
          setLoading(false);
        })
        .catch((err) => {
          setShowResults("Request Failed please Try again after few minutes ");
          setTestResults(true);
          setLoading(false);
        });
    } else {
      axiosHttp
        .post(ApiConstants.problems.runCode(batch, id), dataObj)
        .then((res: AxiosResponse) => {
          setShowResults(res.data.message);
          setResultStatus(res.data.status);
          setTestResults(true);
          if (res.data.failedTestCases?.length > 0) {
            setFailedCases(res.data.failedTestCases);
          }
          if (res.data.stdout) {
            setStdOut(res.data.stdout);
          }
          setLoading(false);
        })
        .catch((err) => {
          setShowResults("Request Failed please Try again after few minutes ");
          setTestResults(true);
          setLoading(false);
        });
    }
  }
  const submitCode = async () => {
    const tenSeconds = 10;

    // Update UI and local storage
    setDisabled(true);
    setTimeLeft(tenSeconds);
    localStorage.setItem("buttonDisabled", "true");
    localStorage.setItem("timeLeft", tenSeconds.toString());
    localStorage.setItem("timestamp", Date.now().toString());
    setLoading(true);
    setTestResults(false);
    setFailedCases([]);

    // Time management
    const startTime = Date.now();
    const endTime = new Date();
    const timeSpent = ((endTime.getTime() - startTime) / (1000 * 60)).toFixed(
      2
    );

    // Prepare data object
    let dataObj: any = {
      language_id: languageMapper[language],
      source_code: code,
      time_taken: timeSpent,
    };

    if (stdIn) {
      dataObj.stdin = stdIn;
    }

    try {
      if (customIde) {
        let dataObjs = {
          language_id: languageMapper[language],
          source_code: code,
        };
        const baseUrl = "https://bejudge.codepaathshala.com";
        let dataOb = {
          default_language: language,
          code: code,
          data: fullData,
        };

        localStorage.setItem(
          `${language}code_Data${fullData?.id}`,
          JSON.stringify(dataOb)
        );
        localStorage.setItem(
          `default_language${fullData?.id}`,
          JSON.stringify(language)
        );

        await submitCustomIdeProblem(dataObjs, baseUrl);
      } else {
        await submitProblemCode(batch as string, id as string, dataObj);
      }
    } catch (error) {
      setShowResults("Request Failed. Please try again after a few minutes.");
      setTestResults(true);
    } finally {
      setLoading(false);
      resetButtonState();
    }
  };

  const submitCustomIdeProblem = async (
    dataObjs: any,
    baseUrl: string,
    retryCount = 1
  ) => {
    try {
      const response = await axiosHttp.post(
        ApiConstants.assessment.submitProblem(fullData?.id),
        dataObjs
      );

      if (response.data && response.data.task_id) {
        setTimeout(() => {
          GetResponseToken(response, baseUrl);
        }, 1000);
      } else {
        if (retryCount < 5) {
          await submitCustomIdeProblem(dataObjs, baseUrl, retryCount + 1);
        } else {
          setShowResults(
            "Request Failed. Please try again after a few minutes."
          );
          throw new Error("Failed to receive token after multiple attempts.");
        }
      }
    } catch (error) {
      console.error("Error during custom IDE problem submission:", error);
      throw error; // Propagate error to be handled in submitCode
    }
  };

  const submitProblemCode = async (batch: string, id: string, dataObj: any) => {
    try {
      const response = await axiosHttp.post(
        ApiConstants.problems.submitCode(batch, id),
        dataObj
      );
      setShowResults(response.data.message);
      setResultStatus(response.data.status);
      setTestResults(true);
      if (response.data.failedTestCases?.length > 0) {
        setFailedCases(response.data.failedTestCases);
      }
      if (response.data.stdout) {
        setStdOut(response.data.stdout);
      }
    } catch (error) {
      setShowResults("Request Failed. Please try again after a few minutes.");
      setTestResults(true);
    }
  };

  const resetButtonState = () => {
    setTimeout(() => {
      setDisabled(false);
      setTimeLeft(0);
      localStorage.removeItem("buttonDisabled");
      localStorage.removeItem("timeLeft");
      localStorage.removeItem("timestamp");
    }, 10000);
  };

  async function GetResponseToken(res: AxiosResponse, baseUrl: string) {
    const { data } = await axiosHttp.get(
      ApiConstants.assessment.checkSubmitStatus(res?.data?.task_id)
    );

    if (data.state === "PENDING") {
      setResultStatus("W");
      setTestResults(true);
      setShowResults(`Your submission is being evaluated.`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await GetResponseToken(res, baseUrl);
    }
    if (data.result.tokens) {
      setLoading(false);
      setTimeout(() => {
        const totalTestCases = data.result.tokens.length;
        let count = 0;
        setResultStatus("W");
        setShowResults(`Your submission is being evaluated.`);
        const checkStatus = async (token: string) => {
          setResultStatus("W");
          setShowResults(`Your submission is being evaluated.`);
          const statusResponse = await axios.get(
            `${baseUrl}/${
              languageMapper[language]
            }/${ApiConstants.assessment.checkStatus(token)}`
          );
          const statusId = statusResponse.data.status_id;
          if (statusId === 3) {
            count++;
            setResultStatus("S");
            setShowResults(
              `${count}/${totalTestCases} test cases are passed and your submission has been recorded.`
            );
          } else if (statusId === 4) {
            setResultStatus("W");
            setShowResults(
              `${count}/${totalTestCases} test cases are passed and your submission has been recorded.`
            );
          } else if (statusId === 1) {
            setResultStatus("CE");
            setShowResults(`Your Submmission is in evaluation process`);
          } else if (statusId === 2) {
            await new Promise((resolve) => setTimeout(resolve, 2500));
            await checkStatus(token);
            return;
          } else if (statusId === 5) {
            setResultStatus("F");
            setShowResults(`Time Limit Exceeded`);
          } else if (statusId === 6) {
            setResultStatus("CE");

            setShowResults(`Compilation Error`);
          } else if (statusId === 11) {
            setResultStatus("CE");
            setShowResults(statusResponse.data.stderr);
            return;
          }
        };

        Promise.all(
          data.result.tokens.map((token: string) => checkStatus(token))
        ).then(() => {
          setTestResults(true);
          let ress = (count / totalTestCases) * 100;
          onCodeChange(ress ?? 0);

          if (res.data.stdout) {
            setStdOut(res.data.stdout);
          }
          setLoading(false);
        });
      }, 2000);
    }
    return;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
        JSON.stringify(timeLeft - 1);
        localStorage.setItem("timeLeft", JSON.stringify(timeLeft - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (localStorage.getItem("buttonDisabled")) {
      const timeLeftOnRefresh =
        JSON.parse(localStorage?.getItem("timeLeft") as any) -
        Math.floor(
          (Date.now() - JSON.parse(localStorage?.getItem("timestamp") as any)) /
            1000
        );

      if (timeLeftOnRefresh > 0) {
        setDisabled(true);
        setTimeLeft(timeLeftOnRefresh);
        setTimeout(() => {
          setDisabled(false);
          setTimeLeft(0);
          localStorage.removeItem("buttonDisabled");
          localStorage.removeItem("timeLeft");
        }, timeLeftOnRefresh * 1000);
      } else {
        localStorage.removeItem("buttonDisabled");
        localStorage.removeItem("timeLeft");
      }
    }
  }, []);

  const handleCheckboxChange = (event: any) => {
    setShowManualCases(event.target.checked);
    if (event?.target?.checked === false) {
      setStdIn("");
    }
  };

  function getDefaultCodeForLanguage(templateCodes: any, defaultLanguage: any) {
    const template = templateCodes?.find(
      (template: any) => template.language === defaultLanguage
    );
    return template ? template.code : "";
  }

  const handleCodeChange = (newCode: any) => {
    setCode(newCode);
    if (customIde) {
      let dataOb = {
        default_language: language,
        code: newCode,
        data: fullData,
      };
      setLanguage(language);
      localStorage.setItem(
        `default_language${fullData?.id}`,
        JSON.stringify(language)
      );
      localStorage.setItem(
        `${language}code_Data${fullData?.id}`,
        JSON.stringify(dataOb)
      );
    }
  };

  function handleLanguageChange(event: any) {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    setCode(
      getDefaultCodeForLanguage(problemData?.template_codes, selectedLanguage)
    );
    if (customIde) {
      const selectedLanguage = event.target.value;
      setLanguage(selectedLanguage);
      if (
        localStorage.getItem(`${selectedLanguage}code_Data${fullData?.id}`) !==
        null
      ) {
        let obj: any = localStorage?.getItem(
          `${selectedLanguage}code_Data${fullData?.id}`
        );
        let data = JSON?.parse(obj);
        setCode(data?.code);
      }
    }
  }
  function handleStdInChange(event: any) {
    setStdIn(event.target.value);
  }

  return (
    <>
      <SEO
        title="Program IDE | CodePaathshala"
        description={"CodePaathshala"}
        name={"CodePaathshala"}
      />
      {problemData ? (
        <section
          className={`${customIde ? "mb-3" : "px-6 mb-3"} overflow-hidden`}
        >
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
                  <div className="col-span-4 !h-auto">
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
                    <div
                      dangerouslySetInnerHTML={{
                        __html: problemData?.description
                          ? problemData?.description
                          : " ",
                      }}
                      className="description mb-4 mx-3 text-justify"
                    ></div>
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
                          className="break-words text-justify"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {problemData?.constraints}
                        </p>
                      </div>
                    )}
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
                      lesson_type: LessonType.PROBLEM,
                      img_urls: problemData?.image_urls,
                      input_format: problemData?.input_format,
                      output_format: problemData?.output_format,
                      constraints: problemData?.constraints,
                      csv_link: problemData?.csv_link,
                      week_number: problemData?.week_number,
                      previous_submissions: previousData,
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
              className={`col-span-12 lg:col-span-6 ml-3 border border-1 border-primary-100 rounded-xl px-2 py-1`}
            >
              <Box>
                <TabContext value="0">
                  <Box
                    sx={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "0.5rem",
                      padding: "0.45rem 0.35rem",
                      width: "100%",
                    }}
                  >
                    <TabList
                      TabIndicatorProps={{ sx: { display: "none" } }}
                      className="flex items-center max-h-[50px]"
                      variant="scrollable"
                      scrollButtons={false}
                      aria-label="lab API tabs example"
                    >
                      <div className="flex justify-start w-full">
                        <div className="text-secondary-950 font-semibold hidden md:block items-center mt-1">
                          <FontAwesomeIcon icon={faCode} /> Code
                        </div>
                        <div className="flex items-center ml-3">
                          {/* <label htmlFor="language" className="text-secondary-950 mr-2">Language</label> */}
                          <select
                            id="language"
                            name="language"
                            value={language}
                            className="form-select bg-primary-50 text-secondary-950 rounded-md px-3 py-2 focus:outline-none"
                            onChange={handleLanguageChange}
                          >
                            {customIde === false ? (
                              <>
                                {languageOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </>
                            ) : (
                              <>
                                {languageAssessmentOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                    </TabList>
                  </Box>
                </TabContext>
              </Box>
              <div className="mx-auto">
                <Editor
                  theme={"vs-dark"}
                  language={language}
                  codes={code}
                  id="61"
                  onCodeChange={handleCodeChange}
                  disableCopyPaste={true}
                />
              </div>
              <div className="mx-3">
                <div className="flex flex-col sm:flex-row items-center mt-3 justify-between space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="flex items-center">
                    <input
                      id="checked-checkbox"
                      type="checkbox"
                      onChange={handleCheckboxChange}
                      value=""
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:border-gray-600 rounded"
                    />
                    <label
                      htmlFor="checked-checkbox"
                      className="ms-2 text-sm font-medium text-black-900 dark:text-black-300"
                    >
                      Check Manual Cases
                    </label>
                  </div>
                  <div className="flex flex-col items-center space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3 w-full sm:w-auto">
                    <button
                      type="submit"
                      className="w-full sm:w-auto border border-1 border-primary-500 text-primary-500 font-bold py-2 px-4 rounded cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-400"
                      disabled={showManualCases && stdIn.trim() === ""}
                      onClick={runcode}
                    >
                      Run Code
                    </button>
                    {disabled ? (
                      <Tooltip
                        title={`You can try again in ${timeLeft % 60} seconds`}
                      >
                        <button
                          type="submit"
                          data-tooltip-target="tooltip-default"
                          className="w-full sm:w-auto text-white font-bold py-2 px-4 rounded cursor-pointer disabled:cursor-not-allowed bg-gray-400"
                          disabled={
                            disabled || (showManualCases && stdIn.trim() === "")
                          }
                          onClick={submitCode}
                        >
                          Submit
                        </button>
                      </Tooltip>
                    ) : (
                      <button
                        type="submit"
                        data-tooltip-target="tooltip-default"
                        className="w-full sm:w-auto bg-primary-500 text-white font-bold py-2 px-4 rounded cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400"
                        disabled={showManualCases && stdIn.trim() === ""}
                        onClick={submitCode}
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {showManualCases && (
                <div className="grid grid-cols-12 mt-3">
                  <div className="col-span-5">
                    <textarea
                      id="stdin"
                      placeholder="Enter Input (stdin)"
                      value={stdIn}
                      rows={4}
                      onChange={handleStdInChange}
                      className="block p-2.5 w-full text-sm text-white-900 bg-white-50 rounded-lg border border-white-300 focus:ring-white-500 focus:border-white-500"
                    ></textarea>
                  </div>
                  <div className="col-span-5">
                    <textarea
                      id="stdout"
                      placeholder="Output (stdout)"
                      value={stdOut}
                      rows={4}
                      className="ml-3 block p-2.5 w-full text-sm text-white-900 bg-white-50 rounded-lg border border-white-300 focus:ring-white-500 focus:border-white-500"
                      readOnly
                    ></textarea>
                  </div>
                </div>
              )}
              {loading && (
                <div className="col-span-12 border border-gray-300 mt-8 rounded rounded-xs p-2 mb-3 flex justify-center align-center text-red-800">
                  Please wait...
                </div>
              )}

              {testResults && (
                <div
                  className={`col-span-6 border border-gray-300 mt-8 rounded rounded-xs p-2 mb-3 flex justify-center items-center mb-3 mx-2 ${
                    resultStatus === "S" || resultStatus === "CT"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {showResults}
                </div>
              )}

              <div className="max-h-[40svh] overflow-y-auto mt-3 mx-3">
                {/* {customIde === false ? (<> */}
                {failedCases && failedCases.length > 0 && (
                  <div className="mx-3">
                    <h6 className="mt-4 mb-0 text-md font-bold">
                      Failed Test Cases:
                    </h6>
                    {failedCases.map((testCase: any, index: any) => (
                      <div
                        key={index}
                        className="col-span-6 border border-gray-300 mt-8 rounded rounded-xs p-2  mb-3"
                      >
                        <div>
                          <b className="text-cyan-800">Input</b>:{" "}
                          {testCase.input}
                        </div>
                        <div>
                          <b className="text-green-800">Actual Output</b>:
                          <p style={{ whiteSpace: "pre-wrap" }}>
                            {testCase.actualOutput}
                          </p>
                        </div>
                        <div>
                          <b className="text-red-800">Expected Output</b>:{" "}
                          <p style={{ whiteSpace: "pre-wrap" }}>
                            {testCase.expectedOutput}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* </>) : null} */}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export default ProgramIde;
