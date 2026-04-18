// @ts-ignore
/* eslint-disable */
import request from "@/request";

/** addSpaceUser POST /api/spaceUser/add */
export async function addSpaceUserUsingPost(
  body: API.SpaceUserAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>("/api/spaceUser/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** deleteSpaceUser POST /api/spaceUser/delete */
export async function deleteSpaceUserUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/spaceUser/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** getSpaceUserById GET /api/spaceUser/get/${param0} */
export async function getSpaceUserByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSpaceUserByIdUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseSpaceUser_>(`/api/spaceUser/get/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** getSpaceUserVOById GET /api/spaceUser/get/vo/${param0} */
export async function getSpaceUserVoByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSpaceUserVOByIdUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseSpaceUserVO_>(
    `/api/spaceUser/get/vo/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** listSpaceUserVOByPage POST /api/spaceUser/list/page/vo */
export async function listSpaceUserVoByPageUsingPost(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageSpaceUserVO_>(
    "/api/spaceUser/list/page/vo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** isSpacePermission GET /api/spaceUser/SpacePermission */
export async function isSpacePermissionUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.isSpacePermissionUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>("/api/spaceUser/SpacePermission", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** updateSpaceUser POST /api/spaceUser/update */
export async function updateSpaceUserUsingPost(
  body: API.SpaceUserUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/spaceUser/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
