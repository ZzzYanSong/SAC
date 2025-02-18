class SACDeviceInfo {
    constructor(secretKey, iv) {
        this.secretKey = secretKey || CryptoJS.enc.Utf8.parse('customkey1234567');
        this.iv = iv || CryptoJS.enc.Utf8.parse('customiv12345678');
    }

    getWebGLInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            return;
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        return vendor + renderer;
    }

    getDevice(path, data) {
        const device_json = {
            "x0": Date.now(),
            "x1": this.getWebGLInfo(),
            "x2": navigator.platform,
            "x3": window.screen.width,
            "x4": window.screen.height,
            "x5": window.screen.colorDepth,
            "x6": navigator.userAgent,
            "x7": navigator.hardwareConcurrency,
            "x8": navigator.language,
            "x9": navigator.deviceMemory,
            "x10": Intl.DateTimeFormat().resolvedOptions().timeZone,
            "x11": document.fonts,
            "x12": CryptoJS.MD5(this.getWebGLInfo() + navigator.platform + window.screen.width + window.screen.height + window.screen.colorDepth + navigator.hardwareConcurrency + navigator.deviceMemory).toString(),
            "x13": path,
            "x14": data
        };

        const deviceJsonBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(device_json)));

        // AES encryption
        const encrypted = CryptoJS.AES.encrypt(deviceJsonBase64, this.secretKey, {
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // Return the encrypted string
        return 'SAC_' + encrypted.toString();
    }
}

module.exports = SACDeviceInfo;