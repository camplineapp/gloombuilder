import type { Section, SectionExercise, ExerciseData } from "@/lib/exercises";
import { generateId } from "@/lib/exercises";

export interface ParseInput {
  text: string;
  exerciseLibrary: ExerciseData[];
}

export interface ParseResult {
  sections: Section[];
  exerciseCount: number;
}

interface RepInfo {
  reps: string;
  exerciseName: string;
  cadence: "IC" | "OYO";
}

const SECTION_COLORS = ["#22c55e", "#f59e0b", "#a78bfa"];

function pickSectionColor(index: number): string {
  return SECTION_COLORS[index % SECTION_COLORS.length];
}

function extractCadence(line: string): { cadence: "IC" | "OYO"; textWithoutCadence: string } {
  const m = line.match(/\s+(ic|oyo)\s*$/i);
  if (m && typeof m.index === "number") {
    const tag = m[1].toLowerCase();
    const cadence: "IC" | "OYO" = tag === "ic" ? "IC" : "OYO";
    const textWithoutCadence = line.slice(0, m.index).trimEnd();
    return { cadence, textWithoutCadence };
  }
  return { cadence: "OYO", textWithoutCadence: line };
}

function matchExercise(name: string, library: ExerciseData[]): ExerciseData | null {
  const target = name.trim().toLowerCase();
  if (!target) return null;

  const tryTarget = (t: string): ExerciseData | null => {
    for (const e of library) {
      if (e.n && e.n.toLowerCase() === t) return e;
      if (e.f && e.f.toLowerCase() === t) return e;
      const aliasField = (e as unknown as { aliases?: string | string[] }).aliases;
      if (aliasField) {
        const aliasArr = Array.isArray(aliasField)
          ? aliasField.map(a => String(a).trim().toLowerCase()).filter(Boolean)
          : aliasField.split("|").map(a => a.trim().toLowerCase()).filter(Boolean);
        if (aliasArr.includes(t)) return e;
      }
    }
    return null;
  };

  let result = tryTarget(target);
  if (result) return result;

  if (target.endsWith("s") && target.length > 1) {
    result = tryTarget(target.slice(0, -1));
    if (result) return result;
  }
  if (target.endsWith("es") && target.length > 2) {
    result = tryTarget(target.slice(0, -2));
    if (result) return result;
  }

  return null;
}

function antiPatternRejects(name: string, library: ExerciseData[]): boolean {
  if (matchExercise(name, library) !== null) return false;
  const trimmed = name.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const charCount = trimmed.length;
  return wordCount < 2 && charCount < 6;
}

function extractReps(line: string, library: ExerciseData[]): RepInfo | null {
  const { cadence, textWithoutCadence: workLine } = extractCadence(line);

  // PATTERN 1: xN or x N anywhere in line
  const p1 = workLine.match(/\bx\s*(\d+)\b/i);
  if (p1 && typeof p1.index === "number") {
    const reps = p1[1];
    const rest = (workLine.slice(0, p1.index) + workLine.slice(p1.index + p1[0].length))
      .replace(/\s+/g, " ")
      .trim();
    return { reps, exerciseName: rest, cadence };
  }

  // PATTERN 2: trailing duration unit
  const p2 = workLine.match(/(\d+)\s*(seconds|sec|minutes|min)\s*$/i);
  if (p2 && typeof p2.index === "number") {
    const num = p2[1];
    const unitRaw = p2[2].toLowerCase();
    const unit = unitRaw.startsWith("min") ? "min" : "sec";
    const reps = num + unit;
    const rest = workLine.slice(0, p2.index).trim();
    return { reps, exerciseName: rest, cadence };
  }

  // PATTERN 3: trailing digit at end of line
  const p3 = workLine.match(/^(.+?)\s+(\d+)\s*$/);
  if (p3) {
    const exerciseName = p3[1].trim();
    if (antiPatternRejects(exerciseName, library)) return null;
    return { reps: p3[2], exerciseName, cadence };
  }

  // PATTERN 4: leading digit at start
  const p4 = workLine.match(/^(\d+)\s+(.+)$/);
  if (p4) {
    const exerciseName = p4[2].trim();
    if (antiPatternRejects(exerciseName, library)) return null;
    return { reps: p4[1], exerciseName, cadence };
  }

  return null;
}

function newSection(label: string, index: number): Section {
  const name = label.trim() || "Untitled";
  return {
    id: generateId(),
    label: name,
    name,
    color: pickSectionColor(index),
    exercises: [],
    qNotes: "",
    note: "",
  };
}

function pushExercise(section: Section, partial: Partial<SectionExercise> & { name: string }, matched?: ExerciseData | null) {
  const reps = partial.r ?? "";
  const cadence = partial.c ?? "";
  const exercise: SectionExercise = {
    id: generateId(),
    name: matched ? matched.n : partial.name,
    n: matched ? matched.n : partial.name,
    r: reps,
    c: cadence,
    nt: "",
    note: "",
    ...(matched ? { exerciseId: matched.id } : {}),
  };
  section.exercises.push(exercise);
}

export function parseNotepad(input: ParseInput): ParseResult {
  const { text, exerciseLibrary } = input;
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let previousLineWasEmpty = true;

  const lines = text.split("\n");

  for (const rawLine of lines) {
    // Q1: empty
    if (rawLine.trim() === "") {
      previousLineWasEmpty = true;
      continue;
    }

    // Q2: NOTE
    const noteMatch = rawLine.match(/^\s*[-*•]\s*(.+)$/);
    if (noteMatch) {
      const noteText = noteMatch[1].trim();
      if (currentSection !== null) {
        if (currentSection.exercises.length === 0) {
          if (currentSection.qNotes && currentSection.qNotes.trim().length > 0) {
            currentSection.qNotes = currentSection.qNotes + "\n" + noteText;
          } else {
            currentSection.qNotes = noteText;
          }
          currentSection.note = currentSection.qNotes;
        } else {
          const lastEx = currentSection.exercises[currentSection.exercises.length - 1];
          const prev = lastEx.note ?? "";
          if (prev.trim().length > 0) {
            lastEx.note = prev + "\n" + noteText;
          } else {
            lastEx.note = noteText;
          }
          lastEx.nt = lastEx.note;
        }
      }
      previousLineWasEmpty = false;
      continue;
    }

    // Q3: TRANSITION
    const transitionMatch = rawLine.match(/^\s*>\s*(.+)$/);
    if (transitionMatch) {
      const trText = transitionMatch[1].trim();
      if (currentSection !== null) {
        if (currentSection.exercises.length === 0) {
          if (currentSection.qNotes && currentSection.qNotes.trim().length > 0) {
            currentSection.qNotes = currentSection.qNotes + "\n" + trText;
          } else {
            currentSection.qNotes = trText;
          }
          currentSection.note = currentSection.qNotes;
        } else {
          currentSection.exercises.push({
            id: generateId(),
            type: "transition",
            name: trText,
            n: trText,
            r: "",
            c: "",
            nt: "",
            note: "",
          });
        }
      }
      previousLineWasEmpty = false;
      continue;
    }

    // Q4: EXERCISE WITH REPS
    const repInfo = extractReps(rawLine, exerciseLibrary);
    if (repInfo) {
      if (currentSection === null) {
        currentSection = newSection("Untitled", sections.length);
      }
      const matched = matchExercise(repInfo.exerciseName, exerciseLibrary);
      pushExercise(
        currentSection,
        { name: repInfo.exerciseName, r: String(repInfo.reps), c: repInfo.cadence },
        matched
      );
      previousLineWasEmpty = false;
      continue;
    }

    // Q5: SECTION HEADER (previous line empty)
    if (previousLineWasEmpty) {
      if (currentSection !== null) {
        sections.push(currentSection);
      }
      currentSection = newSection(rawLine.trim(), sections.length);
      previousLineWasEmpty = false;
      continue;
    }

    // Q6: EXERCISE WITHOUT REPS
    if (currentSection === null) {
      currentSection = newSection("Untitled", sections.length);
    }
    const trimmed = rawLine.trim();
    const matched6 = matchExercise(trimmed, exerciseLibrary);
    pushExercise(
      currentSection,
      { name: trimmed, r: "", c: "OYO" },
      matched6
    );
    previousLineWasEmpty = false;
  }

  if (currentSection !== null) {
    sections.push(currentSection);
  }

  const exerciseCount = sections.reduce(
    (sum, s) => sum + s.exercises.filter(e => e.type !== "transition").length,
    0
  );

  return { sections, exerciseCount };
}
