// Supabase used for question and role
import { supabase } from "../lib/supabase";

function normalizeCsvValue(value) {
  return (value ?? "")
    .toString()
    .replace(/^\uFEFF/, "")
    .trim();
}

function parseCsvText(csvText) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentValue);

      if (currentRow.some((cell) => normalizeCsvValue(cell) !== "")) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);

    if (currentRow.some((cell) => normalizeCsvValue(cell) !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function createHeaderMap(headers) {
  const headerMap = {};

  headers.forEach((header, index) => {
    headerMap[normalizeCsvValue(header).toLowerCase()] = index;
  });

  return headerMap;
}

// fetch roles used in dropdowns and forms
export async function getRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch roles:", error);
    return [];
  }

  return data ?? [];
}

// Retrieve the currently authenticated user's profile (applicant-facing)
export async function getApplicantProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const user = userData?.user;

  if (!user) {
    throw new Error("No active session.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error("Profile not found.");
  }

  return profile;
}

// crud -
// Fetch question rows for a specific role. Throws on Supabase error.
export async function getQuestionsByRole(roleId) {
  console.log("Searching Questions For Role:", roleId);

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("role_id", roleId)
    .order("question", { ascending: true });

  console.log("Supabase Response:", data);
  console.log("Supabase Error:", error);

  if (error) {
    throw error;
  }

  return data ?? [];
}

// Insert a new question row
export async function createQuestion(questionData) {
  const { data, error } = await supabase.from("questions").insert(questionData).single();

  if (error) {
    throw error;
  }

  return data;
}

// Update an existing question row by id
export async function updateQuestion(id, questionData) {
  const { data, error } = await supabase
    .from("questions")
    .update(questionData)
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Delete a question by id
export async function deleteQuestion(id) {
  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

export async function previewQuestionImport(file) {
  const csvText = await file.text();
  const rows = parseCsvText(csvText);

  if (rows.length < 2) {
    throw new Error("CSV format invalid. The file must include a header row and at least one question row.");
  }

  const [headers, ...dataRows] = rows;
  const headerMap = createHeaderMap(headers);
  const requiredHeaders = [
    "role",
    "question",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_option",
  ];
  const missingHeaders = requiredHeaders.filter((header) => headerMap[header] === undefined);

  if (missingHeaders.length > 0) {
    throw new Error(`CSV format invalid. Missing required columns: ${missingHeaders.join(", ")}.`);
  }

  const { data: rolesData, error: rolesError } = await supabase
    .from("roles")
    .select("id, name");

  if (rolesError) {
    throw rolesError;
  }

  const roleLookup = new Map(
    (rolesData ?? []).map((role) => [normalizeCsvValue(role.name).toLowerCase(), role.id])
  );

  const { data: existingQuestions, error: questionsError } = await supabase
    .from("questions")
    .select("role_id, question");

  if (questionsError) {
    throw questionsError;
  }

  const existingQuestionKeys = new Set(
    (existingQuestions ?? []).map((question) => {
      const normalizedQuestion = normalizeCsvValue(question.question).toLowerCase();
      return `${question.role_id}:${normalizedQuestion}`;
    })
  );

  const previewRows = [];
  let skippedCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;
  let totalRows = 0;

  dataRows.forEach((row, index) => {
    const values = {
      role: normalizeCsvValue(row[headerMap.role] ?? ""),
      question: normalizeCsvValue(row[headerMap.question] ?? ""),
      option_a: normalizeCsvValue(row[headerMap.option_a] ?? ""),
      option_b: normalizeCsvValue(row[headerMap.option_b] ?? ""),
      option_c: normalizeCsvValue(row[headerMap.option_c] ?? ""),
      option_d: normalizeCsvValue(row[headerMap.option_d] ?? ""),
      correct_option: normalizeCsvValue(row[headerMap.correct_option] ?? ""),
    };

    const isEmptyRow = Object.values(values).every((value) => value === "");

    if (isEmptyRow) {
      skippedCount += 1;
      return;
    }

    totalRows += 1;

    const normalizedRoleName = values.role.toLowerCase();
    const matchedRoleId = roleLookup.get(normalizedRoleName);
    const normalizedQuestion = values.question.toLowerCase();
    const normalizedCorrectOption = values.correct_option.toUpperCase();
    let status = "ready";
    let reason = "";

    if (!values.question) {
      status = "invalid";
      reason = "Missing question";
      invalidCount += 1;
    } else if (!values.option_a || !values.option_b || !values.option_c || !values.option_d) {
      status = "invalid";
      reason = "Missing option";
      invalidCount += 1;
    } else if (!["A", "B", "C", "D"].includes(normalizedCorrectOption)) {
      status = "invalid";
      reason = "Invalid correct option";
      invalidCount += 1;
    } else if (!matchedRoleId) {
      status = "invalid";
      reason = "Role not found";
      invalidCount += 1;
    } else if (existingQuestionKeys.has(`${matchedRoleId}:${normalizedQuestion}`)) {
      status = "duplicate";
      reason = "Duplicate question already exists";
      duplicateCount += 1;
    }

    previewRows.push({
      rowNumber: index + 2,
      role: values.role,
      question: values.question,
      option_a: values.option_a,
      option_b: values.option_b,
      option_c: values.option_c,
      option_d: values.option_d,
      correct_option: normalizedCorrectOption,
      role_id: matchedRoleId ?? null,
      status,
      reason,
      isImportable: status === "ready",
    });
  });

  return {
    rows: previewRows,
    canImport: invalidCount === 0,
    summary: {
      totalRows,
      imported: 0,
      skipped: skippedCount,
      duplicate: duplicateCount,
      invalid: invalidCount,
      failed: invalidCount > 0 ? 1 : 0,
    },
  };
}

export async function importQuestionsFromPreview(previewRows, summary) {
  const rowsToInsert = previewRows.filter((row) => row.isImportable);

  if (rowsToInsert.length === 0) {
    return {
      ...summary,
      imported: 0,
      failed: summary.invalid > 0 ? 1 : 0,
    };
  }

  const payload = rowsToInsert.map((row) => ({
    role_id: row.role_id,
    question: row.question,
    option_a: row.option_a,
    option_b: row.option_b,
    option_c: row.option_c,
    option_d: row.option_d,
    correct_option: row.correct_option,
  }));

  const { error } = await supabase.from("questions").insert(payload);

  if (error) {
    throw error;
  }

  return {
    ...summary,
    imported: payload.length,
    failed: 0,
  };
}
