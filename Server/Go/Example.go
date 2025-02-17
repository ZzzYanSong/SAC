package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"
)

func main() {
	secretKey := []byte("testkey123456789") // 16 字节密钥
	iv := []byte("testiv1234567890")    // 16 字节 IV

	encryptedData := "SAC_uDSKBeOt/ytQAY0no23aeqzfXOs27vCJz2bbNIk3XpDs8ya0K+wu9I/ThxXQzwS3v6RlIoVz6vPh7pIarlR8XUdXGDTzrrLlljOR5HtRNfumfY1xExuaKIRYdZ6LrwU5t6UDRtV5FvQJ0994yI8U2W0IPcuIO2bwDsun3t0Iuf3hVUOGh0urTTjMNCjtbwDyTuccdSkeZxslRR16vDuG8kEAfgl22UM5kJeLmCTyLJyzj9PCur/KnRMHPNJqSX5TVaFV5Uu2mHSnDOOS5mzzPROk3O+8C3gOM7DIw/6+fL+y9knDRtC5FV1KZcQNJ7Lqudug5fM4RuYtaUmMflXyhF0wymOWVCZD3QfLz9yXyYnkwxk61nvXuNLCBgjDoCDXX9HsXnBtOuF0CC/nZmgUBXO6mZLlzTYGOSHAxNAjaINJ0UwFdFl7aeL0XVV++zr+Hny4DMel2EytnuZ/KMEYzRYvqUpBFBCQRdOJ1i7Ki9VENBqV+f2KTAk8NSlMqUqKuh3TpOZvAwSobcVZcZBuYlkpSF0LFKUMXyjyiHWuaTG1ocdQrhgCQPBoM0HX0vMku3ebdXDGzAZmXPJle+caNPQ4UZPAIP2zzSzv+1uCx1OWXNmp4NOtCDXRBWyc3JvYQVyawJEC4grO3UNBzlHMUVso3HRgy99duDqlw2bv8wnUHp7G1mCAnwKdLKlpnb0t0yJw6vfc11xi7p/c6O5XWFYg9/EyAqPebS/LZRuASRxwt71i2neRgXYoPrF7fwosSAhP2R4kmp8f0znTBtKZTQ=="

	// 去除标识字符
	data := encryptedData[4:]

	// 解密
	block, err := aes.NewCipher(secretKey)
	if err != nil {
		panic(err)
	}
	mode := cipher.NewCBCDecrypter(block, iv)
	decoded, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		panic(err)
	}
	mode.CryptBlocks(decoded, decoded, decoded)

	// 去除填充
	unpadded := unpad(decoded, aes.BlockSize)

	// 解码 Base64 字符串
	decodedJsonBase64 := string(unpadded)
	deviceJsonStr, err := base64.StdEncoding.DecodeString(decodedJsonBase64)
	if err != nil {
		panic(err)
	}
	var deviceJson map[string]interface{}
	err = json.Unmarshal(deviceJsonStr, &deviceJson)
	if err != nil {
		panic(err)
	}

	// 校验时间戳是否在有效期内 (设置时间范围在 60 秒内)
	timeRange := 60
	x0, ok := deviceJson["x0"].(float64) // 注意类型断言
	if !ok {
		panic("x0 is not a number")
	}
	if int64(x0) < time.Now().Unix()*1000 && time.Now().Unix()*1000 <= int64(x0)+int64(timeRange*1000) {
		fmt.Println("时间校验通过")
	} else {
		fmt.Println("时间校验不通过")
	}

	// 校验指纹真实性 (如果需要)
	x12 := fmt.Sprintf("%v%v%v%v%v%v%v", deviceJson["x1"], deviceJson["x2"], deviceJson["x3"], deviceJson["x4"], deviceJson["x5"], deviceJson["x7"], deviceJson["x9"])
	md5Hash := fmt.Sprintf("%x", md5.Sum([]byte(x12)))
	if deviceJson["x12"] == md5Hash {
		fmt.Println("指纹校验通过")
	} else {
		fmt.Println("指纹校验不通过")
	}

	// 校验接口以及 DATA 是否匹配 (如果需要)，实际使用时请校验实际请求的 path 和 data 数据
	path := deviceJson["x13"].(string) // 注意类型断言
	dataToCheck := deviceJson["x14"].(string)
	if path == "/check.php" && dataToCheck == `{"data":"example"}` {
		fmt.Println("接口校验通过")
	} else {
		fmt.Println("接口校验不通过")
	}
}

// unpad 函数用于去除 PKCS7 填充
func unpad(data []byte, blockSize int) []byte {
	padding := int(data[len(data)-1])
	if padding > blockSize || padding == 0 {
		return data
	}
	return data[:len(data)-padding]
}