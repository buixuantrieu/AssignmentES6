import { format } from "date-fns";

export const convertToDate = (input) => {
  const [datePart, secondsPart] = input.split("_");
  const [day, month, year] = datePart.split("/");
  const totalSeconds = parseFloat(secondsPart);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hours
    .toString()
    .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}Z`;
  return isoDate;
};
