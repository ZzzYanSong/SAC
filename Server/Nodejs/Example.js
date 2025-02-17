const crypto = require('crypto');
const base64 = require('js-base64').Base64;

const secretKey = Buffer.from('testkey123456789');
const iv = Buffer.from('testiv1234567890');

const encryptedData = 'SAC_uDSKBeOt/ytQAY0no23aeqzfXOs27vCJz2bbNIk3XpDs8ya0K+wu9I/ThxXQzwS3v6RlIoVz6vPh7pIarlR8XUdXGDTzrrLlljOR5HtRNfumfY1xExuaKIRYdZ6LrwU5t6UDRtV5FvQJ0994yI8U2W0IPcuIO2bwDsun3t0Iuf3hVUOGh0urTTjMNCjtbwDyTuccdSkeZxslRR16vDuG8kEAfgl22UM5kJeLmCTyLJyzj9PCur/KnRMHPNJqSX5TVaFV5Uu2mHSnDOOS5mzzPROk3O+8C3gOM7DIw/6+fL+y9knDRtC5FV1KZcQNJ7Lqudug5fM4RuYtaUmMflXyhF0wymOWVCZD3QfLz9yXyYnkwxk61nvXuNLCBgjDoCDXX9HsXnBtOuF0CC/nZmgUBXO6mZLlzTYGOSHAxNAjaINJ0UwFdFl7aeL0XVV++zr+Hny4DMel2EytnuZ/KMEYzRYvqUpBFBCQRdOJ1i7Ki9VENBqV+f2KTAk8NSlMqUqKuh3TpOZvAwSobcVZcZBuYlkpSF0LFKUMXyjyiHWuaTG1ocdQrhgCQPBoM0HX0vMku3ebdXDGzAZmXPJle+caNPQ4UZPAIP2zzSzv+1uCx1OWXNmp4NOtCDXRBWyc3JvYQVyawJEC4grO3UNBzlHMUVso3HRgy99duDqlw2bv8wnUHp7G1mCAnwKdLKlpnb0t0yJw6vfc11xi7p/c6O5XWFYg9/EyAqPebS/LZRuASRxwt71i2neRgXYoPrF7fwosSAhP2R4kmp8f0znTBtKZTQ==';

// 去除标识字符
const data = encryptedData.substring(4);

// 解密
const decipher = crypto.createDecipheriv('aes-128-cbc', secretKey, iv);
let decrypted = decipher.update(data, 'base64', 'utf8');
decrypted += decipher.final('utf8');

// 解码 Base64 字符串
const decodedJsonBase64 = decrypted;
const deviceJsonStr = base64.decode(decodedJsonBase64);
const deviceJson = JSON.parse(deviceJsonStr);

// 校验时间戳是否在有效期内 (设置时间范围在 60 秒内)
const timeRange = 60;
if (deviceJson.x0 < Date.now() && Date.now() <= deviceJson.x0 + timeRange * 1000) {
  console.log('时间校验通过');
} else {
  console.log('时间校验不通过');
}

// 校验指纹真实性 (如果需要)
const x12 = deviceJson.x1 + deviceJson.x2 + deviceJson.x3 + deviceJson.x4 + deviceJson.x5 + deviceJson.x7 + deviceJson.x9;
const md5Hash = crypto.createHash('md5').update(x12).digest('hex');
if (deviceJson.x12 === md5Hash) {
  console.log('指纹校验通过');
} else {
  console.log('指纹校验不通过');
}

// 校验接口以及 DATA 是否匹配 (如果需要)，实际使用时请校验实际请求的 path 和 data 数据
const path = deviceJson.x13;
const dataToCheck = deviceJson.x14;
if (path === '/check.php' && dataToCheck === '{"data":"example"}') {
  console.log('接口校验通过');
} else {
  console.log('接口校验不通过');
}