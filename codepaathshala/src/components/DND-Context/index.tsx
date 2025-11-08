import deletebin from "assets/svg/delete.svg";
import edit from "assets/svg/edit.svg";
import prev from "assets/svg/prev-primary-300.svg";
import { Typography, Button } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableItemProps } from "_utils/interface";

export default function SortableItem({
  id,
  section,
  opendeletecard,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex justify-between items-center mb-[16px] w-full bg-white h-auto md:h-[86px]"
    >
      <div className="flex flex-col mr-4">
        <img
          src={prev}
          className="transform rotate-90 h-[2vh] fill-secondary-500 mb-3"
          alt="Up"
        />
        <img
          src={prev}
          className="transform rotate-[270deg] h-[2vh]"
          alt="Down"
        />
      </div>

      <div className="flex justify-between items-center border border-primary-100 mb-4 rounded-lg h-auto md:h-24 p-2 w-full">
        <div className="flex items-center">
          <div className="flex-col">
            <Typography variant="h6" sx={{ color: "#001F68" }}>
              {section.title}
            </Typography>
            <div className="flex flex-col md:flex-row gap-2">
              <span className="rounded-full bg-primary-100 border border-primary-300 p-2 text-xs">
                {section.sections_type === "P"
                  ? "Coding"
                  : section.sections_type === "M"
                  ? "MCQ"
                  : "Subjective"}
              </span>
              <span className="rounded-full bg-primary-100 border border-primary-300 p-2 text-xs">
                <span className="font-light mr-1">Passing Percentage</span>
                <span className="text-secondary-500 font-semibold">
                  {section.section_cutoff}%
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="h-full flex items-center md:flex-row flex-col ">
          <Button
            variant="outlined"
            color="error"
            sx={{
              fontSize: "12px",
              height: { xs: "25px", md: "50%" },
              minWidth: "1%",
              width: { xs: "75px", md: "auto" },
              marginRight: "4px",
              marginBottom: { xs: "4px", md: "0px" },
            }}
            onClick={opendeletecard}
          >
            <img src={deletebin} alt="Delete" />
          </Button>
          <Button
            variant="outlined"
            sx={{
              fontSize: "12px",
              width: { xs: "75px", md: "auto" },
              height: { xs: "25px", md: "50%" },
              borderColor: "#001F68",
              color: "#001F68",
            }}
            className="flex flex-row justify-evenly"
          >
            Edit
            <img src={edit} className="fill-secondary-500 ml-2" alt="Edit" />
          </Button>
        </div>
      </div>
    </div>
  );
}
