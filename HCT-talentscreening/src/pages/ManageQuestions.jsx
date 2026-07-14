import { useEffect, useState } from "react";
import {
  createQuestion,
  deleteQuestion,
  deleteQuestionsByIds,
  getQuestions,
  getRoles,
  importQuestionsFromPreview,
  previewQuestionImport,
  updateQuestion,
} from "../services/questionService";

const defaultQuestionForm = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A",
};

export default function ManageQuestions() {
  // Available roles for the dropdown
  const [roles, setRoles] = useState([]);
  // Role currently selected for question management
  const [selectedRoleId, setSelectedRoleId] = useState("");
  // Questions for the selected role
  const [questions, setQuestions] = useState([]);
  // Controlled form for create/edit question
  const [questionForm, setQuestionForm] = useState(defaultQuestionForm);
  // Currently editing question id (null when adding)
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  // Loading states for roles and questions
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  // UI error message
  const [error, setError] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvPreviewRows, setCsvPreviewRows] = useState([]);
  const [csvImportSummary, setCsvImportSummary] = useState(null);
  const [csvCanImport, setCsvCanImport] = useState(false);
  const [csvError, setCsvError] = useState("");
  const [csvPreviewing, setCsvPreviewing] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionRoleFilter, setQuestionRoleFilter] = useState("");

  // Load roles once on mount for the role selector
  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load roles.");
      } finally {
        setLoadingRoles(false);
      }
    }

    loadRoles();
  }, []);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const data = await getQuestions();
      setQuestions(data);
      setSelectedQuestionIds((previousIds) =>
        previousIds.filter((id) => data.some((question) => question.id === id))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load questions.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleRoleChange = async (e) => {
    const roleId = e.target.value;
    setSelectedRoleId(roleId);
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
    setError("");
    setSuccessMessage("");
    setSelectedQuestionIds([]);
  };

  const handleChange = (e) => {
    setQuestionForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRoleId) {
      setError("Please select a role first.");
      return;
    }

    try {
      const payload = {
        ...questionForm,
        role_id: selectedRoleId,
      };

      if (editingQuestionId) {
        await updateQuestion(editingQuestionId, payload);
      } else {
        await createQuestion(payload);
      }

      setQuestionForm(defaultQuestionForm);
      setEditingQuestionId(null);
      await loadQuestions();
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save question.");
    }
  };

  // Save or update a question for the selected role
  const handleEdit = (question) => {
    // Populate the form for editing the selected question
    setEditingQuestionId(question.id);
    setQuestionForm({
      question: question.question,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option,
    });
    setError("");
  };

  // Delete a question after user confirmation and reload list
  const handleDelete = async (id) => {
    if (isDeleting || loadingQuestions) {
      return;
    }

    const confirmed = window.confirm("Delete this question?");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setSuccessMessage("");
    try {
      await deleteQuestion(id);
      await loadQuestions();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete question.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleQuestionSelection = (id) => {
    if (isDeleting) {
      return;
    }

    setSelectedQuestionIds((previousIds) =>
      previousIds.includes(id)
        ? previousIds.filter((questionId) => questionId !== id)
        : [...previousIds, id]
    );
  };

  const handleSelectAll = () => {
    if (isDeleting) {
      return;
    }

    setSelectedQuestionIds((previousIds) =>
      allVisibleQuestionsSelected
        ? previousIds.filter((id) => !visibleQuestionIds.includes(id))
        : [...new Set([...previousIds, ...visibleQuestionIds])]
    );
  };

  const handleClearSelection = () => {
    if (!isDeleting) {
      setSelectedQuestionIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (isDeleting || loadingQuestions || selectedQuestionIds.length === 0) {
      return;
    }

    const count = selectedQuestionIds.length;
    const confirmed = window.confirm(
      `Delete ${count} selected question${count === 1 ? "" : "s"}?`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");
    setSuccessMessage("");

    try {
      await deleteQuestionsByIds(selectedQuestionIds);
      setSelectedQuestionIds([]);
      await loadQuestions();
      setSuccessMessage(
        `${count} question${count === 1 ? "" : "s"} deleted successfully.`
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete selected questions.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
    setError("");
  };

  const normalizedQuestionSearch = questionSearch.trim().toLowerCase();
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.question
      .toLowerCase()
      .includes(normalizedQuestionSearch);
    const matchesRole = !questionRoleFilter || question.role_id === questionRoleFilter;

    return matchesSearch && matchesRole;
  });
  const visibleQuestionIds = filteredQuestions.map((question) => question.id);
  const allVisibleQuestionsSelected =
    visibleQuestionIds.length > 0 &&
    visibleQuestionIds.every((id) => selectedQuestionIds.includes(id));

  const handleClearFilters = () => {
    setQuestionSearch("");
    setQuestionRoleFilter("");
  };

  const handleCsvFileChange = (e) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setCsvFile(selectedFile);
    setCsvFileName(selectedFile?.name ?? "");
    setCsvPreviewRows([]);
    setCsvImportSummary(null);
    setCsvCanImport(false);
    setCsvError("");
  };

  const handlePreviewCsv = async () => {
    if (!csvFile) {
      setCsvError("Please select a CSV file first.");
      return;
    }

    if (!csvFile.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please choose a valid .csv file.");
      return;
    }

    setCsvPreviewing(true);
    setCsvError("");

    try {
      const preview = await previewQuestionImport(csvFile);
      setCsvPreviewRows(preview.rows);
      setCsvImportSummary(preview.summary);
      setCsvCanImport(preview.canImport);

      if (!preview.canImport) {
        setCsvError("This CSV contains validation errors. Fix the file and try again.");
      }
    } catch (err) {
      console.error(err);
      setCsvPreviewRows([]);
      setCsvImportSummary(null);
      setCsvCanImport(false);
      setCsvError(err.message || "Unable to preview the CSV file.");
    } finally {
      setCsvPreviewing(false);
    }
  };

  const handleImportCsv = async () => {
    if (!csvPreviewRows.length) {
      setCsvError("Preview the CSV first before importing.");
      return;
    }

    if (!csvCanImport) {
      setCsvError("This CSV contains validation errors. Fix the file and try again.");
      return;
    }

    setCsvImporting(true);
    setCsvError("");

    try {
      const result = await importQuestionsFromPreview(csvPreviewRows, csvImportSummary);
      setCsvImportSummary(result);
      setCsvCanImport(false);
      await loadQuestions();
    } catch (err) {
      console.error(err);
      setCsvError(err.message || "Unable to import questions.");
    } finally {
      setCsvImporting(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sampleCsv = [
      "role,question,option_a,option_b,option_c,option_d,correct_option",
      "React Developer,What is JSX?,Syntax Extension,Database,Compiler,Language,A",
    ].join("\n");

    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "question-import-sample.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold text-slate-800">Manage Questions</h1>
          <p className="mt-2 text-slate-600">
            Choose a role, then add, edit, or delete questions for that role.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <div className="bg-white rounded-2xl shadow p-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Select Role</label>
              <select
                value={selectedRoleId}
                onChange={handleRoleChange}
                disabled={isDeleting}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Choose a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Bulk Import Questions</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Upload a CSV file to add multiple questions at once.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Download Sample CSV
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileChange}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  type="button"
                  onClick={handlePreviewCsv}
                  disabled={!csvFile || csvPreviewing}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {csvPreviewing ? "Preparing Preview..." : "Preview CSV"}
                </button>
                <button
                  type="button"
                  onClick={handleImportCsv}
                  disabled={!csvPreviewRows.length || !csvCanImport || csvImporting || csvPreviewing}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {csvImporting ? "Importing..." : "Import Questions"}
                </button>
              </div>

              {csvFileName && <p className="mt-2 text-sm text-slate-500">Selected file: {csvFileName}</p>}
              {csvError && <p className="mt-3 text-sm text-red-600">{csvError}</p>}

              {csvImportSummary && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-800">Import Summary</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Total Rows</p>
                      <p className="mt-1 text-lg font-semibold text-slate-800">{csvImportSummary.totalRows}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Imported</p>
                      <p className="mt-1 text-lg font-semibold text-slate-800">{csvImportSummary.imported}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Skipped</p>
                      <p className="mt-1 text-lg font-semibold text-slate-800">{csvImportSummary.skipped}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Duplicate</p>
                      <p className="mt-1 text-lg font-semibold text-slate-800">{csvImportSummary.duplicate}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Invalid</p>
                      <p className="mt-1 text-lg font-semibold text-slate-800">{csvImportSummary.invalid}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Failed</p>
                      <p className="mt-1 text-lg font-semibold text-slate-800">{csvImportSummary.failed}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {csvImportSummary.failed > 0
                      ? "Validation errors blocked the import. Fix the CSV and try again."
                      : "The import completed and duplicate rows were skipped."}
                  </p>
                </div>
              )}

              {csvPreviewRows.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
                  <table className="mt-3 w-full text-left text-sm text-slate-700">
                    <thead>
                      <tr>
                        <th className="border-b px-3 py-2 font-medium">Row</th>
                        <th className="border-b px-3 py-2 font-medium">Role</th>
                        <th className="border-b px-3 py-2 font-medium">Question</th>
                        <th className="border-b px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreviewRows.map((row) => (
                        <tr key={row.rowNumber} className="odd:bg-slate-50">
                          <td className="border-b px-3 py-2">{row.rowNumber}</td>
                          <td className="border-b px-3 py-2">{row.role}</td>
                          <td className="border-b px-3 py-2">{row.question}</td>
                          <td className="border-b px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                row.status === "ready"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : row.status === "duplicate"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {row.status === "ready"
                                ? "Ready"
                                : row.status === "duplicate"
                                  ? "Duplicate"
                                  : "Invalid"}
                            </span>
                            {row.reason && <span className="ml-2 text-xs text-slate-500">{row.reason}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-slate-800">
                {editingQuestionId ? "Edit Question" : "Add Question"}
              </h2>

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Question</label>
                  <textarea
                    name="question"
                    value={questionForm.question}
                    onChange={handleChange}
                    rows="3"
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Option A</label>
                    <input
                      type="text"
                      name="option_a"
                      value={questionForm.option_a}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Option B</label>
                    <input
                      type="text"
                      name="option_b"
                      value={questionForm.option_b}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Option C</label>
                    <input
                      type="text"
                      name="option_c"
                      value={questionForm.option_c}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Option D</label>
                    <input
                      type="text"
                      name="option_d"
                      value={questionForm.option_d}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Correct Answer</label>
                  <select
                    name="correct_option"
                    value={questionForm.correct_option}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
                  >
                    {editingQuestionId ? "Update Question" : "Add Question"}
                  </button>
                  {editingQuestionId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded-xl bg-slate-200 px-6 py-3 text-slate-700 transition hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold text-slate-800">Questions</h2>

            {successMessage && <p className="mt-3 text-sm text-emerald-600">{successMessage}</p>}

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">Search Questions</label>
                <input
                  type="search"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  disabled={isDeleting}
                  placeholder="Search question text"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="md:w-52">
                <label className="block text-sm font-medium text-slate-700">Filter by Role</label>
                <select
                  value={questionRoleFilter}
                  onChange={(e) => setQuestionRoleFilter(e.target.value)}
                  disabled={isDeleting}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">All Roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={isDeleting}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear Filters
              </button>
            </div>

            {loadingQuestions ? (
              <p className="mt-4 text-slate-500">Loading questions...</p>
            ) : questions.length === 0 ? (
              <p className="mt-4 text-slate-500">No questions found.</p>
            ) : filteredQuestions.length === 0 ? (
              <p className="mt-4 text-slate-500">No questions found.</p>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-700">
                    {selectedQuestionIds.length} Question{selectedQuestionIds.length === 1 ? "" : "s"} Selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      disabled={selectedQuestionIds.length === 0 || isDeleting || loadingQuestions}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Clear Selection
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      disabled={selectedQuestionIds.length === 0 || isDeleting || loadingQuestions}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                    >
                      {isDeleting
                        ? "Deleting..."
                        : `Delete Selected (${selectedQuestionIds.length})`}
                    </button>
                  </div>
                </div>

                <table className="mt-4 w-full text-left text-sm text-slate-700">
                  <thead>
                    <tr>
                    <th className="border-b px-4 py-3 font-medium">
                      <input
                        type="checkbox"
                        checked={allVisibleQuestionsSelected}
                        onChange={handleSelectAll}
                        disabled={isDeleting || loadingQuestions}
                        aria-label="Select all questions"
                      />
                    </th>
                    <th className="border-b px-4 py-3 font-medium">Question</th>
                    <th className="border-b px-4 py-3 font-medium">A</th>
                    <th className="border-b px-4 py-3 font-medium">B</th>
                    <th className="border-b px-4 py-3 font-medium">C</th>
                    <th className="border-b px-4 py-3 font-medium">D</th>
                    <th className="border-b px-4 py-3 font-medium">Correct</th>
                    <th className="border-b px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((question) => (
                    <tr key={question.id} className="odd:bg-slate-50">
                      <td className="border-b px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedQuestionIds.includes(question.id)}
                          onChange={() => handleQuestionSelection(question.id)}
                          disabled={isDeleting || loadingQuestions}
                          aria-label={`Select question: ${question.question}`}
                        />
                      </td>
                      <td className="border-b px-4 py-3">{question.question}</td>
                      <td className="border-b px-4 py-3">{question.option_a}</td>
                      <td className="border-b px-4 py-3">{question.option_b}</td>
                      <td className="border-b px-4 py-3">{question.option_c}</td>
                      <td className="border-b px-4 py-3">{question.option_d}</td>
                      <td className="border-b px-4 py-3">{question.correct_option}</td>
                      <td className="border-b px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(question)}
                            disabled={isDeleting || loadingQuestions}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(question.id)}
                            disabled={isDeleting || loadingQuestions}
                            className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
