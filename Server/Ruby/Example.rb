require 'openssl'
require 'base64'
require 'json'
require 'digest'

secret_key = 'testkey123456789'
iv = 'testiv1234567890'

encrypted_data = 'SAC_uDSKBeOt/ytQAY0no23aeqzfXOs27vCJz2bbNIk3XpDs8ya0K+wu9I/ThxXQzwS3v6RlIoVz6vPh7pIarlR8XUdXGDTzrrLlljOR5HtRNfumfY1xExuaKIRYdZ6LrwU5t6UDRtV5FvQJ0994yI8U2W0IPcuIO2bwDsun3t0Iuf3hVUOGh0urTTjMNCjtbwDyTuccdSkeZxslRR16vDuG8kEAfgl22UM5kJeLmCTyLJyzj9PCur/KnRMHPNJqSX5TVaFV5Uu2mHSnDOOS5mzzPROk3O+8C3gOM7DIw/6+fL+y9knDRtC5FV1KZcQNJ7Lqudug5fM4RuYtaUmMflXyhF0wymOWVCZD3QfLz9yXyYnkwxk61nvXuNLCBgjDoCDXX9HsXnBtOuF0CC/nZmgUBXO6mZLlzTYGOSHAxNAjaINJ0UwFdFl7aeL0XVV++zr+Hny4DMel2EytnuZ/KMEYzRYvqUpBFBCQRdOJ1i7Ki9VENBqV+f2KTAk8NSlMqUqKuh3TpOZvAwSobcVZcZBuYlkpSF0LFKUMXyjyiHWuaTG1ocdQrhgCQPBoM0HX0vMku3ebdXDGzAZmXPJle+caNPQ4UZPAIP2zzSzv+1uCx1OWXNmp4NOtCDXRBWyc3JvYQVyawJEC4grO3UNBzlHMUVso3HRgy99duDqlw2bv8wnUHp7G1mCAnwKdLKlpnb0t0yJw6vfc11xi7p/c6O5XWFYg9/EyAqPebS/LZRuASRxwt71i2neRgXYoPrF7fwosSAhP2R4kmp8f0znTBtKZTQ=='

# 去除标识字符
data = encrypted_data[4..-1]

# 解密
cipher = OpenSSL::Cipher.new('aes-128-cbc')
cipher.decrypt
cipher.key = secret_key
cipher.iv = iv
decrypted = cipher.update(Base64.decode64(data)) + cipher.final

# 解码 Base64 字符串
decoded_json_base64 = decrypted
device_json_str = Base64.decode64(decoded_json_base64)
device_json = JSON.parse(device_json_str)

# 校验时间戳是否在有效期内 (设置时间范围在 60 秒内)
time_range = 60
if device_json['x0'] < Time.now.to_i * 1000 && Time.now.to_i * 1000 <= device_json['x0'] + time_range * 1000
  puts '时间校验通过'
else
  puts '时间校验不通过'
end

# 校验指纹真实性 (如果需要)
x12 = device_json['x1'].to_s + device_json['x2'].to_s + device_json['x3'].to_s + device_json['x4'].to_s + device_json['x5'].to_s + device_json['x7'].to_s + device_json['x9'].to_s
md5_hash = Digest::MD5.hexdigest(x12)
if device_json['x12'] == md5_hash
  puts '指纹校验通过'
else
  puts '指纹校验不通过'
end

# 校验接口以及 DATA 是否匹配 (如果需要)，实际使用时请校验实际请求的 path 和 data 数据
path = device_json['x13']
data_to_check = device_json['x14']
if path == '/check.php' && data_to_check == '{"data":"example"}'
  puts '接口校验通过'
else
  puts '接口校验不通过'
end