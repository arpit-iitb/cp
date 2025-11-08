import { Tooltip } from "@mui/material";
import { ApiConstants } from "_utils/api-constants";
import axiosHttp from "_utils/axios.index";
import { DifficultyLevel, DifficultyLevelIcon, LessonType } from "_utils/enum";
import { TextData } from "_utils/interface";
import { AxiosResponse } from "axios";
import PrevNext from "components/prevNext/prevnext";
import SEO from "components/SEO";
import TabComponent from "components/TabsComponent/TabComponent";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function TextIde() {
  const { id, batch } = useParams();
  const [textData, setTextData] = useState<TextData>();
  useEffect(() => {
    getData();
  }, [batch, id]);

  function getData() {
    if (id && batch) {
      axiosHttp
        .get(ApiConstants.problems.getTextContent(batch, id))
        .then((res: AxiosResponse) => {
          setTextData(res.data);
        });
    }
  }
  return (
    <>
      {" "}
      <SEO
        title={textData?.title ?? "CodePaathshala"}
        description={"CodePaathshala"}
        name={"CodePaathshala"}
      />
      {textData && (
        <section className="px-6 min-h-[70svh]">
          <PrevNext
            batchName={batch}
            problem={textData}
            type={LessonType.TEXT}
          />
          <div className="grid grid-cols-12 gap-3 px-3">
            <div className="col-span-12 lg:col-span-12 rounded-xl border border-primary-100 p-2">
              <p className="mt-3 flex mx-3">
                <Tooltip
                  title={DifficultyLevel[textData?.difficulty_level ?? 1]}
                >
                  <img
                    src={DifficultyLevelIcon[textData?.difficulty_level ?? 1]}
                    alt={DifficultyLevel[textData?.difficulty_level ?? 1]}
                    className="h-6 w-6"
                  />
                </Tooltip>
                <span className="text-2xl text-secondary-800 font-bold mb-4 ms-3 ">
                  {textData.title}
                </span>
              </p>
              <div
                dangerouslySetInnerHTML={{
                  __html: textData?.description ? textData?.description : " ",
                }}
                className="description mb-4 mx-3 text-justify"
              ></div>
              {/* <TabComponent
                problem={{
                  title: textData?.title,
                  description: textData?.description,
                  id: textData?.id,
                  difficulty_level: textData?.difficulty_level,
                  batch_name: textData?.batch_name,
                  lesson_type: LessonType.VIDEO,

                  week_number: textData?.week_number,
                }}
              /> */}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
export default TextIde;
