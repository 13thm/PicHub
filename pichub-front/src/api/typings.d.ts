declare namespace API {
  type BaseResponseBoolean_ = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseInt_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseListMySpaceVO_ = {
    code?: number;
    data?: MySpaceVO[];
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
