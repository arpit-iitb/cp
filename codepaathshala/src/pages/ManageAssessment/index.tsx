import { useState, useEffect } from "react";
import {
  AssessmentCardInterface,
  GetAllAssessmentsInterface,
} from "_utils/interface";
import SEO from "components/SEO";
import { Link } from "react-router-dom";
import prevBlack from "../../assets/svg/prev-black.svg";
import ManageAssessmentCard from "components/cards/ManageAssessmentCard";
import CreateAssessmentCard from "components/cards/CreateAssessment";
import createassessment from "../../assets/svg/CreateAssessment.svg";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axiosHttp from "_utils/axios.index";
import { AxiosResponse } from "axios";
import { ApiConstants } from "_utils/api-constants";

export default function ManageAssessment() {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [assessments, setAssessments] = useState<GetAllAssessmentsInterface[]>(
    []
  );

  const handleCreateAssessment = () => {
    setShowCreateCard(true);
  };

  const handleCloseCreateCard = () => {
    setShowCreateCard(false);
  };

  useEffect(() => {
    function getAssessments() {
      axiosHttp
        .get(ApiConstants.assessment.list2())
        .then((res: AxiosResponse) => {
          // Map the data to correct the key names
          const correctedData = res.data.map((item: any) => ({
            id: item["id "], // Fix the key name
            name: item.name,
            total_test_takers: item.total_test_takers,
          }));

          setAssessments(correctedData);
        })
        .catch((err) => {
          console.error(err);
        });
    }

    getAssessments();
  }, []);

  return (
    <section className="min-h-screen pb-8 relative">
      <SEO
        title="Manage Assessment | CodePaathshala"
        description={"CodePaathshala"}
        name={"CodePaathshala"}
      />
      <div className="ml-6 mt-4 sm:ml-24">
        <Link
          to="/assessment"
          className="flex items-center whitespace-nowrap text-xs font-medium"
        >
          <img src={prevBlack} className="h-3 mr-1" alt="Previous" />
          <div>Back to Assessments</div>
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row lg:ml-24 mt-8 gap-4 lg:gap-8 px-4 lg:px-0">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl text-secondary-500">Assessments Created</h1>
            <Button
              variant="contained"
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "none",
                padding: "8px 16px",
              }}
              startIcon={<AddIcon />}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleCreateAssessment}
            >
              Create New Assessment
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {assessments.map((assessment) => (
              <ManageAssessmentCard
                key={assessment.id}
                assessment={assessment}
              />
            ))}
          </div>
        </div>
        <div className="w-full lg:w-[270px] bg-[#F3F7FE] flex flex-col items-center justify-center rounded-lg shadow-sm py-6 mr-24 h-[60vh]">
          <img src={createassessment} className="w-[170px] h-[147px]" alt="" />
          <div className="text-lg text-secondary-500 text-center mt-4 font-semibold">
            Create Assessment More Efficiently
          </div>
          <div className="text-sm text-secondary-400 text-center mt-2 px-4">
            Watch a 2 min video, and create assessment like it's a piece of
            cake!
          </div>
          <Button
            variant="contained"
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white normal-case"
          >
            Watch the Video
          </Button>
        </div>
      </div>
      {showCreateCard && (
        <CreateAssessmentCard onClose={handleCloseCreateCard} />
      )}
    </section>
  );
}
