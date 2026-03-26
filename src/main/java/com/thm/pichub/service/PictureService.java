package com.thm.pichub.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.thm.pichub.model.dto.picture.PictureQueryRequest;
import com.thm.pichub.model.dto.picture.PictureUpdateRequest;
import com.thm.pichub.model.entity.Picture;
import com.thm.pichub.model.vo.picture.PictureVO;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.InputStream;
import java.util.List;

/**
 * 图片服务
 */
public interface PictureService extends IService<Picture> {

    /**
     * 上传图片
     */
    Long uploadPicture(MultipartFile file, String name, String introduction, String category, String tags, HttpServletRequest request);

    /**
     * 下载图片
     */
    InputStream downloadPicture(Long pictureId);

    /**
     * 修改图片信息
     */
    boolean updatePicture(PictureUpdateRequest pictureUpdateRequest);

    /**
     * 删除图片
     */
    boolean deletePicture(Long pictureId, HttpServletRequest request);

    /**
     * 获取图片列表（分页）
     */
    Page<PictureVO> listPictureVOByPage(PictureQueryRequest pictureQueryRequest);

    /**
     * 获取查询条件
     */
    QueryWrapper<Picture> getQueryWrapper(PictureQueryRequest pictureQueryRequest);

    /**
     * 转换为VO
     */
    PictureVO getPictureVO(Picture picture);

    /**
     * 批量转换为VO
     */
    List<PictureVO> getPictureVOList(List<Picture> pictureList);
    /**
     * 审核图片
     */
    boolean reviewPicture(Long pictureId, Integer reviewStatus, String reviewMessage, Long reviewerId);
}