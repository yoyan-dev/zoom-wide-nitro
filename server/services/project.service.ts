import type { H3Event } from "h3";
import type { Order, Project, ProjectItem } from "../types";
import { getCustomerByUserIdRecord } from "../repositories/customers/get-customer-by-user-id";
import { createOrderItemsRecord } from "../repositories/orders/create-order-items";
import { createOrderRecord } from "../repositories/orders/create-order";
import { deleteOrderRecord } from "../repositories/orders/delete-order";
import { getOrderByIdRecord } from "../repositories/orders/get-order-by-id";
import { getProductByIdRecord } from "../repositories/products/get-product-by-id";
import {
  createProjectItemRecord,
  createProjectOrderRecord,
  createProjectRecord,
  deleteProjectItemRecord,
  deleteProjectRecord,
  getProjectByIdRecord,
  getProjectItemByIdRecord,
  getProjectItemByProductRecord,
  listProjectItemsByProjectId,
  listProjectsByUserId,
  updateProjectItemRecord,
  updateProjectRecord,
  updateProjectStatsRecord,
} from "../repositories/project.repo";
import {
  createProjectItemSchema,
  createProjectSchema,
  updateProjectItemSchema,
  updateProjectSchema,
} from "../schemas/project";
import { mapOrder } from "./orders/map-order";
import { isContractor } from "../utils/customer-type";
import {
  badRequestError,
  forbiddenError,
  notFoundError,
} from "../utils/errors";
import { requireActiveRequestUser } from "../utils/permissions";
import { string } from "../utils/validator";

type ContractorUser = ReturnType<typeof requireActiveRequestUser>;

function requireContractor(event: H3Event): ContractorUser {
  const user = requireActiveRequestUser(event);

  if (!isContractor(user)) {
    throw forbiddenError("Only contractor customers can access projects");
  }

  return user;
}

async function getOwnedProjectOrThrow(
  userId: string,
  projectId: string,
): Promise<Project> {
  const project = await getProjectByIdRecord(projectId);

  if (!project || project.user_id !== userId) {
    throw notFoundError("Project not found");
  }

  return project;
}

async function getOwnedProjectItemOrThrow(params: {
  userId: string;
  projectId: string;
  itemId: string;
}): Promise<ProjectItem> {
  await getOwnedProjectOrThrow(params.userId, params.projectId);
  const item = await getProjectItemByIdRecord(params.itemId);

  if (!item || item.project_id !== params.projectId) {
    throw notFoundError("Project item not found");
  }

  return item;
}

async function resolveProjectItemUnitPrice(input: {
  productId: string;
  unitPrice?: number;
}): Promise<number> {
  const product = await getProductByIdRecord(input.productId);

  if (!product) {
    throw notFoundError("Product not found");
  }

  if (product.is_active === false) {
    throw badRequestError("Product is inactive");
  }

  if (typeof product.price !== "number") {
    throw badRequestError("Product price is not available");
  }

  return input.unitPrice ?? product.price;
}

async function getContractorCustomerIdOrThrow(userId: string): Promise<string> {
  const customer = await getCustomerByUserIdRecord(userId);

  if (!customer) {
    throw badRequestError("Contractor customer profile not found");
  }

  return customer.id;
}

export async function createProject(
  event: H3Event,
  input: unknown,
): Promise<Project> {
  const user = requireContractor(event);
  const parsed = createProjectSchema.safeParse(input);

  if (!parsed.success) {
    throw badRequestError(parsed.error.message);
  }

  return createProjectRecord({
    ...parsed.data,
    user_id: user.id,
  });
}

export async function listProjects(event: H3Event): Promise<Project[]> {
  const user = requireContractor(event);
  return listProjectsByUserId(user.id);
}

export async function getProject(
  event: H3Event,
  id: unknown,
): Promise<Project> {
  const user = requireContractor(event);
  const projectId = string(id, "Project id");
  return getOwnedProjectOrThrow(user.id, projectId);
}

export async function updateProject(
  event: H3Event,
  params: {
    id: unknown;
    input: unknown;
  },
): Promise<Project> {
  const user = requireContractor(event);
  const projectId = string(params.id, "Project id");
  const parsed = updateProjectSchema.safeParse(params.input);

  if (!parsed.success) {
    throw badRequestError(parsed.error.message);
  }

  const hasUpdates = Object.values(parsed.data).some(
    (value) => value !== undefined,
  );

  if (!hasUpdates) {
    return getOwnedProjectOrThrow(user.id, projectId);
  }

  await getOwnedProjectOrThrow(user.id, projectId);
  const updatedProject = await updateProjectRecord(projectId, parsed.data);

  if (!updatedProject) {
    throw notFoundError("Project not found");
  }

  return updatedProject;
}

export async function deleteProject(
  event: H3Event,
  id: unknown,
): Promise<void> {
  const user = requireContractor(event);
  const projectId = string(id, "Project id");

  await getOwnedProjectOrThrow(user.id, projectId);
  await deleteProjectRecord(projectId);
}

export async function addProjectItem(
  event: H3Event,
  params: {
    projectId: unknown;
    input: unknown;
  },
): Promise<ProjectItem> {
  const user = requireContractor(event);
  const projectId = string(params.projectId, "Project id");
  const parsed = createProjectItemSchema.safeParse(params.input);

  if (!parsed.success) {
    throw badRequestError(parsed.error.message);
  }

  await getOwnedProjectOrThrow(user.id, projectId);

  const unitPrice = await resolveProjectItemUnitPrice({
    productId: parsed.data.product_id,
    unitPrice: parsed.data.unit_price,
  });

  const existingItem = await getProjectItemByProductRecord({
    project_id: projectId,
    product_id: parsed.data.product_id,
  });

  if (existingItem) {
    const updatedItem = await updateProjectItemRecord(existingItem.id, {
      quantity: existingItem.quantity + parsed.data.quantity,
      unit_price: unitPrice,
    });

    if (!updatedItem) {
      throw notFoundError("Project item not found");
    }

    return updatedItem;
  }

  return createProjectItemRecord({
    project_id: projectId,
    product_id: parsed.data.product_id,
    quantity: parsed.data.quantity,
    unit_price: unitPrice,
  });
}

export async function listProjectItems(
  event: H3Event,
  projectIdInput: unknown,
): Promise<ProjectItem[]> {
  const user = requireContractor(event);
  const projectId = string(projectIdInput, "Project id");

  await getOwnedProjectOrThrow(user.id, projectId);
  return listProjectItemsByProjectId(projectId);
}

export async function updateProjectItemQuantity(
  event: H3Event,
  params: {
    projectId: unknown;
    itemId: unknown;
    input: unknown;
  },
): Promise<ProjectItem> {
  const user = requireContractor(event);
  const projectId = string(params.projectId, "Project id");
  const itemId = string(params.itemId, "Project item id");
  const parsed = updateProjectItemSchema.safeParse(params.input);

  if (!parsed.success) {
    throw badRequestError(parsed.error.message);
  }

  const item = await getOwnedProjectItemOrThrow({
    userId: user.id,
    projectId,
    itemId,
  });

  const updatedItem = await updateProjectItemRecord(item.id, {
    quantity: parsed.data.quantity,
    unit_price: item.unit_price,
  });

  if (!updatedItem) {
    throw notFoundError("Project item not found");
  }

  return updatedItem;
}

export async function removeProjectItem(
  event: H3Event,
  params: {
    projectId: unknown;
    itemId: unknown;
  },
): Promise<void> {
  const user = requireContractor(event);
  const projectId = string(params.projectId, "Project id");
  const itemId = string(params.itemId, "Project item id");

  await getOwnedProjectItemOrThrow({
    userId: user.id,
    projectId,
    itemId,
  });

  await deleteProjectItemRecord(itemId);
}

export async function checkoutProject(
  event: H3Event,
  id: unknown,
): Promise<Order> {
  const user = requireContractor(event);
  const projectId = string(id, "Project id");
  const project = await getOwnedProjectOrThrow(user.id, projectId);
  const items = await listProjectItemsByProjectId(projectId);

  if (items.length === 0) {
    throw badRequestError("Project has no items to checkout");
  }

  const customerId = await getContractorCustomerIdOrThrow(user.id);
  const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);

  let orderId: string | null = null;

  try {
    const order = await createOrderRecord({
      customer_id: customerId,
      status: "pending",
      total_amount: totalAmount,
      notes: `Project checkout: ${project.name}`,
      approved_by: null,
      rejection_reason: null,
    });

    orderId = order.id;

    await createOrderItemsRecord(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.total_price,
      })),
    );

    await createProjectOrderRecord({
      project_id: projectId,
      order_id: order.id,
      total_amount: totalAmount,
    });

    await updateProjectStatsRecord({
      projectId,
      totalOrders: (project.total_orders ?? 0) + 1,
      totalSpent: (project.total_spent ?? 0) + totalAmount,
    });
  } catch (error) {
    if (orderId) {
      await deleteOrderRecord(orderId).catch(() => undefined);
    }

    throw error;
  }

  if (!orderId) {
    throw notFoundError("Created order not found");
  }

  const createdOrder = await getOrderByIdRecord(orderId);

  if (!createdOrder) {
    throw notFoundError("Created order not found");
  }

  return mapOrder(createdOrder);
}
