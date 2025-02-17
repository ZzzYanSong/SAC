# S-A-C: 简单的反爬虫
**中文** | [English](./README.en-US.md)
---
一个简单轻量的Web反爬虫实现方案

> 仅需在前端加上数十行JavaScript代码（加密前）即可为您的Web接口服务添加安全有效的防护措施。

## 目的

目前，许多个人站长提供各种服务给用户。然而，现实中，公开的接口往往容易被大量调用和爬取，这可能偏离了站长的初衷，使得接口被滥用或出现在不应出现的地方。

我们想要避免这种情况发生，但是我们不想负担行为验证码等第三方防御所产生的价格，也不想费时费力去研究如何防止接口被滥用。

现在，SAC可以很好的解决这个问题，并且它还可以获取设备指纹信息用于用户行为分析。

> [!CAUTION]
> ！注意：该方案的安全性是建立在您前端代码的混淆加密上的，您的前端代码混淆的越难以被逆向，您的反爬策略就越难被突破！

## 方案详解

通过浏览器提供的**document、window、navigator**并通过**canvas**获取**WebG**L信息，我们可以使用JavaScript处理这些数据，将数据字串加密为一个令牌，通过headers或Cookie的方式传入后端。通过后端逻辑进行校验。

目前的方案，可以使后端很轻松的从***四个维度***进行校验

- 加密校验
- 时间校验
- 指纹校验
- 接口校验

### 加密校验
前端通过特定的加密方法（AES/DES）对数据字串进行加密为令牌，并在后端进行解密。这样可以有效的防止伪造令牌。

### 时间校验
在完成加密校验后，后端可以根据解密获取到的数据中取出前端传入的时间戳，并根据后端设定的失效时间进行校验，如果超时可认定该令牌过期。有效防止一个令牌多次批量请求。

### 指纹校验
我们可以通过该方法实现用户的异常操作检测，令牌解密后存在一个前端生成的唯一设备ID，该设备ID是通过一些浏览器指纹生成。后端可根据账号同一时间在多个设备ID登录来判断账号风险，如无账号系统则可直接限制同一设备ID一段时间内的请求频率。

### 接口校验
在通过前三种校验后，该请求的可信度已经很高了。但是我们不能忽略的一点是，如果在短时间内，一个用户使用一个令牌同时请求多个接口，可能依然会形成恶意请求。因此，我们可以通过前端在发起请求时生成的接口路径和提交的数据进行校验，以判断此令牌是否是用于当前接口的。

## 交互方案

前面提到过，可以通过headers或Cookie的方式传入后端，这是为了在不同的场景下达到最优的策略

### headers传入令牌
headers传入令牌的方式是可以完整完成上述四种校验的，但是可能会造成一定的性能损失，接下来的cookie传入方式会解释这个原因。

headers传入方式的可以用于对抗反爬
### cookie传入令牌
如果通过headers传入令牌，则有一个不可避免的问题。即前端每次发起请求时都需要生成一个令牌，而为了安全，前端的代码虽然只有几十行，但往往需要使用VMP加密技术、混淆等方案来加固代码，这样会导致前端在请求时造成性能损失。

因此，我们在接口请求频率过高的时候，可以采用生成一个设备令牌传入后端，后端完成校验后，返回一个cookie，之后的请求中均附带此条cookie而不需要生成令牌，这样可以有效防止用户的性能损失。但同样会失去接口校验的能力。

cookie传入方式可以用于记录设备指纹，分析用户行为。

## 例子
SAC提供了前端JavaScript的例子，并为后端常用服务端开发语言提供了例子。

前端例子位于根目录的JavaScript目录内  
后端例子如下结构所示
```
.
├─Server
|   ├─Ruby
|   |  └Example.rb
|   ├─Python
|   |   └Example.py
|   ├─PHP
|   |  └Example.php
|   ├─Nodejs
|   |   └Example.js
|   ├─Java
|   |  └Example.java
|   ├─Go
|   | └Example.go
|   ├─C#
|   | └Example.cs
```
## 使用示例

---
### 前端
**将前端的JavaScript代码引进您的前端代码中，请务必加密**

要使用，请确保您引入了**CryptoJS**库

您可以根据您的开发情况选择不同的方式引入

#### CDN引入
```javascript
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1-crypto-js.js"></script>
```

#### 安装并导入
```bash
npm install crypto-js
```
然后在您的Vue组件导入并使用
```vue
import CryptoJS from 'crypto-js';
```
接下来，您可以在您的业务逻辑中使用

```javascript
const deviceInfo = new DeviceInfo(customSecretKey, customIv);
const encryptedData = deviceInfo.getDevice('/path', 'some data');
console.log(encryptedData);
```
在请求接口时生成并作为headers参数传入
```javascript
const headers = new Headers({
        "Content-Type": "application/json",
        "gid": deviceInfo.getDevice('/api', JSON.stringify({ data: 'example' })) // 将 deviceId 作为 gid 字段附加
    });

    // 示例: 使用 fetch 发送请求，附带 headers
    fetch('/api', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ data: 'example' }) // 示例请求数据
    })
    .then(response => response.json())
    .then(data => {
       //请求成功的业务逻辑
    })
    .catch(error => console.error('请求失败:', error));
```
### 后端
后端请根据您的语言参考对应的示例代码引入业务逻辑  
以下是使用Python完成对headers的四重验证  
```python
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import hashlib
import base64
import json
import time

# 设置密钥和 IV
secret_key = b'testkey123456789'  # 16 字节密钥
iv = b'testiv1234567890'  # 16 字节 IV

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
```


**实际使用中，只需要配置key和iv然后再headers取出encrypted_data然后使用剩余的逻辑校验并完成业务逻辑即可。校验失败可以直接返回403。**
