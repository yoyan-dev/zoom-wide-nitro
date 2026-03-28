import { getHeader, readBody, type H3Event } from "h3";
import { requireMultipartFormData } from "./multipart";
import { uploadUserImage } from "./storage";
import {
  getAccountImagePart,
  parseCustomerMultipartFields,
  parseCustomerRegisterMultipartFields,
  parseDriverMultipartFields,
  parseOwnAccountMultipartFields,
  parseUserMultipartFields,
} from "./resource-form-data";

export async function readUserAccountInput(event: H3Event): Promise<unknown> {
  const contentType = getHeader(event, "content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return readBody(event);
  }

  const formData = await requireMultipartFormData(event, "user account request");
  const imagePart = getAccountImagePart(formData);
  const body = parseUserMultipartFields(formData);

  return {
    ...body,
    image_url: imagePart ? await uploadUserImage(imagePart) : body.image_url,
  };
}

export async function readDriverAccountInput(
  event: H3Event,
): Promise<unknown> {
  const contentType = getHeader(event, "content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return readBody(event);
  }

  const formData = await requireMultipartFormData(
    event,
    "driver account request",
  );
  const imagePart = getAccountImagePart(formData);
  const body = parseDriverMultipartFields(formData);

  return {
    ...body,
    image_url: imagePart ? await uploadUserImage(imagePart) : body.image_url,
  };
}

export async function readCustomerAccountInput(
  event: H3Event,
): Promise<unknown> {
  const contentType = getHeader(event, "content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return readBody(event);
  }

  const formData = await requireMultipartFormData(
    event,
    "customer account request",
  );
  const imagePart = getAccountImagePart(formData);
  const body = parseCustomerMultipartFields(formData);

  return {
    ...body,
    image_url: imagePart ? await uploadUserImage(imagePart) : body.image_url,
  };
}

export async function readCustomerRegisterInput(
  event: H3Event,
): Promise<unknown> {
  const contentType = getHeader(event, "content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return readBody(event);
  }

  const formData = await requireMultipartFormData(
    event,
    "customer registration",
  );
  const imagePart = getAccountImagePart(formData);
  const body = parseCustomerRegisterMultipartFields(formData);

  return {
    ...body,
    image_url: imagePart ? await uploadUserImage(imagePart) : body.image_url,
  };
}

export async function readOwnAccountInput(event: H3Event): Promise<unknown> {
  const contentType = getHeader(event, "content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return readBody(event);
  }

  const formData = await requireMultipartFormData(event, "account update");
  const imagePart = getAccountImagePart(formData);
  const body = parseOwnAccountMultipartFields(formData);

  return {
    ...body,
    image_url: imagePart ? await uploadUserImage(imagePart) : body.image_url,
  };
}
