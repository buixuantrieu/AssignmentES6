/* eslint-disable react-hooks/exhaustive-deps */
import { FaCloudUploadAlt } from "react-icons/fa";

import { Form, Upload, Button, Table, notification, Slider, Row, Col, Input, DatePicker, Card } from "antd";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Modal } from "antd";
import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import qs from "qs";
import { ROUTES } from "../../constants/route";
import _ from "lodash";
import "dayjs/locale/vi";
import { FaMoneyBillWave } from "react-icons/fa6";

const { confirm } = Modal;

function Statement() {
  const [formUpload] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [maxCredit, setMaxCredit] = useState(1000000000);
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
      take: params.take || 20,
      skip: params.skip || 0,
    };
  }, [search]);

  useEffect(() => {
    if (searchParams.credit) {
      const creditArr = searchParams.credit.map((item) => parseFloat(item));
      setRangeValue(creditArr);
    }
  }, [searchParams.credit]);

  const debouncedHandleFilter = _.debounce((key, value) => {
    const newFilterParams = { ...searchParams, [key]: value, take: 20, skip: 0 };
    navigate(`${ROUTES.ADMIN.STATEMENT}?${qs.stringify(newFilterParams)}`);
  }, 50);
  const handleNextPage = () => {
    const skip = Number(searchParams.skip) + 1;
    const newFilterParams = { ...searchParams, take: 20, skip };
    navigate(`${ROUTES.ADMIN.STATEMENT}?${qs.stringify(newFilterParams)}`);
  };
  const handlePrevPage = () => {
    const skip = Number(searchParams.skip) - 1;
    const newFilterParams = { ...searchParams, take: 20, skip };
    navigate(`${ROUTES.ADMIN.STATEMENT}?${qs.stringify(newFilterParams)}`);
  };

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

  useEffect(() => {
    if (maxCredit != data?.data?.maxCredit && data?.data?.maxCredit) {
      setMaxCredit(data?.data?.maxCredit);
    }
  }, [data]);

  const mutationUploadFile = useMutation({
    mutationFn: ({ formData, checkSum }) => {
      setTime({});
      setIsLoading(true);
      return axios.post(`http://localhost:3000/upload-csv?checkSum=${checkSum}`, formData);
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
      showConfirm();
    },
  });

  const handleUploadCSV = async (values) => {
    const formData = new FormData();
    formData.append("fileCSV", values.upload[0].originFileObj);
    mutationUploadFile.mutate({ formData, checkSum: undefined });
  };
  const showConfirm = () => {
    confirm({
      title: "File đã được tải lên trước đó",
      content: "Bạn có muốn ghi đè?.",
      okText: "Đồng ý",
      cancelText: "Hủy bỏ",
      onOk() {
        const formData = new FormData();
        const uploadValue = formUpload.getFieldValue("upload");
        formData.append("fileCSV", uploadValue[0].originFileObj);
        mutationUploadFile.mutate({ formData, checkSum: true });
      },
      onCancel() {},
    });
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
      render: (item) => <div className="whitespace-nowrap overflow-hidden w-[350px] truncate">{item}</div>,
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
        <Col className="pt-12" span={7}>
          <Card title="Bộ lọc">
            <Form layout="vertical">
              <Form.Item name="keyword" initialValue={searchParams.keyword}>
                <Input
                  allowClear
                  onChange={(e) => debouncedHandleFilter("keyword", e.target.value)}
                  placeholder="Nhập từ khóa để tìm kiếm..."
                />
              </Form.Item>
              <p className="my-4 font-bold">Số tiền giao dịch: </p>
              <Form.Item>
                <Slider
                  className="flex-1"
                  range
                  step={1000}
                  min={0}
                  value={rangeValue}
                  max={maxCredit}
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
          </Card>
        </Col>

        <Col span={17}>
          <div className="flex justify-between mb-4">
            <Button onClick={() => handlePrevPage()} disabled={searchParams.skip == 0} type="primary">
              Trang trước
            </Button>
            <Button disabled={data?.data?.dataList?.length < 20} onClick={() => handleNextPage()} type="primary">
              Trang sau
            </Button>
          </div>
          <div className=" shadow">
            <Table
              loading={isLoading || isFetching}
              dataSource={data?.data?.dataList ? data.data.dataList : []}
              columns={columns}
              pagination={false}
              rowKey="id"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Statement;
