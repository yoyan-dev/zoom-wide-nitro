import {
  readMultipartFormData,
  type H3Event,
  type MultiPartData,
} from "h3";
import { badRequestError } from "./errors";

export async function requireMultipartFormData(
  event: H3Event,
  action: string,
): Promise<MultiPartData[]> {
  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw badRequestError(`multipart/form-data is required for ${action}`);
  }

  return formData;
}
