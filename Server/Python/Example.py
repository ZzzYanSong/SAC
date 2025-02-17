from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import hashlib
import base64
import json
import time

# 设置密钥和 IV
secret_key = b'glt6h61ta7kisow7'  # 16 字节密钥
iv = b'4hrivgw5s342f9b2'  # 16 字节 IV

# 待解密的数据
encrypted_data = 'SAC_uDSKBeOt/ytQAY0no23aeqzfXOs27vCJz2bbNIk3XpDs8ya0K+wu9I/ThxXQzwS3v6RlIoVz6vPh7pIarlR8XUdXGDTzrrLlljOR5HtRNfumfY1xExuaKIRYdZ6LrwU5t6UDRtV5FvQJ0994yI8U2W0IPcuIO2bwDsun3t0Iuf3hVUOGh0urTTjMNCjtbwDyTuccdSkeZxslRR16vDuG8kEAfgl22UM5kJeLmCTyLJyzj9PCur/KnRMHPNJqSX5TVaFV5Uu2mHSnDOOS5mzzPROk3O+8C3gOM7DIw/6+fL+y9knDRtC5FV1KZcQNJ7Lqudug5fM4RuYtaUmMflXyhF0wymOWVCZD3QfLz9yXyYnkwxk61nvXuNLCBgjDoCDXX9HsXnBtOuF0CC/nZmgUBXO6mZLlzTYGOSHAxNAjaINJ0UwFdFl7aeL0XVV++zr+Hny4DMel2EytnuZ/KMEYzRYvqUpBFBCQRdOJ1i7Ki9VENBqV+f2KTAk8NSlMqUqKuh3TpOZvAwSobcVZcZBuYlkpSF0LFKUMXyjyiHWuaTG1ocdQrhgCQPBoM0HX0vMku3ebdXDGzAZmXPJle+caNPQ4UZPAIP2zzSzv+1uCx1OWXNmp4NOtCDXRBWyc3JvYQVyawJEC4grO3UNBzlHMUVso3HRgy99duDqlw2bv8wnUHp7G1mCAnwKdLKlpnb0t0yJw6vfc11xi7p/c6O5XWFYg9/EyAqPebS/LZRuASRxwt71i2neRgXYoPrF7fwosSAhP2R4kmp8f0znTBtKZTQ=='

#去除标识字符
encrypted_data = encrypted_data[4:]

# 解密
cipher = AES.new(secret_key, AES.MODE_CBC, iv)
try:
    decrypted_data = unpad(cipher.decrypt(base64.b64decode(encrypted_data)), AES.block_size)
    print("加密校验通过")
except ValueError:
    print("加密校验不通过")
    exit()
# 解密后是 Base64 编码的 JSON 字符串
decoded_json_base64 = decrypted_data.decode('utf-8')

# 解码 Base64 字符串
device_json = json.loads(base64.b64decode(decoded_json_base64).decode('utf-8'))

# 输出解码后的 device_json
# print(device_json)

#校验时间戳是否在有效期内(设置时间范围在60秒内)
time_range = 60
if device_json['x0'] < int(time.time()*1000) <= device_json['x0'] + time_range*1000:
    print("时间校验通过")
else:
    print("时间校验不通过")

#校验指纹真实性（如果需要）
x12 = str(device_json['x1'])+str(device_json['x2'])+str(device_json['x3'])+str(device_json['x4'])+str(device_json['x5'])+str(device_json['x7'])+str(device_json['x9'])
md5_hash = hashlib.md5()
md5_hash.update(x12.encode('utf-8'))
if device_json['x12'] == md5_hash.hexdigest():
    print("指纹校验通过")
else:
    print("指纹校验不通过")

#校验接口以及DATA是否匹配（如果需要），实际使用时请校验实际请求的path和data数据
path = str(device_json['x13'])
data = str(device_json['x14'])
if path=='/check.php' and data=='{\"data\":\"example\"}':
    print("接口校验通过")
else:
    print("接口校验不通过")