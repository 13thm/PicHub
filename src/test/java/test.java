import cn.hutool.core.util.StrUtil;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;

public class test {
    public static void main(String[] args) {
            // 你要搜索的关键词
            String searchText = "风景";
            // 最多提取多少张（原代码限制30）
            int count = 10;

            // 拼接必应图片地址
            String fetchUrl = String.format("https://cn.bing.com/images/async?q=%s&mmasync=1", searchText);
            Document document;

            try {
                // 爬取页面
                document = Jsoup.connect(fetchUrl).get();
            } catch (IOException e) {
                System.err.println("获取页面失败: " + e.getMessage());
                return;
            }

            // 获取图片容器
            Element div = document.getElementsByClass("dgControl").first();
            if (div == null) {
                System.err.println("获取元素失败");
                return;
            }

            // 提取所有图片 img 标签
            Elements imgElementList = div.select("img.mimg");
            int extractCount = 0;

            System.out.println("===== 开始提取图片 URL =====");

            for (Element imgElement : imgElementList) {
                String fileUrl = imgElement.attr("src");
                if (fileUrl == null || StrUtil.isBlank(fileUrl)) {
                    continue;
                }

                // 去掉 ? 后面的参数
                int questionMarkIndex = fileUrl.indexOf("?");
                if (questionMarkIndex > -1) {
                    fileUrl = fileUrl.substring(0, questionMarkIndex);
                }

                // 输出 URL
                System.out.println(fileUrl);
                extractCount++;

                // 达到数量就停止
                if (extractCount >= count) {
                    break;
                }
            }

            System.out.println("===== 提取完成，共 " + extractCount + " 张 =====");
    }
}
