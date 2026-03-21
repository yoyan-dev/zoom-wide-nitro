import type { MultiPartData } from "h3";

const ARRAY_FIELD_ALIASES = {
  typical_uses: ["typical_uses", "typical_uses[]"],
  buying_considerations: [
    "buying_considerations",
    "buying_considerations[]",
  ],
} as const;

const FILE_FIELD_ALIASES = ["image", "image_file", "file"] as const;

function readPartValue(part: MultiPartData): string {
  return part.data.toString("utf8").trim();
}

function getParts(parts: MultiPartData[], names: readonly string[]) {
  return parts.filter((part) => part.name && names.includes(part.name));
}

function parseOptionalString(parts: MultiPartData[], field: string) {
  const part = parts.find((item) => item.name === field);

  if (!part) {
    return undefined;
  }

  const value = readPartValue(part);
  return value.length > 0 ? value : undefined;
}

function parseStringArray(parts: MultiPartData[], names: readonly string[]) {
  const matches = getParts(parts, names);

  if (matches.length === 0) {
    return undefined;
  }

  const values = matches
    .map(readPartValue)
    .filter((value) => value.length > 0);

  if (values.length === 0) {
    return [];
  }

  if (values.length === 1) {
    try {
      const parsed = JSON.parse(values[0]);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }
    } catch {
      // Fall back to treating the field as a single repeated value.
    }
  }

  return values;
}

function parseFeaturedSpecs(parts: MultiPartData[]) {
  const matches = getParts(parts, ["featured_specs", "featured_specs[]"]);

  if (matches.length === 0) {
    return undefined;
  }

  const values = matches
    .map(readPartValue)
    .filter((value) => value.length > 0);

  if (values.length === 0) {
    return [];
  }

  if (values.length === 1) {
    try {
      const parsed = JSON.parse(values[0]);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      throw new Error("featured_specs must be a valid JSON array");
    }
  }

  return values.map((value) => {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error("featured_specs entries must be valid JSON objects");
    }
  });
}

export function parseCategoryMultipartFields(parts: MultiPartData[]) {
  return {
    name: parseOptionalString(parts, "name"),
    description: parseOptionalString(parts, "description"),
    overview: parseOptionalString(parts, "overview"),
    typical_uses: parseStringArray(parts, ARRAY_FIELD_ALIASES.typical_uses),
    buying_considerations: parseStringArray(
      parts,
      ARRAY_FIELD_ALIASES.buying_considerations,
    ),
    featured_specs: parseFeaturedSpecs(parts),
  };
}

export function getCategoryImagePart(parts: MultiPartData[]) {
  return parts.find(
    (part) =>
      !!part.name &&
      FILE_FIELD_ALIASES.includes(part.name as (typeof FILE_FIELD_ALIASES)[number]) &&
      !!part.filename &&
      part.data.length > 0,
  );
}
