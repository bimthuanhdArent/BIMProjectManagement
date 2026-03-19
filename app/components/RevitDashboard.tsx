"use client";

import { useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FolderOpen,
  AlertTriangle,
  HardDrive,
  Plus,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Trash2,
  Upload,
  FileUp,
  X,
} from "lucide-react";

const ACCEPTED_EXTENSIONS = ".ifc,.rvt";

export interface RevitProject {
  id: string;
  name: string;
  warnings: number;
  fileSizeMb: number;
  createdAt: Date;
}

const WARNING_THRESHOLD = 200;

export default function RevitDashboard() {
  const [projects, setProjects] = useState<RevitProject[]>([]);
  const [name, setName] = useState("");
  const [warnings, setWarnings] = useState("");
  const [fileSizeMb, setFileSizeMb] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".ifc" && ext !== ".rvt") {
      return;
    }
    setUploadedFile(file);
    if (!name.trim()) {
      setName(file.name.replace(/\.(ifc|rvt)$/i, ""));
    }
    const sizeMb = file.size / (1024 * 1024);
    setFileSizeMb(sizeMb.toFixed(2));
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseInt(warnings, 10) || 0;
    const mb = parseFloat(fileSizeMb) || 0;
    if (!name.trim()) return;

    setProjects((prev) => [
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        warnings: w,
        fileSizeMb: mb,
        createdAt: new Date(),
      },
      ...prev,
    ]);
    setName("");
    setWarnings("");
    setFileSizeMb("");
    clearUploadedFile();
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const chartData = projects.map((p) => ({
    name: p.name.length > 20 ? p.name.slice(0, 18) + "…" : p.name,
    fullName: p.name,
    dungLuong: p.fileSizeMb,
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            Dashboard sức khỏe dự án Revit
          </h1>
          <p className="mt-2 text-slate-600">
            Theo dõi Warnings và dung lượng file để đảm bảo chất lượng mô hình.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-800">
            <Plus className="h-5 w-5 text-emerald-600" />
            Thêm dự án mới
          </h2>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Upload file IFC / RVT (tùy chọn)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2">
                <Upload className="h-4 w-4 text-emerald-600" />
                Chọn file .ifc hoặc .rvt
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              {uploadedFile && (
                <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  <FileUp className="h-4 w-4" />
                  {uploadedFile.name}
                  <button
                    type="button"
                    onClick={clearUploadedFile}
                    className="rounded p-0.5 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-900"
                    title="Bỏ chọn file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Chọn file để tự điền Tên dự án và Dung lượng file (MB).
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Tên dự án
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Tower A - MEP"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
            <div>
              <label
                htmlFor="warnings"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Số lỗi (Warnings)
              </label>
              <input
                id="warnings"
                type="number"
                min={0}
                value={warnings}
                onChange={(e) => setWarnings(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
            <div>
              <label
                htmlFor="fileSize"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Dung lượng file (MB)
              </label>
              <input
                id="fileSize"
                type="number"
                min={0}
                step="any"
                value={fileSizeMb}
                onChange={(e) => setFileSizeMb(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Thêm dự án
            </button>
          </div>
        </form>

        {projects.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-800">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Lịch sử dung lượng file
            </h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 12, right: 12, left: 0, bottom: 28 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#475569" }}
                      angle={-35}
                      textAnchor="end"
                      height={44}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#475569" }}
                      tickFormatter={(v) => `${v} MB`}
                      label={{
                        value: "Dung lượng (MB)",
                        angle: -90,
                        position: "insideLeft",
                        style: { fill: "#64748b", fontSize: 12 },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: unknown) => [`${value != null ? `${value} MB` : "—"}`, "Dung lượng"]}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.fullName
                          ? `Dự án: ${payload[0].payload.fullName}`
                          : ""
                      }
                    />
                    <Bar
                      dataKey="dungLuong"
                      fill="#059669"
                      radius={[6, 6, 0, 0]}
                      name="Dung lượng (MB)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-6 text-xl font-semibold text-slate-800">
            Danh sách dự án ({projects.length})
          </h2>
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 py-16 text-center text-slate-500">
              <FolderOpen className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3">Chưa có dự án nào. Hãy thêm dự án từ form phía trên.</p>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const isWarning = project.warnings > WARNING_THRESHOLD;
                return (
                  <li
                    key={project.id}
                    className={`rounded-2xl border-2 p-6 shadow-sm transition hover:shadow-md ${
                      isWarning
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-slate-800">
                          {project.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {project.createdAt.toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {isWarning ? (
                          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Cảnh báo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            OK
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(project.id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          title="Xóa dự án"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isWarning ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          <AlertTriangle className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">
                            {project.warnings.toLocaleString()}
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            Warnings
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <HardDrive className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">
                            {project.fileSizeMb.toLocaleString("vi-VN")} MB
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            Dung lượng file
                          </p>
                        </div>
                      </div>
                    </div>
                    {isWarning && (
                      <p className="mt-4 rounded-lg bg-red-100/80 px-3 py-2 text-sm font-medium text-red-800">
                        Số lỗi vượt ngưỡng {WARNING_THRESHOLD}. Cần kiểm tra và tối ưu mô hình.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
