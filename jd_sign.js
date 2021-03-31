// version v0.0.1
// create by zhihua
// detail url: https://github.com/ruicky/jd_sign_bot

const exec = require('child_process').execSync
const fs = require('fs')
const rp = require('request-promise')
const download = require('download')

// 京东cookie
const cookie = process.env.JD_COOKIE
// 真快乐 cookie
const happy_cookie = process.env.HAPPY_COOKIE
// Server酱SCKEY
const push_key = process.env.PUSH_KEY

// 京东脚本文件
const js_url = 'https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js'
// 下载脚本路劲
const js_path = './JD_DailyBonus.js'
// 脚本执行输出路劲
const result_path = './result.txt'
// 错误信息输出路劲
const error_path = './error.txt'

Date.prototype.Format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'H+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'S+': this.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(String(o[k]).length)));
    }
  }
  return fmt;
};

function setupCookie() {
  var js_content = fs.readFileSync(js_path, 'utf8')
  js_content = js_content.replace(/var Key = ''/, `var Key = '${cookie}'`)
  fs.writeFileSync(js_path, js_content, 'utf8')
}
function sign_happy() {
    console.log("happy cookie ",happy_cookie.substring(0,20))
    const options = {
        uri: `https://club.m.gome.com.cn/mclub/api/sign/in?site=APP`,
        header:{
            "Host": "club.m.gome.com.cn",
            "Accept-Encoding": "br, gzip, deflate",
            "Cookie": `${happy_cookie}`,
            "Connection": "keep-alive",
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12.5.1 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11B508/gomeplus/iphone/208/c9fddaa1-093e-4a3a-9378-38e0149d3f81/12.5.1/NotReachable/320*568/gome/c9fddaa1-093e-4a3a-9378-38e0149d3f81 /sa-sdk-ios/sensors-verify/report.gome.com.cn?production",
            "Referer": "https://club.m.gome.com.cn/mclub/index/signin",
            "Accept-Language": "zh-cn",
            "X-Requested-With": "XMLHttpRequest",
        },
        json: true,
        method: 'GET'
    }
    console.log("happy cookie ",JSON.stringify(options).substring(0,500))
    rp.get(options).then(res=>{
        console.log("真快乐签到结果！",JSON.stringify(res)) 
        fs.writeFileSync(result_path, JSON.stringify(res), 'utf8')
    }).catch((err)=>{
        console.log("真快乐签到失败")
        fs.writeFileSync(error_path, err, 'utf8')
    })
}
function sendNotificationIfNeed() {

  if (!push_key) {
    console.log('执行任务结束!'); return;
  }

  if (!fs.existsSync(result_path)) {
    console.log('没有执行结果，任务中断!'); return;
  }

  let text = "京东签到_" + new Date().Format('yyyy.MM.dd');
  let desp = fs.readFileSync(result_path, "utf8")

  // 去除末尾的换行
  let SCKEY = push_key.replace(/[\r\n]/g,"")

  const options ={
    uri:  `https://sc.ftqq.com/${SCKEY}.send`,
    form: { text, desp },
    json: true,
    method: 'POST'
  }

  rp.post(options).then(res=>{
    const code = res['errno'];
    if (code == 0) {
      console.log("通知发送成功，任务结束！")
    }
    else {
      console.log(res);
      console.log("通知发送失败，任务中断！")
      fs.writeFileSync(error_path, JSON.stringify(res), 'utf8')
    }
  }).catch((err)=>{
    console.log("通知发送失败，任务中断！")
    fs.writeFileSync(error_path, err, 'utf8')
  })
}

function main() {

  if (!cookie) {
    console.log('请配置京东cookie!'); return;
  }

  // 1、下载脚本
  download(js_url, './').then(res=>{
    // 2、替换cookie
    // setupCookie()
    // 3、执行脚本
    // exec(`node '${js_path}' >> '${result_path}'`);
    // 4、发送推送
    // sendNotificationIfNeed() 
    
    sign_happy()
  }).catch((err)=>{
    console.log('脚本文件下载失败，任务中断！');
    fs.writeFileSync(error_path, err, 'utf8')
  })

}

main()
