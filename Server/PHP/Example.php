<?php

$secret_key = 'testkey123456789'; // 16 字节密钥
$iv = 'testiv1234567890'; // 16 字节 IV

$encrypted_data = 'SAC_uDSKBeOt/ytQAY0no23aeqzfXOs27vCJz2bbNIk3XpDs8ya0K+wu9I/ThxXQzwS3v6RlIoVz6vPh7pIarlR8XUdXGDTzrrLlljOR5HtRNfumfY1xExuaKIRYdZ6LrwU5t6UDRtV5FvQJ0994yI8U2W0IPcuIO2bwDsun3t0Iuf3hVUOGh0urTTjMNCjtbwDyTuccdSkeZxslRR16vDuG8kEAfgl22UM5kJeLmCTyLJyzj9PCur/KnRMHPNJqSX5TVaFV5Uu2mHSnDOOS5mzzPROk3O+8C3gOM7DIw/6+fL+y9knDRtC5FV1KZcQNJ7Lqudug5fM4RuYtaUmMflXyhF0wymOWVCZD3QfLz9yXyYnkwxk61nvXuNLCBgjDoCDXX9HsXnBtOuF0CC/nZmgUBXO6mZLlzTYGOSHAxNAjaINJ0UwFdFl7aeL0XVV++zr+Hny4DMel2EytnuZ/KMEYzRYvqUpBFBCQRdOJ1i7Ki9VENBqV+f2KTAk8NSlMqUqKuh3TpOZvAwSobcVZcZBuYlkpSF0LFKUMXyjyiHWuaTG1ocdQrhgCQPBoM0HX0vMku3ebdXDGzAZmXPJle+caNPQ4UZPAIP2zzSzv+1uCx1OWXNmp4NOtCDXRBWyc3JvYQVyawJEC4grO3UNBzlHMUVso3HRgy99duDqlw2bv8wnUHp7G1mCAnwKdLKlpnb0t0yJw6vfc11xi7p/c6O5XWFYg9/EyAqPebS/LZRuASRxwt71i2neRgXYoPrF7fwosSAhP2R4kmp8f0znTBtKZTQ==';

// 去除标识字符
$encrypted_data = substr($encrypted_data, 4);

// 解密
$cipher = mcrypt_create_cipher(MCRYPT_RIJNDAEL_128, $secret_key);
mcrypt_generic_init($cipher, $secret_key, $iv);
$decrypted_data = mdecrypt_generic($cipher, base64_decode($encrypted_data));
mcrypt_generic_deinit($cipher);

// 去除填充
$decrypted_data = rtrim($decrypted_data, "\0"); // 使用 \0 进行填充

// 解码 Base64 字符串
$decoded_json_base64 = $decrypted_data;
$device_json = json_decode(base64_decode($decoded_json_base64), true);

// 校验时间戳是否在有效期内 (设置时间范围在 60 秒内)
$time_range = 60;
if ($device_json['x0'] < time() * 1000 && time() * 1000 <= $device_json['x0'] + $time_range * 1000) {
    echo "时间校验通过\n";
} else {
    echo "时间校验不通过\n";
}

// 校验指纹真实性 (如果需要)
$x12 = $device_json['x1'] . $device_json['x2'] . $device_json['x3'] . $device_json['x4'] . $device_json['x5'] . $device_json['x7'] . $device_json['x9'];
$md5_hash = md5($x12);
if ($device_json['x12'] == $md5_hash) {
    echo "指纹校验通过\n";
} else {
    echo "指纹校验不通过\n";
}

// 校验接口以及 DATA 是否匹配 (如果需要)，实际使用时请校验实际请求的 path 和 data 数据
$path = $device_json['x13'];
$data = $device_json['x14'];
if ($path == '/check.php' && $data == '{"data":"example"}') {
    echo "接口校验通过\n";
} else {
    echo "接口校验不通过\n";
}

?>