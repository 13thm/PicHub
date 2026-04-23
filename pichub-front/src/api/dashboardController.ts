// @ts-ignore
/* eslint-disable */
import request from "@/request";

/** getStats GET /api/dashboard/stats */
export async function getStatsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseDashboardStatsVO_>("/api/dashboard/stats", {
    method: "GET",
    ...(options || {}),
  });
}
