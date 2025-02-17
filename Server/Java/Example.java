import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.IvParameterSpec;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import org.apache.commons.codec.digest.DigestUtils;
import org.json.JSONObject;

public class DecryptAndVerify {

    public static void main(String[] args) throws Exception {

        String secretKey = "testkey123456789"; // 16 字节密钥
        String iv = "testiv1234567890"; // 16 字节 IV

        String encryptedData = "SAC_uDSKBeOt/ytQAY0no23aeqzfXOs27vCJz2bbNIk3XpDs8ya0K+wu9I/ThxXQzwS3v6RlIoVz6vPh7pIarlR8XUdXGDTzrrLlljOR5HtRNfumfY1xExuaKIRYdZ6LrwU5t6UDRtV5FvQJ0994yI8U2W0IPcuIO2bwDsun3t0Iuf3hVUOGh0urTTjMNCjtbwDyTuccdSkeZxslRR16vDuG8kEAfgl22UM5kJeLmCTyLJyzj9PCur/KnRMHPNJqSX5TVaFV5Uu2mHSnDOOS5mzzPROk3O+8C3gOM7DIw/6+fL+y9knDRtC5FV1KZcQNJ7Lqudug5fM4RuYtaUmMflXyhF0wymOWVCZD3QfLz9yXyYnkwxk61nvXuNLCBgjDoCDXX9HsXnBtOuF0CC/nZmgUBXO6mZLlzTYGOSHAxNAjaINJ0UwFdFl7aeL0XVV++zr+Hny4DMel2EytnuZ/KMEYzRYvqUpBFBCQRdOJ1i7Ki9VENBqV+f2KTAk8NSlMqUqKuh3TpOZvAwSobcVZcZBuYlkpSF0LFKUMXyjyiHWuaTG1ocdQrhgCQPBoM0HX0vMku3ebdXDGzAZmXPJle+caNPQ4UZPAIP2zzSzv+1uCx1OWXNmp4NOtCDXRBWyc3JvYQVyawJEC4grO3UNBzlHMUVso3HRgy99duDqlw2bv8wnUHp7G1mCAnwKdLKlpnb0t0yJw6vfc11xi7p/c6O5XWFYg9/EyAqPebS/LZRuASRxwt71i2neRgXYoPrF7fwosSAhP2R4kmp8f0znTBtKZTQ==";

        // 去除标识字符
        encryptedData = encryptedData.substring(4);

        // 解密
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        SecretKeySpec key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(iv.getBytes(StandardCharsets.UTF_8));
        cipher.init(Cipher.DECRYPT_MODE, key, ivSpec);
        byte[] decryptedData = cipher.doFinal(Base64.getDecoder().decode(encryptedData));

        // 解码 Base64 字符串
        String decodedJsonBase64 = new String(decryptedData, StandardCharsets.UTF_8);
        String deviceJsonStr = new String(Base64.getDecoder().decode(decodedJsonBase64), StandardCharsets.UTF_8);
        JSONObject deviceJson = new JSONObject(deviceJsonStr);

        // 校验时间戳是否在有效期内 (设置时间范围在 60 秒内)
        long timeRange = 60;
        if (deviceJson.getLong("x0") < System.currentTimeMillis() && System.currentTimeMillis() <= deviceJson.getLong("x0") + timeRange * 1000) {
            System.out.println("时间校验通过");
        } else {
            System.out.println("时间校验不通过");
        }

        // 校验指纹真实性 (如果需要)
        String x12 = deviceJson.getString("x1") + deviceJson.getString("x2") + deviceJson.getString("x3") + deviceJson.getString("x4") + deviceJson.getString("x5") + deviceJson.getString("x7") + deviceJson.getString("x9");
        String md5Hash = DigestUtils.md5Hex(x12);
        if (deviceJson.getString("x12").equals(md5Hash)) {
            System.out.println("指纹校验通过");
        } else {
            System.out.println("指纹校验不通过");
        }

        // 校验接口以及 DATA 是否匹配 (如果需要)，实际使用时请校验实际请求的 path 和 data 数据
        String path = deviceJson.getString("x13");
        String data = deviceJson.getString("x14");
        if (path.equals("/check.php") && data.equals("{\"data\":\"example\"}")) {
            System.out.println("接口校验通过");
        } else {
            System.out.println("接口校验不通过");
        }
    }
}