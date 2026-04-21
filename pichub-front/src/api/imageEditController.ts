// @ts-ignore
/* eslint-disable */
import request from "@/request";

/** 获取图片当前旋转角度 GET /api/image/edit/current-angle/${param0} */
export async function getCurrentAngleUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCurrentAngleUsingGETParams,
  options?: { [key: string]: any }
) {
  const { imageId: param0, ...queryParams } = params;
  return request<API.BaseResponseInt_>(
    `/api/image/edit/current-angle/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 保存编辑后的图片 POST /api/image/edit/save */
export async function saveImageUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.saveImageUsingPOSTParams,
  body: {},
  file?: File,
  options?: { [key: string]: any }
) {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === "object" && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ""));
        } else {
          formData.append(
            ele,
            new Blob([JSON.stringify(item)], { type: "application/json" })
          );
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.BaseResponseBoolean_>("/api/image/edit/save", {
    method: "POST",
    params: {
      ...params,
    },
    data: formData,
    requestType: "form",
    ...(options || {}),
  });
}

/** 获取图片编辑状态 GET /api/image/edit/status/${param0} */
export async function getImageStatusUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getImageStatusUsingGETParams,
  options?: { [key: string]: any }
) {
  const { imageId: param0, ...queryParams } = params;
  return request<API.BaseResponseEditLockVO_>(
    `/api/image/edit/status/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 退出编辑模式 POST /api/image/edit/unlock */
export async function unlockEditUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.unlockEditUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/image/edit/unlock", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
