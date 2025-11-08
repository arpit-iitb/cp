import { AssessmentCardInterface } from "_utils/interface";
import SEO from "components/SEO";
import { useEffect, useState } from "react";
import AssessmentCard from "components/cards/AssessmentCard";
import axiosHttp from "../../_utils/axios.index";
import { ApiConstants } from "../../_utils/api-constants";
import { AxiosResponse } from "axios";
import { useAuth } from "hooks/AuthProvider";
import { Link } from "react-router-dom";
import { ProfileDataInterface } from "_utils/interface";

export default function AssessmentLinks() {
  const [assessmentData, setAssessmentData] =
    useState<AssessmentCardInterface[]>();
  const authContext = useAuth();
  useEffect(() => {
    // authContext.updateClientLogo("");
    axiosHttp.get(ApiConstants.assessment.list()).then((res: AxiosResponse) => {
      setAssessmentData(res.data);
    });
  }, []);

  const userAuth = useAuth();
  const [profile, setProfile] = useState<ProfileDataInterface>(userAuth.user);
  const [is_staff, setis_staff] = useState(false);

  useEffect(() => {
    let userData = userAuth.getUserInfo();
    if (userData) {
      setProfile(userData);
      if (userData.user.is_staff) {
        setis_staff(true);
      }
    }
  }, []);

  return (
    <section className="min-h-[70svh]">
      <SEO
        title="Registered Batches | Coding Judge"
        description={"Coding Judge"}
        name={"Coding Judge"}
      />
      <div className="mx-9 flex h-[35px] justify-between">
        <p className="text-[28px] text-secondary-500 font-sora font-semibold">
          Assessments
        </p>
        {is_staff ? (
          <Link to="/manage-assessment">
            <button className="bg-[#3183FF] h-full px-5 py-4 leading-[15px] md:ml-0 ml-4 md:text-lg text-sm md:leading-normal md:p-[8px] rounded-[4px] text-white flex justify-center items-center">
              Manage Assessments
            </button>
          </Link>
        ) : (
          <></>
        )}
      </div>
      {assessmentData?.length === 0 ? (
        <div className="text-3xl flex justify-center">
          No Assessment Found
          <p className="ml-2"> Stay tuned for future opportunities 🚀✨</p>
        </div>
      ) : null}
      <section className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessmentData &&
            assessmentData.map((single, index) => (
              <AssessmentCard key={index} {...single} />
            ))}
        </div>
      </section>
    </section>
  );
}
