using System;
using System.Security.Cryptography;
using System.Text;
using System.Linq;
using Newtonsoft.Json.Linq;

public class DecryptAndVerify
{
    public static void Main(string[] args)
    {
        string secretKey = "testkey123456789"; // 16 字节密钥
        string iv = "testiv1234567890"; // 16 字节 IV

        string encryptedData = "SAC_uDSKBeOt/ytQAY0no23aeqzfXOs27vCJz2bbNIk3XpDs8ya0K+wu9I/ThxXQzwS3v6RlIoVz6vPh7pIarlR8XUdXGDTzrrLlljOR5HtRNfumfY1xExuaKIRYdZ6LrwU5t6UDRtV5FvQJ0994yI8U2W0IPcuIO2bwDsun3t0Iuf3hVUOGh0urTTjMNCjtbwDyTuccdSkeZxslRR16vDuG8kEAfgl22UM5kJeLmCTyLJyzj9PCur/KnRMHPNJqSX5TVaFV5Uu2mHSnDOOS5mzzPROk3O+8C3gOM7DIw/6+fL+y9knDRtC5FV1KZcQNJ7Lqudug5fM4RuYtaUmMflXyhF0wymOWVCZD3QfLz9yXyYnkwxk61nvXuNLCBgjDoCDXX9HsXnBtOuF0CC/nZmgUBXO6mZLlzTYGOSHAxNAjaINJ0UwFdFl7aeL0XVV++zr+Hny4DMel2EytnuZ/KMEYzRYvqUpBFBCQRdOJ1i7Ki9VENBqV+f2KTAk8NSlMqUqKuh3TpOZvAwSobcVZcZBuYlkpSF0LFKUMXyjyiHWuaTG1ocdQrhgCQPBoM0HX0vMku3ebdXDGzAZmXPJle+caNPQ4UZPAIP2zzSzv+1uCx1OWXNmp4NOtCDXRBWyc3JvYQVyawJEC4grO3UNBzlHMUVso3HRgy99duDqlw2bv8wnUHp7G1mCAnwKdLKlpnb0t0yJw6vfc11xi7p/c6O5XWFYg9/EyAqPebS/LZRuASRxwt71i2neRgXYoPrF7fwosSAhP2R4kmp8f0znTBtKZTQ==";

        // 去除标识字符
        encryptedData = encryptedData.Substring(4);

        // 解密
        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.Key = Encoding.UTF8.GetBytes(secretKey);
            aesAlg.IV = Encoding.UTF8.GetBytes(iv);

            ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

            using (MemoryStream msDecrypt = new MemoryStream(Convert.FromBase64String(encryptedData)))
            {
                using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                {
                    using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                    {
                        string decryptedData = srDecrypt.ReadToEnd();

                        // 解码 Base64 字符串
                        string decodedJsonBase64 = decryptedData;
                        string deviceJsonStr = Encoding.UTF8.GetString(Convert.FromBase64String(decodedJsonBase64));
                        JObject deviceJson = JObject.Parse(deviceJsonStr);

                        // 校验时间戳是否在有效期内 (设置时间范围在 60 秒内)
                        long timeRange = 60;
                        if (deviceJson["x0"].Value<long>() < DateTimeOffset.Now.ToUnixTimeMilliseconds() && DateTimeOffset.Now.ToUnixTimeMilliseconds() <= deviceJson["x0"].Value<long>() + timeRange * 1000)
                        {
                            Console.WriteLine("时间校验通过");
                        }
                        else
                        {
                            Console.WriteLine("时间校验不通过");
                        }

                        // 校验指纹真实性 (如果需要)
                        string x12 = deviceJson["x1"].ToString() + deviceJson["x2"].ToString() + deviceJson["x3"].ToString() + deviceJson["x4"].ToString() + deviceJson["x5"].ToString() + deviceJson["x7"].ToString() + deviceJson["x9"].ToString();
                        string md5Hash = CalculateMD5Hash(x12);
                        if (deviceJson["x12"].ToString() == md5Hash)
                        {
                            Console.WriteLine("指纹校验通过");
                        }
                        else
                        {
                            Console.WriteLine("指纹校验不通过");
                        }

                        // 校验接口以及 DATA 是否匹配 (如果需要)，实际使用时请校验实际请求的 path 和 data 数据
                        string path = deviceJson["x13"].ToString();
                        string dataToCheck = deviceJson["x14"].ToString();
                        if (path == "/check.php" && dataToCheck == "{\"data\":\"example\"}")
                        {
                            Console.WriteLine("接口校验通过");
                        }
                        else
                        {
                            Console.WriteLine("接口校验不通过");
                        }
                    }
                }
            }
        }
    }

    // 计算 MD5 哈希值
    public static string CalculateMD5Hash(string input)
    {
        using (MD5 md5 = MD5.Create())
        {
            byte[] inputBytes = Encoding.UTF8.GetBytes(input);
            byte[] hashBytes = md5.ComputeHash(inputBytes);
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hashBytes.Length; i++)
            {
                sb.Append(hashBytes[i].ToString("X2"));
            }
            return sb.ToString();
        }
    }
}