import React, { useContext, useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/vi";
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

moment.locale("vi");
const localizer = momentLocalizer(moment);
const Schedule_Teacher = () => {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [events, setEvents] = useState([]);
  const [calendarDate, setCalendarDate] = useState(moment());
  const [calendarView, setCalendarView] = useState("week");
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState({});

  const calendarFormats = useMemo(() => {
    return {
      monthHeaderFormat: (date, culture) =>
        `Tháng ${moment(date)
          .locale(culture || "vi")
          .format("M YYYY")}`,
      dayHeaderFormat: (date, culture) =>
        moment(date)
          .locale(culture || "vi")
          .format("dddd, DD/MM/YYYY"),
      dayRangeHeaderFormat: (range, culture) => {
        const start = moment(range?.start).locale(culture || "vi");
        const end = moment(range?.end).locale(culture || "vi");
        return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
      },
      agendaHeaderFormat: (range, culture) => {
        const start = moment(range?.start).locale(culture || "vi");
        const end = moment(range?.end).locale(culture || "vi");
        return `Từ ${start.format("DD/MM/YYYY")} đến ${end.format("DD/MM/YYYY")}`;
      },
    };
  }, []);

  const parseScheduleRule = (scheduleRule) => {
    if (!scheduleRule) return null;
    const raw = String(scheduleRule).trim();
    if (!raw) return null;

    const dayMatch = raw.match(/(CN|T[2-7])([\s,-]+(CN|T[2-7]))*/i);
    const timeMatch = raw.match(
      /(\d{1,2}:\d{2})\s*(?:-|–|to)\s*(\d{1,2}:\d{2})/i,
    );

    const days = [];
    if (dayMatch) {
      const dayTokens = dayMatch[0]
        .toUpperCase()
        .replace(/\s+/g, "")
        .split(/[,-]/)
        .filter(Boolean);
      for (const t of dayTokens) {
        if (t === "CN" || /^T[2-7]$/.test(t)) days.push(t);
      }
    }

    const start = timeMatch?.[1]?.padStart(5, "0") || null;
    const end = timeMatch?.[2]?.padStart(5, "0") || null;
    return { days, start, end };
  };

  const getVisibleRange = (dateMoment, view) => {
    const base = moment(dateMoment);
    if (view === "month") {
      const start = base.clone().startOf("month").startOf("week");
      const end = base.clone().endOf("month").endOf("week");
      return { start, end };
    }
    if (view === "day") {
      const start = base.clone().startOf("day");
      const end = base.clone().endOf("day");
      return { start, end };
    }
    if (view === "agenda") {
      const start = base.clone().startOf("week");
      const end = base.clone().endOf("week");
      return { start, end };
    }
    // default: week
    const start = base.clone().startOf("week");
    const end = base.clone().endOf("week");
    return { start, end };
  };

  const dowToDayToken = (dow) => {
    // Moment: Sunday=0
    if (dow === 0) return "CN";
    if (dow >= 1 && dow <= 6) return `T${dow + 1}`;
    return null;
  };

  const normalizeTime = (t) => {
    if (!t) return null;
    const raw = String(t).trim();
    if (!raw) return null;
    const [h, m] = raw.split(":").map((x) => Number(x));
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const buildEventsForRange = (classList, rangeStart, rangeEnd) => {
    const start = moment(rangeStart).startOf("day");
    const end = moment(rangeEnd).endOf("day");
    if (!start.isValid() || !end.isValid() || end.isBefore(start)) return [];

    const classSchedules = (classList || []).map((c) => {
      const parsed = parseScheduleRule(c.schedule_rule);
      const days = c.schedule_days?.length
        ? c.schedule_days
        : parsed?.days || [];
      const startTime = normalizeTime(c.start_time || parsed?.start);
      const endTime = normalizeTime(c.end_time || parsed?.end);
      return { c, days, startTime, endTime };
    });

    const evts = [];
    const cursor = start.clone();
    while (cursor.isSameOrBefore(end, "day")) {
      const token = dowToDayToken(cursor.day());
      if (token) {
        for (const item of classSchedules) {
          if (!item.days?.includes(token) || !item.startTime || !item.endTime)
            continue;

          const [sh, sm] = item.startTime.split(":").map(Number);
          const [eh, em] = item.endTime.split(":").map(Number);
          const startAt = cursor
            .clone()
            .hour(sh)
            .minute(sm)
            .second(0)
            .millisecond(0);
          const endAt = cursor
            .clone()
            .hour(eh)
            .minute(em)
            .second(0)
            .millisecond(0);

          if (!endAt.isAfter(startAt)) continue;

          const c = item.c;
          evts.push({
            title: `${c.name}${c.teacher_id?.full_name ? ` - ${c.teacher_id.full_name}` : ""}`,
            start: startAt.toDate(),
            end: endAt.toDate(),
            resource: c,
          });
        }
      }
      cursor.add(1, "day");
    }
    return evts;
  };

  const fetchClasses = async () => {
    try {
      if (user?.role === "Teacher") {
        const { data } = await axios.get("/api/classes/my");
        setClasses(data);
      } else if (user?.role === "Student") {
        const { data } = await axios.get("/api/classes/student/my");
        setClasses(data);
      } else {
        setClasses([]);
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi tải lịch");
    }
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    const { start, end } = getVisibleRange(calendarDate, calendarView);
    setEvents(buildEventsForRange(classes, start, end));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, calendarDate?.valueOf(), calendarView]);

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
                { label: "Có mặt", value: "Present" },
                { label: "Vắng", value: "Absent" },
                { label: "Đi trễ", value: "Late" },
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

  const openAttendance = async (clazz, dateObj) => {
    setSelectedClass(clazz);
    setSelectedDate(moment(dateObj));
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
        culture="vi"
        formats={calendarFormats}
        date={calendarDate.toDate()}
        view={calendarView}
        onNavigate={(date) => setCalendarDate(moment(date))}
        onView={(v) => setCalendarView(v)}
        messages={{
          today: "Hôm nay",
          previous: "Trước",
          next: "Sau",
          month: "Tháng",
          week: "Tuần",
          day: "Ngày",
          agenda: "Danh sách",
          date: "Ngày",
          time: "Giờ",
          event: "Lớp",
          noEventsInRange: "Không có lịch trong khoảng này",
          showMore: (total) => `+${total} thêm`,
        }}
        style={{ height: "100%", marginTop: "20px" }}
        onSelectEvent={(evt) => {
          if (user?.role === "Teacher") {
            openAttendance(evt.resource, evt.start);
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
