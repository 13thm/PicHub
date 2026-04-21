// @ts-ignore
/* eslint-disable */
import request from "@/request";

/** 申请加入空间 POST /api/spaceRecruitApply/add */
export async function addApplyUsingPost(
  body: API.SpaceRecruitApplyAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>("/api/spaceRecruitApply/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据 id 获取申请 GET /api/spaceRecruitApply/get/${param0} */
export async function getApplyByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getApplyByIdUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseSpaceRecruitApply_>(
    `/api/spaceRecruitApply/get/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 获取我的申请列表 POST /api/spaceRecruitApply/my/list */
export async function listMyAppliesUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSpaceRecruitApplyVO_>(
    "/api/spaceRecruitApply/my/list",
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

/** 获取待审批数量 GET /api/spaceRecruitApply/pending/count */
export async function getPendingCountUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPendingCountUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>(
    "/api/spaceRecruitApply/pending/count",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 分页获取申请列表 POST /api/spaceRecruitApply/query */
export async function listApplyVoByPageUsingPost(
  body: API.SpaceRecruitApplyQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseIPageSpaceRecruitApplyVO_>(
    "/api/spaceRecruitApply/query",
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

/** 审批申请 POST /api/spaceRecruitApply/review */
export async function reviewApplyUsingPost(
  body: API.SpaceRecruitApplyReviewRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/spaceRecruitApply/review", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
