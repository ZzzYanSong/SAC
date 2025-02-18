class SACDeviceInfo {
    constructor(secretKey, iv) {
        this.secretKey = secretKey || CryptoJS.enc.Utf8.parse('customkey1234567');
        this.iv = iv || CryptoJS.enc.Utf8.parse('customiv12345678');
        this.canvas = document.createElement("canvas"); // Create canvas only once
        this.ctx = this.canvas.getContext("2d");
    }

    bin2hex(s) {
        let o = "";
        for (let i = 0, l = s.length; i < l; i++) {
            let n = s.charCodeAt(i).toString(16);
            o += n.length < 2 ? "0" + n : n;
        }
        return o;
    }

    getUUID(domain) {
        const ctx = this.ctx; // Use the pre-created context
        const canvas = this.canvas;
        const txt = domain;
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "tencent";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText(txt, 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText(txt, 4, 17);

        const b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
        const bin = atob(b64);
        const crc = this.bin2hex(bin.slice(-16, -12));
        return crc;
    }

    getWebGLInfo() {
        const canvas = document.createElement('canvas'); // Create canvas inside this function
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            return null;
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return null;

        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        return vendor + renderer;
    }

    getDevice(path, data) {
        const webGLInfo = this.getWebGLInfo();
        const fonts = [];
        if (document.fonts) {
            for (const font of document.fonts) {
                fonts.push(font.family);
            }
        } else {
          const fontList = ["Arial", "Verdana", "Times New Roman", "Courier New", "Georgia", "Comic Sans MS"];
          fonts.push(...fontList)
        }
        const device_json = {
            "x0": Date.now(),
            "x1": webGLInfo,
            "x2": navigator.platform,
            "x3": window.screen.width,
            "x4": window.screen.height,
            "x5": window.screen.colorDepth,
            "x6": navigator.userAgent,
            "x7": navigator.hardwareConcurrency,
            "x8": navigator.language,
            "x9": navigator.deviceMemory,
            "x10": Intl.DateTimeFormat().resolvedOptions().timeZone,
            "x11": fonts.join(","), // Store font list as a string
            "x12": CryptoJS.MD5((webGLInfo || "") + navigator.platform + window.screen.width + window.screen.height + window.screen.colorDepth + navigator.hardwareConcurrency + navigator.deviceMemory + fonts.join(",")).toString(), // Include fonts in MD5 hash
            "x13": path,
            "x14": data,
            "x15": this.getUUID("SACDeviceID"),
            "x16": navigator.productSub, // Add productSub
            "x17": navigator.vendor,      // Add vendor
            "x18": navigator.appCodeName, // Add appCodeName
            "x19": navigator.appName,    // Add appName
            "x20": navigator.appVersion, // Add appVersion
            "x21": navigator.cookieEnabled, // Add cookieEnabled
            "x22": navigator.doNotTrack,    // Add doNotTrack if available
            "x23": navigator.maxTouchPoints, // Add maxTouchPoints
        };
        const deviceJsonBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(device_json)));

        const encrypted = CryptoJS.AES.encrypt(deviceJsonBase64, this.secretKey, {
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return 'SAC_' + encrypted.toString();
    }
}

module.exports = SACDeviceInfo;