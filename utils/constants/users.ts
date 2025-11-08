export const Role = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  ORDER_MANAGER: "ORDER_MANAGER",
  DELIVERY: "DELIVERY",
} as const;

export enum UserSortField {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  FIRST_NAME = "firstName",
  LAST_NAME = "lastName",
  ROLE = "role",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}
