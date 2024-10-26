import { Row, Col, Tabs } from "antd";
import StatisticsByDay from "./StatisticsByDay";
import StatisticsPeriod from "./StatisticsPeriod";
import StatisticsByMoney from "./StatisticsByMoney";

function Statistical() {
  const items = [
    {
      label: `Thống kê theo ngày`,
      key: "1",
      children: <StatisticsByDay />,
    },
    {
      label: `Thống kê theo khoảng thời gian`,
      key: "2",
      children: <StatisticsPeriod />,
    },
    {
      label: `Thống kê theo số tiền`,
      key: "3",
      children: <StatisticsByMoney />,
    },
  ];
  return (
    <div className="h-full absolute top-0 left-0 w-full bg-slate-200">
      <Row>
        <Col span={24}>
          <Tabs defaultActiveKey="1" centered items={items} />
        </Col>
      </Row>
    </div>
  );
}
export default Statistical;
