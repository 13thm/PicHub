package com.thm.pichub.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.SecureUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.thm.pichub.common.constant.UserConstant;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.common.utils.MinioUtil;
import com.thm.pichub.common.utils.MultiLevelCacheUtil;
import com.thm.pichub.mapper.PictureMapper;
import com.thm.pichub.model.dto.picture.PictureQueryRequest;
import com.thm.pichub.model.dto.picture.PictureUpdateRequest;
import com.thm.pichub.model.entity.Picture;
import com.thm.pichub.model.entity.User;
import com.thm.pichub.model.vo.picture.PictureVO;
import com.thm.pichub.service.PictureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 图片服务实现
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PictureServiceImpl extends ServiceImpl<PictureMapper, Picture> implements PictureService {

    private final MinioUtil minioUtil;
    @Resource
    private MultiLevelCacheUtil multiLevelCacheUtil;
    @Override
    public Long uploadPicture(MultipartFile file, String name, String introduction, String category, String tags, HttpServletRequest request) {
        // 1. 获取当前登录用户
        User loginUser = (User) request.getSession().getAttribute(UserConstant.USER_LOGIN_STATE);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        Long userId = loginUser.getId();

        // 2. 校验文件
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "文件为空");
        }

        // 3. 上传到MinIO
        String fileName = minioUtil.uploadFile(file);
        String fileUrl = minioUtil.getFileUrl(fileName);

        // 4. 计算图片属性
        long picSize = file.getSize();
        String picFormat = file.getContentType().split("/")[1];

        // 5. 保存到数据库
        Picture picture = new Picture();
        picture.setUrl(fileUrl);
        picture.setName(name);
        picture.setIntroduction(introduction);
        picture.setCategory(category);
        picture.setTags(tags);
        picture.setPicSize(picSize);
        picture.setPicFormat(picFormat);
        picture.setReviewStatus(0); // 默认待审核
        picture.setUserId(userId);
        picture.setCreateTime(new Date());
        picture.setEditTime(new Date());
        picture.setIsDelete(0);

        boolean save = this.save(picture);
        if (!save) {
            // 上传失败回删MinIO文件
            minioUtil.deleteFile(fileName);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "图片上传失败");
        }
        return picture.getId();
    }

    @Override
    public InputStream downloadPicture(Long pictureId) {
        // 1. 校验参数
        if (pictureId == null || pictureId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        // 2. 查询图片
        Picture picture = this.getById(pictureId);
        if (picture == null || picture.getIsDelete() == 1) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "图片不存在");
        }

        // 3. 解析 MinIO 文件名（从 url 中提取，去除查询参数）
        String fileName = extractFileNameFromUrl(picture.getUrl());

        // 4. 从 MinIO 下载
        return minioUtil.downloadFile(fileName);
    }

    @Override
    public boolean updatePicture(PictureUpdateRequest pictureUpdateRequest) {
        // 1. 校验参数
        if (pictureUpdateRequest == null || pictureUpdateRequest.getId() == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Long pictureId = pictureUpdateRequest.getId();

        // 2. 查询图片
        Picture picture = this.getById(pictureId);
        if (picture == null || picture.getIsDelete() == 1) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "图片不存在");
        }

        // 3. 更新字段
        if (StrUtil.isNotBlank(pictureUpdateRequest.getName())) {
            picture.setName(pictureUpdateRequest.getName());
        }
        if (StrUtil.isNotBlank(pictureUpdateRequest.getIntroduction())) {
            picture.setIntroduction(pictureUpdateRequest.getIntroduction());
        }
        if (StrUtil.isNotBlank(pictureUpdateRequest.getCategory())) {
            picture.setCategory(pictureUpdateRequest.getCategory());
        }
        if (StrUtil.isNotBlank(pictureUpdateRequest.getTags())) {
            picture.setTags(pictureUpdateRequest.getTags());
        }
        if (pictureUpdateRequest.getReviewStatus() != null) {
            picture.setReviewStatus(pictureUpdateRequest.getReviewStatus());
        }
        if (StrUtil.isNotBlank(pictureUpdateRequest.getReviewMessage())) {
            picture.setReviewMessage(pictureUpdateRequest.getReviewMessage());
        }
        picture.setEditTime(new Date());

        // 4. 保存更新
        return this.updateById(picture);
    }

    @Override
    public boolean deletePicture(Long pictureId, HttpServletRequest request) {
        // 1. 校验参数
        if (pictureId == null || pictureId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        // 2. 查询图片
        Picture picture = this.getById(pictureId);
        if (picture == null || picture.getIsDelete() == 1) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "图片不存在");
        }

        // 3. 校验权限（仅本人或管理员可删除）
        User loginUser = (User) request.getSession().getAttribute(UserConstant.USER_LOGIN_STATE);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        if (!loginUser.getId().equals(picture.getUserId()) && !"admin".equals(loginUser.getUserRole())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无删除权限");
        }

        // 4. 删除 MinIO 文件
        String fileName = extractFileNameFromUrl(picture.getUrl());
        minioUtil.deleteFile(fileName);

        // 5. 逻辑删除数据库记录
        return this.removeById(pictureId);
    }
    /**
     * 分页获取图片封装列表已经弃用
     */

    @Deprecated
//    @Override
    public Page<PictureVO> listPictureVOByPageDeprecated(PictureQueryRequest pictureQueryRequest) {
        long current = pictureQueryRequest.getCurrent();
        long size = pictureQueryRequest.getPageSize();
        Page<Picture> picturePage = this.page(new Page<>(current, size), this.getQueryWrapper(pictureQueryRequest));
        Page<PictureVO> pictureVOPage = new Page<>(current, size, picturePage.getTotal());
        List<PictureVO> pictureVOList = this.getPictureVOList(picturePage.getRecords());
        pictureVOPage.setRecords(pictureVOList);
        return pictureVOPage;
    }

    /**
     * 分页获取图片封装列表（带多级缓存）
     */
    @Override
    public Page<PictureVO> listPictureVOByPage(PictureQueryRequest pictureQueryRequest) {
        // 生成唯一缓存 Key（用查询参数 MD5 加密）
        String cacheKey = "picture:vo:page:" + SecureUtil.md5(JSONUtil.toJsonStr(pictureQueryRequest));

        // 多级缓存：Caffeine → Redis → DB
        return (Page<PictureVO>) multiLevelCacheUtil.get(cacheKey, () -> {
            // 缓存未命中，执行真实逻辑
            long current = pictureQueryRequest.getCurrent();
            long size = pictureQueryRequest.getPageSize();
            Page<Picture> picturePage = this.page(new Page<>(current, size), this.getQueryWrapper(pictureQueryRequest));
            Page<PictureVO> pictureVOPage = new Page<>(current, size, picturePage.getTotal());
            List<PictureVO> pictureVOList = this.getPictureVOList(picturePage.getRecords());
            pictureVOPage.setRecords(pictureVOList);
            return pictureVOPage;
        });
    }

    @Override
    public QueryWrapper<Picture> getQueryWrapper(PictureQueryRequest pictureQueryRequest) {
        QueryWrapper<Picture> queryWrapper = new QueryWrapper<>();
        if (pictureQueryRequest == null) {
            return queryWrapper;
        }
        String searchField = pictureQueryRequest.getSearchField();
        String name = pictureQueryRequest.getName();
        String category = pictureQueryRequest.getCategory();
        String tags = pictureQueryRequest.getTags();
        Long userId = pictureQueryRequest.getUserId();
        Integer reviewStatus = pictureQueryRequest.getReviewStatus();
        String sortField = pictureQueryRequest.getSortField();
        String sortOrder = pictureQueryRequest.getSortOrder();

        // 模糊查询
        if (StringUtils.isNotBlank(name)) {
            queryWrapper.like("name", name);
        }
        if (StringUtils.isNotBlank(category)) {
            queryWrapper.eq("category", category);
        }
        if (StringUtils.isNotBlank(tags)) {
            queryWrapper.like("tags", tags);
        }
        // 精确查询
        if (userId != null) {
            queryWrapper.eq("userId", userId);
        }
        if (reviewStatus != null) {
            queryWrapper.eq("reviewStatus", reviewStatus);
        }
        if (StringUtils.isNotBlank(searchField)) {
            queryWrapper.like("name", searchField)
                    .or().like("category", searchField)
                    .or().like("tags", searchField)
                    .or().like("introduction", searchField);
        }
        // 排序
        queryWrapper.orderBy(StrUtil.isNotEmpty(sortField), StrUtil.equals(sortOrder, "ascend"), sortField);

        return queryWrapper;
    }

    @Override
    public PictureVO getPictureVO(Picture picture) {
        if (picture == null) {
            return null;
        }
        PictureVO pictureVO = new PictureVO();
        BeanUtils.copyProperties(picture, pictureVO);
        return pictureVO;
    }

    @Override
    public List<PictureVO> getPictureVOList(List<Picture> pictureList) {
        if (pictureList == null || pictureList.isEmpty()) {
            return new ArrayList<>();
        }
        return pictureList.stream().map(this::getPictureVO).collect(Collectors.toList());
    }

    /**
     * 从 MinIO URL 中提取文件名（去除查询参数）
     */
    private String extractFileNameFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        // 去除查询参数（?后面的内容）
        String[] urlParts = url.split("\\?");
        String pathWithoutQuery = urlParts[0];
        // 从路径中提取文件名
        String[] pathParts = pathWithoutQuery.split("/");
        return pathParts[pathParts.length - 1];
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean reviewPicture(Long pictureId, Integer reviewStatus, String reviewMessage, Long reviewerId) {
        // 1. 校验图片是否存在
        Picture picture = this.getById(pictureId);
        if (picture == null || picture.getIsDelete() == 1) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "图片不存在");
        }

        // 2. 校验状态（只能是 1 或 2）
        if (reviewStatus == null || (reviewStatus != 1 && reviewStatus != 2)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "审核状态错误");
        }

        // 3. 已经审核过的不能重复审核
        if (picture.getReviewStatus() == 1 || picture.getReviewStatus() == 2) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "请勿重复审核");
        }

        // 4. 构建更新条件
        LambdaUpdateWrapper<Picture> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(Picture::getId, pictureId);
        updateWrapper.set(Picture::getReviewStatus, reviewStatus);
        updateWrapper.set(Picture::getReviewMessage, reviewMessage);
        updateWrapper.set(Picture::getReviewerId, reviewerId);
        updateWrapper.set(Picture::getReviewTime, new Date());

        // 5. 执行更新
        return this.update(updateWrapper);
    }


    @Override
    public List<String> getSeachUrl(Integer count, String searchText) {
        // 最大限制30条
        if (count > 30) {
            count = 30;
        }
        List<String> urlList = new ArrayList<>();
        // 拼接必应图片异步接口地址
        String fetchUrl = String.format("https://cn.bing.com/images/async?q=%s&mmasync=1", searchText);
        Document document;
        try {
            document = Jsoup.connect(fetchUrl).get();
        } catch (IOException e) {
            System.err.println("获取页面失败: " + e.getMessage());
            return urlList;
        }
        // 获取图片容器
        Element div = document.getElementsByClass("dgControl").first();
        if (div == null) {
            return urlList;
        }
        // 提取图片标签
        Elements imgElementList = div.select("img.mimg");

        for (Element imgElement : imgElementList) {
            String fileUrl = imgElement.attr("src");
            if (fileUrl == null || StrUtil.isBlank(fileUrl)) {
                continue;
            }

            // 去掉?后面的参数，获取纯净URL
            int questionMarkIndex = fileUrl.indexOf("?");
            if (questionMarkIndex > -1) {
                fileUrl = fileUrl.substring(0, questionMarkIndex);
            }
            urlList.add(fileUrl);
            // 达到数量停止
            if (urlList.size() >= count) {
                break;
            }
        }
        return urlList;
    }

}