import { DatePicker } from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

function fetchTotalAmount(date) {
  return axios.get(`http://localhost:3000/total-by-day`, {
    params: { date: dayjs(date).toISOString() },
  });
}

function StatisticsByDay() {
  const [selectedDate, setSelectedDate] = useState(null);

  const { data, error, isLoading } = useQuery({
    queryKey: ["totalAmountByDay", selectedDate],
    queryFn: () => fetchTotalAmount(selectedDate),
    enabled: !!selectedDate,
  });

  return (
    <div>
      <div className="flex justify-center">
        <DatePicker
          placeholder="Chọn ngày cần thống kê"
          onChange={(value) => setSelectedDate(value)}
          className="w-[300px]"
          allowClear
        />
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

export default StatisticsByDay;
