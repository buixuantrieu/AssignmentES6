import { FaCloudUploadAlt } from "react-icons/fa";

import { Form, Upload, Button, Table, notification, Slider, Row, Col, Input, DatePicker } from "antd";

import { useMutation, useQuery } from "@tanstack/react-query";

import axios from "axios";
import { useState, useMemo, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import qs from "qs";
import { ROUTES } from "../../constants/route";
import _ from "lodash";
import "dayjs/locale/vi";
import { FaMoneyBillWave } from "react-icons/fa6";

function Statement() {
  const [formUpload] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [rangeValue, setRangeValue] = useState([0, 1000000000]);
  const [time, setTime] = useState({});
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const { search } = useLocation();

  const navigate = useNavigate();

  const searchParams = useMemo(() => {
    const params = qs.parse(search, { ignoreQueryPrefix: true });
    return {
      fromDate: params.fromDate,
      credit: params.credit,
      toDate: params.toDate,
      keyword: params.keyword || "",
    };
  }, [search]);

  useEffect(() => {
    if (searchParams.credit) {
      const creditArr = searchParams.credit.map((item) => parseFloat(item));
      setRangeValue(creditArr);
    }
  }, [searchParams.credit]);

  const debouncedHandleFilter = useCallback(
    _.debounce((key, value) => {
      const newFilterParams = { ...searchParams, [key]: value };
      navigate(`${ROUTES.ADMIN.STATEMENT}?${qs.stringify(newFilterParams)}`);
    }, 500),
    [searchParams, navigate]
  );

  useEffect(() => {
    if (searchParams.fromDate) {
      setFromDate(dayjs(searchParams.fromDate));
    }
    if (searchParams.toDate) {
      setToDate(dayjs(searchParams.toDate));
    }
  }, [searchParams.fromDate, searchParams.toDate]);

  const fetchApi = async (search) => {
    const result = await axios.get("http://localhost:3000", {
      params: {
        ...search,
      },
    });
    return result;
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["statement", { ...searchParams }],
    queryFn: () => fetchApi(searchParams),
  });

  const mutationUploadFile = useMutation({
    mutationFn: (formData) => {
      setTime({});
      setIsLoading(true);
      return axios.post("http://localhost:3000/upload-csv", formData);
    },
    onSuccess: (response) => {
      setIsLoading(false);
      formUpload.resetFields();
      setTime(response.data);
      notification.success({ message: "Tải lên file thành công!!!" });
      refetch();
    },
    onError: () => {
      setIsLoading(false);
      console.error("Tải lên file thất bại");
    },
  });

  const handleUploadCSV = async (values) => {
    const formData = new FormData();
    formData.append("fileCSV", values.upload[0].originFileObj);
    mutationUploadFile.mutate(formData);
  };

  const columns = [
    {
      title: "Số giao dịch",
      dataIndex: "transNo",
      key: "transNo",
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "dateTime",
      key: "dateTime",
      render: (item) => {
        return <div style={{ whiteSpace: "nowrap" }}>{dayjs(item).format("DD/MM/YYYY HH:mm:ss")}</div>;
      },
    },
    {
      title: "Số tiền giao dịch",
      dataIndex: "credit",
      key: "credit",
      render: (item) => <div style={{ whiteSpace: "nowrap" }}>{item.toLocaleString()} vnđ</div>,
    },
    {
      title: "Ghi nợ",
      dataIndex: "debit",
      key: "debit",
    },

    {
      title: "Chi tiết giao dịch",
      dataIndex: "detail",
      key: "detail",
    },
  ];

  return (
    <div className="px-16">
      <div className="mt-8 flex justify-center ">
        <Form form={formUpload} onFinish={handleUploadCSV} className="flex items-start gap-4">
          <Form.Item
            name="upload"
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
            rules={[
              {
                message: "Bạn chưa chọn file!",
                required: true,
              },
            ]}
          >
            <Upload name="fileCSV" listType="picture" beforeUpload={() => false} maxCount={1}>
              <Button icon={<FaCloudUploadAlt />}>Click to upload</Button>
            </Upload>
          </Form.Item>

          <Button loading={isLoading} className="bg-[#7367f0] text-white hover:text-[red]" htmlType="submit">
            Đọc file
          </Button>
        </Form>
      </div>
      <div className="flex gap-4 text-[12px]  min-h-[50px]">
        <span>
          {" "}
          <b>Thời gian tải danh sách:</b>
          {data?.data?.endTime && <span> {data?.data?.endTime}ms</span>}
        </span>
        {time.fileReadingTime && (
          <>
            <span>
              <b>Thời gian đọc file:</b>
              <span> {time.fileReadingTime}ms</span>
            </span>
            <span>
              <b>Thời gian nạp dữ liệu vào database:</b>
              <span> {time.databaseRetentionTime - time.fileReadingTime}ms</span>
            </span>
          </>
        )}
      </div>
      <Row gutter={[32, 32]}>
        <Col className="shadow pt-4 pb-4" span={7}>
          <Form layout="vertical">
            <h1 className="text-[20px] font-medium mb-3">Bộ lọc</h1>
            <Form.Item name="keyword" initialValue={searchParams.keyword}>
              <Input
                onChange={(e) => debouncedHandleFilter("keyword", e.target.value)}
                placeholder="Nhập từ khóa để tìm kiếm..."
              />
            </Form.Item>
            <p className="my-4 font-bold">Số tiền giao dịch: </p>
            <Form.Item>
              <Slider
                className="flex-1"
                range
                min={0}
                value={rangeValue}
                max={1000000000}
                onChange={(value) => {
                  setRangeValue(value);
                  debouncedHandleFilter("credit", value);
                }}
              />
              <span className="flex items-center gap-2">
                {rangeValue[0].toLocaleString()}{" "}
                <span>
                  <FaMoneyBillWave />
                </span>{" "}
                <span> -</span> {rangeValue[1].toLocaleString()}{" "}
                <span>
                  <FaMoneyBillWave />
                </span>
              </span>
            </Form.Item>
            <Form.Item label="Từ ngày:">
              <DatePicker
                className="w-full"
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                onChange={(value) => {
                  value
                    ? debouncedHandleFilter("fromDate", dayjs(value).toISOString())
                    : debouncedHandleFilter("fromDate", undefined);
                }}
                value={fromDate}
                placeholder="Select Date and Time"
              />
            </Form.Item>
            <Form.Item label="Đến ngày:">
              <DatePicker
                onChange={(value) => {
                  value
                    ? debouncedHandleFilter("toDate", dayjs(value).toISOString())
                    : debouncedHandleFilter("toDate", undefined);
                }}
                value={toDate}
                className="w-full"
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="Select Date and Time"
              />
            </Form.Item>
          </Form>
        </Col>

        <Col span={17}>
          <div className=" shadow">
            <Table
              loading={isLoading || isFetching}
              dataSource={data?.data?.dataList ? data.data.dataList : []}
              columns={columns}
              rowKey="id"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Statement;
