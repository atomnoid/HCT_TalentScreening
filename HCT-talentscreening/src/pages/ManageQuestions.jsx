import { useEffect, useState } from "react";
import {
  createQuestion,
  deleteQuestion,
  getQuestionsByRole,
  getRoles,
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

  const loadQuestions = async (roleId) => {
    if (!roleId) {
      setQuestions([]);
      return;
    }

    setLoadingQuestions(true);
    try {
      const data = await getQuestionsByRole(roleId);
      setQuestions(data);
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
    await loadQuestions(roleId);
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
      await loadQuestions(selectedRoleId);
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
    const confirmed = window.confirm("Delete this question?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteQuestion(id);
      await loadQuestions(selectedRoleId);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete question.");
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
    setError("");
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

            {loadingQuestions ? (
              <p className="mt-4 text-slate-500">Loading questions...</p>
            ) : !selectedRoleId ? (
              <p className="mt-4 text-slate-500">Select a role to view questions.</p>
            ) : questions.length === 0 ? (
              <p className="mt-4 text-slate-500">No questions found for this role.</p>
            ) : (
              <table className="mt-4 w-full text-left text-sm text-slate-700">
                <thead>
                  <tr>
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
                  {questions.map((question) => (
                    <tr key={question.id} className="odd:bg-slate-50">
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
                            className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(question.id)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
