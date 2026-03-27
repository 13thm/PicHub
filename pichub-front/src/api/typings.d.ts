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

  type BaseResponsePageUserVO_ = {
    code?: number;
    data?: PageUserVO_;
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
  };

  type downloadPictureUsingGETParams = {
    /** pictureId */
    pictureId: number;
  };

  type getUserByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getUserVOByIdUsingGETParams = {
    /** id */
    id: number;
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

  type uploadByUrlUsingPOSTParams = {
    /** category */
    category?: string;
    /** introduction */
    introduction?: string;
    /** name */
    name: string;
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
