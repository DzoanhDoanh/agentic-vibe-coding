import React, { useContext, useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const localizer = momentLocalizer(moment);
const Schedule_Teacher = () => {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState({});

  const parseScheduleRule = (scheduleRule) => {
    if (!scheduleRule) return null;
    const raw = String(scheduleRule).trim();
    if (!raw) return null;

    const dayMatch = raw.match(/(CN|T[2-7])([\s,\-]+(CN|T[2-7]))*/i);
    const timeMatch = raw.match(
      /(\d{1,2}:\d{2})\s*(?:-|–|to)\s*(\d{1,2}:\d{2})/i,
    );

    const days = [];
    if (dayMatch) {
      const dayTokens = dayMatch[0]
        .toUpperCase()
        .replace(/\s+/g, "")
        .split(/[,\-]/)
        .filter(Boolean);
      for (const t of dayTokens) {
        if (t === "CN" || /^T[2-7]$/.test(t)) days.push(t);
      }
    }

    const start = timeMatch?.[1]?.padStart(5, "0") || null;
    const end = timeMatch?.[2]?.padStart(5, "0") || null;
    return { days, start, end };
  };

  const dayTokenToDow = (token) => {
    // Moment: Sunday=0
    if (token === "CN") return 0;
    if (token === "T2") return 1;
    if (token === "T3") return 2;
    if (token === "T4") return 3;
    if (token === "T5") return 4;
    if (token === "T6") return 5;
    if (token === "T7") return 6;
    return null;
  };

  const buildEventsForWeek = (classList) => {
    const weekStart = moment().startOf("week").add(1, "day"); // Monday
    // if locale week starts on Monday already, this still yields Monday.
    const weekStartSunday = moment().startOf("week");

    const evts = [];
    for (const c of classList) {
      const days = c.schedule_days?.length
        ? c.schedule_days
        : parseScheduleRule(c.schedule_rule)?.days || [];
      const startTime =
        c.start_time || parseScheduleRule(c.schedule_rule)?.start;
      const endTime = c.end_time || parseScheduleRule(c.schedule_rule)?.end;
      if (!days.length || !startTime || !endTime) continue;

      for (const d of days) {
        const dow = dayTokenToDow(d);
        if (dow == null) continue;

        const base =
          dow === 0
            ? weekStartSunday.clone()
            : weekStart.clone().add(dow - 1, "day");

        const [sh, sm] = String(startTime).split(":").map(Number);
        const [eh, em] = String(endTime).split(":").map(Number);
        const start = base.clone().hour(sh).minute(sm).second(0).millisecond(0);
        const end = base.clone().hour(eh).minute(em).second(0).millisecond(0);

        evts.push({
          title: `${c.name}${c.teacher_id?.full_name ? ` - ${c.teacher_id.full_name}` : ""}`,
          start: start.toDate(),
          end: end.toDate(),
          resource: c,
        });
      }
    }
    return evts;
  };

  const fetchClasses = async () => {
    try {
      if (user?.role === "Teacher") {
        const { data } = await axios.get("/api/classes/my");
        setClasses(data);
        setEvents(buildEventsForWeek(data));
      } else if (user?.role === "Student") {
        const { data } = await axios.get("/api/classes/student/my");
        setClasses(data);
        setEvents(buildEventsForWeek(data));
      } else {
        setClasses([]);
        setEvents([]);
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi tải lịch");
    }
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const attendanceColumns = useMemo(() => {
    return [
      {
        title: "Học sinh",
        dataIndex: "full_name",
        key: "full_name",
        render: (v) => <strong>{v}</strong>,
      },
      {
        title: "Trạng thái",
        key: "status",
        render: (_, record) => {
          const row = attendanceMap[record._id] || {
            status: "Present",
            remarks: "",
          };
          return (
            <Select
              value={row.status}
              onChange={(value) =>
                setAttendanceMap((prev) => ({
                  ...prev,
                  [record._id]: { ...row, status: value },
                }))
              }
              options={[
                { label: "Present", value: "Present" },
                { label: "Absent", value: "Absent" },
                { label: "Late", value: "Late" },
              ]}
              style={{ width: 140 }}
            />
          );
        },
      },
      {
        title: "Điểm",
        key: "score",
        render: (_, record) => {
          const row = attendanceMap[record._id] || {
            status: "Present",
            remarks: "",
            score: null,
          };
          return (
            <InputNumber
              value={row.score}
              onChange={(value) =>
                setAttendanceMap((prev) => ({
                  ...prev,
                  [record._id]: { ...row, score: value },
                }))
              }
              min={0}
              max={10}
              step={0.25}
              style={{ width: 120 }}
              placeholder="-"
            />
          );
        },
      },
      {
        title: "Ghi chú",
        key: "remarks",
        render: (_, record) => {
          const row = attendanceMap[record._id] || {
            status: "Present",
            remarks: "",
            score: null,
          };
          return (
            <Input
              value={row.remarks || ""}
              onChange={(e) =>
                setAttendanceMap((prev) => ({
                  ...prev,
                  [record._id]: { ...row, remarks: e.target.value },
                }))
              }
              placeholder="Nhận xét"
            />
          );
        },
      },
    ];
  }, [attendanceMap]);

  const openAttendance = async (clazz) => {
    setSelectedClass(clazz);
    setSelectedDate(moment());
    setAttendanceMap({});
    setAttendanceOpen(true);
  };

  const fetchAttendance = async (clazz, dateMoment) => {
    try {
      setAttendanceLoading(true);
      const date = dateMoment.format("YYYY-MM-DD");
      const { data } = await axios.get(`/api/attendance/class/${clazz._id}`, {
        params: { date },
      });

      const initial = {};
      for (const s of clazz.enrolled_students || []) {
        initial[s._id] = { status: "Present", remarks: "", score: null };
      }
      for (const r of data || []) {
        if (r.student_id?._id) {
          initial[r.student_id._id] = {
            status: r.status,
            remarks: r.remarks || "",
            score: r.score ?? null,
          };
        }
      }
      setAttendanceMap(initial);
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi tải điểm danh");
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (!attendanceOpen || !selectedClass) return;
    fetchAttendance(selectedClass, selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceOpen, selectedClass?._id, selectedDate?.valueOf()]);

  const saveAttendance = async () => {
    if (!selectedClass) return;
    try {
      setAttendanceLoading(true);
      const date = selectedDate.format("YYYY-MM-DD");
      const records = Object.entries(attendanceMap).map(([studentId, v]) => ({
        student_id: studentId,
        status: v.status,
        remarks: v.remarks,
        score: v.score ?? null,
      }));
      await axios.post(`/api/attendance/class/${selectedClass._id}`, {
        date,
        records,
      });
      message.success("Lưu điểm danh thành công");
      setAttendanceOpen(false);
      setSelectedClass(null);
      setAttendanceMap({});
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi lưu điểm danh");
    } finally {
      setAttendanceLoading(false);
    }
  };

  return (
    <div style={{ height: "75vh", background: "#fff" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>
          {user?.role === "Teacher"
            ? "Lịch dạy (Giáo viên)"
            : user?.role === "Student"
              ? "Lịch học (Học sinh)"
              : "Lịch"}
        </h2>
        {user?.role === "Teacher" ? (
          <Tag color="blue">Bạn có thể bấm vào lớp để điểm danh</Tag>
        ) : null}
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", marginTop: "20px" }}
        onSelectEvent={(evt) => {
          if (user?.role === "Teacher") {
            openAttendance(evt.resource);
          }
        }}
      />

      <Modal
        title={
          selectedClass ? `Điểm danh - ${selectedClass.name}` : "Điểm danh"
        }
        open={attendanceOpen}
        onOk={saveAttendance}
        onCancel={() => {
          setAttendanceOpen(false);
          setSelectedClass(null);
          setAttendanceMap({});
        }}
        okText="Lưu"
        cancelText="Hủy"
        width={900}
        confirmLoading={attendanceLoading}
        destroyOnClose
      >
        {selectedClass && (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Typography.Text strong>Ngày:</Typography.Text>
              <DatePicker
                value={selectedDate}
                onChange={(v) => v && setSelectedDate(v)}
                format="YYYY-MM-DD"
              />
              <Typography.Text type="secondary">
                Học sinh ghi danh:{" "}
                {(selectedClass.enrolled_students || []).length}
              </Typography.Text>
            </div>

            <Table
              columns={attendanceColumns}
              dataSource={selectedClass.enrolled_students || []}
              rowKey="_id"
              pagination={false}
              loading={attendanceLoading}
            />
          </Space>
        )}
      </Modal>
    </div>
  );
};
export default Schedule_Teacher;
