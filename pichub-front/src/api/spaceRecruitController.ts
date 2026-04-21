// @ts-ignore
/* eslint-disable */
import request from "@/request";

/** 新增招募 POST /api/spaceRecruit/add */
export async function addRecruitUsingPost(
  body: API.SpaceRecruitAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>("/api/spaceRecruit/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除招募 POST /api/spaceRecruit/delete */
export async function deleteRecruitUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/spaceRecruit/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据 id 获取招募 GET /api/spaceRecruit/get/${param0} */
export async function getRecruitByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRecruitByIdUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseSpaceRecruit_>(
    `/api/spaceRecruit/get/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 根据空间ID获取招募 GET /api/spaceRecruit/get/bySpace/${param0} */
export async function getRecruitBySpaceIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRecruitBySpaceIdUsingGETParams,
  options?: { [key: string]: any }
) {
  const { spaceId: param0, ...queryParams } = params;
  return request<API.BaseResponseSpaceRecruitVO_>(
    `/api/spaceRecruit/get/bySpace/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 分页获取招募列表 POST /api/spaceRecruit/list/page/vo */
export async function listRecruitVoByPageUsingPost(
  body: API.SpaceRecruitQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageSpaceRecruitVO_>(
    "/api/spaceRecruit/list/page/vo",
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

/** 获取我发布的招募列表 POST /api/spaceRecruit/my/list */
export async function listMyRecruitsUsingPost(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListSpaceRecruitVO_>(
    "/api/spaceRecruit/my/list",
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

/** 分页查询招募 POST /api/spaceRecruit/query */
export async function queryRecruitUsingPost(
  body: API.SpaceRecruitQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageSpaceRecruitVO_>(
    "/api/spaceRecruit/query",
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

/** 更新招募 POST /api/spaceRecruit/update */
export async function updateRecruitUsingPost(
  body: API.SpaceRecruitUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/spaceRecruit/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
