declare namespace API {
  type BaseResponseBoolean_ = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseEditLockVO_ = {
    code?: number;
    data?: EditLockVO;
    message?: string;
  };

  type BaseResponseInt_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseIPageSpaceRecruitApplyVO_ = {
    code?: number;
    data?: IPageSpaceRecruitApplyVO_;
    message?: string;
  };

  type BaseResponseListMySpaceVO_ = {
    code?: number;
    data?: MySpaceVO[];
    message?: string;
  };

  type BaseResponseListSpaceRecruitApplyVO_ = {
    code?: number;
    data?: SpaceRecruitApplyVO[];
    message?: string;
  };

  type BaseResponseListSpaceRecruitVO_ = {
    code?: number;
    data?: SpaceRecruitVO[];
    message?: string;
  };

  type BaseResponseListString_ = {
    code?: number;
    data?: string[];
    message?: string;
  };

  type BaseResponseLoginUserVO_ = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponseLong_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponsePagePictureVO_ = {
    code?: number;
    data?: PagePictureVO_;
    message?: string;
  };

  type BaseResponsePageSpaceRecruitVO_ = {
    code?: number;
    data?: PageSpaceRecruitVO_;
    message?: string;
  };

  type BaseResponsePageSpaceUserVO_ = {
    code?: number;
    data?: PageSpaceUserVO_;
    message?: string;
  };

  type BaseResponsePageSpaceVO_ = {
    code?: number;
    data?: PageSpaceVO_;
    message?: string;
  };

  type BaseResponsePageUserVO_ = {
    code?: number;
    data?: PageUserVO_;
    message?: string;
  };

  type BaseResponseSpace_ = {
    code?: number;
    data?: Space;
    message?: string;
  };

  type BaseResponseSpaceRecruit_ = {
    code?: number;
    data?: SpaceRecruit;
    message?: string;
  };

  type BaseResponseSpaceRecruitApply_ = {
    code?: number;
    data?: SpaceRecruitApply;
    message?: string;
  };

  type BaseResponseSpaceRecruitVO_ = {
    code?: number;
    data?: SpaceRecruitVO;
    message?: string;
  };

  type BaseResponseSpaceUser_ = {
    code?: number;
    data?: SpaceUser;
    message?: string;
  };

  type BaseResponseSpaceUserVO_ = {
    code?: number;
    data?: SpaceUserVO;
    message?: string;
  };

  type BaseResponseSpaceVO_ = {
    code?: number;
    data?: SpaceVO;
    message?: string;
  };

  type BaseResponseString_ = {
    code?: number;
    data?: string;
    message?: string;
  };

  type BaseResponseUser_ = {
    code?: number;
    data?: User;
    message?: string;
  };

  type BaseResponseUserVO_ = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type batchExtractPictureUrlUsingGETParams = {
    count?: number;
    searchText?: string;
  };

  type DeleteRequest = {
    id?: number;
    spaceId?: number;
  };

  type downloadPictureUsingGETParams = {
    /** pictureId */
    pictureId: number;
  };

  type EditLockVO = {
    angle?: number;
    editing?: boolean;
    editorId?: number;
    editorName?: string;
    imageId?: number;
  };

  type getApplyByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getCurrentAngleUsingGETParams = {
    /** imageId */
    imageId: number;
  };

  type getImageStatusUsingGETParams = {
    /** imageId */
    imageId: number;
  };

  type getPendingCountUsingGETParams = {
    /** recruitId */
    recruitId?: number;
    /** spaceId */
    spaceId?: number;
  };

  type getRecruitByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getRecruitBySpaceIdUsingGETParams = {
    /** spaceId */
    spaceId: number;
  };

  type getSpaceByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getSpaceUserByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getSpaceUserVOByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getSpaceVOByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getUserByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getUserVOByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type IPageSpaceRecruitApplyVO_ = {
    current?: number;
    pages?: number;
    records?: SpaceRecruitApplyVO[];
    size?: number;
    total?: number;
  };

  type isSpacePermissionUsingGETParams = {
    /** spaceId */
    spaceId?: number;
    /** userId */
    userId?: number;
  };

  type LoginUserVO = {
    createTime?: string;
    id?: number;
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type MySpaceVO = {
    createTime?: string;
    editTime?: string;
    id?: number;
    maxCount?: number;
    maxSize?: number;
    spaceLevel?: number;
    spaceName?: string;
    spaceRole?: string;
    spaceType?: number;
    totalCount?: number;
    totalSize?: number;
    userId?: number;
  };

  type OrderItem = {
    asc?: boolean;
    column?: string;
  };

  type PagePictureVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: PictureVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageSpaceRecruitVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: SpaceRecruitVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageSpaceUserVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: SpaceUserVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageSpaceVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: SpaceVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageUserVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: UserVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PictureQueryRequest = {
    category?: string;
    current?: number;
    name?: string;
    pageSize?: number;
    reviewStatus?: number;
    searchField?: string;
    sortField?: string;
    sortOrder?: string;
    spaceId?: number;
    tags?: string;
    userId?: number;
  };

  type PictureUpdateRequest = {
    category?: string;
    id?: number;
    introduction?: string;
    name?: string;
    reviewMessage?: string;
    reviewStatus?: number;
    tags?: string;
  };

  type PictureUploadByBatchRequest = {
    search?: string;
    spaceId?: number;
    urls?: string[];
  };

  type PictureVO = {
    category?: string;
    createTime?: string;
    id?: number;
    introduction?: string;
    name?: string;
    picFormat?: string;
    reviewStatus?: number;
    tags?: string;
    thumbnailUrl?: string;
    url?: string;
    userId?: number;
  };

  type ReviewPictureRequest = {
    id?: number;
    reviewMessage?: string;
    reviewStatus?: number;
  };

  type saveImageUsingPOSTParams = {
    /** imageId */
    imageId: number;
  };

  type Space = {
    createTime?: string;
    editTime?: string;
    id?: number;
    isDelete?: number;
    maxCount?: number;
    maxSize?: number;
    spaceLevel?: number;
    spaceName?: string;
    spaceType?: number;
    totalCount?: number;
    totalSize?: number;
    updateTime?: string;
    userId?: number;
  };

  type SpaceAddRequest = {
    maxCount?: number;
    maxSize?: number;
    spaceLevel?: number;
    spaceName?: string;
    spaceType?: number;
  };

  type SpaceQueryRequest = {
    current?: number;
    pageSize?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
    spaceLevel?: number;
    spaceName?: string;
    spaceType?: number;
    userId?: number;
  };

  type SpaceRecruit = {
    /** 招募介绍/要求 */
    content?: string;
    /** 创建时间 */
    createTime?: string;
    /** 编辑时间 */
    editTime?: string;
    /** id */
    id?: number;
    /** 是否删除 */
    isDelete?: number;
    /** 最多接受人数 */
    maxApplyCount?: number;
    /** 招募状态：0-招募中 1-已招满 2-已关闭 */
    recruitStatus?: number;
    /** 空间 id */
    spaceId?: number;
    /** 招募标题 */
    title?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 发布人 id（空间管理员） */
    userId?: number;
  };

  type SpaceRecruitAddRequest = {
    /** 招募介绍/要求 */
    content?: string;
    /** 最多接受人数 */
    maxApplyCount?: number;
    /** 空间 id */
    spaceId: number;
    /** 招募标题 */
    title: string;
  };

  type SpaceRecruitApply = {
    /** 申请理由 */
    applyReason?: string;
    /** 申请状态：0-待审核 1-已通过 2-已拒绝 */
    applyStatus?: number;
    /** 创建时间 */
    createTime?: string;
    /** 编辑时间 */
    editTime?: string;
    /** id */
    id?: number;
    /** 是否删除 */
    isDelete?: number;
    /** 招募帖子 id */
    recruitId?: number;
    /** 审核意见 */
    reviewMessage?: string;
    /** 审核时间 */
    reviewTime?: string;
    /** 审核人 id */
    reviewerId?: number;
    /** 空间 id */
    spaceId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 申请人 id */
    userId?: number;
  };

  type SpaceRecruitApplyAddRequest = {
    /** 申请理由 */
    applyReason?: string;
    /** 招募帖子 id */
    recruitId: number;
  };

  type SpaceRecruitApplyQueryRequest = {
    applyStatus?: number;
    current?: number;
    id?: number;
    pageSize?: number;
    recruitId?: number;
    sortField?: string;
    sortOrder?: string;
    spaceId?: number;
    userId?: number;
  };

  type SpaceRecruitApplyReviewRequest = {
    /** 审核状态：1-已通过 2-已拒绝 */
    applyStatus: number;
    /** 申请 id */
    id: number;
    /** 审核意见 */
    reviewMessage?: string;
  };

  type SpaceRecruitApplyVO = {
    /** 申请人名称 */
    applicantName?: string;
    /** 申请理由 */
    applyReason?: string;
    /** 申请状态：0-待审核 1-已通过 2-已拒绝 */
    applyStatus?: number;
    /** 创建时间 */
    createTime?: string;
    /** id */
    id?: number;
    /** 招募帖子 id */
    recruitId?: number;
    /** 招募标题 */
    recruitTitle?: string;
    /** 审核意见 */
    reviewMessage?: string;
    /** 审核时间 */
    reviewTime?: string;
    /** 审核人 id */
    reviewerId?: number;
    /** 审核人名称 */
    reviewerName?: string;
    /** 空间 id */
    spaceId?: number;
    /** 空间名称 */
    spaceName?: string;
    /** 申请人账号 */
    userAccount?: string;
    /** 申请人头像 */
    userAvatar?: string;
    /** 申请人 id */
    userId?: number;
  };

  type SpaceRecruitQueryRequest = {
    current?: number;
    id?: number;
    pageSize?: number;
    recruitStatus?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
    spaceId?: number;
    title?: string;
    userId?: number;
  };

  type SpaceRecruitUpdateRequest = {
    /** 招募介绍/要求 */
    content?: string;
    /** id */
    id: number;
    /** 最多接受人数 */
    maxApplyCount?: number;
    /** 招募状态：0-招募中 1-已招满 2-已关闭 */
    recruitStatus?: number;
    /** 招募标题 */
    title?: string;
  };

  type SpaceRecruitVO = {
    /** 招募介绍/要求 */
    content?: string;
    /** 创建时间 */
    createTime?: string;
    /** 编辑时间 */
    editTime?: string;
    /** id */
    id?: number;
    /** 最多接受人数 */
    maxApplyCount?: number;
    /** 当前待审批人数 */
    pendingCount?: number;
    /** 发布人账号 */
    publisherAccount?: string;
    /** 发布人名称 */
    publisherName?: string;
    /** 招募状态：0-招募中 1-已招满 2-已关闭 */
    recruitStatus?: number;
    /** 空间 id */
    spaceId?: number;
    /** 空间级别：0-普通版 1-专业版 2-旗舰版 */
    spaceLevel?: number;
    /** 空间名称 */
    spaceName?: string;
    /** 空间类型：0-私有 1-团队 */
    spaceType?: number;
    /** 招募标题 */
    title?: string;
    /** 总申请人数 */
    totalApplyCount?: number;
    /** 发布人 id */
    userId?: number;
  };

  type SpaceUpdateRequest = {
    id?: number;
    maxCount?: number;
    maxSize?: number;
    spaceLevel?: number;
    spaceName?: string;
    spaceType?: number;
  };

  type SpaceUser = {
    createTime?: string;
    id?: number;
    spaceId?: number;
    spaceRole?: string;
    updateTime?: string;
    userId?: number;
  };

  type SpaceUserAddRequest = {
    spaceId?: number;
    spaceRole?: string;
    userId?: number;
  };

  type SpaceUserQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    spaceId?: number;
    spaceRole?: string;
    userId?: number;
  };

  type SpaceUserUpdateRequest = {
    id?: number;
    spaceId?: number;
    spaceRole?: string;
    userId?: number;
  };

  type SpaceUserVO = {
    createTime?: string;
    id?: number;
    spaceId?: number;
    spaceRole?: string;
    userAccount?: string;
    userId?: number;
    userName?: string;
  };

  type SpaceVO = {
    createTime?: string;
    editTime?: string;
    id?: number;
    maxCount?: number;
    maxSize?: number;
    spaceLevel?: number;
    spaceName?: string;
    spaceType?: number;
    totalCount?: number;
    totalSize?: number;
    userId?: number;
  };

  type unlockEditUsingPOSTParams = {
    /** imageId */
    imageId: number;
  };

  type uploadByUrlUsingPOSTParams = {
    /** category */
    category?: string;
    /** introduction */
    introduction?: string;
    /** name */
    name: string;
    /** spaceId */
    spaceId?: number;
    /** tags */
    tags?: string;
    /** url */
    url: string;
  };

  type uploadPictureUsingPOSTParams = {
    /** category */
    category?: string;
    /** introduction */
    introduction?: string;
    /** name */
    name: string;
    /** spaceId */
    spaceId?: number;
    /** tags */
    tags?: string;
  };

  type User = {
    createTime?: string;
    editTime?: string;
    id?: number;
    isDelete?: number;
    updateTime?: string;
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userPassword?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserAddRequest = {
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserQueryRequest = {
    current?: number;
    pageSize?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
  };

  type UserRegisterRequest = {
    checkPassword?: string;
    userAccount?: string;
    userPassword?: string;
  };

  type UserUpdatePasswordRequest = {
    confirmPassword?: string;
    newPassword?: string;
    oldPassword?: string;
  };

  type UserUpdateRequest = {
    id?: number;
    userAvatar?: string;
    userName?: string;
    userPassword?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserVO = {
    id?: number;
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };
}
