import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

function StatisticsPeriod() {
  const { RangePicker } = DatePicker;
  const [selectedDate, setSelectedDate] = useState(null);

  function fetchTotalAmount(date) {
    return axios.get(`http://localhost:3000/total-period`, {
      params: { date: date.map((item) => dayjs(item).toISOString()) },
    });
  }

  const { data, error, isLoading } = useQuery({
    queryKey: ["totalAmountPeriod", selectedDate],
    queryFn: () => fetchTotalAmount(selectedDate),
    enabled: !!selectedDate,
  });

  return (
    <div>
      <div className="flex justify-center">
        <RangePicker placeholder={["Từ ngày", "Đến ngày"]} onChange={(value) => setSelectedDate(value)} />
      </div>
      <div className="flex justify-center mt-4">
        {isLoading && <h2>Loading...</h2>}
        {!isLoading && !error && data && (
          <h2>
            <span className="font-medium text-[#7367f0]">Tổng số tiền giao dịch:</span>{" "}
            {data.data.total.toLocaleString()} vnđ
          </h2>
        )}
      </div>
      <div className="flex justify-center mt-4">
        {isLoading && <h2>Loading...</h2>}
        {!isLoading && !error && data && (
          <h2>
            <span className="font-medium text-[#7367f0]">Thời gian xử lí:</span> {data.data.endTime} ms
          </h2>
        )}
      </div>
    </div>
  );
}
export default StatisticsPeriod;
