import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Input } from "antd";

function StatisticsByMoney() {
  const [money, setMoney] = useState(null);

  function fetchTotalAmount(money) {
    return axios.get(`http://localhost:3000/count`, {
      params: { money },
    });
  }

  const { data, error, isLoading } = useQuery({
    queryKey: ["countAmount", money],
    queryFn: () => fetchTotalAmount(money),
    enabled: !!money,
  });

  return (
    <div>
      <div className="flex justify-center">
        <Input
          type="number"
          allowClear
          placeholder="Nhập số tiền cần thống kê"
          className="w-[300px]"
          onChange={(e) => setMoney(e.target.value)}
        />
      </div>
      <div className="flex justify-center mt-4">
        {isLoading && <h2>Loading...</h2>}
        {!isLoading && !error && data && (
          <h2>
            <span className="font-medium text-[#7367f0]">
              Số lượng giao dịch với số tiền {Number(money).toLocaleString()} vnd là:
            </span>{" "}
            {data.data.count} giao dịch
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
export default StatisticsByMoney;
