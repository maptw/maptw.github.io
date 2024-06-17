const maplibregl=require('@maplibre/maplibre-gl-native')
const sharp=require('sharp')
//const style=require('./style.json')
const{EventEmitter}=require('events')
const emitter=new EventEmitter()
//emitter.on('mapAvailable',()=>{Render()})
var fs=require("fs")
const{spawn}=require('child_process')
//process.chdir('D:/PC/PC2/Desktop/html_css_js_bat/Node/向量地圖/contours')

var list={},List={},end,tmp

fs.readFile('list.txt','utf8',(err,data)=>{
 if(err){console.error('Error reading file:',err);return}
 const arr=data.split('\n')
 for(const item of arr){
  const tmp=item.slice(0,-4).split('/')
  const[z,x,y]=tmp.map(Number)//相當於tmp.map(v=>+v)
  if(!list[z])list[z]={}
  if(!list[z][x])list[z][x]=[]
  list[z][x].push(y)
 }
 for(let z=9;z<=14;z++)handle(z)
 //以上List包含10～15
 Handle(16);Handle(17);Handle(18)
})


function handle(z){//來自list.txt
 const Z=z+1
 if(!List[Z])List[Z]={}
 for(const x in list[z]){
  for(const y of list[z][x]){
   tile4(Z,2*x,2*y);tile4(Z,2*x+1,2*y);tile4(Z,2*x,2*y+1);tile4(Z,2*x+1,2*y+1)
  }
 }
}

function Handle(Z){//來自生成的前級List{}
 if(!List[Z])List[Z]={}
 for(const x in List[Z-1]){
  for(const y of List[Z-1][x]){
   tile4(Z,2*x,2*y);tile4(Z,2*x+1,2*y);tile4(Z,2*x,2*y+1);tile4(Z,2*x+1,2*y+1)
  }
 }
}

function tile4(Z,X,Y){
 if(!List[Z][X])List[Z][X]=[]
 List[Z][X].push(Y)
}


var n=8,sum=0
var map=[]//,isMap=new Array(n).fill(true)
fetch('https://cors-rrw.onrender.com/github/wbjon/map_json/04.json').then(res=>res.json()).then(style=>{
 for(let i=0;i<n;i++){
  map[i]=new maplibregl.Map()
  map[i].load(style)
  map[i].available=true
 }
 //console.log(map)
 toPng(18);child()//List{z:10～18}
})

async function toPng(z){//List{z:10～18}
 const ListZ={}
 for(let x in List[z]){
  for(let y of List[z][x]){
   x=+x
   const center=calculateCenter(z,x,y)
   sum++;console.log('z',z,'x',x,'y',y,tmp)
   await new Promise(resolve=>{
    save()
    function save(){
     const i=map.findIndex(item=>item.available==true)
     if(i!=-1){map[i].available=false;resolve()}else return emitter.once('mapAvailable',save)//等同emitter.once('mapAvailable',save);return
     map[i].render({zoom:z-1,width:256,height:256,center},async(err,buffer)=>{
      map[i].available=true;emitter.emit('mapAvailable')
      if(err){console.error('Error rendering tile:',err);save();return}//偶爾發生500以上網路錯誤，故後code改前code//if(err){console.error('Error rendering tile:',err);process.exit(1)}
      const pngBuffer=await sharp(buffer,{
       raw:{premultiplied:true,width:256,height:256,channels:4}//我的理解:premultiplied:true表示RGB顏色值已預乘alpha值，輸出png不要再乘alpha值
      }).png().toBuffer()
      const writeFile=()=>{
       if(pngBuffer.length==355){last();return}//空png
       fs.writeFile(`C:/maptw.github.io/${z}/${x}/${y}.png`,pngBuffer,err=>{
        if(err){fs.mkdirSync(`C:/maptw.github.io/${z}/${x}`,{recursive:true});writeFile();return}//創建目錄
        if(!ListZ[x])ListZ[x]=[];ListZ[x].push(y);last()
       })
      }
      writeFile()
     })
    }
   })
  }
 }
 function last(){
  sum--
  if(sum==0){
   List[z]=ListZ
   console.log('存檔完成');end=2
  }

 }
}

function calculateCenter(z,x,y){
 x+=1/2;y+=1/2
 const lon=360*x/Math.pow(2,z)-180
 const n=Math.PI*(1-2*y/Math.pow(2,z)),lat= Math.atan((Math.exp(n)-Math.exp(-n))/2)*180/Math.PI
 return [lon,lat]
}

//生成個人訪問令牌：
//1.登錄到你的 GitHub 賬戶。
//2.右上角點擊你的頭像，然後選擇“Settings”。
//3.在左側菜單中選擇“Developer settings”。
//4.選擇“Personal access tokens”，然後點擊“Tokens (classic)”。
//5.點擊“Generate new token”。
//6.選擇一個描述（如 “My Token”），並選擇需要的權限（至少需要 repo 權限來推送到存儲庫）。
//7.點擊“Generate token”。
//8.記下生成的訪問令牌，因為這是你唯一能看到它的機會。

//重要！為避免git自動回收干擾，先執行git config gc.auto 0 關閉此倉庫的自動回收；git config --get gc.auto 可看設定結果
//隨時手動 git gc 一般回收；git gc --aggressive 徹底回收

//捨棄以上做法，改為：
//創建C:/256
//至C:/256
//執行git init 會生成.git隱藏資料夾
//type nul > index.html 建立空文件，準備將這一個檔案force覆蓋至遠端倉庫
//上傳者設定補充git config --global user.name "twtopo"
//上傳者設定補充git config --global user.email "spy.160126@gmail.com"
//上傳者設定補充git config --global --list 檢查以上config設定
//執行git add . 若多了--ignore-removal代表不加入刪除的檔案
//可執行git diff --name-only --cached 看加入了哪些檔案
//執行git commit -q -m "256x256" 若有-q代表安靜不輸出訊息
//執行git remote add origin https://<username>:<token>@github.com/<username>/256.git 或↓
//執行git remote set-url origin https://<username>:<token>@github.com/<username>/256.git 或↑
//可執行git remote --verbose 檢查以上遠端origin設定
//執行git push --force origin HEAD:main (HEAD為本地分支名稱master的指針，main為遠端分支名稱，故也可改為git push --force origin master:main)
//若本地分支名稱HEAD為main，則可改為git push --force origin main:main 或簡寫為 git push --force origin main
//慎用--force，平常不要--force以免刪除歷史及舊資料
//重要！執行git config gc.auto 0
function child(){tmp='add'
 const addProcess=spawn('git',['add','.'])
 //addProcess.stdout.on('data',data=>{console.log(`add stdout:${data}`)})
 //addProcess.stderr.on('data',data=>{console.error(`add stderr:${data}`)})
 addProcess.on('close',code=>{tmp='commit'
  if(code!==0){console.error('Failed to add files:',code);process.exit(1)}
  const commitProcess=spawn('git',['commit','-q','-m','256x256'])//-q不輸出訊息
  //commitProcess.stdout.on('data',data=>{console.log(`commit stdout:${data}`)})
  //commitProcess.stderr.on('data',data=>{console.error(`commit stderr:${data}`)})
  commitProcess.on('close',code=>{tmp='push'
   if(code>1){console.error('Failed to commit changes:',code);process.exit(1)}//有時會發生：若add的所有檔案都已有commit，則code==1(nothing to commit)
   const pushProcess=spawn('git',['push','origin','main'])
   //pushProcess.stdout.on('data',data=>{console.log(`push stdout:${data}`)})
   //pushProcess.stderr.on('data',data=>{console.error(`push stderr:${data}`)})
   pushProcess.on('close',code=>{tmp=''
    if(code!==0){console.error('Failed to push changes:',code);process.exit(1)}
    if(end==3){console.log('同步結束');process.exit()};if(end==2)end=3;child()
   })
  })
 })
}
